import prisma from '../utils/db.js';
import { sendWhatsappTemplate } from './fast2sms.service.js';

/**
 * Enterprise Meta WhatsApp Cloud API Service
 * Centralized service responsible for authentication, payload construction,
 * E.164 phone formatting, AbortController timeouts, exponential backoff retries,
 * idempotency flags, structured logging, and non-blocking error handling.
 */

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v23.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Helper: Format recipient mobile number into E.164 format without leading '+'
 * (e.g. "9100422140" -> "919100422140", "+91 9100422140" -> "919100422140")
 */
export function formatE164Phone(phoneStr) {
  if (!phoneStr) return null;
  const digits = String(phoneStr).replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits.length >= 10 ? digits : null;
}

/**
 * Centralized Low-Level Meta Template Message Sender
 */
export async function sendMetaTemplate({ recipientPhone, templateName, languageCode = 'en', components = [] }) {
  const formattedPhone = formatE164Phone(recipientPhone);
  if (!formattedPhone) {
    const err = `Invalid or missing recipient phone number: "${recipientPhone}"`;
    console.warn(`⚠️ [WhatsApp Service] ${err}`);
    return { success: false, error: err };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || WHATSAPP_ACCESS_TOKEN;
  const apiVersion = process.env.WHATSAPP_API_VERSION || WHATSAPP_API_VERSION || 'v23.0';

  if (!phoneNumberId || !accessToken || phoneNumberId.trim() === '' || accessToken.trim() === '') {
    if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim() !== '') {
      console.log(`ℹ️ [WhatsApp Service] Meta Cloud API credentials missing/empty. Attempting fallback via Fast2SMS WhatsApp Gateway for template "${templateName}" to ${formattedPhone}...`);
      try {
        const textParams = components.flatMap(c => c.parameters || []).map(p => p.text || '');
        const fast2smsRes = await sendWhatsappTemplate({
          message_id: process.env.FAST2SMS_MESSAGE_ID || process.env.FAST2SMS_OTP_TEMPLATE_ID,
          phone_number_id: process.env.FAST2SMS_PHONE_NUMBER_ID,
          numbers: formattedPhone,
          variables_values: textParams.join('|')
        });
        const timestamp = new Date().toISOString();
        console.log(`✅ [WhatsApp Fast2SMS Fallback Sent] Template: "${templateName}" | To: ${formattedPhone} | RequestID: ${fast2smsRes.request_id || 'Fast2SMS'} | Time: ${timestamp}`);
        return {
          success: true,
          templateName,
          recipientPhone: formattedPhone,
          messageId: fast2smsRes.request_id || 'Fast2SMS',
          metaResponse: fast2smsRes,
          timestamp
        };
      } catch (fast2smsErr) {
        console.warn(`⚠️ [WhatsApp Service] Fast2SMS Fallback Error: ${fast2smsErr.message}`);
      }
    }

    const err = 'Meta WhatsApp credentials unconfigured (WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN missing)';
    console.warn(`⚠️ [WhatsApp Service] ${err}`);
    return { success: false, error: err };
  }

  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      },
      components
    }
  };

  const MAX_RETRIES = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const resData = await response.json();
      const timestamp = new Date().toISOString();

      if (response.ok && (resData.messages || resData.messaging_product)) {
        const messageId = resData.messages?.[0]?.id || 'N/A';
        console.log(`✅ [WhatsApp Meta Sent] Template: "${templateName}" | To: ${formattedPhone} | MessageID: ${messageId} | Time: ${timestamp}`);
        return {
          success: true,
          templateName,
          recipientPhone: formattedPhone,
          messageId,
          metaResponse: resData,
          timestamp
        };
      } else {
        lastError = resData.error?.message || resData.message || `HTTP ${response.status} Error`;
        console.warn(`⚠️ [WhatsApp Meta Attempt ${attempt}/${MAX_RETRIES + 1} Failed] Template: "${templateName}" | To: ${formattedPhone} | Status: ${response.status} | Error: ${lastError}`);
        
        if (response.status < 500 && response.status !== 429) {
          break; // Do not retry client 4xx errors except 429 rate limit
        }
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      lastError = fetchErr.name === 'AbortError' ? 'Request Timeout (10s)' : fetchErr.message;
      console.warn(`⚠️ [WhatsApp Meta Attempt ${attempt}/${MAX_RETRIES + 1} Network Exception] ${lastError}`);
    }

    if (attempt <= MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
    }
  }

  const timestamp = new Date().toISOString();
  console.error(`❌ [WhatsApp Meta Final Error] Template: "${templateName}" | To: ${formattedPhone} | Error: ${lastError} | Time: ${timestamp}`);
  return {
    success: false,
    templateName,
    recipientPhone: formattedPhone,
    error: lastError,
    timestamp
  };
}

/**
 * 1. Send Welcome Template (welcome_new_user)
 * Trigger: Immediately after a new customer successfully registers.
 */
export async function sendWelcome(user) {
  try {
    if (!user || !user.id) return { success: false, error: 'User object missing' };

    // Idempotency check: Send only once per user
    if (user.welcomeWhatsappSent) {
      console.log(`ℹ️ [WhatsApp Service] Welcome notification already sent to user ${user.id}. Skipping.`);
      return { success: true, skipped: true };
    }

    const recipientPhone = user.mobile;
    if (!recipientPhone) {
      console.warn(`⚠️ [WhatsApp Service] User ${user.id} has no mobile number registered. Skipping welcome notification.`);
      return { success: false, error: 'Mobile number missing' };
    }

    const rawName = String(user.name || '').trim();
    const isInvalidOrTempName = !rawName || 
      /^Customer\s*\d*$/i.test(rawName) || 
      /^Guest/i.test(rawName) || 
      /^Unknown/i.test(rawName) || 
      /^\d+$/.test(rawName);

    if (isInvalidOrTempName) {
      console.warn(`⚠️ [WhatsApp Service] Skipped sending welcome notification to user ${user.id} because name "${user.name}" is temporary or invalid.`);
      return { success: false, error: 'User name is temporary or invalid' };
    }

    const customerName = rawName;

    const result = await sendMetaTemplate({
      recipientPhone,
      templateName: 'welcome_new_user',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName }
          ]
        }
      ]
    });

    if (result.success) {
      await prisma.user.update({
        where: { id: user.id },
        data: { welcomeWhatsappSent: true }
      }).catch(err => console.error(`Failed to update welcomeWhatsappSent flag for user ${user.id}:`, err));
    }

    return result;
  } catch (error) {
    console.error('❌ [WhatsApp Service sendWelcome Error]', error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Send Order Placed Template (order_placed_success)
 * Trigger: Only after online payment succeeds OR COD order is created.
 */
export async function sendOrderPlaced(order) {
  try {
    if (!order || !order.id) return { success: false, error: 'Order object missing' };

    // Idempotency check: Send only once per order
    if (order.orderPlacedWhatsappSent) {
      console.log(`ℹ️ [WhatsApp Service] Order Placed notification already sent for order ${order.orderNumber || order.id}. Skipping.`);
      return { success: true, skipped: true };
    }

    const recipientPhone = order.shippingAddress?.phone || order.user?.mobile;
    if (!recipientPhone) {
      console.warn(`⚠️ [WhatsApp Service] Order ${order.id} has no recipient phone. Skipping order_placed_success.`);
      return { success: false, error: 'Recipient phone missing' };
    }

    const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer';
    const orderId = order.orderNumber || order.id;
    const orderAmount = `₹${order.totalAmount}`;

    const result = await sendMetaTemplate({
      recipientPhone,
      templateName: 'order_placed_success',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: orderId },
            { type: 'text', text: orderAmount }
          ]
        }
      ]
    });

    if (result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderPlacedWhatsappSent: true,
          whatsappLogs: {
            push: result
          }
        }
      }).catch(err => console.error(`Failed to update orderPlacedWhatsappSent flag for order ${order.id}:`, err));
    }

    return result;
  } catch (error) {
    console.error('❌ [WhatsApp Service sendOrderPlaced Error]', error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Send Order Packed Template (order_packed)
 * Trigger: Admin changes order status from Processing -> Packed.
 */
export async function sendOrderPacked(order) {
  try {
    if (!order || !order.id) return { success: false, error: 'Order object missing' };

    // Idempotency check: Send only once per order
    if (order.orderPackedWhatsappSent) {
      console.log(`ℹ️ [WhatsApp Service] Order Packed notification already sent for order ${order.orderNumber || order.id}. Skipping.`);
      return { success: true, skipped: true };
    }

    const recipientPhone = order.shippingAddress?.phone || order.user?.mobile;
    if (!recipientPhone) {
      console.warn(`⚠️ [WhatsApp Service] Order ${order.id} has no recipient phone. Skipping order_packed.`);
      return { success: false, error: 'Recipient phone missing' };
    }

    const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer';
    const orderId = order.orderNumber || order.id;

    const result = await sendMetaTemplate({
      recipientPhone,
      templateName: 'order_packed',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: orderId }
          ]
        }
      ]
    });

    if (result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderPackedWhatsappSent: true,
          whatsappLogs: {
            push: result
          }
        }
      }).catch(err => console.error(`Failed to update orderPackedWhatsappSent flag for order ${order.id}:`, err));
    }

    return result;
  } catch (error) {
    console.error('❌ [WhatsApp Service sendOrderPacked Error]', error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Send Order Shipped Template (order_shipped)
 * Trigger: Admin changes order status from Packed -> Shipped.
 */
export async function sendOrderShipped(order) {
  try {
    if (!order || !order.id) return { success: false, error: 'Order object missing' };

    // Idempotency check: Send only once per order
    if (order.orderShippedWhatsappSent) {
      console.log(`ℹ️ [WhatsApp Service] Order Shipped notification already sent for order ${order.orderNumber || order.id}. Skipping.`);
      return { success: true, skipped: true };
    }

    const recipientPhone = order.shippingAddress?.phone || order.user?.mobile;
    if (!recipientPhone) {
      console.warn(`⚠️ [WhatsApp Service] Order ${order.id} has no recipient phone. Skipping order_shipped.`);
      return { success: false, error: 'Recipient phone missing' };
    }

    const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer';
    const orderId = order.orderNumber || order.id;
    const trackingNumber = order.awbCode || order.courierName || 'N/A';

    const result = await sendMetaTemplate({
      recipientPhone,
      templateName: 'order_shipped',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: orderId },
            { type: 'text', text: trackingNumber }
          ]
        }
      ]
    });

    if (result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderShippedWhatsappSent: true,
          whatsappLogs: {
            push: result
          }
        }
      }).catch(err => console.error(`Failed to update orderShippedWhatsappSent flag for order ${order.id}:`, err));
    }

    return result;
  } catch (error) {
    console.error('❌ [WhatsApp Service sendOrderShipped Error]', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper: Format Order Items into a clean bulleted list string for Meta Template {{4}}
 * e.g.:
 * • Moringa Powder (1 × 250g)
 * • Carrot Powder (2 × 500g)
 */
export function formatProductList(orderItems = []) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return '• Standard Order Item';
  }

  const lines = orderItems.map(item => {
    const productName = item.product?.name || item.name || 'Product';
    const quantity = item.quantity || 1;

    let weightOrVariant = '';
    if (item.variant && item.variant.name && item.variant.name !== 'Default') {
      weightOrVariant = item.variant.name;
    } else if (item.variant && item.variant.weight) {
      weightOrVariant = item.variant.weight;
    } else if (item.product && item.product.weight) {
      weightOrVariant = item.product.weight;
    }

    if (weightOrVariant) {
      return `• ${productName} (${quantity} × ${weightOrVariant})`;
    } else {
      return `• ${productName} (×${quantity})`;
    }
  });

  return lines.join('\n');
}

/**
 * 5. Send Admin New Order Template (admin_new_order)
 * Trigger: Automatically sent to Admin whenever an order is successfully created
 * (after online payment confirmation or COD order creation).
 */
export async function sendAdminNewOrder(order) {
  try {
    if (!order || !order.id) return { success: false, error: 'Order object missing' };

    // Idempotency check: Send only once per order
    if (order.adminOrderWhatsappSent) {
      console.log(`ℹ️ [WhatsApp Service] Admin order notification already sent for order ${order.orderNumber || order.id}. Skipping.`);
      return { success: true, skipped: true };
    }

    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
    if (!adminPhone) {
      console.warn(`⚠️ [WhatsApp Service] ADMIN_WHATSAPP_NUMBER is unconfigured in environment variables. Skipping admin_new_order notification.`);
      return { success: false, error: 'ADMIN_WHATSAPP_NUMBER unconfigured' };
    }

    const adminName = process.env.ADMIN_NAME || 'Admin';
    const orderId = order.orderNumber || order.id;
    const customerName = order.shippingAddress?.recipientName || order.user?.name || 'Customer';
    const productList = formatProductList(order.orderItems || []);
    const totalAmount = `₹${order.totalAmount}`;
    const paymentMode = order.paymentMethod === 'COD' ? 'COD' : 'Online';

    console.log(`📡 [WhatsApp Service] Triggering admin_new_order | Admin: ${adminPhone} | Order: ${orderId} | Customer: ${customerName}`);

    const result = await sendMetaTemplate({
      recipientPhone: adminPhone,
      templateName: 'admin_new_order',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: adminName },        // {{1}} Admin Name
            { type: 'text', text: orderId },          // {{2}} Order ID
            { type: 'text', text: customerName },     // {{3}} Customer Name
            { type: 'text', text: productList },      // {{4}} Product List
            { type: 'text', text: totalAmount },     // {{5}} Total Amount
            { type: 'text', text: paymentMode }       // {{6}} Payment Mode
          ]
        }
      ]
    });

    if (result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          adminOrderWhatsappSent: true,
          whatsappLogs: {
            push: result
          }
        }
      }).catch(err => console.error(`Failed to update adminOrderWhatsappSent flag for order ${order.id}:`, err));
    }

    return result;
  } catch (error) {
    console.error('❌ [WhatsApp Service sendAdminNewOrder Error]', error);
    return { success: false, error: error.message };
  }
}

export default {
  formatE164Phone,
  formatProductList,
  sendMetaTemplate,
  sendWelcome,
  sendOrderPlaced,
  sendOrderPacked,
  sendOrderShipped,
  sendAdminNewOrder
};
