import Razorpay from 'razorpay';
import { PrismaClient } from '@prisma/client';
import whatsappService from './whatsapp.service.js';

const prisma = new PrismaClient();

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_TKPje1gjpvHTve';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'EQ7HfH1H5MRvb44z48C7w93X';

export const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

/**
 * Executes a full or partial refund via official Razorpay Payments API
 */
export const processRazorpayRefund = async ({ paymentId, amountInRupees, orderId, orderNumber }) => {
  if (!paymentId) {
    throw new Error('Razorpay Payment ID (razorpayPaymentId) is missing on this order.');
  }

  const amountInPaise = Math.round(Number(amountInRupees) * 100);

  console.log(`[RAZORPAY_REFUND] Initiating refund for Payment ID: ${paymentId}, Amount: ₹${amountInRupees} (${amountInPaise} paise), Order: #${orderNumber || orderId}...`);

  try {
    console.log("Refund Payment ID:", paymentId);
    console.log("Refund Amount (paise):", amountInPaise);

    // Fetch actual payment and verify amount
    let payment;
    try {
      payment = await razorpay.payments.fetch(paymentId);
      console.log("Payment status from Razorpay:", payment.status);

      if (amountInPaise > payment.amount) {
        throw new Error(
          `Refund amount (${amountInPaise} paise = ₹${amountInRupees}) exceeds original payment amount (${payment.amount} paise = ₹${payment.amount / 100}).`
        );
      }
    } catch (fetchErr) {
      if (fetchErr.message.includes('exceeds')) throw fetchErr;
      console.warn("Could not fetch payment details for validation:", fetchErr.message);
    }

    // Check if already refunded on Razorpay
    try {
      const existingRefunds = await razorpay.payments.fetchMultipleRefund(paymentId);
      const processedRefunds = existingRefunds?.items?.filter(r => r.status === 'processed' || r.status === 'pending') || [];
      if (processedRefunds.length > 0) {
        const totalPaymentAmount = payment?.amount || amountInPaise;
        const alreadyRefunded = processedRefunds.reduce((sum, r) => sum + r.amount, 0);
        if (alreadyRefunded >= totalPaymentAmount) {
          console.warn("✅ Refund request already accepted by Razorpay. Returning existing refund record.");
          return processedRefunds[0];
        }
      }
    } catch (refundListErr) {
      console.warn("Could not fetch existing refunds:", refundListErr.message);
    }

    // Call Razorpay Refund API
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amountInPaise,
      speed: 'normal',
      notes: {
        reason: 'Customer Order Cancelled',
        orderId: orderId,
        orderNumber: orderNumber || ''
      },
      receipt: `ref_${(orderNumber || orderId).toString().replace(/[^a-zA-Z0-9]/g, '').slice(-12)}_${Date.now().toString().slice(-6)}`
    });

    console.log('[RAZORPAY_REFUND_SUCCESS]:', JSON.stringify(refund, null, 2));
    return refund;
  } catch (err) {
    const rawError = err?.error || err;
    const errorCode = rawError?.code || '';
    const errorDescription = rawError?.description || '';
    const errorMessage = errorDescription || err?.message || 'Razorpay refund execution failed.';

    console.error("=== RAZORPAY REFUND ERROR ===", errorCode, errorMessage);
    throw new Error(`[${errorCode || 'RAZORPAY_ERROR'}] ${errorMessage}`);
  }
};

/**
 * Synchronizes single order's refund status with Razorpay
 * Transitions: INITIATED / PROCESSING -> COMPLETED or FAILED
 */
export const syncOrderRefundStatus = async (orderOrId) => {
  try {
    const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id;
    if (!orderId) return orderOrId;

    const dbOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!dbOrder) return null;

    const currentStatus = (dbOrder.refundStatus || '').toUpperCase().trim();
    
    // Only poll orders that are currently INITIATED or PROCESSING
    if (!['INITIATED', 'PROCESSING', 'PENDING'].includes(currentStatus) || !dbOrder.refundId) {
      return dbOrder;
    }

    let rzpRefund;
    try {
      rzpRefund = await razorpay.refunds.fetch(dbOrder.refundId);
    } catch (err) {
      console.warn(`[RAZORPAY_REFUND_SYNC_WARN] Failed to fetch refund ${dbOrder.refundId} for Order #${dbOrder.orderNumber}:`, err.message);
      return dbOrder;
    }

    const rzpStatus = (rzpRefund.status || '').toLowerCase();
    console.log(`[RAZORPAY_REFUND_SYNC] Order #${dbOrder.orderNumber} (Refund: ${dbOrder.refundId}) status on Razorpay: "${rzpStatus}"`);

    const existingHistory = Array.isArray(dbOrder.trackingHistory) ? dbOrder.trackingHistory : [];
    let updatedData = {
      lastRefundSync: new Date(),
      refundResponse: JSON.stringify(rzpRefund)
    };

    let statusChanged = false;

    if (rzpStatus === 'failed') {
      updatedData.refundStatus = 'FAILED';
      updatedData.refundError = rzpRefund.error_description || 'Refund execution failed on Razorpay';
      updatedData.trackingHistory = [
        ...existingHistory,
        {
          status: 'REFUND_FAILED',
          location: 'Razorpay Gateway',
          timestamp: new Date().toISOString(),
          activity: `✕ Razorpay Refund Failed: ${updatedData.refundError}`
        }
      ];
      statusChanged = true;
    } else if (rzpStatus === 'processed') {
      // Check if refund has been processed/settled
      const arn = rzpRefund.acquirer_data?.arn || rzpRefund.acquirer_data?.bank_transaction_id;

      updatedData.refundStatus = 'COMPLETED';
      updatedData.paymentStatus = 'REFUNDED';
      updatedData.refundCompletedAt = new Date();
      updatedData.refundDate = new Date();
      updatedData.trackingHistory = [
        ...existingHistory,
        {
          status: 'REFUND_CREDITED',
          location: 'Customer Bank Account',
          timestamp: new Date().toISOString(),
          activity: `✔ Refund successfully credited to customer account (Refund ID: ${rzpRefund.id}${arn ? `, ARN: ${arn}` : ''}).`
        }
      ];
      statusChanged = true;
    }

    if (statusChanged) {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updatedData
      });
      console.log(`[RAZORPAY_REFUND_SYNC] Order #${dbOrder.orderNumber} refund status updated to ${updatedData.refundStatus}!`);

      if (updatedData.refundStatus === 'COMPLETED') {
        whatsappService.sendRefundCompleted(
          updatedOrder,
          updatedOrder.refundAmount || updatedOrder.totalAmount,
          rzpRefund.id
        ).catch(err => console.error('[WhatsApp Service] Refund Completed notification error:', err.message));
      }

      return updatedOrder;
    } else {
      return await prisma.order.update({
        where: { id: orderId },
        data: { lastRefundSync: new Date() }
      });
    }
  } catch (err) {
    console.error('[RAZORPAY_REFUND_SYNC_ERROR]:', err);
    return typeof orderOrId === 'object' ? orderOrId : null;
  }
};

/**
 * Background / Bulk sync for all active non-terminal pending refunds
 */
export const syncAllPendingRefunds = async () => {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: {
        refundStatus: { in: ['INITIATED', 'PROCESSING', 'PENDING'] },
        refundId: { not: null }
      }
    });

    if (pendingOrders.length === 0) {
      return { total: 0, updated: 0 };
    }

    console.log(`[RAZORPAY_REFUND_CRON] Found ${pendingOrders.length} pending refund(s) to sync...`);

    let updatedCount = 0;
    for (const order of pendingOrders) {
      const res = await syncOrderRefundStatus(order.id);
      if (res && res.refundStatus === 'COMPLETED') {
        updatedCount++;
      }
      // Rate limit backoff (250ms per order)
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    return { total: pendingOrders.length, updated: updatedCount };
  } catch (err) {
    console.error('[RAZORPAY_REFUND_CRON_ERROR]:', err);
    return { total: 0, updated: 0, error: err.message };
  }
};
