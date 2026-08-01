import { shiprocketLogger } from './shiprocket.logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const webhookService = {
  /**
   * Process incoming Shiprocket Webhook Event
   */
  async processWebhook(headers, body) {
    const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
    const incomingApiKey = headers['anx-api-key'] || headers['x-api-key'] || headers['authorization'];

    // Verify security header if configured in .env
    if (webhookSecret && incomingApiKey && incomingApiKey !== webhookSecret) {
      shiprocketLogger.warn('WEBHOOK_SERVICE', 'Invalid Webhook Security Token (anx-api-key header mismatch).');
      // Per spec, return status 401 for unauthorized webhook requests
      return { success: false, statusCode: 401, message: 'Unauthorized webhook request.' };
    }

    shiprocketLogger.webhook(body.current_status || 'GENERIC_EVENT', body);

    const awbCode = body.awb || body.awb_code;
    const orderNumber = body.order_id || body.channel_order_id;
    const currentStatus = (body.current_status || body.status || '').toUpperCase();
    const scans = body.scans || body.tracking_data?.shipment_track_activities || [];
    const etd = body.etd || body.expected_delivery_date || null;

    if (!awbCode && !orderNumber) {
      shiprocketLogger.warn('WEBHOOK_SERVICE', 'Webhook payload missing awb and order_id reference.', body);
      return { success: true, message: 'Payload received but missing order identifiers.' };
    }

    // Find Order in PostgreSQL database
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(awbCode ? [{ awbCode }] : []),
          ...(orderNumber ? [{ orderNumber }] : [])
        ]
      }
    });

    if (!order) {
      shiprocketLogger.warn('WEBHOOK_SERVICE', `No matching Order found for AWB: ${awbCode} / OrderNumber: ${orderNumber}`);
      return { success: true, message: 'Order reference not found in database.' };
    }

    // Map Shiprocket status to Suryodaya Farms OrderStatus Enum
    let mappedStatus = order.status;

    if (currentStatus.includes('DELIVERED')) {
      mappedStatus = 'DELIVERED';
    } else if (currentStatus.includes('OUT FOR DELIVERY')) {
      mappedStatus = 'OUT_FOR_DELIVERY';
    } else if (currentStatus.includes('IN TRANSIT') || currentStatus.includes('DISPATCHED') || currentStatus.includes('SHIPPED') || currentStatus.includes('PICKED UP')) {
      mappedStatus = 'IN_TRANSIT';
    } else if (currentStatus.includes('CANCELLED')) {
      mappedStatus = 'CANCELLED';
    } else if (currentStatus.includes('AWB ASSIGNED') || currentStatus.includes('PICKUP SCHEDULED')) {
      mappedStatus = 'SHIPPED';
    }

    const existingScans = Array.isArray(order.trackingHistory) ? order.trackingHistory : [];
    const newScanEntry = {
      status: currentStatus,
      location: body.current_location || body.location || 'Hub',
      timestamp: body.current_timestamp || new Date().toISOString(),
      activity: body.activity || body.current_status || 'Tracking update received',
      rawScan: body
    };

    // Update database order record with tracking events
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        shiprocketStatus: currentStatus,
        status: mappedStatus,
        awbCode: awbCode || order.awbCode,
        trackingHistory: [...existingScans, newScanEntry]
      }
    });

    shiprocketLogger.info('WEBHOOK_SERVICE', `Updated Order ${order.orderNumber} status to: ${mappedStatus} (${currentStatus})`);

    return {
      success: true,
      orderId: order.id,
      mappedStatus,
      shiprocketStatus: currentStatus
    };
  }
};
