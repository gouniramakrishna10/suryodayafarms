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

// Complete List of Indian States & Union Territories for Nationwide Delivery
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman & Nicobar Islands',
  'Chandigarh',
  'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi (NCT)',
  'Jammu & Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];
