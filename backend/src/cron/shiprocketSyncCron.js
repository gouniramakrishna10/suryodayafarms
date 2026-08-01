import cron from 'node-cron';
import { syncService } from '../services/shiprocket/sync.service.js';
import { syncAllPendingRefunds } from '../services/razorpay.service.js';
import { shiprocketLogger } from '../services/shiprocket/shiprocket.logger.js';

/**
 * Initialize 5-minute background cron job for Shiprocket order synchronization
 * & 6-hour background cron jobs for customer shipments & Razorpay refund lifecycle
 */
export const initShiprocketSyncCron = () => {
  shiprocketLogger.info('CRON_SYNC', 'Initializing 5-minute & 6-hour Shiprocket and Razorpay Refund Background Sync Cron Jobs...');

  // 1. 5-Minute Cron for real-time active admin dashboard shipments
  cron.schedule('*/5 * * * *', async () => {
    shiprocketLogger.info('CRON_SYNC', '5-Minute Cron Triggered: Running automatic Shiprocket order sync...');
    try {
      const summary = await syncService.syncAllActiveShipments();
      shiprocketLogger.info('CRON_SYNC', `5-Min Cron Sync Complete. Total: ${summary.total}, Updated: ${summary.updatedCount}, Failed: ${summary.failedCount}`);
    } catch (err) {
      shiprocketLogger.error('CRON_SYNC', 'Fatal error during 5-min cron sync run', err);
    }
  });

  // 2. 6-Hour Cron for lightweight background sweep of all active customer shipments
  cron.schedule('0 */6 * * *', async () => {
    shiprocketLogger.info('CRON_SYNC', '6-Hour Cron Triggered: Running customer active shipments sweep...');
    try {
      const summary = await syncService.syncAllActiveShipments();
      shiprocketLogger.info('CRON_SYNC', `6-Hour Cron Sync Complete. Total: ${summary.total}, Updated: ${summary.updatedCount}, Failed: ${summary.failedCount}`);
    } catch (err) {
      shiprocketLogger.error('CRON_SYNC', 'Fatal error during 6-hour cron sync run', err);
    }
  });

  // 3. 6-Hour Cron for polling pending Razorpay refunds (INITIATED, PROCESSING)
  cron.schedule('0 */6 * * *', async () => {
    shiprocketLogger.info('CRON_SYNC', '6-Hour Cron Triggered: Running pending Razorpay refunds lifecycle sync...');
    try {
      const summary = await syncAllPendingRefunds();
      shiprocketLogger.info('CRON_SYNC', `6-Hour Razorpay Refund Sync Complete. Total: ${summary.total}, Completed: ${summary.updated}`);
    } catch (err) {
      shiprocketLogger.error('CRON_SYNC', 'Fatal error during 6-hour refund cron sync run', err);
    }
  });
};
