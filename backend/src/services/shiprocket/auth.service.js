import { tokenManager } from './token.manager.js';
import { shiprocketLogger } from './shiprocket.logger.js';

export const authService = {
  /**
   * Check connection & test token validity
   */
  async testConnection() {
    try {
      const token = await tokenManager.getToken(true);
      const status = tokenManager.getStatus();
      shiprocketLogger.info('AUTH_SERVICE', 'Test Connection Successful.');
      return {
        success: true,
        message: 'Successfully authenticated with Shiprocket API User credentials.',
        status
      };
    } catch (err) {
      shiprocketLogger.error('AUTH_SERVICE', 'Test Connection Failed', err);
      return {
        success: false,
        error: err.message,
        status: tokenManager.getStatus()
      };
    }
  },

  /**
   * Get current token status
   */
  getTokenStatus() {
    return tokenManager.getStatus();
  }
};
