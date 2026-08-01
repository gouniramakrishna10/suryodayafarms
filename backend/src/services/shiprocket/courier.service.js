import { shiprocketClient } from './shiprocket.client.js';
import { serviceabilityService } from './serviceability.service.js';
import { shiprocketLogger } from './shiprocket.logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const courierService = {
  /**
   * Assign Courier Partner & Generate AWB Number
   */
  async assignCourier({ shipmentId, courierId, orderId = null }) {
    if (!shipmentId) {
      throw new Error('shipmentId is required to assign courier.');
    }

    try {
      const payload = {
        shipment_id: shipmentId.toString(),
        courier_id: courierId ? courierId.toString() : ''
      };

      shiprocketLogger.info('COURIER_SERVICE', `Assigning Courier ID ${courierId} to Shipment ID ${shipmentId}...`, payload);

      const response = await shiprocketClient.post('/v1/external/courier/assign/awb', payload);
      const resData = response.data;

      if (!resData || resData.status !== 200 || !resData.response?.data) {
        throw new Error(resData?.message || resData?.response?.data?.awb_assign_error || 'Courier assignment failed.');
      }

      const awbData = resData.response.data;
      const awbCode = awbData.awb_code;
      const courierName = awbData.courier_name;
      const assignedCourierId = awbData.courier_company_id;

      // Update DB Order record if orderId is provided
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            awbCode,
            courierName,
            courierId: parseInt(assignedCourierId),
            shiprocketStatus: 'AWB ASSIGNED',
            status: 'PROCESSING'
          }
        });
      }

      shiprocketLogger.info('COURIER_SERVICE', `Successfully Assigned AWB: ${awbCode} via ${courierName}`);

      return {
        success: true,
        awbCode,
        courierName,
        courierId: assignedCourierId,
        awbData
      };
    } catch (err) {
      shiprocketLogger.error('COURIER_SERVICE', `Failed to assign courier for shipment ${shipmentId}`, err);
      throw err;
    }
  },

  /**
   * Automatically Select Best Courier (Cheapest vs Fastest) and Assign AWB
   */
  async autoAssignBestCourier({ orderId, preferredMode = 'CHEAPEST' }) {
    const dbOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!dbOrder || !dbOrder.shipmentId) {
      throw new Error(`Order ${orderId} does not have a valid Shiprocket shipment ID.`);
    }

    const addr = typeof dbOrder.shippingAddress === 'string'
      ? JSON.parse(dbOrder.shippingAddress)
      : (dbOrder.shippingAddress || {});

    const deliveryPincode = addr.postalCode || addr.pincode;
    if (!deliveryPincode) {
      throw new Error('Delivery pincode missing on order shipping address.');
    }

    // Get serviceability & available couriers
    const serviceability = await serviceabilityService.checkServiceability({
      pickupPincode: '302001',
      deliveryPincode,
      weight: 0.5,
      cod: dbOrder.paymentMethod === 'COD' ? 1 : 0
    });

    if (!serviceability.isServiceable || serviceability.couriers.length === 0) {
      throw new Error(`No available couriers for pincode ${deliveryPincode}`);
    }

    const chosenCourier = preferredMode === 'FASTEST'
      ? serviceability.fastest
      : serviceability.cheapest;

    if (!chosenCourier) {
      throw new Error('Failed to select courier partner.');
    }

    shiprocketLogger.info('COURIER_SERVICE', `Auto-selected ${chosenCourier.tag} Courier: ${chosenCourier.courierName} (ID: ${chosenCourier.courierId})`);

    // Assign courier
    return await this.assignCourier({
      shipmentId: dbOrder.shipmentId,
      courierId: chosenCourier.courierId,
      orderId: dbOrder.id
    });
  }
};
