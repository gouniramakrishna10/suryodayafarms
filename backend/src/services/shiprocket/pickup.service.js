import { shiprocketClient } from './shiprocket.client.js';
import { shiprocketLogger } from './shiprocket.logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const pickupService = {
  /**
   * Schedule Dispatch Pickup for Shipment
   */
  async schedulePickup({ shipmentId, pickupDate = null, orderId = null }) {
    if (!shipmentId) {
      throw new Error('shipmentId is required to schedule pickup.');
    }

    // Default pickup date to tomorrow if not specified
    const formattedDate = pickupDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const payload = {
        shipment_id: [parseInt(shipmentId)],
        pickup_date: [formattedDate]
      };

      shiprocketLogger.info('PICKUP_SERVICE', `Scheduling pickup for Shipment ID ${shipmentId} on ${formattedDate}...`, payload);

      const response = await shiprocketClient.post('/v1/external/courier/generate/pickup', payload);
      const resData = response.data;

      if (!resData || resData.pickup_status === 0) {
        throw new Error(resData?.response?.data?.message || resData?.message || 'Pickup scheduling failed.');
      }

      const pickupId = resData.response?.pickup_id || resData.pickup_id || `PICKUP-${shipmentId}`;

      // Update DB Order status
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            pickupId: pickupId.toString(),
            shiprocketStatus: 'PICKUP SCHEDULED',
            status: 'PROCESSING'
          }
        });
      }

      shiprocketLogger.info('PICKUP_SERVICE', `Successfully Scheduled Pickup! Pickup ID: ${pickupId}`);

      return {
        success: true,
        pickupId,
        pickupDate: formattedDate,
        response: resData
      };
    } catch (err) {
      shiprocketLogger.error('PICKUP_SERVICE', `Failed to schedule pickup for shipment ${shipmentId}`, err);
      throw err;
    }
  },

  /**
   * List Registered Pickup Locations / Warehouses
   */
  async getPickupAddresses() {
    try {
      shiprocketLogger.info('PICKUP_SERVICE', 'Fetching registered pickup locations...');
      const response = await shiprocketClient.get('/v1/external/settings/company/pickup');
      const data = response.data;

      if (data && data.shipping_address) {
        return {
          success: true,
          addresses: data.shipping_address
        };
      }
      return { success: true, addresses: [] };
    } catch (err) {
      shiprocketLogger.error('PICKUP_SERVICE', 'Failed to fetch pickup addresses', err);
      throw err;
    }
  }
};
