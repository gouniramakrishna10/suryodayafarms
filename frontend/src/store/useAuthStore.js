import { create } from 'zustand';
import api from '../utils/api';
import { useWishlistStore } from './useWishlistStore';
import { useCartStore } from './useCartStore';
import { useFeedbackStore } from './useFeedbackStore';

const getInitialUserData = () => {
  try {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const hasStoredAuthToken = () => {
  try {
    return !!(localStorage.getItem('userToken') || localStorage.getItem('userData'));
  } catch (e) {
    return false;
  }
};

const initialUser = getInitialUserData();
const initialAuth = hasStoredAuthToken();

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  isAuthenticated: initialAuth,
  isLoading: false,
  isAuthChecked: initialAuth,
  isAuthModalOpen: false,
  isLoginRequiredModalOpen: false,
  loginRequiredMessage: '',
  authModalTab: 'login', // 'login' | 'signup'
  checkoutResumeRedirect: null,
  error: null,

  // Set modal and redirect states
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open, error: null }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  setLoginRequiredModalOpen: (open, message = '') => set({ isLoginRequiredModalOpen: open, loginRequiredMessage: open ? message : '' }),
  setCheckoutResumeRedirect: (redirect) => set({ checkoutResumeRedirect: redirect }),
  clearError: () => set({ error: null }),

  // 1. FAST2SMS SEND OTP
  sendOtp: async (mobile) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/send-otp', { mobile });
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // 2. FAST2SMS VERIFY OTP & SET PERSISTENT SESSION
  verifyOtp: async (mobile, otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/verify-otp', { mobile, otp });
      if (response && (response.return === true || response.success) && response.user) {
        if (response.token) {
          localStorage.setItem('userToken', response.token);
        }
        localStorage.setItem('userData', JSON.stringify(response.user));

        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          isAuthChecked: true
        });

        // Merge guest local cart if present
        useCartStore.getState().syncGuestCartWithServer();
      }
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // 3. FAST2SMS RESEND OTP
  resendOtp: async (mobile) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/resend-otp', { mobile });
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // 4. UPDATE USER PROFILE (Name, Email, Gender, DOB)
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response && response.success && response.user) {
        const updatedUser = { ...get().user, ...response.user };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        set({
          user: updatedUser,
          isLoading: false
        });
      }
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // 5. REGISTER NEW USER (LEGACY SUPPORT)
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    useFeedbackStore.getState().showLoader('Creating your account...');
    try {
      const response = await api.post('/auth/register', { name, email, password });
      useFeedbackStore.getState().hideLoader();
      if (response.success && response.user) {
        if (response.token) {
          localStorage.setItem('userToken', response.token);
        }
        localStorage.setItem('userData', JSON.stringify(response.user));

        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          isAuthChecked: true,
          isAuthModalOpen: false
        });
        useFeedbackStore.getState().showToast('✅ Account created successfully', 'success');
        return { success: true, message: response.message || 'Account created successfully.' };
      }
      useFeedbackStore.getState().showToast(`❌ Registration failed: ${response.message || 'Error'}`, 'error');
      return { success: false, message: response.message || 'Registration failed.' };
    } catch (error) {
      useFeedbackStore.getState().hideLoader();
      set({ error: error.message, isLoading: false });
      useFeedbackStore.getState().showToast(`❌ Registration failed: ${error.message}`, 'error');
      return { success: false, message: error.message || 'An error occurred.' };
    }
  },

  // 6. LOGIN USER (LEGACY SUPPORT)
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    useFeedbackStore.getState().showLoader('Logging in...');
    try {
      const response = await api.post('/auth/login', { email, password });
      useFeedbackStore.getState().hideLoader();
      if (response.success && response.user) {
        if (response.token) {
          localStorage.setItem('userToken', response.token);
        }
        localStorage.setItem('userData', JSON.stringify(response.user));

        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          isAuthChecked: true,
          isAuthModalOpen: false
        });
        useFeedbackStore.getState().showToast('✅ Logged in successfully', 'success');
        return { success: true, message: response.message || 'Logged in successfully.' };
      }
      useFeedbackStore.getState().showToast(`❌ Login failed: ${response.message || 'Error'}`, 'error');
      return { success: false, message: response.message || 'Login failed.' };
    } catch (error) {
      useFeedbackStore.getState().hideLoader();
      set({ error: error.message, isLoading: false });
      useFeedbackStore.getState().showToast(`❌ Login failed: ${error.message}`, 'error');
      return { success: false, message: error.message || 'An error occurred.' };
    }
  },

  // 7. CHECK SESSIONS (SILENT BACKGROUND VERIFICATION)
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.success && response.user) {
        if (response.token) {
          localStorage.setItem('userToken', response.token);
        }
        localStorage.setItem('userData', JSON.stringify(response.user));

        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          isAuthChecked: true
        });
      } else {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isAuthChecked: true
        });
      }
    } catch (error) {
      // Clear token only if server explicitly responds with 401 unauthenticated
      if (error.message && (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('Token expired'))) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isAuthChecked: true
        });
      } else {
        // Keep optimistic state if network glitch occurs
        set({
          isLoading: false,
          isAuthChecked: true
        });
      }
    }
  },

  // 8. LOGOUT USER
  logout: async () => {
    set({ isLoading: true, error: null });
    useFeedbackStore.getState().showLoader('Logging out...');
    try {
      await api.post('/auth/logout').catch(() => {});
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      useCartStore.getState().clearCart();
      useWishlistStore.getState().clearWishlist();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAuthChecked: true
      });
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast('✅ Logged out successfully', 'success');
    } catch (error) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      useFeedbackStore.getState().hideLoader();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAuthChecked: true
      });
    }
  }
}));
