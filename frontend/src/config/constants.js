// Centralized Configuration Constants for Suryodaya Farms

export const WHATSAPP_NUMBER = '9100422140';
export const WHATSAPP_COUNTRY_CODE = '91';
export const WHATSAPP_FULL_NUMBER = `${WHATSAPP_COUNTRY_CODE}${WHATSAPP_NUMBER}`; // 919100422140
export const WHATSAPP_FORMATTED_PHONE = `+${WHATSAPP_COUNTRY_CODE} ${WHATSAPP_NUMBER}`; // +91 9100422140

/**
 * Helper function to generate a standardized WhatsApp URL (wa.me format)
 * with an optional pre-filled message.
 * 
 * @param {string} [message] - Text message to encode and attach
 * @returns {string} WhatsApp wa.me URL string
 */
export const getWhatsAppUrl = (message = '') => {
  if (!message) {
    return `https://wa.me/${WHATSAPP_FULL_NUMBER}`;
  }
  // Safely handle pre-encoded or raw string messages
  const encodedMsg = message.includes('%') ? message : encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_FULL_NUMBER}?text=${encodedMsg}`;
};
