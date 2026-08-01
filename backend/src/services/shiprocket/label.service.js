import { shiprocketClient } from './shiprocket.client.js';
import { shiprocketLogger } from './shiprocket.logger.js';
import { courierService } from './courier.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const labelService = {
  /**
   * Generate Shipping Label PDF URL
   */
  async generateLabel({ shipmentId, orderId = null }) {
    if (!shipmentId) {
      throw new Error('shipmentId is required to generate label.');
    }

    try {
      const payload = {
        shipment_id: [parseInt(shipmentId)]
      };

      shiprocketLogger.info('LABEL_SERVICE', `Generating shipping label for Shipment ID ${shipmentId}...`, payload);

      let response = await shiprocketClient.post('/v1/external/courier/generate/label', payload);
      let resData = response.data;
      let labelUrl = resData?.label_url || resData?.response?.label_url;

      // If AWB is missing (label_created === 0), attempt auto-assigning courier partner
      if (!labelUrl && (resData?.label_created === 0 || resData?.not_created)) {
        const notCreatedReason = JSON.stringify(resData?.not_created || resData?.response || '');
        shiprocketLogger.warn('LABEL_SERVICE', `Label not generated directly (${notCreatedReason}). Attempting auto-assigning courier...`);

        if (orderId) {
          try {
            await courierService.autoAssignBestCourier({ orderId, preferredMode: 'CHEAPEST' });
            // Retry label generation after AWB assignment
            response = await shiprocketClient.post('/v1/external/courier/generate/label', payload);
            resData = response.data;
            labelUrl = resData?.label_url || resData?.response?.label_url;
          } catch (assignErr) {
            shiprocketLogger.warn('LABEL_SERVICE', `Auto-assign courier attempt during label gen failed: ${assignErr.message}`);
          }
        }
      }

      if (!labelUrl) {
        const notCreatedMsg = resData?.not_created ? Object.values(resData.not_created).join(', ') : '';
        const rawMsg = resData?.response || resData?.message || notCreatedMsg || 'AWB Assignment pending. Please assign a courier partner to generate AWB before printing label.';
        const err = new Error(`Label Generation Error: ${rawMsg}`);
        err.statusCode = 400;
        throw err;
      }

      // Update DB Order record if orderId provided
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            labelUrl,
            shiprocketStatus: 'LABEL GENERATED'
          }
        });
      }

      shiprocketLogger.info('LABEL_SERVICE', `Successfully generated label: ${labelUrl}`);

      return {
        success: true,
        labelUrl,
        response: resData
      };
    } catch (err) {
      shiprocketLogger.error('LABEL_SERVICE', `Failed to generate label for shipment ${shipmentId}`, err);
      throw err;
    }
  },

  /**
   * Generate Manifest PDF URL
   */
  async generateManifest({ shipmentId, orderId = null }) {
    try {
      const payload = {
        shipment_id: [parseInt(shipmentId)]
      };

      shiprocketLogger.info('LABEL_SERVICE', `Generating manifest for Shipment ID ${shipmentId}...`);

      const response = await shiprocketClient.post('/v1/external/manifests/generate', payload);
      const resData = response.data;

      const manifestUrl = resData?.manifest_url || resData?.response?.manifest_url;

      if (!manifestUrl) {
        const err = new Error(resData?.message || 'Manifest generation failed or manifest URL not returned.');
        err.statusCode = 400;
        throw err;
      }

      if (orderId && manifestUrl) {
        await prisma.order.update({
          where: { id: orderId },
          data: { manifestUrl }
        });
      }

      return {
        success: true,
        manifestUrl,
        response: resData
      };
    } catch (err) {
      shiprocketLogger.error('LABEL_SERVICE', `Failed to generate manifest for shipment ${shipmentId}`, err);
      throw err;
    }
  },

  /**
   * Generate Tax Invoice PDF URL
   */
  async generateInvoice({ shiprocketOrderIds, orderId = null }) {
    try {
      const payload = {
        ids: Array.isArray(shiprocketOrderIds) ? shiprocketOrderIds : [shiprocketOrderIds]
      };

      shiprocketLogger.info('LABEL_SERVICE', `Generating invoice for Shiprocket Order IDs: ${payload.ids.join(', ')}...`);

      const response = await shiprocketClient.post('/v1/external/orders/print/invoice', payload);
      const resData = response.data;

      const invoiceUrl = resData?.is_invoice_created ? resData?.invoice_url : resData?.invoice_url || null;

      if (!invoiceUrl) {
        const err = new Error(resData?.message || 'Invoice generation failed or URL not returned.');
        err.statusCode = 400;
        throw err;
      }

      if (orderId && invoiceUrl) {
        await prisma.order.update({
          where: { id: orderId },
          data: { invoiceUrl }
        });
      }

      return {
        success: true,
        invoiceUrl,
        response: resData
      };
    } catch (err) {
      shiprocketLogger.error('LABEL_SERVICE', 'Failed to generate invoice', err);
      throw err;
    }
  }
};
