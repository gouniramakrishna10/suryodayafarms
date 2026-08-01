import { shiprocketClient } from './shiprocket.client.js';
import { shiprocketLogger } from './shiprocket.logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const trackingService = {
  /**
   * Track Shipment by AWB Code
   */
  async trackByAwb(awbCode) {
    if (!awbCode) {
      throw new Error('awbCode is required for tracking.');
    }

    try {
      shiprocketLogger.info('TRACKING_SERVICE', `Tracking shipment by AWB Code: ${awbCode}`);

      const response = await shiprocketClient.get(`/v1/external/courier/track/awb/${awbCode}`);
      const data = response.data;

      const trackingData = data?.tracking_data || data;

      // Also sync to DB Order if AWB matches
      if (awbCode) {
        const currentStatus = trackingData?.shipment_track?.[0]?.current_status || trackingData?.track_status;
        const scans = trackingData?.shipment_track_activities || trackingData?.scans || [];

        if (currentStatus) {
          await prisma.order.updateMany({
            where: { awbCode },
            data: {
              shiprocketStatus: currentStatus,
              trackingHistory: scans
            }
          });
        }
      }

      return {
        success: true,
        awbCode,
        tracking: trackingData
      };
    } catch (err) {
      shiprocketLogger.error('TRACKING_SERVICE', `Failed to track AWB: ${awbCode}`, err);
      throw err;
    }
  },

  /**
   * Track Shipment by Shiprocket Order ID or Reference Order Number
   */
  async trackByOrderId(orderId) {
    if (!orderId) {
      throw new Error('orderId is required for tracking.');
    }

    try {
      shiprocketLogger.info('TRACKING_SERVICE', `Tracking shipment by Order ID / Number: ${orderId}`);

      const response = await shiprocketClient.get(`/v1/external/courier/track`, {
        params: { order_id: orderId }
      });
      const data = response.data;

      return {
        success: true,
        orderId,
        tracking: data
      };
    } catch (err) {
      shiprocketLogger.error('TRACKING_SERVICE', `Failed to track Order ID: ${orderId}`, err);
      throw err;
    }
  },

  /**
   * Track Shipment by Shiprocket Shipment ID
   */
  async trackByShipmentId(shipmentId) {
    if (!shipmentId) {
      throw new Error('shipmentId is required for tracking.');
    }

    try {
      shiprocketLogger.info('TRACKING_SERVICE', `Tracking shipment by Shipment ID: ${shipmentId}`);

      const response = await shiprocketClient.get(`/v1/external/courier/track/shipment/${shipmentId}`);
      return {
        success: true,
        shipmentId,
        tracking: response.data
      };
    } catch (err) {
      shiprocketLogger.error('TRACKING_SERVICE', `Failed to track Shipment ID: ${shipmentId}`, err);
      throw err;
    }
  }
};
