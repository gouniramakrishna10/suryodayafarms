import { authService } from '../services/shiprocket/auth.service.js';
import { serviceabilityService } from '../services/shiprocket/serviceability.service.js';
import { ordersService } from '../services/shiprocket/orders.service.js';
import { courierService } from '../services/shiprocket/courier.service.js';
import { pickupService } from '../services/shiprocket/pickup.service.js';
import { labelService } from '../services/shiprocket/label.service.js';
import { trackingService } from '../services/shiprocket/tracking.service.js';
import { webhookService } from '../services/shiprocket/webhook.service.js';
import { syncService } from '../services/shiprocket/sync.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const shiprocketController = {
  // 1. Auth & Connection Status
  async getAuthStatus(req, res) {
    try {
      const status = authService.getTokenStatus();
      res.json({ success: true, status });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async testConnection(req, res) {
    try {
      const result = await authService.testConnection();
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Shipping Rate Calculator & Serviceability
  async checkRateAndServiceability(req, res) {
    try {
      const { pickupPincode, deliveryPincode, weight, length, width, height, cod, declaredValue } = req.body;
      const result = await serviceabilityService.checkServiceability({
        pickupPincode,
        deliveryPincode,
        weight,
        length,
        width,
        height,
        cod,
        declaredValue
      });
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async getEstimatedDelivery(req, res) {
    try {
      const { pickupPincode, deliveryPincode, weight, cod } = req.body;
      const result = await serviceabilityService.getEstimatedDelivery({
        pickupPincode,
        deliveryPincode,
        weight,
        cod
      });
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // 3. Create Order
  async createOrder(req, res) {
    try {
      const { orderId, pickupLocation, length, width, height, weight } = req.body;
      const result = await ordersService.createShiprocketOrder({
        orderId,
        pickupLocation,
        length,
        width,
        height,
        weight
      });
      res.json(result);
    } catch (err) {
      const statusCode = err.statusCode || err.response?.status || 400;
      res.status(statusCode).json({
        success: false,
        message: err.message,
        errors: err.response?.data?.errors || null
      });
    }
  },

  // 4. List Sync Orders
  async listOrders(req, res) {
    try {
      const result = await ordersService.listShiprocketOrders(req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 5. Assign Courier
  async assignCourier(req, res) {
    try {
      const { shipmentId, courierId, orderId, autoAssign, mode, preferredMode } = req.body;
      if ((autoAssign || preferredMode || !courierId) && orderId) {
        const result = await courierService.autoAssignBestCourier({ orderId, preferredMode: preferredMode || mode || 'CHEAPEST' });
        return res.json(result);
      }
      const result = await courierService.assignCourier({ shipmentId, courierId, orderId });
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 6. Schedule Pickup
  async schedulePickup(req, res) {
    try {
      const { shipmentId, pickupDate, orderId } = req.body;
      const result = await pickupService.schedulePickup({ shipmentId, pickupDate, orderId });
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 7. Generate Label / Manifest / Invoice
  async generateLabel(req, res) {
    try {
      const { shipmentId, orderId } = req.query;
      const result = await labelService.generateLabel({ shipmentId, orderId });
      res.json(result);
    } catch (err) {
      const statusCode = err.statusCode || err.response?.status || 400;
      res.status(statusCode).json({ success: false, message: err.message });
    }
  },

  async generateManifest(req, res) {
    try {
      const { shipmentId, orderId } = req.query;
      const result = await labelService.generateManifest({ shipmentId, orderId });
      res.json(result);
    } catch (err) {
      const statusCode = err.statusCode || err.response?.status || 400;
      res.status(statusCode).json({ success: false, message: err.message });
    }
  },

  async generateInvoice(req, res) {
    try {
      const { shiprocketOrderIds, orderId } = req.query;
      const ids = shiprocketOrderIds ? shiprocketOrderIds.split(',') : [];
      const result = await labelService.generateInvoice({ shiprocketOrderIds: ids, orderId });
      res.json(result);
    } catch (err) {
      const statusCode = err.statusCode || err.response?.status || 400;
      res.status(statusCode).json({ success: false, message: err.message });
    }
  },

  // 8. Cancel Order
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const cancelledBy = (req.user?.role === 'ADMIN' || req.user?.isAdmin) ? 'ADMIN' : 'CUSTOMER';
      const result = await ordersService.cancelShiprocketOrder(orderId, cancelledBy);
      res.json(result);
    } catch (err) {
      res.status(err.statusCode || 400).json({ success: false, message: err.message });
    }
  },

  // 9. Tracking
  async trackOrder(req, res) {
    try {
      const { identifier } = req.params;
      const { type } = req.query; // 'awb' | 'order' | 'shipment'

      if (type === 'awb' || identifier.length > 10 && !isNaN(identifier)) {
        const result = await trackingService.trackByAwb(identifier);
        return res.json(result);
      }

      if (type === 'shipment') {
        const result = await trackingService.trackByShipmentId(identifier);
        return res.json(result);
      }

      const result = await trackingService.trackByOrderId(identifier);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 10. Pickup Addresses
  async getPickupAddresses(req, res) {
    try {
      const result = await pickupService.getPickupAddresses();
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 11. Webhook Handler
  async handleWebhook(req, res) {
    // Respond HTTP 200 immediately as per Shiprocket documentation
    res.status(200).json({ success: true, message: 'Webhook received successfully.' });

    // Process tracking payload asynchronously
    try {
      await webhookService.processWebhook(req.headers, req.body);
    } catch (err) {
      console.error('[SHIPROCKET WEBHOOK ERROR]', err);
    }
  },

  // 12. Shipping Settings CRUD
  async getSettings(req, res) {
    try {
      let settings = await prisma.shippingSettings.findUnique({ where: { id: 'default' } });
      if (!settings) {
        settings = await prisma.shippingSettings.create({
          data: { id: 'default' }
        });
      }
      res.json({ success: true, settings });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateSettings(req, res) {
    try {
      const data = req.body;
      const settings = await prisma.shippingSettings.upsert({
        where: { id: 'default' },
        update: data,
        create: { id: 'default', ...data }
      });
      res.json({ success: true, settings });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 13. Diagnostics & Test Suite
  async testRateDiagnostic(req, res) {
    try {
      const { deliveryPincode = '110001', weight = 0.5 } = req.body;
      const result = await serviceabilityService.checkServiceability({
        pickupPincode: '302001',
        deliveryPincode,
        weight,
        cod: 0
      });
      res.json({ success: true, diagnostic: 'RATE_CALCULATOR', result });
    } catch (err) {
      res.status(500).json({ success: false, diagnostic: 'RATE_CALCULATOR', error: err.message });
    }
  },

  async testWebhookDiagnostic(req, res) {
    try {
      const samplePayload = {
        awb: 'TEST-AWB-999999',
        order_id: 'TEST-ORDER-1234',
        current_status: 'IN TRANSIT',
        current_timestamp: new Date().toISOString(),
        scans: [{ activity: 'Package in transit at Jaipur Hub', location: 'Jaipur Hub' }]
      };
      const result = await webhookService.processWebhook({ 'anx-api-key': process.env.SHIPROCKET_WEBHOOK_SECRET }, samplePayload);
      res.json({ success: true, diagnostic: 'WEBHOOK_PROCESSOR', result });
    } catch (err) {
      res.status(500).json({ success: false, diagnostic: 'WEBHOOK_PROCESSOR', error: err.message });
    }
  },

  // 13. Synchronize Single Order from Shiprocket
  async syncOrder(req, res) {
    try {
      const { orderId } = req.params;
      const result = await syncService.syncOrder(orderId);
      res.json(result);
    } catch (err) {
      res.status(err.statusCode || 400).json({ success: false, message: err.message });
    }
  },

  // 14. Synchronize All Active Shipments from Shiprocket
  async syncAllOrders(req, res) {
    try {
      const result = await syncService.syncAllActiveShipments();
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
