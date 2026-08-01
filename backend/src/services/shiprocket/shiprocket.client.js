import axios from 'axios';
import { tokenManager } from './token.manager.js';
import { shiprocketLogger } from './shiprocket.logger.js';

const baseURL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in';

// Circuit Breaker State
let consecutiveFailures = 0;
const FAILURE_THRESHOLD = 5;
let circuitBreakerResetTime = 0;
const RESET_TIMEOUT_MS = 60000; // 1 minute cooldown

export const shiprocketClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// REQUEST INTERCEPTOR: Inject Bearer Token
shiprocketClient.interceptors.request.use(
  async (config) => {
    // Check Circuit Breaker
    const now = Date.now();
    if (consecutiveFailures >= FAILURE_THRESHOLD) {
      if (now < circuitBreakerResetTime) {
        const cooldownRemaining = Math.ceil((circuitBreakerResetTime - now) / 1000);
        shiprocketLogger.warn('CLIENT', `Circuit Breaker Active. Cooldown: ${cooldownRemaining}s`);
        return Promise.reject(new Error(`Shiprocket API circuit breaker active. Try again in ${cooldownRemaining} seconds.`));
      } else {
        // Reset Circuit Breaker after cooldown
        consecutiveFailures = 0;
        shiprocketLogger.info('CLIENT', 'Circuit Breaker Cooldown Expired. Resetting state.');
      }
    }

    // Skip token injection for login endpoint
    if (config.url && config.url.includes('/auth/login')) {
      return config;
    }

    try {
      const token = await tokenManager.getToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      shiprocketLogger.error('CLIENT', 'Failed to retrieve auth token for request', err);
      return Promise.reject(err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle 401 (Auto Refresh), 429 & 5xx Exponential Retry
shiprocketClient.interceptors.response.use(
  (response) => {
    consecutiveFailures = 0; // Reset consecutive failures on success
    return response;
  },
  async (error) => {
    const { config, response } = error;

    if (!config) {
      return Promise.reject(error);
    }

    // Mark failure for circuit breaker if network or server error
    if (!response || response.status >= 500) {
      consecutiveFailures++;
      if (consecutiveFailures >= FAILURE_THRESHOLD) {
        circuitBreakerResetTime = Date.now() + RESET_TIMEOUT_MS;
        shiprocketLogger.warn('CLIENT', `Circuit Breaker Tripped! ${consecutiveFailures} consecutive failures.`);
      }
    }

    // 1. Handle 401 Unauthorized (Token Expiration / Invalidation)
    if (response && response.status === 401 && !config._isRetry) {
      config._isRetry = true;
      shiprocketLogger.warn('CLIENT', 'Received 401 Unauthorized. Refreshing token & retrying request...');

      try {
        const newToken = await tokenManager.getToken(true);
        config.headers.Authorization = `Bearer ${newToken}`;
        return shiprocketClient(config);
      } catch (refreshError) {
        shiprocketLogger.error('CLIENT', 'Failed to refresh token during 401 retry', refreshError);
        return Promise.reject(refreshError);
      }
    }

    // 2. Handle 429 Rate Limiting & 500 Server Errors with Exponential Backoff
    const shouldRetry = (response && (response.status === 429 || response.status >= 500)) || !response;
    const currentRetry = config._retryCount || 0;
    const maxRetries = 3;

    if (shouldRetry && currentRetry < maxRetries) {
      config._retryCount = currentRetry + 1;
      const delayMs = Math.pow(2, currentRetry) * 1000 + Math.floor(Math.random() * 500); // 1s, 2s, 4s + jitter

      shiprocketLogger.warn('CLIENT', `Retrying request (${config._retryCount}/${maxRetries}) after ${delayMs}ms due to status ${response?.status || 'Network Error'}`);

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return shiprocketClient(config);
    }

    shiprocketLogger.error('CLIENT', `Request failed with status ${response?.status || 'Network Error'}`, response?.data || error.message);
    return Promise.reject(error);
  }
);
