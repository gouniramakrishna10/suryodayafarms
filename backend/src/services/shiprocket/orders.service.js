import { shiprocketClient } from './shiprocket.client.js';
import { shiprocketLogger } from './shiprocket.logger.js';
import { pickupService } from './pickup.service.js';
import { processRazorpayRefund } from '../razorpay.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ordersService = {
  /**
   * Create Shiprocket Adhoc Order from Suryodaya Farms Order
   */
  async createShiprocketOrder({
    orderId,
    pickupLocation = null,
    length = 15,
    width = 15,
    height = 10,
    weight = 0.5
  }) {
    if (!orderId) {
      throw new Error('orderId is required to create a Shiprocket order.');
    }

    // Fetch complete Order details from database
    const dbOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    if (!dbOrder) {
      throw new Error(`Order not found with ID: ${orderId}`);
    }

    // Dynamic resolution of Pickup Location
    let targetPickupLocation = pickupLocation;
    if (!targetPickupLocation || targetPickupLocation === 'Primary Warehouse') {
      try {
        const settings = await prisma.shippingSettings.findUnique({ where: { id: 'default' } });
        if (settings && settings.defaultPickupLocation && settings.defaultPickupLocation !== 'Primary Warehouse') {
          targetPickupLocation = settings.defaultPickupLocation;
        }
      } catch (e) {
        console.warn('[ORDERS_SERVICE] Failed to fetch shipping settings:', e.message);
      }
    }

    // Fallback: Fetch registered pickup locations from Shiprocket API if targetPickupLocation is still invalid/default
    if (!targetPickupLocation || targetPickupLocation === 'Primary Warehouse') {
      try {
        const pickupAddressesRes = await pickupService.getPickupAddresses();
        const activeAddresses = pickupAddressesRes.addresses || [];
        if (activeAddresses.length > 0 && activeAddresses[0].pickup_location) {
          targetPickupLocation = activeAddresses[0].pickup_location;
        }
      } catch (e) {
        console.warn('[ORDERS_SERVICE] Failed to fetch registered Shiprocket pickup addresses:', e.message);
      }
    }

    // Default fallback if no location was resolved
    if (!targetPickupLocation) {
      targetPickupLocation = 'Home';
    }

    // Parse shipping address JSON
    const addr = typeof dbOrder.shippingAddress === 'string'
      ? JSON.parse(dbOrder.shippingAddress)
      : (dbOrder.shippingAddress || {});

    const customerName = addr.recipientName || dbOrder.user?.name || 'Valued Customer';
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    // Format order items for Shiprocket
    const orderItems = dbOrder.orderItems.map((item) => {
      const pName = item.product?.name || 'Suryodaya Organic Product';
      const variantSpec = item.variant ? ` (${item.variant.weight}${item.variant.unit})` : '';
      return {
        name: `${pName}${variantSpec}`,
        sku: item.variant?.sku || item.product?.sku || `SURY-${item.productId.slice(0, 6)}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 1211
      };
    });

    const isCod = dbOrder.paymentMethod === 'COD';
    const orderDate = new Date(dbOrder.createdAt).toISOString().replace('T', ' ').substring(0, 19);
    const widthStr = (width || 15).toString();

    const payload = {
      order_id: dbOrder.orderNumber || dbOrder.id,
      order_date: orderDate,
      pickup_location: targetPickupLocation,
      channel_id: '',
      comment: 'Organic Farm Direct Shipment from Suryodaya Farms',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: addr.street || addr.addressLine1 || 'Farm Direct Address',
      billing_address_2: addr.addressLine2 || '',
      billing_city: addr.city || 'Jaipur',
      billing_pincode: addr.postalCode || addr.pincode || '302001',
      billing_state: addr.state || 'Rajasthan',
      billing_country: addr.country || 'India',
      billing_email: dbOrder.user?.email || 'customer@suryodayafarms.com',
      billing_phone: addr.phone || dbOrder.user?.phone || '9876543210',
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: isCod ? 'COD' : 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: dbOrder.discountAmount || 0,
      sub_total: dbOrder.totalAmount,
      length: (length || 15).toString(),
      width: widthStr,
      breadth: widthStr, // Shiprocket API requires breadth
      height: (height || 10).toString(),
      weight: (weight || 0.5).toString()
    };

    console.log('[SHIPROCKET] Creating Shiprocket Order...');
    shiprocketLogger.info('ORDERS_SERVICE', `[SHIPROCKET] Creating Shiprocket Order for ${dbOrder.orderNumber}...`, payload);

    let resData;
    try {
      const response = await shiprocketClient.post('/v1/external/orders/create/adhoc', payload);
      resData = response.data;
    } catch (err) {
      resData = err.response?.data;
      // Task 4: Check if error payload contains order_id or shipment_id (e.g. order already created in Shiprocket)
      if (!resData || (!resData.order_id && !resData.shipment_id && !resData.data?.order_id)) {
        const errorData = err.response?.data;
        const errorMessage = errorData?.message || err.message;
        const detailedErrors = errorData?.errors ? JSON.stringify(errorData.errors) : '';
        const fullMsg = `Shiprocket Order Creation Error: ${errorMessage} ${detailedErrors}`.trim();

        shiprocketLogger.error('ORDERS_SERVICE', fullMsg, errorData || err);
        const customErr = new Error(fullMsg);
        customErr.statusCode = err.response?.status || 422;
        customErr.response = err.response;
        throw customErr;
      }
    }

    // Handle custom Shiprocket response formats (e.g. wrong pickup location error returned as 200)
    if (resData && resData.message && resData.message.toLowerCase().includes('wrong pickup location')) {
      const availableList = resData.data?.data || resData.data || [];
      if (availableList.length > 0 && availableList[0].pickup_location) {
        const fallbackLoc = availableList[0].pickup_location;
        shiprocketLogger.info('ORDERS_SERVICE', `Retrying with corrected Shiprocket Pickup Location: "${fallbackLoc}"`);
        payload.pickup_location = fallbackLoc;
        const retryRes = await shiprocketClient.post('/v1/external/orders/create/adhoc', payload);
        resData = retryRes.data;
      }
    }

    return await this._processShiprocketSuccess(orderId, resData);
  },

  /**
   * Internal Helper to Process Successful Shiprocket Order Response
   */
  async _processShiprocketSuccess(orderId, resData) {
    console.log('[SHIPROCKET] Shiprocket Response:', JSON.stringify(resData, null, 2));
    shiprocketLogger.info('ORDERS_SERVICE', '[SHIPROCKET] Shiprocket Response:', resData);

    const payloadData = (resData.data && typeof resData.data === 'object') ? { ...resData, ...resData.data } : resData;

    const shiprocketOrderId = payloadData.order_id || payloadData.id;
    const shipmentId = payloadData.shipment_id;
    const status = payloadData.status || 'READY TO SHIP';

    const awbCode = payloadData.awb_code || payloadData.awb_code_status || null;
    const courierId = payloadData.courier_company_id || payloadData.courier_id || null;
    const courierName = payloadData.courier_name || payloadData.courier || null;

    const courierAlreadyAssigned = !!(awbCode || courierId || courierName);
    console.log(`[SHIPROCKET] Courier Already Assigned: ${courierAlreadyAssigned}`);
    shiprocketLogger.info('ORDERS_SERVICE', `[SHIPROCKET] Courier Already Assigned: ${courierAlreadyAssigned}`);

    if (courierAlreadyAssigned) {
      console.log('[SHIPROCKET] Skipping Assign Courier...');
      shiprocketLogger.info('ORDERS_SERVICE', '[SHIPROCKET] Skipping Assign Courier...');
    }

    // Task 3: Build update object for Database
    const updateData = {
      shiprocketOrderId: parseInt(shiprocketOrderId),
      shipmentId: parseInt(shipmentId),
      shiprocketStatus: status,
      shiprocketData: resData,
      status: 'PROCESSING'
    };

    if (awbCode) updateData.awbCode = awbCode.toString();
    if (courierName) updateData.courierName = courierName.toString();
    if (courierId) updateData.courierId = parseInt(courierId);

    // Update database Order record
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    console.log('[SHIPROCKET] Shipment Saved Successfully');
    shiprocketLogger.info('ORDERS_SERVICE', '[SHIPROCKET] Shipment Saved Successfully', updatedOrder);

    // Task 5: Return clean success response structure
    return {
      success: true,
      orderId: parseInt(shiprocketOrderId),
      shiprocketOrderId: parseInt(shiprocketOrderId),
      shipmentId: parseInt(shipmentId),
      awb: awbCode ? awbCode.toString() : (updatedOrder.awbCode || null),
      courier: courierName ? courierName.toString() : (updatedOrder.courierName || null),
      status: status,
      courierAlreadyAssigned,
      rawResponse: resData,
      order: updatedOrder
    };
  },

  /**
   * Fetch List of Sync Orders from Shiprocket
   */
  async listShiprocketOrders(params = {}) {
    try {
      const response = await shiprocketClient.get('/v1/external/orders', { params });
      return response.data;
    } catch (err) {
      shiprocketLogger.error('ORDERS_SERVICE', 'Failed to list Shiprocket orders', err);
      throw err;
    }
  },

  /**
   * Cancel Order on Shiprocket & Local Database + Automated Razorpay Refund Workflow
   */
  async cancelShiprocketOrder(orderId, cancelledBy = 'CUSTOMER') {
    const dbOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!dbOrder) {
      throw new Error('Order record not found.');
    }

    const normShipStatus = (dbOrder.shiprocketStatus || dbOrder.status || '').toUpperCase().trim();

    if (normShipStatus === 'CANCELLED' || normShipStatus === 'CANCELED') {
      throw new Error('Order is already cancelled.');
    }

    if (['PICKED UP', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(normShipStatus)) {
      throw new Error('Shipment already picked up. Cancellation unavailable.');
    }

    let shiprocketResult = null;

    // 1. Call Shiprocket Cancellation API
    if (dbOrder.shiprocketOrderId) {
      try {
        const payload = { ids: [dbOrder.shiprocketOrderId] };
        shiprocketLogger.info('ORDERS_SERVICE', `Cancelling Shiprocket Order ID: ${dbOrder.shiprocketOrderId}...`);
        const response = await shiprocketClient.post('/v1/external/orders/cancel', payload);
        shiprocketResult = response.data;
      } catch (err) {
        shiprocketLogger.error('ORDERS_SERVICE', `Shiprocket cancel API warning/error for ${orderId}: ${err.message}`, err);
      }
    }

    // 2. Initial DB state update: Order & Shipment marked CANCELLED
    const existingHistory = Array.isArray(dbOrder.trackingHistory) ? dbOrder.trackingHistory : [];
    const cancelTimestamp = new Date().toISOString();

    const cancelLog = {
      status: 'CANCELLED',
      location: 'System',
      timestamp: cancelTimestamp,
      activity: `✔ ${cancelledBy === 'ADMIN' ? 'Admin' : 'Customer'} cancelled order. Shipment cancelled in Shiprocket.`
    };

    const isPrepaid = dbOrder.paymentStatus === 'COMPLETED' || dbOrder.paymentStatus === 'PAID' || !!dbOrder.razorpayPaymentId;

    let orderAfterCancel = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        shiprocketStatus: 'CANCELLED',
        paymentStatus: isPrepaid ? 'PENDING' : 'CANCELLED',
        refundStatus: isPrepaid ? 'PENDING' : 'NONE',
        trackingHistory: [...existingHistory, cancelLog],
        updatedAt: new Date()
      }
    });

    // 3. AUTOMATED RAZORPAY REFUND WORKFLOW (If Prepaid & payment completed)
    let refundResult = null;
    let refundError = null;

    if (isPrepaid && dbOrder.razorpayPaymentId) {
      try {
        shiprocketLogger.info('ORDERS_SERVICE', `Triggering automated Razorpay refund for Order #${dbOrder.orderNumber} (TXN: ${dbOrder.razorpayPaymentId})...`);

        refundResult = await processRazorpayRefund({
          paymentId: dbOrder.razorpayPaymentId,
          amountInRupees: dbOrder.totalAmount,
          orderId: dbOrder.id,
          orderNumber: dbOrder.orderNumber
        });

        const initiatedAt = new Date();
        const expectedCreditDate = new Date(initiatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        const expectedDateStr = expectedCreditDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' });

        const refundLog = {
          status: 'REFUND_PROCESSING',
          location: 'Razorpay Gateway',
          timestamp: initiatedAt.toISOString(),
          activity: `↻ Refund initiated & processing via Razorpay (ID: ${refundResult.id}, Amount: ₹${dbOrder.totalAmount}). Expected credit by ${expectedDateStr}.`
        };

        const finalHistory = Array.isArray(orderAfterCancel.trackingHistory) ? orderAfterCancel.trackingHistory : [];

        orderAfterCancel = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'REFUND_PENDING',
            refundStatus: 'PROCESSING',
            refundId: refundResult.id,
            refundAmount: dbOrder.totalAmount,
            refundGateway: 'Razorpay',
            refundInitiatedAt: initiatedAt,
            refundExpectedDate: expectedCreditDate,
            lastRefundSync: initiatedAt,
            refundResponse: JSON.stringify(refundResult),
            trackingHistory: [...finalHistory, refundLog],
            updatedAt: new Date()
          }
        });

        shiprocketLogger.info('ORDERS_SERVICE', `Automated Razorpay refund INITIATED & PROCESSING for Order #${dbOrder.orderNumber} (Refund ID: ${refundResult.id}).`);

      } catch (err) {
        refundError = err.message || 'Razorpay Refund API error';
        shiprocketLogger.error('ORDERS_SERVICE', `Automated Razorpay refund FAILED for Order #${dbOrder.orderNumber}: ${refundError}`, err);

        const failLog = {
          status: 'REFUND_FAILED',
          location: 'Razorpay Gateway',
          timestamp: new Date().toISOString(),
          activity: `❌ Razorpay Refund Attempt Failed: ${refundError}`
        };

        const finalHistory = Array.isArray(orderAfterCancel.trackingHistory) ? orderAfterCancel.trackingHistory : [];

        orderAfterCancel = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'FAILED',
            refundStatus: 'FAILED',
            refundError: refundError,
            trackingHistory: [...finalHistory, failLog],
            updatedAt: new Date()
          }
        });
      }
    }

    return {
      success: true,
      message: 'Order cancelled successfully.',
      refundStatus: orderAfterCancel.refundStatus || 'NONE',
      paymentStatus: orderAfterCancel.paymentStatus,
      refundId: orderAfterCancel.refundId || null,
      refundError: refundError,
      order: orderAfterCancel,
      shiprocketResult
    };
  },

  /**
   * Retry Razorpay Refund for a Cancelled Order (Admin Action)
   */
  async retryRazorpayRefund(orderId) {
    const dbOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!dbOrder) {
      throw new Error('Order record not found.');
    }

    if (dbOrder.refundStatus === 'COMPLETED' || dbOrder.paymentStatus === 'REFUNDED') {
      return {
        success: true,
        message: 'Refund has already been completed.',
        order: dbOrder
      };
    }

    if (!dbOrder.razorpayPaymentId) {
      throw new Error('No Razorpay payment ID recorded for this order.');
    }

    shiprocketLogger.info('ORDERS_SERVICE', `Retrying Razorpay refund for Order #${dbOrder.orderNumber} (TXN: ${dbOrder.razorpayPaymentId})...`);

    const refundResult = await processRazorpayRefund({
      paymentId: dbOrder.razorpayPaymentId,
      amountInRupees: dbOrder.totalAmount,
      orderId: dbOrder.id,
      orderNumber: dbOrder.orderNumber
    });

    const initiatedAt = new Date();
    const expectedCreditDate = new Date(initiatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expectedDateStr = expectedCreditDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' });

    const refundLog = {
      status: 'REFUND_PROCESSING',
      location: 'Razorpay Gateway',
      timestamp: initiatedAt.toISOString(),
      activity: `↻ Refund retried & processing via Razorpay (ID: ${refundResult.id}, Amount: ₹${dbOrder.totalAmount}). Expected credit by ${expectedDateStr}.`
    };

    const existingHistory = Array.isArray(dbOrder.trackingHistory) ? dbOrder.trackingHistory : [];

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'REFUND_PENDING',
        refundStatus: 'PROCESSING',
        refundId: refundResult.id,
        refundAmount: dbOrder.totalAmount,
        refundGateway: 'Razorpay',
        refundInitiatedAt: initiatedAt,
        refundExpectedDate: expectedCreditDate,
        lastRefundSync: initiatedAt,
        refundResponse: JSON.stringify(refundResult),
        refundError: null,
        trackingHistory: [...existingHistory, refundLog],
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      message: 'Razorpay refund retried and set to processing successfully.',
      order: updatedOrder
    };
  }
};
