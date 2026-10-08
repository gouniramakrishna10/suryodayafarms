import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { formatCurrency } from '../utils/currency';
import { INDIAN_STATES } from '../config/constants';
import { getOptimizedImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageOptimizer';
import GstInvoiceModal from '../components/GstInvoiceModal';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage,
  FiHeart,
  FiMapPin,
  FiUser,
  FiTag,
  FiHelpCircle,
  FiLogOut,
  FiChevronRight,
  FiArrowLeft,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiDownload,
  FiShoppingBag,
  FiCopy,
  FiCheck,
  FiMessageSquare,
  FiShield,
  FiInfo,
  FiX
} from 'react-icons/fi';

const MENU_ITEMS = [
  {
    id: 'orders',
    label: 'My Orders',
    desc: 'View and track all your orders',
    icon: FiPackage,
    color: 'text-[#4E641A]',
    bg: 'bg-[#F0F5E6]'
  },
  {
    id: 'wishlist',
    label: 'My Wishlist',
    desc: 'View your saved products',
    icon: FiHeart,
    color: 'text-rose-600',
    bg: 'bg-rose-50'
  },
  {
    id: 'addresses',
    label: 'My Addresses',
    desc: 'Manage your delivery addresses',
    icon: FiMapPin,
    color: 'text-[#C68A2B]',
    bg: 'bg-[#FFF9EE]'
  },
  {
    id: 'profile',
    label: 'My Profile',
    desc: 'Manage your personal information',
    icon: FiUser,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    id: 'coupons',
    label: 'My Coupons',
    desc: 'View available coupons and offers',
    icon: FiTag,
    color: 'text-amber-600',
    bg: 'bg-amber-50'
  },
  {
    id: 'help',
    label: 'Help & Support',
    desc: 'Get help with orders and other issues',
    icon: FiHelpCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tab } = useParams();

  const { user, logout, isAuthenticated, isAuthChecked, updateProfile } = useAuthStore();
  const { cartItems, addItem } = useCartStore();
  const { wishlistItems, toggleWishlist, fetchWishlist } = useWishlistStore();

  // Active section tab state (default to 'orders' on desktop, or route tab)
  const [activeTab, setActiveTab] = useState(tab || 'orders');

  // Sync tab with URL
  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    } else {
      // If root /account or /profile on desktop, default tab is 'orders'
      if (window.innerWidth >= 768) {
        setActiveTab('orders');
      }
    }
  }, [tab]);

  // Auth Protection Redirect
  useEffect(() => {
    if (isAuthChecked && !isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true, 'Please login to access your account.');
      navigate('/');
    }
  }, [isAuthenticated, isAuthChecked, navigate]);

  // Data States
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Address Modal States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    recipientName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Profile Edit States
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    gender: '',
    dob: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Logout Confirmation Modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Invoice Modal State
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);

  // Coupon copied feedback state
  const [copiedCoupon, setCopiedCoupon] = useState('');

  // Fetch Wishlist on Mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  // Sync Profile Form
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        gender: user.gender || '',
        dob: user.dob || ''
      });
    }
  }, [user]);

  // Fetch Orders
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fetch Addresses
  const fetchAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const res = await api.get('/auth/addresses');
      setAddresses(res.addresses || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'orders' || !tab) fetchOrders();
      if (activeTab === 'addresses') fetchAddresses();
    }
  }, [isAuthenticated, activeTab]);

  // Helper: Switch Tab (Updates URL)
  const handleTabChange = (targetTab) => {
    setActiveTab(targetTab);
    const basePath = location.pathname.startsWith('/profile') ? '/profile' : '/account';
    navigate(`${basePath}/${targetTab}`);
  };

  // Handle Save Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.recipientName || !addressForm.phone || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      useFeedbackStore.getState().showToast('Please fill in all address parameters.', 'error');
      return;
    }

    setIsSavingAddress(true);
    try {
      if (editingAddress) {
        await api.put(`/auth/addresses/${editingAddress.id}`, addressForm);
        useFeedbackStore.getState().showToast('✅ Address updated successfully!', 'success');
      } else {
        await api.post('/auth/addresses', addressForm);
        useFeedbackStore.getState().showToast('✅ New address added!', 'success');
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err) {
      useFeedbackStore.getState().showToast(err.message || 'Failed to save address.', 'error');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Handle Delete Address
  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/auth/addresses/${id}`);
      useFeedbackStore.getState().showToast('✅ Address deleted successfully.', 'success');
      fetchAddresses();
    } catch (err) {
      useFeedbackStore.getState().showToast(err.message || 'Failed to delete address.', 'error');
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      useFeedbackStore.getState().showToast('Full name is required.', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile(profileForm);
      useFeedbackStore.getState().showToast('✅ Profile updated successfully!', 'success');
    } catch (err) {
      useFeedbackStore.getState().showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Copy Coupon Code
  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    useFeedbackStore.getState().showToast(`✅ Coupon code ${code} copied!`, 'success');
    setTimeout(() => setCopiedCoupon(''), 3000);
  };

  // Handle Logout Confirmation
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#4E641A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userInitial = (user?.name || user?.mobile || 'C').slice(0, 2).toUpperCase();
  const isMobileDetailView = Boolean(tab); // true when a sub-route like /account/orders is active on mobile

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2F3B0C] font-sans pt-3 sm:pt-6 md:pt-8 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ---------------------------------------------------------------------- */}
        {/* DESKTOP & MOBILE HEADER SUMMARY CARD */}
        {/* ---------------------------------------------------------------------- */}
        <div className="bg-white border border-[#EDE7D9] rounded-3xl p-5 sm:p-6 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar */}
            <div className="relative shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#4E641A]/20 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#F0F5E6] to-[#E4DDCB] border-2 border-[#4E641A]/30 flex items-center justify-center font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C] shadow-2xs">
                  {userInitial}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#4E641A] text-white flex items-center justify-center text-[10px] shadow-2xs">
                ✓
              </span>
            </div>

            {/* Profile Info */}
            <div className="space-y-0.5 text-left min-w-0 flex-1">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C] truncate leading-snug">
                {user?.name || 'Customer Account'}
              </h2>
              <p className="font-sans text-xs text-stone-500 font-medium truncate">
                Mobile: {user?.mobile ? `+91 ${user.mobile}` : 'Not provided'}
              </p>
              {user?.email && (
                <p className="font-sans text-xs text-stone-400 font-light truncate hidden sm:block">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Edit Profile Action */}
          <button
            onClick={() => handleTabChange('profile')}
            className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F0F5E6] border border-[#EDE7D9] text-xs font-bold text-[#4E641A] flex items-center gap-1.5 transition shrink-0 cursor-pointer"
          >
            <FiEdit3 size={14} />
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* MAIN LAYOUT GRID (Desktop: 2 Column / Mobile: Dynamic Switch) */}
        {/* ---------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

          {/* LEFT SIDEBAR: MENU NAVIGATION (Visible on Desktop OR Mobile root /account) */}
          <div className={`${isMobileDetailView ? 'hidden md:block' : 'block'} md:col-span-4 lg:col-span-4 xl:col-span-3 space-y-3`}>
            <div className="bg-white border border-[#EDE7D9] rounded-3xl p-3 sm:p-4 shadow-2xs space-y-1">
              <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-stone-400 text-left border-b border-[#EDE7D9]/60 mb-2">
                Account Navigation
              </div>

              {MENU_ITEMS.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all duration-200 text-left cursor-pointer border-none select-none ${
                      isActive
                        ? 'bg-[#4E641A] text-white shadow-sm font-semibold'
                        : 'bg-transparent text-stone-700 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/15 text-white' : `${item.bg} ${item.color}`
                      }`}>
                        <IconComp size={18} />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className={`text-xs sm:text-sm font-bold leading-snug truncate ${isActive ? 'text-white' : 'text-[#2F3B0C]'}`}>
                          {item.label}
                        </div>
                        <div className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-white/80 font-light' : 'text-stone-400 font-normal'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <FiChevronRight size={18} className={`shrink-0 ${isActive ? 'text-white' : 'text-stone-300'}`} />
                  </button>
                );
              })}

              {/* LOGOUT ROW */}
              <div className="pt-2 border-t border-[#EDE7D9]/80 mt-2">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-red-50/70 hover:bg-red-100/70 text-red-600 transition-colors text-left cursor-pointer border-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <FiLogOut size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-snug">Logout</div>
                      <div className="text-[11px] text-red-400 font-normal mt-0.5">Sign out of your session</div>
                    </div>
                  </div>
                  <FiChevronRight size={18} className="text-red-300" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT AREA: SELECTED TAB CONTENT */}
          <div className={`${!isMobileDetailView ? 'hidden md:block' : 'block'} md:col-span-8 lg:col-span-8 xl:col-span-9 space-y-6`}>
            
            {/* Mobile Back Button (Shown when viewing sub-tab on mobile) */}
            <div className="md:hidden flex items-center justify-between bg-white border border-[#EDE7D9] rounded-2xl p-3 px-4 shadow-2xs">
              <button
                onClick={() => {
                  const basePath = location.pathname.startsWith('/profile') ? '/profile' : '/account';
                  navigate(basePath);
                }}
                className="flex items-center gap-2 text-xs font-bold text-[#4E641A] bg-transparent border-none cursor-pointer"
              >
                <FiArrowLeft size={16} />
                <span>Back to Menu</span>
              </button>

              <span className="font-serif text-sm font-bold text-[#2F3B0C] capitalize">
                {activeTab}
              </span>
            </div>

            {/* TAB CONTENT RENDERER */}
            <div className="bg-white border border-[#EDE7D9] rounded-3xl p-5 sm:p-8 shadow-2xs text-left">

              {/* 1. MY ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#EDE7D9] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#F0F5E6] text-[#4E641A] flex items-center justify-center">
                        <FiPackage size={18} />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C]">My Orders</h3>
                        <p className="text-xs text-stone-500 font-medium">Track active orders & view past purchases</p>
                      </div>
                    </div>
                  </div>

                  {isLoadingOrders ? (
                    <div className="space-y-4 py-8 text-center">
                      <div className="w-8 h-8 border-3 border-[#4E641A] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-stone-500 font-medium">Loading your orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EDE7D9] flex items-center justify-center mx-auto text-stone-400">
                        <FiPackage size={28} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-base font-bold text-[#2F3B0C]">No orders placed yet</h4>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">
                          Explore our pure natural superfoods and nourish your family with trusted care.
                        </p>
                      </div>
                      <Link
                        to="/products"
                        className="inline-block px-6 py-3 rounded-2xl bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
                      >
                        Explore Products →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        });

                        const isDelivered = (order.status || '').toUpperCase() === 'DELIVERED';
                        const firstItem = order.items?.[0] || order.orderItems?.[0];
                        const itemRawImg = firstItem?.product?.images?.[0] || firstItem?.product?.image;
                        const itemImg = getOptimizedImageUrl(itemRawImg, { width: 100, cropMode: 'fit' });

                        return (
                          <div
                            key={order.id}
                            className="border border-[#EDE7D9] rounded-2xl p-4 sm:p-5 hover:border-[#4E641A]/40 transition space-y-4 bg-[#FDFBF7]"
                          >
                            {/* Top Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDE7D9]/80 pb-3 text-xs">
                              <div className="space-y-0.5">
                                <div className="font-mono font-bold text-[#2F3B0C] text-xs sm:text-sm">
                                  Order #{order.orderNumber || order.id}
                                </div>
                                <div className="text-stone-400 font-normal">
                                  Placed on {orderDate}
                                </div>
                              </div>

                              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                isDelivered ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {order.status || 'Processing'}
                              </span>
                            </div>

                            {/* Middle Items Preview */}
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl bg-white border border-[#EDE7D9] p-1 shrink-0 flex items-center justify-center">
                                <img
                                  src={itemImg}
                                  alt="Product"
                                  onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                                  className="w-full h-full object-contain"
                                />
                              </div>

                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="font-serif text-sm font-bold text-[#2F3B0C] truncate">
                                  {firstItem?.product?.name || firstItem?.name || 'Organic Superfood'}
                                </div>
                                {(order.items?.length > 1 || order.orderItems?.length > 1) && (
                                  <div className="text-[11px] text-stone-500 font-medium">
                                    + {(order.items?.length || order.orderItems?.length) - 1} more item(s)
                                  </div>
                                )}
                                <div className="font-serif text-sm font-bold text-[#4E641A]">
                                  {formatCurrency(order.totalAmount || order.total)}
                                </div>
                              </div>
                            </div>

                            {/* Bottom Action Triggers */}
                            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#EDE7D9]/60">
                              <button
                                onClick={() => setActiveInvoiceOrder(order)}
                                className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#EDE7D9] text-[11px] font-bold text-stone-700 flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <FiDownload size={13} />
                                <span>Invoice</span>
                              </button>

                              <button
                                onClick={() => navigate(`/profile/shipments/${order.id}`)}
                                className="px-4 py-2 rounded-xl bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                              >
                                <FiTruck size={13} />
                                <span>Track Order</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 2. MY WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#EDE7D9] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <FiHeart size={18} />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C]">My Wishlist</h3>
                        <p className="text-xs text-stone-500 font-medium">Your saved natural superfood products</p>
                      </div>
                    </div>
                  </div>

                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EDE7D9] flex items-center justify-center mx-auto text-rose-300">
                        <FiHeart size={28} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-base font-bold text-[#2F3B0C]">Your wishlist is empty</h4>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">
                          Save your favorite natural superfoods for quick & easy future shopping.
                        </p>
                      </div>
                      <Link
                        to="/products"
                        className="inline-block px-6 py-3 rounded-2xl bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
                      >
                        Explore Products →
                      </Link>
                    </div>
                  ) : (
                    <div className={`wishlist-products-grid grid gap-4 sm:gap-5 ${
                      wishlistItems.length === 1 
                        ? 'grid-cols-1 max-w-xs' 
                        : wishlistItems.length === 2 
                          ? 'grid-cols-2' 
                          : 'grid-cols-2 md:grid-cols-2 xl:grid-cols-3'
                    }`}>
                      {wishlistItems.map((item) => {
                        const product = item.product || item;
                        if (!product) return null;

                        return (
                          <ProductCard
                            key={product.id || item.id}
                            product={product}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 3. MY ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDE7D9] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#FFF9EE] text-[#C68A2B] flex items-center justify-center">
                        <FiMapPin size={18} />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C]">My Addresses</h3>
                        <p className="text-xs text-stone-500 font-medium">Manage delivery addresses for seamless checkout</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setAddressForm({
                          title: 'Home',
                          recipientName: user?.name || '',
                          phone: user?.mobile || '',
                          street: '',
                          city: '',
                          state: '',
                          postalCode: '',
                          country: 'India',
                          isDefault: addresses.length === 0
                        });
                        setIsAddressModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border-none shadow-2xs"
                    >
                      <FiPlus size={15} />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {isLoadingAddresses ? (
                    <div className="space-y-4 py-8 text-center">
                      <div className="w-8 h-8 border-3 border-[#4E641A] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-stone-500 font-medium">Loading saved addresses...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EDE7D9] flex items-center justify-center mx-auto text-stone-400">
                        <FiMapPin size={28} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-base font-bold text-[#2F3B0C]">No addresses saved</h4>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">
                          Add a delivery address to enjoy 1-click express checkout.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 relative hover:border-[#4E641A]/40 transition"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#F0F5E6] text-[#4E641A] text-[10px] font-extrabold uppercase tracking-wider border border-[#4E641A]/20">
                                {addr.title || 'Address'}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  Default
                                </span>
                              )}
                            </div>

                            <div className="font-serif text-sm font-bold text-[#2F3B0C]">
                              {addr.recipientName}
                            </div>
                            <div className="text-xs text-stone-600 space-y-0.5 font-sans">
                              <p className="line-clamp-2">{addr.street}</p>
                              <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                              <p className="text-stone-400">Phone: +91 {addr.phone}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EDE7D9]/60">
                            <button
                              onClick={() => {
                                setEditingAddress(addr);
                                setAddressForm({
                                  title: addr.title || 'Home',
                                  recipientName: addr.recipientName || '',
                                  phone: addr.phone || '',
                                  street: addr.street || '',
                                  city: addr.city || '',
                                  state: addr.state || '',
                                  postalCode: addr.postalCode || '',
                                  country: addr.country || 'India',
                                  isDefault: addr.isDefault || false
                                });
                                setIsAddressModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white border border-[#EDE7D9] text-[11px] font-bold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold hover:bg-red-100 transition cursor-pointer border-none"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. MY PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#EDE7D9] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FiUser size={18} />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C]">My Profile</h3>
                        <p className="text-xs text-stone-500 font-medium">Manage your personal details and contact info</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Full Name *</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="e.g. Srujan Kumar"
                        required
                        className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-[#4E641A]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Mobile Number (Verified)</label>
                      <input
                        type="text"
                        value={user?.mobile ? `+91 ${user.mobile}` : ''}
                        disabled
                        className="w-full bg-stone-100 border border-stone-200 rounded-xl py-2.5 px-3.5 text-xs text-stone-500 font-mono font-bold cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="e.g. srujan@example.com"
                        className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Gender (Optional)</label>
                        <select
                          value={profileForm.gender}
                          onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                        >
                          <option value="">Select...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Date of Birth (Optional)</label>
                        <input
                          type="date"
                          value={profileForm.dob}
                          onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-6 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer border-none flex items-center gap-2"
                      >
                        {isSavingProfile ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <span>Save Profile Details →</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 5. MY COUPONS */}
              {activeTab === 'coupons' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#EDE7D9] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <FiTag size={18} />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C]">My Coupons</h3>
                        <p className="text-xs text-stone-500 font-medium">Available offers & promo codes for your kitchen</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        code: 'SOILFIRST15',
                        title: '15% OFF Harvest Special',
                        desc: 'Valid on unrefined wood-pressed oils & basmati staples.',
                        minOrder: 'Min Order: ₹1,500'
                      },
                      {
                        code: 'WELCOME100',
                        title: 'Flat ₹100 OFF First Order',
                        desc: 'Applicable on any natural superfood product order.',
                        minOrder: 'Min Order: ₹799'
                      },
                      {
                        code: 'FREESHIP',
                        title: 'Free Express Shipping',
                        desc: 'Enjoy free delivery across India on orders above ₹999.',
                        minOrder: 'Min Order: ₹999'
                      }
                    ].map((coupon, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FFFDF9] border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 relative shadow-2xs"
                      >
                        <div className="space-y-1.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-[#4E641A] bg-[#F0F5E6] px-2.5 py-1 rounded-lg border border-[#4E641A]/20">
                              {coupon.code}
                            </span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Active
                            </span>
                          </div>
                          <h4 className="font-serif text-sm font-bold text-[#2F3B0C] pt-1">
                            {coupon.title}
                          </h4>
                          <p className="text-xs text-stone-600 font-light leading-relaxed">
                            {coupon.desc}
                          </p>
                          <span className="text-[10px] font-semibold text-stone-400 block pt-1">
                            {coupon.minOrder}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer border-none shadow-2xs"
                        >
                          {copiedCoupon === coupon.code ? <FiCheck size={14} /> : <FiCopy size={14} />}
                          <span>{copiedCoupon === coupon.code ? 'Code Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. HELP & SUPPORT */}
              {activeTab === 'help' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#EDE7D9] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FiHelpCircle size={18} />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C]">Help & Support</h3>
                        <p className="text-xs text-stone-500 font-medium">Get assistance with your orders and products</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Order Related Help',
                        desc: 'Track, modify, or report issues with recent orders.',
                        icon: FiPackage,
                        action: () => handleTabChange('orders')
                      },
                      {
                        title: 'Payment Help',
                        desc: 'Payment methods, refund status, and transaction issues.',
                        icon: FiShield,
                        action: () => navigate('/faq')
                      },
                      {
                        title: 'Delivery & Shipping',
                        desc: 'Delivery times, courier partners, and shipping charges.',
                        icon: FiTruck,
                        action: () => navigate('/faq')
                      },
                      {
                        title: 'Returns & Refunds',
                        desc: 'Return policies, damaged items, and refund processing.',
                        icon: FiInfo,
                        action: () => navigate('/faq')
                      }
                    ].map((topic, idx) => {
                      const IconComp = topic.icon;
                      return (
                        <button
                          key={idx}
                          onClick={topic.action}
                          className="bg-[#FDFBF7] border border-[#EDE7D9] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 hover:border-[#4E641A]/40 transition text-left cursor-pointer border-none"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#F0F5E6] text-[#4E641A] flex items-center justify-center shrink-0">
                            <IconComp size={18} />
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-serif text-sm font-bold text-[#2F3B0C]">
                              {topic.title}
                            </div>
                            <div className="text-xs text-stone-500 font-light leading-relaxed">
                              {topic.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Direct WhatsApp Contact Card */}
                  <div className="bg-[#F0F5E6] border border-[#4E641A]/20 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-serif text-base font-bold text-[#2F3B0C]">
                        Need personal assistance?
                      </h4>
                      <p className="text-xs text-stone-600">
                        Our customer support team is available on WhatsApp to help you.
                      </p>
                    </div>

                    <a
                      href="https://wa.me/91789"
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 rounded-xl bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-xs text-decoration-none"
                    >
                      <FiMessageSquare size={16} />
                      <span>Contact Support</span>
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* ADDRESS ADD/EDIT MODAL */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddressModalOpen(false)}
              className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EDE7D9] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative z-10 text-left font-sans max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#EDE7D9] pb-4 mb-4">
                <h3 className="font-serif text-lg font-bold text-[#2F3B0C]">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 bg-transparent border-none cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Address Label</label>
                    <select
                      value={addressForm.title}
                      onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                      placeholder="e.g. Srujan"
                      required
                      className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="9876543210"
                    required
                    className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">House No. / Building / Street *</label>
                  <textarea
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    rows={2}
                    placeholder="Flat 102, Green Acres"
                    required
                    className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">City *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="Hyderabad"
                      required
                      className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">State *</label>
                    <select
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                      className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">PIN Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value.replace(/\D/g, '') })}
                      placeholder="500001"
                      required
                      className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefaultCheck"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 text-[#4E641A] rounded border-stone-300"
                  />
                  <label htmlFor="isDefaultCheck" className="text-xs text-stone-700 font-medium select-none">
                    Set as default delivery address
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#EDE7D9]">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer border-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="px-6 py-2.5 rounded-xl bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer border-none flex items-center gap-1.5"
                  >
                    {isSavingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EDE7D9] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative z-10 text-center font-sans space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-500">
                <FiLogOut size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#2F3B0C]">
                  Confirm Logout
                </h3>
                <p className="text-xs text-stone-500 font-medium leading-relaxed">
                  Are you sure you want to log out of Suryodaya Farms?
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer border-none shadow-sm"
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GST INVOICE MODAL */}
      {activeInvoiceOrder && (
        <GstInvoiceModal
          order={activeInvoiceOrder}
          onClose={() => setActiveInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
