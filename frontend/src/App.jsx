import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Global State Stores
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { useWishlistStore } from './store/useWishlistStore';

// Import Core Layout & Primary Home Page (Synchronous for fast FCP)
import MainLayout from './components/MainLayout';
import Home from './pages/Home';

// Lazy-loaded routes for code splitting
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const Contact = lazy(() => import('./pages/Contact'));
const CategoryCollection = lazy(() => import('./pages/CategoryCollection'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Checkout = lazy(() => import('./pages/Checkout'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ShipmentDetails = lazy(() => import('./pages/ShipmentDetails'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));

// Import MSG91 Mobile OTP Auth Providers
import { AuthProvider } from './components/auth/AuthProvider';
import { LoginModal } from './components/auth/LoginModal';
import { LoginRequiredModal } from './components/auth/LoginRequiredModal';
import CustomModal from './components/CustomModal';
import GlobalFeedback from './components/GlobalFeedback';

export default function App() {
  // Global Store Bindings
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  // Validate active session on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sync cart and wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center"><div className="w-8 h-8 border-3 border-[#4E641A] border-t-transparent rounded-full animate-spin" /></div>}>
        <Routes>
          {/* 1. Main Shared Layout Group (Customer Storefront) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="/category/:slug" element={<CategoryCollection />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Dashboard />} />
            <Route path="/profile/:tab" element={<Dashboard />} />
            <Route path="/profile/shipments/:orderId" element={<ShipmentDetails />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* 2. Isolated Admin Portal Route Group (Admin CMS) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminDashboard />} />
          <Route path="/admin/products/new" element={<AdminDashboard />} />
          <Route path="/admin/products/:id/edit" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminDashboard />} />
          <Route path="/admin/customers" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
          <Route path="/admin/shipping" element={<AdminDashboard />} />
          <Route path="/admin/logistics" element={<AdminDashboard />} />
          <Route path="/admin/homepage" element={<AdminDashboard />} />
          <Route path="/admin/coupons" element={<AdminDashboard />} />
          <Route path="/admin/reviews" element={<AdminDashboard />} />
          <Route path="/admin/reviews/:productId" element={<AdminDashboard />} />
          <Route path="/admin/support-tickets" element={<AdminDashboard />} />
          <Route path="/admin/support-tickets/:id" element={<AdminDashboard />} />

          {/* 3. Fallback Redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global Backdrop-Blurred Mobile OTP Modal */}
      <LoginModal />
      <LoginRequiredModal />
      <CustomModal />
      <GlobalFeedback />
    </AuthProvider>
  );
}
