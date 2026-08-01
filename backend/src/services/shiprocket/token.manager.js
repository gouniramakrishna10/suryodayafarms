import axios from 'axios';
import { shiprocketLogger } from './shiprocket.logger.js';

class TokenManager {
  constructor() {
    this.token = null;
    this.expiresAt = null;
    this.refreshPromise = null;
  }

  /**
   * Get valid Bearer Token for Shiprocket APIs.
   * Auto-refreshes if missing or expiring within 60 minutes.
   */
  async getToken(forceRefresh = false) {
    const now = Date.now();
    // Buffer time: 60 minutes before expiration
    const isExpiringSoon = this.expiresAt && (this.expiresAt - now < 60 * 60 * 1000);

    if (!forceRefresh && this.token && !isExpiringSoon) {
      return this.token;
    }

    // Deduplicate concurrent token refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refreshToken();
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform authentication request against Shiprocket API User login endpoint
   */
  async refreshToken() {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    const baseURL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in';

    if (!email || !password) {
      const errorMsg = 'SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD environment variable is missing.';
      shiprocketLogger.error('TOKEN_MANAGER', errorMsg);
      throw new Error(errorMsg);
    }

    shiprocketLogger.info('TOKEN_MANAGER', 'Authenticating with Shiprocket API User credentials...', { email });

    try {
      const response = await axios.post(`${baseURL}/v1/external/auth/login`, {
        email,
        password
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        // Shiprocket tokens are valid for 10 days (864000 seconds)
        // Set expiry to 9 days from now to ensure buffer
        this.expiresAt = Date.now() + (9 * 24 * 60 * 60 * 1000);

        shiprocketLogger.info('TOKEN_MANAGER', 'Successfully obtained new Shiprocket Bearer Token.');
        return this.token;
      } else {
        throw new Error('Invalid response structure from Shiprocket auth API.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      shiprocketLogger.error('TOKEN_MANAGER', `Authentication failed: ${errMsg}`, err);
      this.token = null;
      this.expiresAt = null;
      throw new Error(`Shiprocket Auth Error: ${errMsg}`);
    }
  }

  /**
   * Get current token status summary (For Admin Settings UI)
   */
  getStatus() {
    const isValid = !!(this.token && this.expiresAt && Date.now() < this.expiresAt);
    return {
      isAuthenticated: isValid,
      expiresAt: this.expiresAt ? new Date(this.expiresAt).toISOString() : null,
      emailConfigured: !!process.env.SHIPROCKET_EMAIL,
      apiKeyConfigured: !!process.env.SHIPROCKET_API_KEY,
      webhookConfigured: !!process.env.SHIPROCKET_WEBHOOK_SECRET
    };
  }
}

export const tokenManager = new TokenManager();
