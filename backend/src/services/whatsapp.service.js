import axios from 'axios';
import prisma from '../utils/db.js';

/**
 * Enterprise Production-Ready Fast2SMS WhatsApp Notification Module
 * Centralizes all WhatsApp notification templates, E.164 phone formatting,
 * 3-attempt exponential backoff retry handling, database audit logging (WhatsAppLog model),
 * and non-blocking error handling.
 */

const FAST2SMS_BASE_URL = 'https://www.fast2sms.com/dev/whatsapp';
const DEFAULT_WABA_PHONE_NUMBER_ID = process.env.FAST2SMS_PHONE_NUMBER_ID || '1234110443123433';
const ADMIN_RECIPIENT_MOBILE = process.env.ADMIN_WHATSAPP_NUMBER || '9177900821';

// Approved Fast2SMS Message IDs Map
export const APPROVED_MESSAGE_IDS = {
  OTP: '27533',
  WELCOME: '27507',
  ORDER_PLACED: '27509',
  ORDER_PACKED: '27510',
  ORDER_SHIPPED: '27511',
  ORDER_DELIVERED: '27513',
  ORDER_CANCELLED: '27514',
  REFUND_INITIATED: '27515',
  REFUND_COMPLETED: '27516',
  ADMIN_NEW_ORDER: '27618'
};

/**
 * Helper: Format phone number into E.164 / 10-digit clean string
 */
export function formatMobileNumber(phoneStr) {
  if (!phoneStr) return null;
  let digits = String(phoneStr).replace(/\D/g, '');
  // Strip leading zeros (e.g., "09100329521" -> "9100329521")
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }
  if (digits.length === 10) {
    return `91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits.length >= 10 ? digits : null;
}

/**
 * Core Reusable Function: sendTemplate
 * Dispatches template message via Fast2SMS with 3-attempt retry logic and database audit logging
 */
export async function sendTemplate({
  messageId,
  templateName = 'custom_template',
  mobile,
  variables = [],
  customerName = null,
  orderId = null
}) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    const err = 'FAST2SMS_API_KEY missing in environment variables.';
    console.warn(`⚠️ [WhatsApp Service] ${err}`);
    return { success: false, error: err };
  }

  const formattedMobile = formatMobileNumber(mobile);
  if (!formattedMobile) {
    const err = `Invalid or missing recipient mobile number: "${mobile}"`;
    console.warn(`⚠️ [WhatsApp Service] ${err}`);
    return { success: false, error: err };
  }

  const phoneNumberId = process.env.FAST2SMS_PHONE_NUMBER_ID || DEFAULT_WABA_PHONE_NUMBER_ID;
  const variablesValues = Array.isArray(variables) ? variables.join('|') : String(variables || '');

  console.log('\n====================================================');
  console.log('📢 [WhatsApp Event Triggered]');
  console.log('📌 Template Name:', templateName);
  console.log('🆔 Message ID:', messageId);
  console.log('👤 Customer Name:', customerName || 'N/A');
  console.log('📱 Mobile Number:', formattedMobile);
  console.log('🔤 Variables:', variablesValues);
  console.log('====================================================');

  // 1. Create PENDING entry in database audit log
  let logRecord = null;
  try {
    logRecord = await prisma.whatsAppLog.create({
      data: {
        templateId: String(messageId),
        templateName,
        recipient: formattedMobile,
        customerName,
        orderId,
        variables: Array.isArray(variables) ? variables.map(String) : [String(variables)],
        status: 'PENDING',
        attempts: 1
      }
    });
  } catch (dbErr) {
    console.warn('⚠️ [WhatsApp Service] Failed to create initial WhatsAppLog entry:', dbErr.message);
  }

  const MAX_RETRIES = 3;
  let lastError = null;
  let lastResponse = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📡 [WhatsApp Fast2SMS Request] MessageID: ${messageId} | PhoneID: ${phoneNumberId} | Recipient: ${formattedMobile} | Attempt: ${attempt}/${MAX_RETRIES}`);

      let response;
      try {
        // Primary Attempt: POST to https://www.fast2sms.com/dev/whatsapp
        response = await axios.post(
          FAST2SMS_BASE_URL,
          {
            message_id: String(messageId).trim(),
            phone_number_id: String(phoneNumberId).trim(),
            numbers: formattedMobile,
            variables_values: variablesValues
          },
          {
            headers: {
              authorization: apiKey.trim(),
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
      } catch (postErr) {
        // Fallback Attempt: GET to https://www.fast2sms.com/dev/whatsapp
        response = await axios.get(FAST2SMS_BASE_URL, {
          headers: {
            authorization: apiKey.trim()
          },
          params: {
            message_id: String(messageId).trim(),
            phone_number_id: String(phoneNumberId).trim(),
            numbers: formattedMobile,
            variables_values: variablesValues
          },
          timeout: 10000
        });
      }

      lastResponse = response.data;
      const timestamp = new Date().toISOString();

      console.log('📬 [WhatsApp Fast2SMS Response]:', JSON.stringify(response.data, null, 2));

      if (response.status === 200 && (response.data?.return || response.data?.request_id)) {
        const requestId = response.data.request_id || 'N/A';
        console.log(`✅ [WhatsApp Sent Success] Template: ${templateName} (${messageId}) | To: ${formattedMobile} | RequestID: ${requestId} | Time: ${timestamp}`);

        // Update database audit log to SUCCESS
        if (logRecord) {
          await prisma.whatsAppLog.update({
            where: { id: logRecord.id },
            data: {
              status: 'SUCCESS',
              response: response.data,
              attempts: attempt
            }
          }).catch(() => {});
        }

        return {
          success: true,
          templateId: messageId,
          templateName,
          recipient: formattedMobile,
          requestId,
          response: response.data,
          timestamp
        };
      } else {
        lastError = response.data?.message?.[0] || response.data?.message || `HTTP ${response.status} Error`;
        console.warn(`⚠️ [WhatsApp Attempt ${attempt}/${MAX_RETRIES} Failed] Error: ${lastError}`);
      }
    } catch (apiErr) {
      lastError = apiErr.response?.data?.message?.[0] || apiErr.response?.data?.message || apiErr.message;
      console.warn(`⚠️ [WhatsApp Attempt ${attempt}/${MAX_RETRIES} Exception] Error: ${lastError}`);
    }

    if (logRecord) {
      await prisma.whatsAppLog.update({
        where: { id: logRecord.id },
        data: {
          status: 'FAILED',
          errorMessage: String(lastError),
          attempts: attempt,
          response: lastResponse || null
        }
      }).catch(() => {});
    }

    if (attempt < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
    }
  }

  console.error(`❌ [WhatsApp Final Failure] Template ID: ${messageId} (${templateName}) | To: ${formattedMobile} | Error: ${lastError}`);
  return {
    success: false,
    templateId: messageId,
    templateName,
    recipient: formattedMobile,
    error: lastError,
    logId: logRecord?.id || null
  };
}

/**
 * 1. sendOtp ({ mobile, otp, purpose, expiry, supportNumber })
 * Approved Message ID: 27533
 */
export async function sendOtp({ mobile, otp, purpose = 'Registration', expiry = '10 Minutes', supportNumber = '9100422140' }) {
  const officialSupportPhone = process.env.SUPPORT_PHONE || supportNumber || '9100422140';
  return sendTemplate({
    messageId: APPROVED_MESSAGE_IDS.OTP,
    templateName: 'otp_authentication',
    mobile,
    variables: [otp, purpose, expiry, officialSupportPhone]
  });
}

/**
 * 2. sendWelcome (user)
 * Approved Message ID: 27507
 */
export async function sendWelcome(user) {
  if (!user || !user.mobile) return { success: false, error: 'User mobile missing' };
  if (user.welcomeWhatsappSent) return { success: true, skipped: true };

  const rawName = String(user.name || '').trim();
  const isInvalidOrTempName = !rawName || 
    /^Customer\s*\d*$/i.test(rawName) || 
    /^Guest/i.test(rawName) || 
    /^Unknown/i.test(rawName) || 
    /^\d+$/.test(rawName);

  if (isInvalidOrTempName) {
    console.warn(`⚠️ [WhatsApp Service] Skipped sending welcome notification to user ${user.id || user.mobile} because name "${user.name}" is temporary or invalid.`);
    return { success: false, error: 'User name is temporary or invalid' };
  }

  const customerName = rawName;

  const res = await sendTemplate({
    messageId: APPROVED_MESSAGE_IDS.WELCOME,
    templateName: 'welcome_new_user',
    mobile: user.mobile,
    variables: [customerName],
    customerName
  });

  if (res.success && user.id) {
    await prisma.user.update({
      where: { id: user.id },
      data: { welcomeWhatsappSent: true }
    }).catch(() => {});
  }

  return res;
}

/**
 * Helper to strip any currency symbols (₹, Rs., INR) and format as clean plain numeric strings
 * for WhatsApp template parameters, as templates already contain currency symbols (e.g. ₹{{2}}).
 */
export function formatNumericAmount(val) {
  if (val === null || val === undefined) return '0';
  const cleanedStr = String(val).replace(/[₹\sRs\.INR,]/gi, '').trim();
  const num = parseFloat(cleanedStr);
  if (isNaN(num)) return '0';
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

/**
 * 3. sendOrderPlaced (order)
 * Approved Message ID: 27509
 * Trigger: ONLY after paymentStatus == COMPLETED / PAID or COD confirmed
 */
export async function sendOrderPlaced(order) {
  if (!order || !order.id) return { success: false, error: 'Order missing' };
  if (order.orderPlacedWhatsappSent) return { success: true, skipped: true };

  const recipientMobile = order.shippingAddress?.phone || order.user?.mobile;
  if (!recipientMobile) return { success: false, error: 'Recipient mobile missing' };

  const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer';
  const orderId = order.orderNumber || order.id;
  const totalAmount = formatNumericAmount(order.totalAmount);

  const res = await sendTemplate({
    messageId: APPROVED_MESSAGE_IDS.ORDER_PLACED,
    templateName: 'order_placed_successfully',
    mobile: recipientMobile,
    variables: [customerName, orderId, totalAmount],
    customerName,
    orderId
  });

  if (res.success) {
    await prisma.order.update({
      where: { id: order.id },
      data: { orderPlacedWhatsappSent: true }
    }).catch(() => {});
  }

  return res;
}

/**
 * 4. sendOrderPacked (order)
 * Approved Message ID: 27510
 */
export async function sendOrderPacked(order) {
  if (!order || !order.id) return { success: false, error: 'Order missing' };
  if (order.orderPackedWhatsappSent) return { success: true, skipped: true };

  const recipientMobile = order.shippingAddress?.phone || order.user?.mobile;
  if (!recipientMobile) return { success: false, error: 'Recipient mobile missing' };

  const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer';
  const orderId = order.orderNumber || order.id;

  const res = await sendTemplate({
    messageId: APPROVED_MESSAGE_IDS.ORDER_PACKED,
    templateName: 'order_packed',
    mobile: recipientMobile,
    variables: [customerName, orderId],
    customerName,
    orderId
  });

  if (res.success) {
    await prisma.order.update({
      where: { id: order.id },
      data: { orderPackedWhatsappSent: true }
    }).catch(() => {});
  }

  return res;
}

/**
 * 5. sendOrderShipped (order)
 * Approved Message ID: 27511
 */
export async function sendOrderShipped(order) {
  if (!order || !order.id) return { success: false, error: 'Order missing' };
  if (order.orderShippedWhatsappSent) return { success: true, skipped: true };

  const recipientMobile = order.shippingAddress?.phone || order.user?.mobile;
  if (!recipientMobile) return { success: false, error: 'Recipient mobile missing' };

  const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer';
  const orderId = order.orderNumber || order.id;
  const trackingId = order.awbCode || order.courierName || 'N/A';

  const res = await sendTemplate({
    messageId: APPROVED_MESSAGE_IDS.ORDER_SHIPPED,
    templateName: 'order_shipped',
    mobile: recipientMobile,
    variables: [customerName, orderId, trackingId],
    customerName,
    orderId
  });

  if (res.success) {
    await prisma.order.update({
      where: { id: order.id },
      data: { orderShippedWhatsappSent: true }
    }).catch(() => {});
  }

  return res;
}

/**
 * 6. sendOrderDelivered (order)
 * Approved Message ID: 27513
 */
export async function sendOrderDelivered(order) {
  if (!order || !order.id) return { success: false, error: 'Order missing' };

  const recipientMobile = order.shippingAddress?.phone || order.user?.mobile;
  if (!recipientMobile) return { success: false, error: 'Recipient mobile missing' };

  const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer';
  const orderId = order.orderNumber || order.id;
  
  const itemNames = (order.orderItems || []).map(item => {
    const name = item.product?.name || item.name || 'Product';
    const qty = item.quantity || 1;
    return `${name} x${qty}`;
  }).join(', ') || 'Organic Products';

  return sendTemplate({
    messageId: APPROVED_MESSAGE_IDS.ORDER_DELIVERED,
    templateName: 'order_delivered',
    mobile: recipientMobile,
    variables: [customerName, orderId, itemNames],
    customerName,
    orderId
  });
}

/**
 * 7. sendOrderCancelled (order)
 * Approved Message ID: 27514
 */
export async function sendOrderCancelled(order) {
  if (!order || !order.id) return { success: false, error: 'Order missing' };

  const recipientMobile = order.shippingAddress?.phone || order.user?.mobile;
  if (!recipientMobile) return { success: false, error: 'Recipient mobile missing' };

  const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer';
  const orderId = order.orderNumber || order.id;

  return sendTemplate({
    messageId: APPROVED_MESSAGE_IDS.ORDER_CANCELLED,
    templateName: 'order_cancelled',
    mobile: recipientMobile,
    variables: [customerName, orderId],
    customerName,
    orderId
  });
}

/**
 * 8. sendRefundInitiated (order, refundAmount)
 * Approved Message ID: 27515
 */
export async function sendRefundInitiated(order, refundAmount) {
  if (!order || !order.id) return { success: false, error: 'Order missing' };

  const recipientMobile = order.shippingAddress?.phone || order.user?.mobile;
  if (!recipientMobile) return { success: false, error: 'Recipient mobile missing' };

  const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer';
  const orderId = order.orderNumber || order.id;
  const amountStr = formatNumericAmount(refundAmount || order.totalAmount);

  return sendTemplate({
    messageId: APPROVED_MESSAGE_IDS.REFUND_INITIATED,
    templateName: 'refund_initiated',
    mobile: recipientMobile,
    variables: [customerName, orderId, amountStr],
    customerName,
    orderId
  });
}

/**
 * 9. sendRefundCompleted (order, refundAmount, referenceNumber)
 * Approved Message ID: 27516
 */
export async function sendRefundCompleted(order, refundAmount, referenceNumber) {
  if (!order || !order.id) return { success: false, error: 'Order missing' };

  const recipientMobile = order.shippingAddress?.phone || order.user?.mobile;
  if (!recipientMobile) return { success: false, error: 'Recipient mobile missing' };

  const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer';
  const orderId = order.orderNumber || order.id;
  const amountStr = formatNumericAmount(refundAmount || order.totalAmount);
  const refNum = referenceNumber || order.refundId || 'RRN-99201';

  return sendTemplate({
    messageId: APPROVED_MESSAGE_IDS.REFUND_COMPLETED,
    templateName: 'refund_completed',
    mobile: recipientMobile,
    variables: [customerName, orderId, amountStr, refNum],
    customerName,
    orderId
  });
}

/**
 * 10. sendAdminNewOrder (order)
 * Approved Message ID: 27618
 * ALWAYS SENT TO 9177900821 (Never to business number)
 */
export async function sendAdminNewOrder(order) {
  if (!order || !order.id) return { success: false, error: 'Order missing' };
  if (order.adminOrderWhatsappSent) return { success: true, skipped: true };

  const adminMobile = process.env.ADMIN_WHATSAPP_NUMBER || ADMIN_RECIPIENT_MOBILE; // 9177900821
  const adminGreetingName = 'Suryodaya Farms';
  const orderId = order.orderNumber || order.id;
  const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Customer';

  // Format readable bulleted product list:
  // • Moringa Powder x2
  // • Carrot Powder x1
  const productList = (order.orderItems || []).map(item => {
    const name = item.product?.name || item.name || 'Product';
    const qty = item.quantity || 1;
    return `• ${name} x${qty}`;
  }).join('\n') || '• Standard Product Item x1';

  const totalAmount = formatNumericAmount(order.totalAmount);
  const paymentMode = order.paymentMethod === 'COD' ? 'COD' : 'ONLINE';

  console.log(`📡 [WhatsApp Service] Sending ADMIN_NEW_ORDER to Admin Mobile: ${adminMobile}`);

  const res = await sendTemplate({
    messageId: APPROVED_MESSAGE_IDS.ADMIN_NEW_ORDER,
    templateName: 'admin_new_order',
    mobile: adminMobile,
    variables: [adminGreetingName, orderId, customerName, productList, totalAmount, paymentMode],
    customerName,
    orderId
  });

  if (res.success) {
    await prisma.order.update({
      where: { id: order.id },
      data: { adminOrderWhatsappSent: true }
    }).catch(() => {});
  }

  return res;
}

export default {
  APPROVED_MESSAGE_IDS,
  formatMobileNumber,
  sendTemplate,
  sendOtp,
  sendWelcome,
  sendOrderPlaced,
  sendOrderPacked,
  sendOrderShipped,
  sendOrderDelivered,
  sendOrderCancelled,
  sendRefundInitiated,
  sendRefundCompleted,
  sendAdminNewOrder
};
