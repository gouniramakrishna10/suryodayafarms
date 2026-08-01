import express from 'express';
import { shiprocketController } from '../controllers/shiprocketController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public / Customer Checkout APIs
router.post('/rate-calculator', shiprocketController.checkRateAndServiceability);
router.post('/estimated-delivery', shiprocketController.getEstimatedDelivery);
router.get('/tracking/:identifier', shiprocketController.trackOrder);

// Shiprocket Webhook (Public POST endpoint for Shiprocket server calls)
router.post('/webhook', shiprocketController.handleWebhook);

// Admin-Only Shiprocket Management APIs
router.get('/auth/status', protect, adminOnly, shiprocketController.getAuthStatus);
router.post('/auth/test-connection', protect, adminOnly, shiprocketController.testConnection);
router.post('/orders', protect, adminOnly, shiprocketController.createOrder);
router.get('/orders', protect, adminOnly, shiprocketController.listOrders);
router.post('/orders/:orderId/cancel', protect, adminOnly, shiprocketController.cancelOrder);
router.post('/assign-courier', protect, adminOnly, shiprocketController.assignCourier);
router.post('/courier/auto-assign', protect, adminOnly, shiprocketController.assignCourier);
router.post('/schedule-pickup', protect, adminOnly, shiprocketController.schedulePickup);
router.post('/pickup', protect, adminOnly, shiprocketController.schedulePickup);
router.get('/label', protect, adminOnly, shiprocketController.generateLabel);
router.get('/manifest', protect, adminOnly, shiprocketController.generateManifest);
router.get('/invoice', protect, adminOnly, shiprocketController.generateInvoice);
router.get('/pickup-addresses', protect, adminOnly, shiprocketController.getPickupAddresses);
router.get('/settings', protect, adminOnly, shiprocketController.getSettings);
router.put('/settings', protect, adminOnly, shiprocketController.updateSettings);

// Synchronize Shipments
router.post('/sync-all', protect, adminOnly, shiprocketController.syncAllOrders);
router.post('/sync/:orderId', protect, adminOnly, shiprocketController.syncOrder);

// Diagnostics & Test Suite
router.post('/diagnostics/test-rate', protect, adminOnly, shiprocketController.testRateDiagnostic);
router.post('/diagnostics/test-webhook', protect, adminOnly, shiprocketController.testWebhookDiagnostic);

export default router;
