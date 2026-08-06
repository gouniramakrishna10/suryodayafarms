import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { FiArrowLeft, FiTrash2, FiCheckCircle, FiShield, FiLock, FiMapPin, FiTruck, FiAlertCircle, FiHome, FiBriefcase } from 'react-icons/fi';
import { GiSun } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { parseWeightToKG, formatWeightDisplay } from '../utils/weightParser';
import { getOptimizedImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageOptimizer';
import { formatCurrency } from '../utils/currency';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthChecked } = useAuthStore();
  const { cartItems, subtotal, coupon, applyCoupon, removeCoupon, updateQuantity, removeItem, clearCart } = useCartStore();
  const { settings, fetchSettings } = useSettingsStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempSelectedAddressId, setTempSelectedAddressId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(false);

  // Checkout flow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccessDetails, setOrderSuccessDetails] = useState(null);
  const [activeCoupons, setActiveCoupons] = useState([]);

  // Live Shiprocket Shipping Rate & Serviceability States
  const [shiprocketQuote, setShiprocketQuote] = useState(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // 'RAZORPAY' | 'COD'

  // 10-minute client-side quote cache helpers (SessionStorage)
  const getCachedQuote = (pincode, weightKg, codFlag) => {
    try {
      const key = `shiprocket_quote_v3_${pincode}_${weightKg.toFixed(2)}_${codFlag}`;
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
        return parsed.data;
      }
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn('Quote cache parse error:', e);
    }
    return null;
  };

  const setCachedQuote = (pincode, weightKg, codFlag, quoteData) => {
    try {
      const key = `shiprocket_quote_v3_${pincode}_${weightKg.toFixed(2)}_${codFlag}`;
      sessionStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data: quoteData
      }));
    } catch (e) {
      console.warn('Quote cache set error:', e);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!isAuthChecked) return;

    if (!isAuthenticated) {
      useAuthStore.getState().setCheckoutResumeRedirect('/checkout');
      useAuthStore.getState().setLoginRequiredModalOpen(true);
      navigate('/');
    } else {
      fetchAddresses();
      fetchActiveCoupons();
    }
  }, [isAuthenticated, isAuthChecked, navigate]);

  const fetchActiveCoupons = async () => {
    try {
      const response = await api.get('/orders/coupons/active');
      setActiveCoupons(response.coupons || []);
    } catch (err) {
      console.error('Failed to fetch active coupons:', err);
    }
  };

  // Load coupon from sessionStorage if applied on Cart page
  useEffect(() => {
    const stored = sessionStorage.getItem('appliedCoupon');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.code) {
          setCouponCode(parsed.code);
          applyCoupon(parsed.code)
            .then(() => setCouponSuccess(true))
            .catch(() => {});
        }
      } catch (e) {
        console.error('Failed to parse pre-applied coupon:', e);
      }
    }
  }, [applyCoupon]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/auth/addresses');
      const addrList = response.addresses || [];
      setAddresses(addrList);
      
      const defaultAddr = addrList.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addrList.length > 0) {
        setSelectedAddressId(addrList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuantityChange = async (itemId, currentQty, delta) => {
    try {
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        await removeItem(itemId);
      } else {
        await updateQuantity(itemId, newQty);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(false);
    try {
      await applyCoupon(couponCode);
      setCouponSuccess(true);
      if (coupon) {
        sessionStorage.setItem('appliedCoupon', JSON.stringify(coupon));
      }
    } catch (err) {
      setCouponError(err.message);
      removeCoupon();
      sessionStorage.removeItem('appliedCoupon');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (isProcessing) return;

    if (isNonServiceable) {
      useFeedbackStore.getState().showToast('Unfortunately, delivery is not available to the selected pincode.', 'error');
      return;
    }

    if (!selectedAddressId) {
      useFeedbackStore.getState().showToast('Please select a delivery address.', 'warning');
      return;
    }

    const targetAddress = addresses.find(a => a.id === selectedAddressId);
    if (!targetAddress) {
      useFeedbackStore.getState().showToast('Selected address not found.', 'warning');
      return;
    }

    setIsProcessing(true);
    useFeedbackStore.getState().showLoader('Connecting to gateway...');

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay gateway failed to load.');
      }

      const response = await api.post('/orders/checkout', {
        addressId: selectedAddressId,
        couponCode: coupon ? coupon.code : null,
        paymentMethod: 'RAZORPAY'
      });

      const rzpOrderId = response.orderId || response.razorpayOrderId;
      const razorpayKey = response.key || response.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TKPje1gjpvHTve';
      const orderAmount = response.amount !== undefined ? response.amount : response.totalAmount;

      if (!response || !rzpOrderId || !rzpOrderId.startsWith('order_')) {
        throw new Error(`Server returned invalid Razorpay Order ID.`);
      }

      useFeedbackStore.getState().hideLoader();

      const options = {
        key: razorpayKey,
        amount: Math.round(orderAmount * 100),
        currency: response.currency || 'INR',
        name: 'Suryodaya Farms',
        description: `Order #${response.order?.orderNumber || 'SURY-ORDER'}`,
        image: 'https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png',
        order_id: rzpOrderId,
        handler: async function (razorpayResp) {
          await verifyRazorpayPayment(razorpayResp, response.order);
        },
        prefill: {
          name: targetAddress.recipientName || user?.name || '',
          email: user?.email || '',
          contact: targetAddress.phone || ''
        },
        theme: {
          color: '#4E641A'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            useFeedbackStore.getState().hideLoader();
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setIsProcessing(false);
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast(`Payment Failed: ${resp.error?.description || 'Transaction unsuccessful'}`, 'error');
      });

      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      useFeedbackStore.getState().showToast(`Checkout failed: ${err.message}`, 'error');
      setIsProcessing(false);
      useFeedbackStore.getState().hideLoader();
    }
  };

  const verifyRazorpayPayment = async (razorpayResponse, initialOrder) => {
    setIsProcessing(true);
    useFeedbackStore.getState().showLoader('Verifying payment signature...');

    try {
      const verifyRes = await api.post('/orders/verify-payment', {
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature
      });

      const confirmedOrder = verifyRes.order || initialOrder;

      setOrderSuccessDetails({
        ...confirmedOrder,
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpayOrderId: razorpayResponse.razorpay_order_id
      });

      clearCart();
      sessionStorage.removeItem('appliedCoupon');
      setIsProcessing(false);
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('Payment successful', 'success');

    } catch (err) {
      console.error('Payment verification error:', err);
      setIsProcessing(false);
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`Payment verification error: ${err.message}`, 'error');
    }
  };

  // Selected Address Derivative & Pincode
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || (addresses.length > 0 ? addresses[0] : null);
  const selectedPincode = selectedAddress?.postalCode || selectedAddress?.pincode || '';

  // Package Weight in KG
  const totalWeightKg = cartItems.reduce((acc, item) => {
    const weightStr = item.variant
      ? `${item.variant.weight || 0.5}${item.variant.unit || 'kg'}`
      : (item.product?.weight || '0.5kg');
    const itemKg = parseWeightToKG(weightStr) || 0.5;
    return acc + (itemKg * item.quantity);
  }, 0) || 0.5;

  // Live Shiprocket Calculation Effect
  useEffect(() => {
    if (!selectedPincode || selectedPincode.length < 6 || cartItems.length === 0) {
      setShiprocketQuote(null);
      return;
    }

    const codFlag = 0; // 100% Prepaid store only
    const cached = getCachedQuote(selectedPincode, totalWeightKg, codFlag);
    if (cached) {
      setShiprocketQuote(cached);
      return;
    }

    let isMounted = true;
    const fetchRate = async () => {
      setIsCalculatingShipping(true);
      try {
        const res = await api.post('/shiprocket/rate-calculator', {
          deliveryPincode: selectedPincode,
          weight: totalWeightKg,
          cod: 0,
          declaredValue: subtotal
        });

        if (isMounted) {
          if (res && res.isServiceable) {
            const chosen = res.cheapest || res.recommendedCourier || res.couriers?.[0] || null;
            
            // Clean up courier name (e.g. "Ekart Logistics Air" -> "Ekart Logistics")
            const cleanName = (chosen?.courierName || 'Partner Express')
              .replace(/\s+(Air|Surface|Express|Standard|Cod|Surface\s+2kg|Surface\s+1kg|5kg|10kg|20kg)$/i, '')
              .trim();

            const rawDateStr = chosen?.expectedDeliveryDate || chosen?.formattedEDD || null;
            const rawDaysNum = chosen?.expectedDeliveryDays ?? chosen?.diffDays ?? null;
            const chargeVal = chosen?.shippingCharge !== undefined ? chosen.shippingCharge : (chosen?.rate !== undefined ? chosen.rate : (res.rate || 0));

            // Priority: Always use expectedDeliveryDate from backend if available
            const finalEDD = rawDateStr || (rawDaysNum ? `In ${rawDaysNum} Days` : '3–5 Business Days');

            let computedBadge = 'Standard Delivery';
            let badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200';
            
            if (rawDaysNum && rawDaysNum <= 1) {
              computedBadge = 'Arrives Tomorrow';
              badgeStyle = 'bg-[#E8F0D6] text-[#37411A] border-[#D4E2B6]';
            } else if (rawDaysNum && rawDaysNum === 2) {
              computedBadge = 'Express Delivery';
              badgeStyle = 'bg-[#E8F0D6] text-[#37411A] border-[#D4E2B6]';
            } else if (rawDaysNum && rawDaysNum >= 3 && rawDaysNum <= 4) {
              computedBadge = 'Standard Delivery';
              badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200';
            } else {
              computedBadge = 'Delivery Expected';
              badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200';
            }

            const quoteData = {
              isServiceable: true,
              courierCompanyId: chosen?.courierCompanyId || chosen?.courierId || 0,
              courierName: cleanName,
              shippingCharge: chargeVal,
              rate: chargeVal,
              expectedDeliveryDate: finalEDD,
              expectedDeliveryDays: rawDaysNum,
              formattedEDD: finalEDD,
              shortEDD: chosen?.shortEDD || finalEDD,
              badgeText: chosen?.badgeText || computedBadge,
              badgeStyle,
              courierRating: chosen?.courierRating || 4.5
            };
            setShiprocketQuote(quoteData);
            setCachedQuote(selectedPincode, totalWeightKg, codFlag, quoteData);
          } else {
            const nonServiceableQuote = {
              isServiceable: false,
              message: res?.message || `Unfortunately, delivery is not available to pincode ${selectedPincode}.`
            };
            setShiprocketQuote(nonServiceableQuote);
            setCachedQuote(selectedPincode, totalWeightKg, codFlag, nonServiceableQuote);
          }
        }
      } catch (err) {
        console.warn('Shiprocket API error:', err);
        if (isMounted) {
          setShiprocketQuote({
            isServiceable: true,
            isFallback: true,
            courierCompanyId: 0,
            courierName: 'Express Delivery',
            shippingCharge: parseFloat(settings.shippingCharge || '80'),
            rate: parseFloat(settings.shippingCharge || '80'),
            expectedDeliveryDate: '3–5 Business Days',
            expectedDeliveryDays: 3,
            formattedEDD: '3–5 Business Days',
            shortEDD: '3–5 Days',
            badgeText: '📦 Standard Delivery',
            badgeStyle: 'bg-stone-100 text-stone-700 border-stone-200'
          });
        }
      } finally {
        if (isMounted) setIsCalculatingShipping(false);
      }
    };

    fetchRate();

    return () => { isMounted = false; };
  }, [selectedPincode, totalWeightKg, subtotal, cartItems, settings.shippingCharge]);

  // Financial Breakdown Math
  const freeDeliveryThreshold = parseFloat(settings.freeDeliveryThreshold || '2');
  const discountAmount = coupon
    ? coupon.discountType === 'PERCENTAGE'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue
    : 0;

  const isFreeDeliveryByWeight = totalWeightKg >= freeDeliveryThreshold;
  const isFreeDeliveryByCoupon = coupon && (coupon.code === 'FREEDEL' || coupon.discountType === 'FREE_SHIPPING');
  const isFreeDelivery = isFreeDeliveryByWeight || isFreeDeliveryByCoupon;

  const remainingWeightKg = Math.max(freeDeliveryThreshold - totalWeightKg, 0);
  const progressPercent = Math.min(Math.round((totalWeightKg / freeDeliveryThreshold) * 100), 100);

  const liveShippingRate = (shiprocketQuote && shiprocketQuote.isServiceable && shiprocketQuote.rate !== undefined)
    ? shiprocketQuote.rate
    : parseFloat(settings.shippingCharge || '80');

  const shipping = isFreeDelivery ? 0 : liveShippingRate;
  const grandTotal = Math.max(subtotal - discountAmount + shipping, 0);

  const isNonServiceable = shiprocketQuote && shiprocketQuote.isServiceable === false;

  // Success Confirmation Screen
  if (orderSuccessDetails) {
    return (
      <div className="min-h-screen bg-cream-bg pt-32 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-stone-200/80 rounded-3xl p-8 text-center flex flex-col items-center gap-6 shadow-xs">
          <FiCheckCircle className="text-primary-green text-5xl" />
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-2xl font-bold text-dark-olive">Order Confirmed</h2>
            <p className="font-sans text-xs text-stone-500">
              Thank you! Order #{orderSuccessDetails.orderNumber} is confirmed.
            </p>
          </div>

          <div className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-left flex flex-col gap-2.5 text-xs text-stone-600 font-sans">
            <div className="flex justify-between">
              <span>Order Number</span>
              <strong className="text-dark-olive">{orderSuccessDetails.orderNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span>Payment Ref</span>
              <span className="font-mono text-[11px] text-stone-500">{orderSuccessDetails.razorpayPaymentId || 'N/A'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-stone-200/60">
              <span>Total Paid</span>
              <strong className="text-primary-green text-sm">{formatCurrency(orderSuccessDetails.totalAmount)}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => navigate('/products')}
              className="flex-1 font-sans text-xs font-semibold uppercase tracking-wider bg-primary-green text-white py-3.5 rounded-xl hover:bg-dark-olive transition cursor-pointer"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 font-sans text-xs font-semibold uppercase tracking-wider border border-stone-300 text-stone-700 py-3.5 rounded-xl hover:bg-stone-50 transition cursor-pointer"
            >
              My Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-cream-bg flex items-center justify-center pt-32">
        <div className="flex flex-col items-center gap-3">
          <GiSun className="text-sunrise-gold text-3xl animate-spin-slow" />
          <span className="font-sans text-xs text-stone-500">Loading Checkout...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-bg pt-6 pb-24 md:pb-16 px-4 md:px-10 lg:px-16 w-full max-w-[1440px] mx-auto">
      
      {/* 10. TOP BACK BUTTON - Left Aligned, Always Visible Below Navbar */}
      <div className="w-full mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-dark-olive transition py-2 px-3.5 rounded-xl hover:bg-stone-200/40 cursor-pointer"
        >
          <FiArrowLeft className="text-sm" />
          <span>Back to Store</span>
        </button>

        <h1 className="font-serif text-2xl md:text-3xl font-bold text-dark-olive">Checkout</h1>
        <div className="w-20" /> {/* Visual Balance Spacer */}
      </div>

      {cartItems.length === 0 ? (
        <div className="max-w-md mx-auto bg-white border border-stone-200/80 rounded-3xl p-12 text-center flex flex-col items-center gap-4 shadow-xs">
          <p className="font-serif text-xl font-bold text-dark-olive">Your bag is empty</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-primary-green hover:bg-dark-olive text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-7 rounded-xl transition cursor-pointer"
          >
            Explore Products
          </button>
        </div>
      ) : (
        /* 1. INCREASED CONTAINER WIDTH: 85-90% Viewport Coverage */
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start text-left">
          
          {/* LEFT COLUMN: 7 Cols (Product Cards, Address, Payment) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* 2 & 3. TALLER PRODUCT CARDS WITH 110-130px IMAGES & CIRCULAR QUANTITY CONTROLS */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold text-stone-500 font-sans tracking-wider uppercase px-1">
                Items in Bag ({cartItems.length})
              </span>

              {cartItems.map((item) => {
                const itemPrice = item.variant ? item.variant.price : item.product.price;
                const rawImgUrl = typeof item.product?.images?.[0] === 'string' ? item.product.images[0] : (item.product?.images?.[0]?.url || item.product?.image || item.product?.hoverImage);
                const itemImg = getOptimizedImageUrl(rawImgUrl, { width: 300, cropMode: 'limit' });
                const weightLabel = item.variant ? item.variant.name : item.product.weight;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-5 p-6 md:p-7 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-all duration-200"
                  >
                    {/* Large Product Photo (110-130px) */}
                    <img
                      src={itemImg}
                      alt={item.product.name}
                      loading="lazy"
                      onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                      className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-2xl border border-stone-100 bg-cream-bg shrink-0 shadow-xs"
                    />

                    {/* Information & Controls */}
                    <div className="flex flex-col flex-grow justify-between min-h-[110px]">
                      <div>
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="font-serif text-lg md:text-xl font-bold text-dark-olive leading-tight">
                            {item.product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            title="Remove item"
                            className="text-stone-400 hover:text-red-500 transition p-1.5 cursor-pointer rounded-lg hover:bg-stone-100 shrink-0"
                          >
                            <FiTrash2 className="text-base" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                          {weightLabel && (
                            <span className="text-xs text-stone-500 font-sans font-medium">
                              {weightLabel}
                            </span>
                          )}
                          <span className="text-stone-300">•</span>
                          <span className="text-xs text-primary-green font-medium">
                            Organic Harvest
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-stone-100">
                        <div className="flex flex-col">
                          <span className="font-serif text-lg font-bold text-dark-olive">
                            {formatCurrency(itemPrice * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[11px] text-stone-400 font-sans">
                              {formatCurrency(itemPrice)} each
                            </span>
                          )}
                        </div>

                        {/* 9. CIRCULAR QUANTITY CONTROLS */}
                        <div className="flex items-center gap-2.5 bg-stone-50 p-1 rounded-full border border-stone-200/80">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-700 font-bold transition flex items-center justify-center cursor-pointer shadow-xs active:scale-90 border border-stone-200/60"
                          >
                            –
                          </button>
                          <span className="w-6 text-center font-sans text-xs font-bold text-dark-olive">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-700 font-bold transition flex items-center justify-center cursor-pointer shadow-xs active:scale-90 border border-stone-200/60"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

                 {/* 4. ADDRESS SECTION WITH MODAL EXPERIENCE */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="font-serif text-lg font-bold text-dark-olive flex items-center gap-2">
                  <FiMapPin className="text-[#C68A2B]" /> Deliver To
                </span>
                {addresses.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTempSelectedAddressId(selectedAddressId);
                      setIsAddressModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#4E641A] hover:underline cursor-pointer bg-transparent border-none"
                  >
                    Change
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/profile?tab=saved-coordinates&from=checkout')}
                    className="text-xs font-bold text-[#4E641A] hover:underline cursor-pointer bg-transparent border-none"
                  >
                    + Add Address
                  </button>
                )}
              </div>

              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 md:p-7 flex flex-col gap-4 shadow-xs">
                {selectedAddress ? (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5 text-sm font-sans text-stone-700 leading-relaxed text-left">
                      <div className="flex items-center gap-2">
                        <strong className="font-serif text-base font-bold text-dark-olive">
                          {selectedAddress.recipientName || user?.name}
                        </strong>
                        {selectedAddress.title && (
                          <span className="text-[10px] font-bold bg-[#4E641A]/10 text-[#4E641A] px-2.5 py-0.5 rounded-full">
                            {selectedAddress.title}
                          </span>
                        )}
                        <span className="text-xs text-stone-500 font-medium">
                          • {selectedAddress.phone}
                        </span>
                      </div>
                      <span className="text-stone-600 text-xs md:text-sm">
                        {selectedAddress.street ? selectedAddress.street.replace(/\s*\|\s*/g, ', ') : ''}, {selectedAddress.city ? selectedAddress.city.replace(/\s*\|\s*/g, ', ') : ''}, {selectedAddress.state} – <strong className="font-semibold text-dark-olive">{selectedAddress.postalCode}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTempSelectedAddressId(selectedAddressId);
                        setIsAddressModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-[#4E641A] bg-[#4E641A]/5 hover:bg-[#4E641A]/10 rounded-xl transition border-none cursor-pointer shrink-0 select-none"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone-400">No address selected</span>
                    <button
                      onClick={() => navigate('/profile?tab=saved-coordinates&from=checkout')}
                      className="text-xs font-bold text-primary-green hover:underline cursor-pointer border-none bg-transparent"
                    >
                      + Add Address
                    </button>
                  </div>
                )}
              </div>
            </div>

              {/* PREMIUM ORGANIC SHIPROCKET DELIVERY CARD */}
              {selectedAddress && (
                <div className="mt-1">
                  {isCalculatingShipping ? (
                    <div className="bg-[#FAF7F2] border border-[#EAE4D8] rounded-2xl p-5 flex items-center justify-between text-xs text-stone-500 font-sans animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 border-2 border-[#4E641A] border-t-transparent rounded-full animate-spin" />
                        <span>Calculating live courier dispatch options...</span>
                      </div>
                    </div>
                  ) : isNonServiceable ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-xs font-sans text-red-700 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2 font-bold text-red-800 text-sm">
                        <FiAlertCircle className="text-red-600 text-base" />
                        <span>Delivery Not Available</span>
                      </div>
                      <p className="text-[11px] text-red-600 leading-relaxed">
                        Unfortunately, delivery is not available to pincode <strong>{selectedPincode}</strong>. Please choose or add a different delivery address.
                      </p>
                    </div>
                  ) : shiprocketQuote ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${selectedPincode}-${liveShippingRate}-${shiprocketQuote?.courierName}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="bg-[#FAF7F2] border border-[#EAE4D8] rounded-2xl p-5 space-y-3.5 font-sans shadow-2xs"
                      >
                        {/* Courier Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-serif font-bold text-dark-olive text-sm flex items-center gap-1.5">
                              <FiTruck className="text-[#4E641A]" /> Shipped via {shiprocketQuote.courierName}
                            </span>
                            <span className="text-[10px] text-stone-400 block pt-0.5 font-medium">
                              Fully Trackable Shipment
                            </span>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            shiprocketQuote.badgeType === 'TOMORROW' || shiprocketQuote.badgeType === 'EXPRESS'
                              ? 'bg-[#E8F0D6] text-[#37411A] border-[#D4E2B6]'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}>
                            {shiprocketQuote.badgeText}
                          </span>
                        </div>

                        {/* Expected Delivery Date */}
                        <div className="flex justify-between items-baseline pt-2.5 border-t border-[#EAE4D8]/80 text-xs">
                          <span className="text-stone-500 font-medium">
                            {shiprocketQuote.expectedDeliveryDays === 1 
                              ? 'Arrives Tomorrow' 
                              : shiprocketQuote.expectedDeliveryDays === 2 
                              ? 'Arrives in 2 Days' 
                              : 'Expected by'}
                          </span>
                          <strong className="font-serif text-sm font-bold text-dark-olive">
                            {shiprocketQuote.expectedDeliveryDate || shiprocketQuote.formattedEDD || '3–5 Business Days'}
                          </strong>
                        </div>

                        {/* Shipping Charge Display */}
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="text-stone-500 font-medium">Shipping</span>
                          <div className="flex items-center gap-1.5">
                            {isFreeDeliveryByCoupon && liveShippingRate > 0 && (
                              <span className="line-through text-stone-400 text-[11px]">{formatCurrency(liveShippingRate)}</span>
                            )}
                            <strong className="text-primary-green font-bold text-sm">
                              {isFreeDelivery ? 'FREE' : formatCurrency(liveShippingRate)}
                            </strong>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 font-sans">
                      Shipping charges will be calculated before payment.
                    </div>
                  )}
                </div>
              )}

              {/* FREE SHIPPING PROGRESS EXPERIENCE CARD */}
              <div className="mt-3">
                {isFreeDeliveryByWeight || isFreeDeliveryByCoupon ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#F2F7E9] border border-[#D4E2B6] rounded-2xl p-5 font-sans space-y-1.5 shadow-2xs text-[#2D3A13]"
                  >
                    <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#37411A]">
                      <GiSun className="text-[#C68A2B] text-base animate-spin-slow" />
                      <span>Congratulations!</span>
                    </div>
                    <p className="text-xs text-[#4E641A] leading-relaxed">
                      Your order qualifies for <strong>FREE Shipping</strong>.
                      {liveShippingRate > 0 && (
                        <span className="block pt-0.5 text-[#37411A] font-semibold">
                          You saved {formatCurrency(liveShippingRate)}!
                        </span>
                      )}
                    </p>
                  </motion.div>
                ) : (
                  <div className="bg-[#FAF7F2] border border-[#EAE4D8] rounded-2xl p-5 font-sans space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-dark-olive text-sm flex items-center gap-1.5">
                        <FiTruck className="text-[#4E641A]" /> Free Shipping Offer
                      </span>
                      <span className="text-[11px] font-bold text-[#37411A] bg-[#E8F0D6] border border-[#D4E2B6] px-2.5 py-0.5 rounded-full">
                        Available above {formatWeightDisplay(freeDeliveryThreshold)}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      Add more products to reach <strong>{formatWeightDisplay(freeDeliveryThreshold)}</strong> and unlock <strong>FREE Shipping</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 pt-1 gap-1 font-medium">
                      <span>Current Weight: <strong className="text-dark-olive font-bold">{formatWeightDisplay(totalWeightKg)}</strong></span>
                      <span>Need only <strong className="text-primary-green font-bold">{formatWeightDisplay(remainingWeightKg)}</strong> more</span>
                    </div>

                    {/* Progressive Motion Bar */}
                    <div className="w-full bg-stone-200/80 rounded-full h-2.5 overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="bg-[#4E641A] h-full rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>

            {/* 8. PAYMENT SECTION WITH ONE-ROW METHOD BADGES */}
            <div className="flex flex-col gap-3">
              <span className="font-serif text-lg font-bold text-dark-olive px-1">
                Payment Method
              </span>

              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 md:p-7 flex flex-col gap-3.5 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="font-serif text-base font-bold text-dark-olive">
                    Pay Online (Razorpay)
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100">
                  <span className="text-xs text-stone-400 font-medium mr-1">Supported:</span>
                  {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'Wallets'].map((method) => (
                    <span key={method} className="text-xs font-semibold text-stone-600 bg-stone-100/80 border border-stone-200/60 px-3 py-1 rounded-lg">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 5, 6 & 7. INTEGRATED ORDER SUMMARY SIDEBAR (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-stone-200/80 rounded-3xl p-7 flex flex-col gap-6 sticky top-28 shadow-xs">
            <span className="font-serif text-xl font-bold text-dark-olive pb-3 border-b border-stone-100">
              Order Summary
            </span>

            {/* 6. INTEGRATED COUPON AREA */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-4 text-xs font-sans focus:outline-none focus:border-primary-green uppercase h-11 transition"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-primary-green hover:bg-dark-olive text-white px-5 rounded-xl text-xs font-semibold uppercase tracking-wider transition active:scale-95 cursor-pointer h-11"
                >
                  Apply
                </button>
              </div>

              {activeCoupons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeCoupons.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={async () => {
                        setCouponCode(c.code);
                        setCouponError(null);
                        setCouponSuccess(false);
                        try {
                          await applyCoupon(c.code);
                          setCouponSuccess(true);
                          sessionStorage.setItem('appliedCoupon', JSON.stringify({
                            id: c.id,
                            code: c.code,
                            discountType: c.discountType,
                            discountValue: c.discountValue
                          }));
                        } catch (err) {
                          setCouponError(err.message);
                          removeCoupon();
                        }
                      }}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer"
                    >
                      {c.code} ({c.code === 'FREEDEL' ? 'Free Delivery' : (c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} OFF`)})
                    </button>
                  ))}
                </div>
              )}

              {couponError && <span className="text-xs text-red-650 font-medium">{couponError}</span>}
              {couponSuccess && coupon && (
                <div className="flex justify-between items-center text-xs text-primary-green bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                  <span>Applied: <strong>{coupon.code}</strong></span>
                  <button type="button" onClick={() => { removeCoupon(); setCouponCode(''); setCouponSuccess(false); sessionStorage.removeItem('appliedCoupon'); }} className="underline text-xs cursor-pointer">Remove</button>
                </div>
              )}
            </div>

            {/* FINANCIAL BREAKDOWN */}
            <div className="flex flex-col gap-3.5 text-xs md:text-sm font-sans text-stone-600 border-t border-b border-stone-100 py-5">
              <div className="flex justify-between">
                <span>Products ({cartItems.reduce((a, b) => a + b.quantity, 0)})</span>
                <span className="font-semibold text-dark-olive">{formatCurrency(subtotal)}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-primary-green font-medium">
                  <span>Discount ({coupon.code})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-dark-olive">{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
              </div>

              {/* Free Shipping Status Row */}
              <div className="flex justify-between text-xs font-sans pt-1">
                <span className="text-stone-500">Free Shipping</span>
                <span className={`font-semibold ${isFreeDelivery ? 'text-primary-green font-bold' : 'text-stone-500'}`}>
                  {isFreeDelivery ? '✓ Applied' : `Available above ${formatWeightDisplay(freeDeliveryThreshold)}`}
                </span>
              </div>

              {/* Estimated Arrival Row in Order Summary */}
              {selectedAddress && shiprocketQuote && shiprocketQuote.isServiceable && (
                <div className="flex justify-between text-xs text-stone-600 font-medium pt-1 border-t border-stone-100/80">
                  <span className="text-stone-500">Estimated Arrival</span>
                  <strong className="font-serif font-bold text-dark-olive">{shiprocketQuote.shortEDD || shiprocketQuote.formattedEDD}</strong>
                </div>
              )}
            </div>

            {/* GRAND TOTAL */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="font-serif text-lg font-bold text-dark-olive">Total</span>
              <span className="font-serif text-2xl md:text-3xl font-bold text-dark-olive">{formatCurrency(grandTotal)}</span>
            </div>

            {/* 7. PRIMARY CTA BUTTON WITH PREPAID SUBTEXT */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || cartItems.length === 0 || isCalculatingShipping || isNonServiceable}
                className={`w-full font-sans text-xs md:text-sm font-semibold uppercase tracking-wider py-4 rounded-2xl transition-all shadow-xs text-center cursor-pointer h-13 flex items-center justify-center active:scale-98 border-none text-white ${
                  isNonServiceable 
                    ? 'bg-red-600 cursor-not-allowed opacity-80' 
                    : 'bg-primary-green hover:bg-dark-olive disabled:bg-primary-green/50'
                }`}
              >
                {isProcessing ? 'Processing Gateway...' : isCalculatingShipping ? 'Calculating Shipping...' : isNonServiceable ? 'Pincode Not Deliverable' : `Continue to Payment`}
              </button>

              {/* PREPAID ONLY SUBTEXT */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 font-sans">
                <FiLock className="text-primary-green text-xs" />
                <span>Secure prepaid payment • No COD available.</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MOBILE STICKY CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-white border-t border-stone-200 z-40 flex items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider">Total</span>
          <span className="font-serif text-xl font-bold text-dark-olive">{formatCurrency(grandTotal)}</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || cartItems.length === 0 || isCalculatingShipping || isNonServiceable}
          className={`flex-grow max-w-[220px] h-12 text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition text-center flex items-center justify-center border-none ${
            isNonServiceable 
              ? 'bg-red-600 cursor-not-allowed opacity-80' 
              : 'bg-primary-green hover:bg-dark-olive disabled:bg-primary-green/50'
          }`}
        >
          {isProcessing ? 'Processing...' : isCalculatingShipping ? 'Calculating...' : isNonServiceable ? 'Not Deliverable' : 'Pay Now'}
        </button>
      </div>

      {/* ADDRESS SELECTION MODAL & BOTTOM SHEET */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 font-sans select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsAddressModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal / Bottom Sheet Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-[650px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh] md:max-h-[80vh] border border-[#EAE4D8]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-[#EAE4D8] flex items-center justify-between bg-white shrink-0">
                <div className="text-left">
                  <h3 className="font-serif text-xl font-bold text-[#2F3B0C] flex items-center gap-2">
                    <FiMapPin className="text-[#C68A2B]" /> Choose Delivery Address
                  </h3>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    Select where you want your order delivered.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer border-none font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Address Cards List */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-grow bg-[#FAF8F5]">
                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3.5">
                    {addresses.map((addr) => {
                      const isSelected = tempSelectedAddressId === addr.id;
                      const LabelIcon = addr.title === 'Home' ? FiHome : addr.title === 'Work' ? FiBriefcase : FiMapPin;

                      return (
                        <div
                          key={addr.id}
                          onClick={() => setTempSelectedAddressId(addr.id)}
                          className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left relative flex items-start gap-4 ${
                            isSelected
                              ? 'border-[#4E641A] bg-[#4E641A]/[0.03] shadow-xs'
                              : 'border-[#EAE4D8] bg-white hover:border-[#4E641A]/30 hover:shadow-xs'
                          }`}
                        >
                          {/* Radio Selector */}
                          <div className="mt-1 shrink-0">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'border-[#4E641A] bg-[#4E641A]' : 'border-stone-300 bg-white'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>

                          {/* Address Details */}
                          <div className="flex-grow space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 bg-[#4E641A]/10 text-[#4E641A] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                                <LabelIcon className="w-3 h-3" />
                                <span>{addr.title || 'Home'}</span>
                              </span>
                              {addr.isDefault && (
                                <span className="inline-flex items-center gap-1 bg-[#C68A2B]/15 text-[#8C5D14] border border-[#C68A2B]/30 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>

                            <div className="font-bold text-sm text-[#2F3B0C] leading-snug">
                              {addr.recipientName || user?.name}
                            </div>

                            <div className="text-xs text-stone-600 font-normal leading-relaxed">
                              {addr.street ? addr.street.replace(/\s*\|\s*/g, ', ') : ''}, {addr.city ? addr.city.replace(/\s*\|\s*/g, ', ') : ''}, {addr.state} – <span className="font-semibold text-stone-800">{addr.postalCode}</span>
                            </div>

                            <div className="text-xs font-medium text-stone-500 pt-0.5">
                              📞 Phone: {addr.phone}
                            </div>
                          </div>

                          {/* Check Indicator */}
                          {isSelected && (
                            <FiCheckCircle className="w-5 h-5 text-[#4E641A] shrink-0 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="bg-white border border-[#EAE4D8] rounded-2xl py-10 px-6 text-center flex flex-col items-center gap-4 shadow-xs">
                    <div className="w-14 h-14 rounded-full bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center shrink-0">
                      <FiMapPin className="w-6 h-6 text-[#4E641A]" />
                    </div>
                    <div className="space-y-1 max-w-xs mx-auto">
                      <h4 className="font-serif text-lg font-bold text-[#2F3B0C]">No Saved Addresses</h4>
                      <p className="text-stone-500 text-xs leading-relaxed font-normal">
                        You don't have any saved delivery addresses yet.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddressModalOpen(false);
                        navigate('/profile?tab=saved-coordinates&from=checkout');
                      }}
                      className="px-5 py-2.5 bg-[#4E641A] hover:bg-[#37411A] text-white text-xs font-bold rounded-xl shadow-xs transition border-none cursor-pointer mt-1"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-white border-t border-[#EAE4D8] flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    navigate('/profile?tab=saved-coordinates&from=checkout');
                  }}
                  className="text-xs font-bold text-[#4E641A] hover:underline cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
                >
                  + Add New Address
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="px-4 py-2.5 border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold rounded-xl transition cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!tempSelectedAddressId}
                    onClick={() => {
                      if (tempSelectedAddressId) {
                        setSelectedAddressId(tempSelectedAddressId);
                        setIsAddressModalOpen(false);
                      }
                    }}
                    className={`px-6 py-2.5 text-xs font-bold rounded-xl transition border-none cursor-pointer shadow-xs ${
                      tempSelectedAddressId
                        ? 'bg-[#4E641A] hover:bg-[#37411A] text-white'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    Deliver Here
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
