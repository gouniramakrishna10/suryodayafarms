import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://www.fast2sms.com';

// Cache for WABA Templates List (TTL: 10 Minutes)
let templatesCache = {
  data: null,
  expiresAt: 0
};

/**
 * Send WhatsApp OTP Message via Fast2SMS using Axios GET
 * GET https://www.fast2sms.com/dev/whatsapp
 */
export async function sendWhatsappOtp({ mobile, otp }) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const messageId = process.env.FAST2SMS_MESSAGE_ID || '27533';
  const phoneNumberId = process.env.FAST2SMS_PHONE_NUMBER_ID || '1234110443123433';

  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ [Fast2SMS Service Error]: FAST2SMS_API_KEY is missing from process.env');
    throw new Error('SMS Gateway configuration error: FAST2SMS_API_KEY missing.');
  }

  // Format 4 pipe-separated variables for template 27533:
  // {{1}} = OTP code (e.g. 482193)
  // {{2}} = Service / Brand ("Suryodaya Farms")
  // {{3}} = Validity duration ("10 minutes")
  // {{4}} = Helpline / Support number ("9100422140")
  const supportNumber = process.env.SUPPORT_PHONE || '9100422140';
  const variablesValues = `${otp}|Suryodaya Farms|10 minutes|${supportNumber}`;

  const url = `${BASE_URL}/dev/whatsapp`;
  const method = 'GET';
  const headers = {
    Authorization: apiKey.trim()
  };
  const params = {
    message_id: messageId,
    phone_number_id: phoneNumberId,
    numbers: String(mobile).trim(),
    variables_values: variablesValues
  };

  console.log("FAST2SMS REQUEST", {
    method,
    url,
    headers: { Authorization: `${headers.Authorization.slice(0, 4)}...` },
    params
  });

  console.log("VARIABLES_VALUES:", variablesValues);

  try {
    const response = await axios.get(url, {
      headers,
      params
    });

    console.log("FAST2SMS RESPONSE STATUS:", response.status);
    console.log("FAST2SMS RESPONSE DATA:", response.data);

    return response.data;
  } catch (err) {
    console.log("STATUS", err.response?.status);
    console.log("HEADERS", err.response?.headers);
    console.log("DATA", err.response?.data);
    console.log("REQUEST", err.config);
    throw err;
  }
}

/**
 * Get WABA Details (WhatsApp Business Account)
 * GET /dev/dlt_manager/whatsapp?type=number
 */
export async function getWaba() {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const response = await axios.get(`${BASE_URL}/dev/dlt_manager/whatsapp`, {
    headers: { Authorization: apiKey.trim() },
    params: { type: 'number' }
  });
  return response.data;
}

/**
 * Get WhatsApp Template Details with 10-min Backend Cache
 * GET /dev/dlt_manager/whatsapp?type=template
 */
export async function getTemplates(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && templatesCache.data && templatesCache.expiresAt > now) {
    console.log('⚡ [Fast2SMS Service] Returning WhatsApp templates from backend cache');
    return templatesCache.data;
  }

  const apiKey = process.env.FAST2SMS_API_KEY;
  const response = await axios.get(`${BASE_URL}/dev/dlt_manager/whatsapp`, {
    headers: { Authorization: apiKey.trim() },
    params: { type: 'template' }
  });

  templatesCache = {
    data: response.data,
    expiresAt: now + 10 * 60 * 1000 // Cache for 10 minutes
  };

  return response.data;
}

/**
 * Send General WhatsApp Template Message
 * GET /dev/whatsapp
 */
export async function sendWhatsappTemplate({
  message_id,
  phone_number_id,
  numbers,
  variables_values,
  media_url,
  document_filename,
  udf1,
  udf2,
  udf3
}) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const targetPhoneNumberId = phone_number_id || process.env.FAST2SMS_PHONE_NUMBER_ID;
  const targetMessageId = message_id || process.env.FAST2SMS_MESSAGE_ID;

  if (!targetMessageId) {
    throw new Error('WhatsApp Template Error: message_id is required.');
  }

  if (!targetPhoneNumberId) {
    throw new Error('WhatsApp Template Error: phone_number_id / FAST2SMS_PHONE_NUMBER_ID is missing.');
  }

  const params = {
    message_id: String(targetMessageId).trim(),
    phone_number_id: String(targetPhoneNumberId).trim(),
    numbers: String(numbers).trim()
  };

  if (variables_values) {
    params.variables_values = Array.isArray(variables_values) ? variables_values.join('|') : String(variables_values);
  }
  if (media_url) params.media_url = String(media_url);
  if (document_filename) params.document_filename = String(document_filename);
  if (udf1) params.udf1 = String(udf1);
  if (udf2) params.udf2 = String(udf2);
  if (udf3) params.udf3 = String(udf3);

  const response = await axios.get(`${BASE_URL}/dev/whatsapp`, {
    headers: { Authorization: apiKey.trim() },
    params
  });

  return response.data;
}

export default {
  sendWhatsappOtp,
  getWaba,
  getTemplates,
  sendWhatsappTemplate
};
