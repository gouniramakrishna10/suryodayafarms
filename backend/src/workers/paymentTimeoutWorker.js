import prisma from '../utils/db.js';

/**
 * Payment Timeout Background Worker
 * Scans for abandoned orders with paymentStatus == 'PENDING' older than 10 minutes.
 * Automatically updates status to CANCELLED with cancelReason = 'Payment Timeout'.
 */
export async function cleanupExpiredPendingOrders() {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Find all pending orders older than 10 minutes
    const expiredOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PENDING',
        createdAt: {
          lt: tenMinutesAgo
        }
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true
      }
    });

    if (expiredOrders.length === 0) {
      return { processedCount: 0 };
    }

    console.log(`⏰ [Payment Timeout Worker] Found ${expiredOrders.length} expired pending order(s) older than 10 minutes. Cancelling...`);

    const now = new Date();
    let cancelledCount = 0;

    for (const order of expiredOrders) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
          cancelReason: 'Payment Timeout',
          cancelledAt: now
        }
      }).catch(err => {
        console.error(`❌ [Payment Timeout Worker] Failed to cancel order ${order.orderNumber}:`, err.message);
      });

      cancelledCount++;
      console.log(`✅ [Payment Timeout Worker] Auto-cancelled order ${order.orderNumber} (ID: ${order.id}) due to payment timeout (Created: ${order.createdAt.toISOString()})`);
    }

    return { processedCount: cancelledCount };
  } catch (error) {
    console.error('❌ [Payment Timeout Worker Error]:', error);
    return { error: error.message };
  }
}

/**
 * Start recurring background scheduler running every 60 seconds
 */
export function startPaymentTimeoutWorker(intervalMs = 60000) {
  console.log(`🚀 [Payment Timeout Worker] Started recurring background scheduler (Interval: ${intervalMs / 1000}s)...`);
  
  // Run initial scan immediately on boot
  cleanupExpiredPendingOrders().catch(() => {});

  // Schedule periodic cleanup
  const intervalId = setInterval(() => {
    cleanupExpiredPendingOrders().catch(err => {
      console.error('❌ [Payment Timeout Worker Interval Error]:', err.message);
    });
  }, intervalMs);

  return intervalId;
}

export default {
  cleanupExpiredPendingOrders,
  startPaymentTimeoutWorker
};
