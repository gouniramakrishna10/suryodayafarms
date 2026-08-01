/**
 * Shiprocket Integration Logger
 * Provides structured logging for API calls, auth lifecycle, courier assignment, tracking, and webhooks.
 */

export const shiprocketLogger = {
  info: (module, message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[SHIPROCKET INFO][${timestamp}][${module}] ${message}`, data ? JSON.stringify(data) : '');
  },

  warn: (module, message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[SHIPROCKET WARN][${timestamp}][${module}] ${message}`, data ? JSON.stringify(data) : '');
  },

  error: (module, message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[SHIPROCKET ERROR][${timestamp}][${module}] ${message}`, error?.response?.data || error?.message || error || '');
  },

  webhook: (event, payload) => {
    const timestamp = new Date().toISOString();
    console.log(`[SHIPROCKET WEBHOOK][${timestamp}][EVENT: ${event}]`, JSON.stringify(payload));
  }
};
