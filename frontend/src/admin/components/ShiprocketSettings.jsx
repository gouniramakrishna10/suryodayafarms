import React, { useState, useEffect } from 'react';
import { FiTruck, FiCheckCircle, FiRefreshCw, FiSave, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import api from '../../utils/api';
import { useFeedbackStore } from '../../store/useFeedbackStore';

export default function ShiprocketSettings() {
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [saving, setSaving] = useState(false);

  const [authStatus, setAuthStatus] = useState(null);
  const [pickupAddresses, setPickupAddresses] = useState([]);

  const [settings, setSettings] = useState({
    defaultPickupLocation: 'Primary Warehouse',
    pickupPincode: '302001',
    autoAssignCourier: true,
    preferredCourierMode: 'CHEAPEST',
    freeShippingThreshold: 999,
    codEnabled: true,
    maxWeight: 20,
    defaultLength: 15,
    defaultWidth: 15,
    defaultHeight: 10,
    webhookUrl: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Auth Status
      const statusRes = await api.get('/shiprocket/auth/status');
      setAuthStatus(statusRes.status || null);

      // 2. Load Shipping Settings
      const settingsRes = await api.get('/shiprocket/settings');
      if (settingsRes.settings) {
        setSettings(settingsRes.settings);
      }

      // 3. Load Registered Pickup Locations from Shiprocket
      try {
        const addressesRes = await api.get('/shiprocket/pickup-addresses');
        if (addressesRes.addresses) {
          setPickupAddresses(addressesRes.addresses);
        }
      } catch (e) {
        console.warn('Pickup addresses not fetched:', e);
      }

    } catch (err) {
      console.error('Failed to load Shiprocket settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await api.post('/shiprocket/auth/test-connection');
      if (res.success) {
        setAuthStatus(res.status);
        useFeedbackStore.getState().showToast('✅ Shiprocket API User connection verified successfully!', 'success');
      } else {
        useFeedbackStore.getState().showToast(`❌ Connection Failed: ${res.error}`, 'error');
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`❌ Connection Error: ${err.message}`, 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await api.put('/shiprocket/settings', settings);
      if (res.success) {
        setSettings(res.settings);
        useFeedbackStore.getState().showToast('✅ Shipping & Shiprocket settings saved successfully!', 'success');
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`Failed to save settings: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center text-stone-500 font-sans space-y-3">
        <div className="w-8 h-8 border-3 border-[#4E641A] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Loading Shiprocket configuration...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-8 animate-fade-in text-left font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">LOGISTICS INTEGRATION</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
              authStatus?.isAuthenticated 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${authStatus?.isAuthenticated ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{authStatus?.isAuthenticated ? 'Token Active' : 'Credentials Needed'}</span>
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-dark-olive flex items-center gap-2">
            <FiTruck className="text-[#4E641A]" />
            <span>Shiprocket Production Settings</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer border-none"
          >
            <FiRefreshCw className={`text-xs ${testingConnection ? 'animate-spin' : ''}`} />
            <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer border-none"
          >
            <FiSave className="text-sm" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* 1. API User Credentials Notice */}
      <div className="bg-gradient-to-r from-amber-50/80 to-amber-100/40 border border-amber-200 rounded-2xl p-5 space-y-2 text-amber-900 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
          <HiSparkles className="text-amber-600 text-base" />
          <span>Shiprocket API User Authentication</span>
        </div>
        <p className="leading-relaxed">
          Authentication is configured using dedicated API User credentials in backend <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code>:
          <code className="block mt-1 bg-white/90 p-2 rounded-xl font-mono text-[11px] text-amber-950 border border-amber-200/60">
            SHIPROCKET_EMAIL=your_api_user_email@domain.com<br/>
            SHIPROCKET_PASSWORD=your_api_user_password<br/>
            SHIPROCKET_WEBHOOK_SECRET=suryodaya_shiprocket_wh_sec_2026<br/>
            SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in
          </code>
        </p>
      </div>

      {/* 2. Warehouse & Pickup Location Configuration */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900">1. Pickup Warehouse & Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700">Default Pickup Location Nickname *</label>
            <input
              type="text"
              placeholder="e.g. Primary Warehouse"
              value={settings.defaultPickupLocation}
              onChange={(e) => setSettings({ ...settings, defaultPickupLocation: e.target.value })}
              className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
            />
            {pickupAddresses.length > 0 && (
              <span className="text-[10px] text-stone-400">
                Registered Shiprocket Locations: {pickupAddresses.map(a => a.pickup_location).join(', ')}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700">Pickup Pincode *</label>
            <input
              type="text"
              placeholder="e.g. 302001"
              value={settings.pickupPincode}
              onChange={(e) => setSettings({ ...settings, pickupPincode: e.target.value })}
              className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
            />
          </div>

        </div>
      </div>

      {/* 3. Automation Rules & Courier Selection */}
      <div className="space-y-4 pt-4 border-t border-stone-200">
        <h3 className="font-serif text-lg font-bold text-stone-900">2. Courier Automation & Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700">Auto Assign Courier</label>
            <select
              value={settings.autoAssignCourier ? 'true' : 'false'}
              onChange={(e) => setSettings({ ...settings, autoAssignCourier: e.target.value === 'true' })}
              className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A] cursor-pointer"
            >
              <option value="true">Enabled (Automatically select best courier)</option>
              <option value="false">Disabled (Manual selection per order)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700">Preferred Courier Strategy</label>
            <select
              value={settings.preferredCourierMode}
              onChange={(e) => setSettings({ ...settings, preferredCourierMode: e.target.value })}
              className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A] cursor-pointer"
            >
              <option value="CHEAPEST">Cheapest Courier Partner</option>
              <option value="FASTEST">Fastest Estimated Delivery</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              placeholder="999"
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
            />
          </div>

        </div>
      </div>

      {/* 4. Default Package Dimensions */}
      <div className="space-y-4 pt-4 border-t border-stone-200">
        <h3 className="font-serif text-lg font-bold text-stone-900">3. Default Package Dimensions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-700">Length (cm)</label>
            <input
              type="number"
              value={settings.defaultLength}
              onChange={(e) => setSettings({ ...settings, defaultLength: parseFloat(e.target.value) || 15 })}
              className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-700">Width (cm)</label>
            <input
              type="number"
              value={settings.defaultWidth}
              onChange={(e) => setSettings({ ...settings, defaultWidth: parseFloat(e.target.value) || 15 })}
              className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-700">Height (cm)</label>
            <input
              type="number"
              value={settings.defaultHeight}
              onChange={(e) => setSettings({ ...settings, defaultHeight: parseFloat(e.target.value) || 10 })}
              className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-700">Max Weight (kg)</label>
            <input
              type="number"
              value={settings.maxWeight}
              onChange={(e) => setSettings({ ...settings, maxWeight: parseFloat(e.target.value) || 20 })}
              className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
            />
          </div>

        </div>
      </div>

      {/* 5. Webhook URL Helper */}
      <div className="space-y-4 pt-4 border-t border-stone-200">
        <h3 className="font-serif text-lg font-bold text-stone-900">4. Live Tracking Webhook Integration</h3>
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-xs text-stone-700">
          <p className="font-semibold text-stone-900">Webhook Endpoint URL to configure in Shiprocket Dashboard:</p>
          <div className="bg-white border border-stone-300 p-2.5 rounded-xl font-mono text-[11px] text-stone-800 flex items-center justify-between">
            <span>https://suryodayafarms.com/api/shiprocket/webhook</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('https://suryodayafarms.com/api/shiprocket/webhook');
                useFeedbackStore.getState().showToast('Copied webhook URL!', 'success');
              }}
              className="text-[#4E641A] hover:underline font-bold cursor-pointer border-none bg-transparent"
            >
              Copy
            </button>
          </div>
          <p className="text-[11px] text-stone-500">
            Set Security Token Header <code className="bg-stone-200 px-1 rounded font-mono">anx-api-key</code> in Shiprocket settings matching <code className="bg-stone-200 px-1 rounded font-mono">SHIPROCKET_WEBHOOK_SECRET</code> in .env.
          </p>
        </div>
      </div>

    </div>
  );
}
