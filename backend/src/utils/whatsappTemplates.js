import { sendWhatsappTemplate } from '../services/fast2sms.service.js';

/**
 * Reusable WhatsApp Notification Template Mapping
 */
export const TEMPLATE_CONFIG = {
  OTP: () => process.env.FAST2SMS_OTP_TEMPLATE_ID,
  WELCOME: () => process.env.FAST2SMS_TEMPLATE_WELCOME,
  ORDER_PLACED: () => process.env.FAST2SMS_TEMPLATE_ORDER,
  ORDER_PACKED: () => process.env.FAST2SMS_TEMPLATE_PACKED || process.env.FAST2SMS_TEMPLATE_ORDER,
  ORDER_SHIPPED: () => process.env.FAST2SMS_TEMPLATE_SHIPPED,
  DELIVERED: () => process.env.FAST2SMS_TEMPLATE_DELIVERED,
  REFUND: () => process.env.FAST2SMS_TEMPLATE_REFUND,
  CANCELLATION: () => process.env.FAST2SMS_TEMPLATE_CANCELLED
};

/**
 * Send WhatsApp Template Message with dynamic env configuration
 * 
 * @param {string} type - Template type ('OTP', 'WELCOME', 'ORDER_PLACED', etc.)
 * @param {string} recipientMobile - 10-digit Indian mobile number
 * @param {Array|string} variableValues - Array or pipe-separated string of template variables
 * @param {Object} options - Additional optional parameters (media_url, document_filename, udf1, udf2, udf3)
 */
export async function sendWhatsappNotification(type, recipientMobile, variableValues = [], options = {}) {
  try {
    const resolver = TEMPLATE_CONFIG[type?.toUpperCase()];
    if (!resolver) {
      console.warn(`⚠️ [WhatsApp Helper] Unsupported template type "${type}". Supported types: ${Object.keys(TEMPLATE_CONFIG).join(', ')}`);
      return { success: false, message: `Unsupported template type "${type}"` };
    }

    const messageId = resolver();
    if (!messageId) {
      console.warn(`⚠️ [WhatsApp Helper] Template ID for "${type}" is not configured in .env variables.`);
      return { success: false, message: `Template ID for ${type} is not configured.` };
    }

    const phoneNumberId = options.phoneNumberId || process.env.FAST2SMS_PHONE_NUMBER_ID;

    const result = await sendWhatsappTemplate({
      message_id: messageId,
      phone_number_id: phoneNumberId,
      numbers: recipientMobile,
      variables_values: variableValues,
      media_url: options.media_url,
      document_filename: options.document_filename,
      udf1: options.udf1,
      udf2: options.udf2,
      udf3: options.udf3
    });

    console.log(`✅ [WhatsApp Sent] Type: ${type}, Recipient: ${recipientMobile}, RequestID: ${result.request_id || result.requestId || 'N/A'}`);
    return {
      success: true,
      requestId: result.request_id || result.requestId,
      raw: result
    };
  } catch (error) {
    console.error(`❌ [WhatsApp Failed] Type: ${type}, Recipient: ${recipientMobile}, Error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  TEMPLATE_CONFIG,
  sendWhatsappNotification
};
