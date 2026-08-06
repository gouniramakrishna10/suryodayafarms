import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import prisma from '../utils/db.js';
import { protect } from '../middlewares/authMiddleware.js';
import { mapCartItem, mapWishlistItem, mapOrder } from '../utils/productMapper.js';
import { syncService } from '../services/shiprocket/sync.service.js';
import { ordersService } from '../services/shiprocket/orders.service.js';
import whatsappService from '../services/whatsapp.service.js';
import { calculateOrderGst } from '../utils/gst.js';

const router = express.Router();

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_TKPje1gjpvHTve';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'EQ7HfH1H5MRvb44z48C7w93X';
const isLiveMode = razorpayKeyId.startsWith('rzp_live_');

console.log(`[Razorpay Audit Mode Check]: ${isLiveMode ? 'LIVE' : 'TEST'} | Key ID: ${razorpayKeyId} | Secret Configured: ${!!razorpayKeySecret}`);

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

export const mapOrderLogistics = (order) => {
  if (!order) return null;
  return {
    ...order,
    courierName: order.courierName || '',
    trackingNumber: order.awbCode || '',
    shiprocketStatus: order.shiprocketStatus || order.status || 'PENDING',
    labelUrl: order.labelUrl || null,
    manifestUrl: order.manifestUrl || null,
    invoiceUrl: order.invoiceUrl || null,
    logistics: {
      status: order.shiprocketStatus || order.status || 'PENDING',
      courierName: order.courierName || '',
      trackingNumber: order.awbCode || '',
      trackingUrl: order.labelUrl || '',
      dispatchDate: order.createdAt ? new Date(order.createdAt).toISOString() : '',
      estimatedDeliveryDate: order.updatedAt ? new Date(order.updatedAt).toISOString() : ''
    }
  };
};

const parseWeightToKG = (weightStr) => {
  if (!weightStr) return 0.5; // Default to 500g if undefined/null
  const normalized = weightStr.toLowerCase().replace(/\s+/g, '');
  const numMatch = normalized.match(/^(\d+(?:\.\d+)?)/);
  if (!numMatch) return 0.5;
  const value = parseFloat(numMatch[1]);
  if (normalized.includes('kg') || normalized.includes('kilo') || normalized.includes('l') && !normalized.includes('ml')) {
    return value;
  }
  if (normalized.includes('g') || normalized.includes('gm') || normalized.includes('ml')) {
    return value / 1000;
  }
  return value >= 10 ? value / 1000 : value;
};

// ================= SHOPPING CART CRUD =================

// 1. GET ACTIVE CART ITEMS
// GET /api/orders/cart (Mounted as /api/cart)
router.get('/cart', protect, async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: true,
        variant: true,
      },
    });

    const mappedCartItems = cartItems.map(mapCartItem);

    res.status(200).json({ success: true, count: mappedCartItems.length, cartItems: mappedCartItems });
  } catch (error) {
    next(error);
  }
});

// 2. ADD ITEM TO CART
// POST /api/orders/cart
router.post('/cart', protect, async (req, res, next) => {
  const { productId, variantId, quantity = 1 } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    // Verify Product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check duplicate item
    const duplicate = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId,
        variantId: variantId || null,
      },
    });

    let cartItem;
    if (duplicate) {
      // Increment quantity
      cartItem = await prisma.cartItem.update({
        where: { id: duplicate.id },
        data: { quantity: duplicate.quantity + parseInt(quantity, 10) },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          variantId: variantId || undefined,
          quantity: parseInt(quantity, 10),
        },
      });
    }

    res.status(201).json({ success: true, cartItem });
  } catch (error) {
    next(error);
  }
});

// 3. UPDATE QUANTITY
// PUT /api/orders/cart/:itemId
router.put('/cart/:itemId', protect, async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const itemExists = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: req.user.id },
    });

    if (!itemExists) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: parseInt(quantity, 10) },
    });

    res.status(200).json({ success: true, cartItem });
  } catch (error) {
    next(error);
  }
});

// 4. REMOVE ITEM FROM CART
// DELETE /api/orders/cart/:itemId
router.delete('/cart/:itemId', protect, async (req, res, next) => {
  const { itemId } = req.params;

  try {
    const itemExists = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: req.user.id },
    });

    if (!itemExists) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    res.status(200).json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
});

// ================= WISHLIST CRUD =================

// 5. GET WISHLIST ITEMS
// GET /api/orders/wishlist (Mounted as /api/wishlist)
router.get('/wishlist', protect, async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: true
      }
    });

    const mappedWishlist = wishlist.map(mapWishlistItem);

    res.status(200).json({ success: true, count: mappedWishlist.length, wishlist: mappedWishlist });
  } catch (error) {
    next(error);
  }
});

// 6. TOGGLE WISHLIST ITEM
// POST /api/orders/wishlist/:productId
router.post('/wishlist/:productId', protect, async (req, res, next) => {
  const { productId } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if in wishlist
    const exists = await prisma.wishlistItem.findFirst({
      where: { userId: req.user.id, productId }
    });

    if (exists) {
      // Remove
      await prisma.wishlistItem.delete({ where: { id: exists.id } });
      res.status(200).json({ success: true, isWishlisted: false, message: 'Product removed from wishlist.' });
    } else {
      // Add
      await prisma.wishlistItem.create({
        data: { userId: req.user.id, productId }
      });
      res.status(200).json({ success: true, isWishlisted: true, message: 'Product added to wishlist.' });
    }
  } catch (error) {
    next(error);
  }
});

// ================= COUPONS ACTIONS =================

// GET ACTIVE COUPONS
// GET /api/orders/coupons/active
router.get('/coupons/active', async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        expiryDate: {
          gt: new Date()
        }
      },
      include: {
        orders: {
          select: { id: true }
        }
      }
    });

    // Filter coupons whose usageLimit is exceeded
    const activeCoupons = coupons.filter(coupon => {
      if (coupon.usageLimit === null || coupon.usageLimit === -1) {
        return true;
      }
      return coupon.orders.length < coupon.usageLimit;
    }).map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive
    }));

    res.status(200).json({ success: true, coupons: activeCoupons });
  } catch (error) {
    next(error);
  }
});

// 7. VALIDATE COUPON
// POST /api/orders/coupon/validate (Mounted as /api/coupons/validate)
router.post('/coupon/validate', protect, async (req, res, next) => {
  const { code, orderValue = 0 } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or deactivated coupon code.' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired.' });
    }

    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({ success: false, message: `Minimum order amount of ₹${coupon.minOrderValue} required.` });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageLimit !== -1) {
      const usageCount = await prisma.order.count({
        where: { couponId: coupon.id }
      });
      if (usageCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: 'Coupon code usage limit has been reached.' });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Coupon code applied successfully.',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      }
    });
  } catch (error) {
    next(error);
  }
});

// ================= CHECKOUTS & ORDERS =================

// 8. PROCESS CHECKOUT (COD & RAZORPAY INIT)
// 8. PROCESS CHECKOUT (RAZORPAY ONLINE PAYMENT ONLY)
// POST /api/orders/checkout
router.post('/checkout', protect, async (req, res, next) => {
  const { addressId, couponCode } = req.body;

  try {
    if (!addressId) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }

    // Fetch Cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true, variant: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is currently empty.' });
    }

    // Fetch Address details
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user.id },
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Selected address not found.' });
    }

    // Fetch website configurations for shipping
    const settings = await prisma.websiteSetting.findMany();
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const freeDeliveryThreshold = parseFloat(settingsObj.freeDeliveryThreshold || '2');
    const shippingCharge = parseFloat(settingsObj.shippingCharge || '80');
    const serviceableStatesStr = settingsObj.serviceableStates || 'PAN India';
    const serviceableStates = serviceableStatesStr
      .split(',')
      .map(s => s.trim().toLowerCase());

    // Validate if address state is serviceable (PAN India delivery allows all states)
    const addressState = (address.state || '').trim().toLowerCase();
    const isPanIndiaDelivery = serviceableStatesStr.toLowerCase().includes('pan india') || 
                               serviceableStatesStr.toLowerCase().includes('all') || 
                               serviceableStatesStr.toLowerCase().includes('india');
                               
    if (!isPanIndiaDelivery && addressState && !serviceableStates.includes(addressState)) {
      return res.status(400).json({
        success: false,
        message: `Delivery is currently restricted to: ${serviceableStatesStr}. Selected state "${address.state}" is not serviceable.`
      });
    }

    // Calculate Cart Weight & Math
    let subtotal = 0;
    let totalWeight = 0;
    cartItems.forEach((item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      subtotal += price * item.quantity;

      const weightStr = item.variant ? item.variant.name : item.product.weight;
      const parsedWeight = parseWeightToKG(weightStr);
      totalWeight += parsedWeight * item.quantity;
    });

    // Validate Coupon if any
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive && new Date() < new Date(coupon.expiryDate) && subtotal >= coupon.minOrderValue) {
        let isUsageLimitOk = true;
        if (coupon.usageLimit !== null && coupon.usageLimit !== -1) {
          const usageCount = await prisma.order.count({
            where: { couponId: coupon.id }
          });
          if (usageCount >= coupon.usageLimit) {
            isUsageLimitOk = false;
          }
        }
        
        if (isUsageLimitOk) {
          couponId = coupon.id;
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }
    }

    // Apply shipping charge based on cart weight
    let shippingFee = 0;
    if (totalWeight < freeDeliveryThreshold) {
      shippingFee = shippingCharge;
    }

    // Zero out delivery charge if FREEDEL coupon is applied
    if (couponCode && couponCode.toUpperCase() === 'FREEDEL') {
      shippingFee = 0;
    }

    const totalAmount = Math.max(subtotal - discountAmount + shippingFee, 0);
    const orderNumber = `SURY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Razorpay Order via Official Razorpay Orders API
    const amountInPaise = Math.round(totalAmount * 100);
    let rzpOrder;
    try {
      console.log(`[Razorpay Order Create Attempt]: Amount: ₹${totalAmount} (${amountInPaise} paise) | Currency: INR | Receipt: ${orderNumber} | Mode: ${isLiveMode ? 'LIVE' : 'TEST'}`);
      
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          userId: req.user.id,
          orderNumber,
          recipientName: address.recipientName,
          phone: address.phone
        }
      });

      console.log('[Razorpay Orders API Response]:', JSON.stringify(rzpOrder, null, 2));

      // Validate order.id format
      if (!rzpOrder || !rzpOrder.id || !rzpOrder.id.startsWith('order_')) {
        console.error('[Razorpay Order Validation Failed] Invalid order.id structure returned:', rzpOrder);
        return res.status(500).json({
          success: false,
          message: `Razorpay Orders API returned an invalid Order ID format: ${rzpOrder?.id || 'null'}`
        });
      }
    } catch (rzpErr) {
      console.error('[Razorpay Order Creation Error]:', rzpErr.response?.data || rzpErr.error || rzpErr);
      return res.status(500).json({
        success: false,
        message: `Failed to initiate payment gateway: ${rzpErr.message || rzpErr.description || 'Razorpay Gateway Error'}`
      });
    }

    // Calculate GST line-by-line using Shipping Address State (Telangana => CGST+SGST, Other States => IGST)
    const shippingState = address.state || 'Telangana';
    const orderGst = calculateOrderGst({
      orderItems: cartItems.map(item => ({
        price: item.variant ? item.variant.price : item.product.price,
        quantity: item.quantity,
        product: item.product,
        hsnCode: item.product?.hsnCode || '1106'
      })),
      shippingState
    });

    // Build database order data
    const orderData = {
      userId: req.user.id,
      orderNumber,
      paymentMethod: 'RAZORPAY',
      razorpayOrderId: rzpOrder.id,
      totalAmount,
      discountAmount,
      couponId,
      shippingAddress: {
        recipientName: address.recipientName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      status: 'PENDING',
      paymentStatus: 'PENDING',
      gstType: orderGst.gstType,
      taxableAmount: orderGst.taxableAmount,
      cgstAmount: orderGst.cgstAmount,
      sgstAmount: orderGst.sgstAmount,
      igstAmount: orderGst.igstAmount,
      gstRate: 5.0
    };

    // Save order record in DB
    const order = await prisma.order.create({
      data: {
        ...orderData,
        orderItems: {
          create: cartItems.map((item, idx) => {
            const lineGst = orderGst.items[idx] || {};
            const price = item.variant ? item.variant.price : item.product.price;
            return {
              productId: item.productId,
              variantId: item.variantId || undefined,
              quantity: item.quantity,
              price,
              hsnCode: item.product?.hsnCode || '1106',
              taxableAmount: lineGst.taxableAmount || 0,
              cgstAmount: lineGst.cgstAmount || 0,
              sgstAmount: lineGst.sgstAmount || 0,
              igstAmount: lineGst.igstAmount || 0
            };
          }),
        },
      },
      include: { orderItems: { include: { product: true, variant: true } } },
    });

    const checkoutResponse = {
      success: true,
      orderId: rzpOrder.id,
      razorpayOrderId: rzpOrder.id,
      amount: order.totalAmount,
      currency: 'INR',
      key: razorpayKeyId,
      razorpayKeyId: razorpayKeyId,
      order: mapOrderLogistics(order)
    };

    console.log('[Checkout Response Sent To Frontend]:', JSON.stringify(checkoutResponse, null, 2));

    res.status(201).json(checkoutResponse);
  } catch (error) {
    console.error('[Checkout Error]:', error);
    next(error);
  }
});

// 9. SHARED ATOMIC ORDER FINALIZATION PIPELINE
export async function finalizeOrderPayment({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  userId,
  isWebhook = false
}) {
  const modeLabel = isWebhook ? 'RAZORPAY_WEBHOOK' : 'FRONTEND_VERIFY';
  console.log('\n====================================================');
  console.log(`[ORDER PIPELINE STEP 1] Payment Verified (${modeLabel})`);
  console.log(`Identifiers: Razorpay Order: ${razorpayOrderId} | Payment Txn: ${razorpayPaymentId}`);

  // 1. Locate Order in Database
  let dbOrder = await prisma.order.findFirst({
    where: razorpayOrderId
      ? { razorpayOrderId }
      : { razorpayPaymentId },
    include: {
      user: true,
      orderItems: {
        include: { product: true, variant: true }
      }
    }
  });

  if (!dbOrder) {
    console.error(`❌ [ORDER PIPELINE ERROR] Order record not found in database for Razorpay Order ID: ${razorpayOrderId}`);
    throw new Error(`Order record not found for Razorpay Order ID: ${razorpayOrderId}`);
  }

  // Ensure userId is stored on order
  const targetUserId = dbOrder.userId || userId;
  if (!dbOrder.userId && targetUserId) {
    await prisma.order.update({
      where: { id: dbOrder.id },
      data: { userId: targetUserId }
    }).catch(() => {});
    dbOrder.userId = targetUserId;
  }

  // Idempotency check: If order is ALREADY completed/paid, return existing order immediately
  if (dbOrder.paymentStatus === 'COMPLETED' || dbOrder.paymentStatus === 'PAID') {
    console.log(`ℹ️ [ORDER PIPELINE] Order #${dbOrder.orderNumber} is already COMPLETED/PAID in DB.`);
    return dbOrder;
  }

  console.log(`[ORDER PIPELINE STEP 2] Order Found/Verified: #${dbOrder.orderNumber} (DB ID: ${dbOrder.id}, User ID: ${targetUserId})`);
  console.log(`[ORDER PIPELINE STEP 3] OrderItems Verified: ${dbOrder.orderItems.length} items linked`);

  // 2. Wrap Order Finalization in Prisma Transaction ($transaction)
  let finalizedOrder;
  try {
    finalizedOrder = await prisma.$transaction(async (tx) => {
      // a) Update Order Payment Record & Status
      const updatedOrder = await tx.order.update({
        where: { id: dbOrder.id },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
          razorpayPaymentId: razorpayPaymentId || dbOrder.razorpayPaymentId,
          updatedAt: new Date()
        },
        include: {
          user: true,
          orderItems: {
            include: { product: true, variant: true }
          }
        }
      });
      console.log(`[ORDER PIPELINE STEP 4] Payment Saved & Order Status updated to CONFIRMED for Order #${updatedOrder.orderNumber}`);

      // b) Update Inventory for each item in order
      console.log(`[ORDER PIPELINE STEP 5] Updating Inventory for Order #${updatedOrder.orderNumber}...`);
      for (const item of updatedOrder.orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { inventory: { decrement: item.quantity } }
          }).catch(err => console.warn(`[Inventory Decrement Variant Warning]: ${err.message}`));
        }

        if (item.productId) {
          const updatedProd = await tx.product.update({
            where: { id: item.productId },
            data: { inventory: { decrement: item.quantity } }
          }).catch(err => console.warn(`[Inventory Decrement Product Warning]: ${err.message}`));

          if (updatedProd && updatedProd.inventory <= 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockStatus: 'OUT_OF_STOCK' }
            }).catch(() => {});
          }
        }
      }
      console.log(`[ORDER PIPELINE STEP 5 SUCCESS] Inventory Updated for Order #${updatedOrder.orderNumber}`);

      // c) Clear User Cart
      if (targetUserId) {
        const cartDelete = await tx.cartItem.deleteMany({
          where: { userId: targetUserId }
        });
        console.log(`[ORDER PIPELINE STEP 7] Cart Cleared: ${cartDelete.count} items deleted for User ID: ${targetUserId}`);
      }

      // d) Create In-App Notification
      if (targetUserId) {
        await tx.notification.create({
          data: {
            userId: targetUserId,
            title: 'Payment Successful!',
            message: `Your payment for order #${updatedOrder.orderNumber} (TXN: ${razorpayPaymentId || updatedOrder.razorpayPaymentId}) was confirmed successfully. We are processing your harvest.`,
          }
        }).catch(() => {});
      }

      return updatedOrder;
    });
  } catch (txError) {
    console.error(`❌ [ORDER PIPELINE FATAL ERROR] $transaction failed for Order #${dbOrder.orderNumber}:`, txError.stack || txError);

    // Rollback status & mark payment for manual review if transaction failed
    await prisma.order.update({
      where: { id: dbOrder.id },
      data: {
        paymentStatus: 'FAILED',
        refundStatus: 'MANUAL_REVIEW_REQUIRED',
        refundError: `Pipeline transaction error: ${txError.message}`
      }
    }).catch(() => {});

    throw txError;
  }

  // 3. Auto-Create Shiprocket Shipment
  console.log(`[ORDER PIPELINE STEP 6] Creating Shiprocket Shipment for Order #${finalizedOrder.orderNumber}...`);
  try {
    const shipRes = await ordersService.createShiprocketOrder({ orderId: finalizedOrder.id });
    if (shipRes && (shipRes.shipment_id || shipRes.order_id)) {
      console.log(`[ORDER PIPELINE STEP 6 SUCCESS] Shiprocket Shipment Created (ID: ${shipRes.shipment_id || shipRes.order_id}) for Order #${finalizedOrder.orderNumber}`);
    }
  } catch (shipErr) {
    console.warn(`[ORDER PIPELINE STEP 6 WARN] Shiprocket auto-creation notice for Order #${finalizedOrder.orderNumber}: ${shipErr.message}`);
  }

  // 4. Send WhatsApp Notifications
  if (!finalizedOrder.orderPlacedWhatsappSent) {
    whatsappService.sendOrderPlaced(finalizedOrder).catch(err => console.error('❌ Customer WhatsApp Error:', err.message));
  }
  if (!finalizedOrder.adminOrderWhatsappSent) {
    whatsappService.sendAdminNewOrder(finalizedOrder).catch(err => console.error('❌ Admin WhatsApp Error:', err.message));
  }

  console.log(`[ORDER PIPELINE STEP 8] Pipeline Finalized Successfully & Response Returned for Order #${finalizedOrder.orderNumber}`);
  console.log('====================================================\n');

  return finalizedOrder;
}

// 9A. VERIFY PAYMENT (FRONTEND HANDLER)
// POST /api/orders/verify-payment
router.post('/verify-payment', protect, async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment validation identifiers or signature missing.' });
    }

    // Verify HMAC SHA256 signature using Razorpay Secret
    const secret = razorpayKeySecret;
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.error('❌ [verify-payment] Signature mismatch! Received:', razorpaySignature, 'Expected:', expectedSignature);
      await prisma.order.updateMany({
        where: { razorpayOrderId },
        data: { paymentStatus: 'FAILED' }
      }).catch(() => {});

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Razorpay verification failed.'
      });
    }

    // Execute atomic order finalization pipeline
    const finalizedOrder = await finalizeOrderPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId: req.user.id,
      isWebhook: false
    });

    return res.status(200).json({
      success: true,
      message: 'Payment authenticated and order confirmed.',
      order: mapOrder(mapOrderLogistics(finalizedOrder))
    });
  } catch (error) {
    console.error('❌ [verify-payment Fatal Error]:', error.stack || error);
    next(error);
  }
});

// 9B. RAZORPAY SERVER WEBHOOK (ASYNCHRONOUS PAYMENT BACKUP)
// POST /api/orders/razorpay-webhook
router.post('/razorpay-webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || razorpayKeySecret;
    const signature = req.headers['x-razorpay-signature'];
    
    if (signature && webhookSecret) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSig !== signature) {
        console.error('[Razorpay Webhook Error]: Signature mismatch');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    console.log(`[Razorpay Webhook Event Received]: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity || {};
      const orderEntity = payload?.order?.entity || {};
      const rzpOrderId = paymentEntity.order_id || orderEntity.id;
      const rzpPaymentId = paymentEntity.id;

      if (rzpOrderId) {
        await finalizeOrderPayment({
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: rzpPaymentId,
          isWebhook: true
        });
      }
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (err) {
    console.error('[Razorpay Webhook Error]:', err.stack || err);
    res.status(500).json({ success: false, message: err.message });
  }
});

import { syncOrderRefundStatus } from '../services/razorpay.service.js';

// 10. FETCH USER ORDER HISTORY (MY SHIPMENTS)
// GET /api/orders/history
router.get('/history', protect, async (req, res, next) => {
  try {
    let orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
        OR: [
          { paymentStatus: { in: ['COMPLETED', 'REFUNDED'] } },
          { status: { in: ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] } }
        ],
        AND: [
          {
            OR: [
              { cancelReason: null },
              { cancelReason: { not: 'Payment Timeout' } }
            ]
          }
        ]
      },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Silent background sync for active shipments that haven't been updated in 2 minutes
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
    const activeToSync = orders.filter(o => 
      o.shiprocketOrderId && 
      !['DELIVERED', 'CANCELLED'].includes(o.status) &&
      (!o.updatedAt || new Date(o.updatedAt) < twoMinsAgo)
    );

    if (activeToSync.length > 0) {
      Promise.all(activeToSync.map(o => syncService.syncOrder(o.id).catch(() => null))).catch(() => null);
    }

    // Silent sync for any pending refunds
    const pendingRefunds = orders.filter(o => ['INITIATED', 'PROCESSING', 'PENDING'].includes((o.refundStatus || '').toUpperCase()) && o.refundId);
    if (pendingRefunds.length > 0) {
      await Promise.all(pendingRefunds.map(o => syncOrderRefundStatus(o.id).catch(() => null)));
      // Refetch mapped orders if refund status updated
      orders = await prisma.order.findMany({
        where: {
          userId: req.user.id,
          OR: [
            { paymentStatus: { in: ['COMPLETED', 'REFUNDED'] } },
            { status: { in: ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] } }
          ],
          AND: [
            {
              OR: [
                { cancelReason: null },
                { cancelReason: { not: 'Payment Timeout' } }
              ]
            }
          ]
        },
        include: {
          orderItems: {
            include: {
              product: true,
              variant: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const mappedOrders = orders.map(order => mapOrder(mapOrderLogistics(order)));
    res.status(200).json({ success: true, count: mappedOrders.length, orders: mappedOrders });
  } catch (error) {
    next(error);
  }
});

// 11. FETCH ORDER DETAILS (WITH SILENT TRACKING & REFUND AUTO-SYNC)
// GET /api/orders/history/:orderId
router.get('/history/:orderId', protect, async (req, res, next) => {
  const { orderId } = req.params;

  try {
    let order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
        OR: [
          { paymentStatus: { in: ['COMPLETED', 'REFUNDED'] } },
          { status: { in: ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] } }
        ],
        AND: [
          {
            OR: [
              { cancelReason: null },
              { cancelReason: { not: 'Payment Timeout' } }
            ]
          }
        ]
      },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order details not found.' });
    }

    // Silent auto sync if active shipment
    if (order.shiprocketOrderId && !['DELIVERED', 'CANCELLED'].includes(order.status)) {
      try {
        const syncResult = await syncService.syncOrder(order.id);
        if (syncResult && syncResult.order) {
          order = syncResult.order;
        }
      } catch (syncErr) {
        // Silent catch for resilience
      }
    }

    // Silent auto sync for pending refund status
    const currentRefundStatus = (order.refundStatus || '').toUpperCase();
    if (['INITIATED', 'PROCESSING', 'PENDING'].includes(currentRefundStatus) && order.refundId) {
      try {
        const syncedRefundOrder = await syncOrderRefundStatus(order.id);
        if (syncedRefundOrder) {
          order = syncedRefundOrder;
        }
      } catch (refundSyncErr) {
        // Silent catch for resilience
      }
    }

    res.status(200).json({ success: true, order: mapOrder(mapOrderLogistics(order)) });
  } catch (error) {
    next(error);
  }
});

// 12. CANCEL ORDER (CUSTOMER / ADMIN)
// POST /api/orders/:orderId/cancel
router.post('/:orderId/cancel', protect, async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const dbOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!dbOrder) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Verify ownership if not admin
    if (req.user.role !== 'ADMIN' && !req.user.isAdmin && dbOrder.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const cancelledBy = (req.user.role === 'ADMIN' || req.user.isAdmin) ? 'ADMIN' : 'CUSTOMER';
    const result = await ordersService.cancelShiprocketOrder(orderId, cancelledBy);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
});

// 13. RETRY RAZORPAY REFUND (ADMIN ONLY)
// POST /api/orders/:orderId/retry-refund
router.post('/:orderId/retry-refund', protect, async (req, res, next) => {
  const { orderId } = req.params;
  try {
    if (req.user.role !== 'ADMIN' && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    const result = await ordersService.retryRazorpayRefund(orderId);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
});

export default router;
