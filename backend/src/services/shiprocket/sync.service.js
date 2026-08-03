import { shiprocketClient } from './shiprocket.client.js';
import { shiprocketLogger } from './shiprocket.logger.js';
import { parseShiprocketDelivery } from './serviceability.service.js';
import { PrismaClient } from '@prisma/client';
import whatsappService from '../whatsapp.service.js';

const prisma = new PrismaClient();

export const syncService = {
  /**
   * Sync a Single Order by ID or Order Record
   */
  async syncOrder(orderOrId) {
    let order = typeof orderOrId === 'string'
      ? await prisma.order.findUnique({ where: { id: orderOrId } })
      : orderOrId;

    if (!order) {
      throw new Error('Order record not found for Shiprocket sync.');
    }

    const sId = order.shipmentId || order.shiprocketOrderId;
    const awb = order.awbCode;

    if (!sId && !awb) {
      return {
        success: true,
        updated: false,
        message: 'No active Shiprocket Shipment ID or AWB code to sync.',
        order
      };
    }

    try {
      shiprocketLogger.info('SYNC_SERVICE', `Syncing Shiprocket status for Order ${order.orderNumber} (Shipment: ${sId}, AWB: ${awb})...`);

      // Try tracking by shipment ID or AWB
      let trackRes = null;
      if (awb) {
        try {
          const res = await shiprocketClient.get(`/v1/external/courier/track/awb/${awb}`);
          trackRes = res.data;
        } catch (e) {
          shiprocketLogger.warn('SYNC_SERVICE', `AWB track failed for ${awb}: ${e.message}`);
        }
      }

      if (!trackRes && sId) {
        try {
          const res = await shiprocketClient.get(`/v1/external/courier/track/shipment/${sId}`);
          trackRes = res.data;
        } catch (e) {
          shiprocketLogger.warn('SYNC_SERVICE', `Shipment track failed for ${sId}: ${e.message}`);
        }
      }

      if (!trackRes) {
        return {
          success: true,
          updated: false,
          message: 'No new updates found from Shiprocket API.',
          order
        };
      }

      const trackingObj = trackRes.tracking_data || trackRes;
      const trackData = trackingObj.shipment_track?.[0] || trackingObj.shipment_track || trackingObj;
      const rawScans = trackingObj.shipment_track_activities || trackingObj.scans || [];

      // Extract updated fields
      const newStatus = (trackData?.current_status || trackData?.track_status || order.shiprocketStatus || 'SHIPPED').toUpperCase().trim();
      const newCourier = trackData?.courier_name || order.courierName || 'Shiprocket Partner';
      const newAwb = trackData?.awb_code || trackData?.awb || order.awbCode;
      const etdRaw = trackData?.etd || trackData?.expected_date || trackData?.estimated_delivery_date;

      const parsedDelivery = parseShiprocketDelivery(etdRaw, trackData?.estimated_delivery_days, newCourier);
      const newEdd = parsedDelivery.expectedDeliveryDate || (order.logistics ? order.logistics.estimatedDeliveryDate : null);

      // Map to local OrderStatus enum
      let mappedOrderStatus = order.status;
      if (newStatus.includes('DELIVERED')) {
        mappedOrderStatus = 'DELIVERED';
      } else if (newStatus.includes('OUT FOR DELIVERY')) {
        mappedOrderStatus = 'OUT_FOR_DELIVERY';
      } else if (newStatus.includes('IN TRANSIT') || newStatus.includes('SHIPPED') || newStatus.includes('PICKED')) {
        mappedOrderStatus = 'IN_TRANSIT';
      } else if (newStatus.includes('CANCELLED')) {
        mappedOrderStatus = 'CANCELLED';
      }

      // Idempotently process scans for activity history
      const existingHistory = Array.isArray(order.trackingHistory) ? order.trackingHistory : [];
      const formattedScans = rawScans.map((scan) => ({
        status: (scan.current_status || scan.status || scan.activity || 'UPDATE').toUpperCase(),
        location: scan.location || scan.current_location || 'Hub',
        timestamp: scan.date || scan.current_timestamp || scan.updated_at || new Date().toISOString(),
        activity: scan.activity || scan.current_status || scan.sr_status_label || 'Scan event',
        rawScan: scan
      }));

      // Combine existing history and new scans without duplicates
      const historyMap = new Map();
      existingHistory.forEach((h) => {
        const key = `${h.status}_${h.timestamp}_${h.location}`;
        historyMap.set(key, h);
      });
      formattedScans.forEach((s) => {
        const key = `${s.status}_${s.timestamp}_${s.location}`;
        if (!historyMap.has(key)) {
          historyMap.set(key, s);
        }
      });

      const updatedHistory = Array.from(historyMap.values()).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Determine if anything changed
      const hasChanged = (
        newStatus !== order.shiprocketStatus ||
        mappedOrderStatus !== order.status ||
        newAwb !== order.awbCode ||
        newCourier !== order.courierName ||
        updatedHistory.length > existingHistory.length
      );

      // Update database
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          shiprocketStatus: newStatus,
          status: mappedOrderStatus,
          courierName: newCourier,
          awbCode: newAwb,
          shiprocketData: trackRes,
          trackingHistory: updatedHistory,
          updatedAt: new Date()
        },
        include: {
          orderItems: {
            include: { product: true }
          }
        }
      });

      if (mappedOrderStatus === 'DELIVERED' && order.status !== 'DELIVERED') {
        whatsappService.sendOrderDelivered(updatedOrder)
          .catch(err => shiprocketLogger.error('SYNC_SERVICE', `WhatsApp Order Delivered error: ${err.message}`));
      }

      shiprocketLogger.info('SYNC_SERVICE', `Synced Order ${order.orderNumber} successfully! Status: ${newStatus} (${hasChanged ? 'Updated' : 'No changes'}).`);

      return {
        success: true,
        updated: hasChanged,
        message: hasChanged ? 'Shipment updated from Shiprocket.' : 'No new updates found.',
        order: updatedOrder
      };
    } catch (err) {
      shiprocketLogger.error('SYNC_SERVICE', `Failed to sync order ${order.orderNumber}`, err);
      throw err;
    }
  },

  /**
   * Sync All Active Non-Terminal Shipments (Cron Job / Refresh All)
   */
  async syncAllActiveShipments() {
    shiprocketLogger.info('SYNC_SERVICE', 'Starting batch sync for all active non-terminal shipments...');

    // Find all active orders with a Shiprocket Order ID
    const activeOrders = await prisma.order.findMany({
      where: {
        shiprocketOrderId: { not: null },
        status: { notIn: ['DELIVERED', 'CANCELLED'] },
        OR: [
          { shiprocketStatus: null },
          { shiprocketStatus: { notIn: ['DELIVERED', 'CANCELLED', 'RTO_DELIVERED', 'RTO_COMPLETED'] } }
        ]
      }
    });

    shiprocketLogger.info('SYNC_SERVICE', `Found ${activeOrders.length} active shipments to sync.`);

    let updatedCount = 0;
    let unchangedCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const order of activeOrders) {
      try {
        // Rate-limiting delay: 250ms between requests to strictly avoid Shiprocket 429 rate limit
        await new Promise((r) => setTimeout(r, 250));

        const result = await this.syncOrder(order);
        if (result.updated) {
          updatedCount++;
        } else {
          unchangedCount++;
        }
      } catch (err) {
        failedCount++;
        errors.push({ orderId: order.id, orderNumber: order.orderNumber, message: err.message });
        shiprocketLogger.warn('SYNC_SERVICE', `Cron sync failed for Order ${order.orderNumber}: ${err.message}`);
      }
    }

    shiprocketLogger.info('SYNC_SERVICE', `Batch sync finished! Total: ${activeOrders.length}, Updated: ${updatedCount}, Unchanged: ${unchangedCount}, Failed: ${failedCount}`);

    return {
      success: true,
      total: activeOrders.length,
      updatedCount,
      unchangedCount,
      failedCount,
      errors
    };
  }
};
