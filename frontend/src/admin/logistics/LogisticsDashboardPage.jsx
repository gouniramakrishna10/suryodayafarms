import React, { useState, useEffect } from 'react';
import { 
  FiTruck, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiSave, 
  FiAlertCircle, 
  FiCopy, 
  FiSearch,
  FiFileText,
  FiSend,
  FiActivity,
  FiBox,
  FiLayers,
  FiPlus,
  FiClock
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import api from '../../utils/api';
import { useFeedbackStore } from '../../store/useFeedbackStore';

export default function LogisticsDashboardPage({ orders = [], fetchOrders }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [testingConnection, setTestingConnection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningDiagnostic, setRunningDiagnostic] = useState('');

  // Diagnostic Log Output State
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  // Auth Status & Pickup Addresses State
  const [authStatus, setAuthStatus] = useState(null);
  const [pickupAddresses, setPickupAddresses] = useState([]);

  // Rate Calculator Sandbox State
  const [calcPincode, setCalcPincode] = useState('110001');
  const [calcWeight, setCalcWeight] = useState('0.5');
  const [calcCod, setCalcCod] = useState(false);
  const [rateResults, setRateResults] = useState(null);
  const [isCalculatingRate, setIsCalculatingRate] = useState(false);

  // Shipping Settings State
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
    webhookUrl: 'https://suryodayafarms.com/api/shiprocket/webhook'
  });

  useEffect(() => {
    loadLogisticsData();
  }, []);

  const loadLogisticsData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Auth Status
      const statusRes = await api.get('/shiprocket/auth/status');
      setAuthStatus(statusRes.status || null);

      // 2. Fetch Shipping Settings
      const settingsRes = await api.get('/shiprocket/settings');
      if (settingsRes.settings) {
        setSettings(settingsRes.settings);
      }

      // 3. Fetch Pickup Locations from Shiprocket
      try {
        const addressesRes = await api.get('/shiprocket/pickup-addresses');
        if (addressesRes.addresses) {
          setPickupAddresses(addressesRes.addresses);
        }
      } catch (e) {
        console.warn('Pickup addresses fetch failed:', e);
      }

      // 4. Refresh Orders list if function passed
      if (fetchOrders) {
        await fetchOrders();
      }

    } catch (err) {
      console.error('Failed to load logistics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setDiagnosticResult(null);
    try {
      const res = await api.post('/shiprocket/auth/test-connection');
      if (res.success) {
        setAuthStatus(res.status);
        setDiagnosticResult({ title: 'Authentication Connection', success: true, data: res });
        useFeedbackStore.getState().showToast('✅ Connected to Shiprocket API User successfully!', 'success');
      } else {
        setDiagnosticResult({ title: 'Authentication Connection', success: false, error: res.error });
        useFeedbackStore.getState().showToast(`❌ Connection Failed: ${res.error}`, 'error');
      }
    } catch (err) {
      setDiagnosticResult({ title: 'Authentication Connection', success: false, error: err.message });
      useFeedbackStore.getState().showToast(`❌ Error: ${err.message}`, 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleRunDiagnostic = async (type) => {
    setRunningDiagnostic(type);
    setDiagnosticResult(null);
    try {
      if (type === 'auth') {
        await handleTestConnection();
      } else if (type === 'rate') {
        const res = await api.post('/shiprocket/diagnostics/test-rate', { deliveryPincode: calcPincode, weight: parseFloat(calcWeight) });
        setDiagnosticResult({ title: 'Shipping Rate Calculation Test', success: res.success, data: res });
        useFeedbackStore.getState().showToast('✅ Rate Calculator Diagnostic completed', 'success');
      } else if (type === 'webhook') {
        const res = await api.post('/shiprocket/diagnostics/test-webhook');
        setDiagnosticResult({ title: 'Live Webhook Event Processor Test', success: res.success, data: res });
        useFeedbackStore.getState().showToast('✅ Webhook Processor Diagnostic completed', 'success');
      }
    } catch (err) {
      setDiagnosticResult({ title: `Diagnostic ${type}`, success: false, error: err.message });
    } finally {
      setRunningDiagnostic('');
    }
  };

  const handleCalculateRates = async (e) => {
    if (e) e.preventDefault();
    setIsCalculatingRate(true);
    try {
      const res = await api.post('/shiprocket/rate-calculator', {
        deliveryPincode: calcPincode,
        weight: parseFloat(calcWeight) || 0.5,
        cod: calcCod ? 1 : 0
      });
      if (res.success) {
        setRateResults(res);
      } else {
        useFeedbackStore.getState().showToast(res.message || 'Serviceability check failed.', 'warning');
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`Rate error: ${err.message}`, 'error');
    } finally {
      setIsCalculatingRate(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await api.put('/shiprocket/settings', settings);
      if (res.success) {
        setSettings(res.settings);
        useFeedbackStore.getState().showToast('✅ Shipping settings saved successfully!', 'success');
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Order Logistics Action Handlers
  const handleCreateShiprocketOrder = async (orderId) => {
    try {
      useFeedbackStore.getState().showLoader('Creating Shiprocket Order...');
      const res = await api.post('/shiprocket/orders', { orderId });
      useFeedbackStore.getState().hideLoader();
      if (res.success) {
        useFeedbackStore.getState().showToast(`✅ Created Shiprocket Order #${res.shiprocketOrderId}`, 'success');
        if (fetchOrders) fetchOrders();
      }
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleAssignCourier = async (orderId) => {
    try {
      useFeedbackStore.getState().showLoader('Auto-assigning best courier & generating AWB...');
      const res = await api.post('/shiprocket/assign-courier', { orderId, autoAssign: true, mode: settings.preferredCourierMode });
      useFeedbackStore.getState().hideLoader();
      if (res.success) {
        useFeedbackStore.getState().showToast(`✅ Assigned ${res.courierName} (AWB: ${res.awbCode})`, 'success');
        if (fetchOrders) fetchOrders();
      }
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`Assign Error: ${err.message}`, 'error');
    }
  };

  const handleGenerateLabel = async (shipmentId, orderId) => {
    try {
      useFeedbackStore.getState().showLoader('Generating Shipping Label PDF...');
      const res = await api.get(`/shiprocket/label?shipmentId=${shipmentId}&orderId=${orderId}`);
      useFeedbackStore.getState().hideLoader();
      if (res.success && res.labelUrl) {
        window.open(res.labelUrl, '_blank');
        useFeedbackStore.getState().showToast('✅ Shipping Label PDF generated!', 'success');
        if (fetchOrders) fetchOrders();
      }
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`Label Error: ${err.message}`, 'error');
    }
  };

  const handleSchedulePickup = async (shipmentId, orderId) => {
    try {
      useFeedbackStore.getState().showLoader('Scheduling Pickup Request...');
      const res = await api.post('/shiprocket/schedule-pickup', { shipmentId, orderId });
      useFeedbackStore.getState().hideLoader();
      if (res.success) {
        useFeedbackStore.getState().showToast(`✅ Scheduled Pickup! ID: ${res.pickupId}`, 'success');
        if (fetchOrders) fetchOrders();
      }
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      useFeedbackStore.getState().showToast(`Pickup Error: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-stone-200/80 rounded-3xl p-12 text-center text-stone-500 font-sans space-y-3">
        <div className="w-8 h-8 border-3 border-[#4E641A] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Loading Shiprocket Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left font-sans w-full">
      
      {/* Top Command Center Header Bar */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-stone-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">ENTERPRISE LOGISTICS CONTROL</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                authStatus?.isAuthenticated 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${authStatus?.isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{authStatus?.isAuthenticated ? 'Token Active & Authenticated' : 'Auth Pending'}</span>
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-dark-olive flex items-center gap-2.5">
              <FiTruck className="text-[#4E641A]" />
              <span>Shiprocket Logistics Command Center</span>
            </h1>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer border-none"
            >
              <FiRefreshCw className={`text-xs ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Testing API...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={loadLogisticsData}
              className="px-4 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer border-none"
            >
              <FiRefreshCw className="text-xs" />
              <span>Sync All Data</span>
            </button>
          </div>
        </div>

        {/* Command Center Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
          {[
            { id: 'overview', label: 'Command Overview', icon: FiActivity },
            { id: 'shipments', label: 'Recent Shipments', icon: FiBox },
            { id: 'rate-calculator', label: 'Rate & Serviceability', icon: FiSend },
            { id: 'warehouses', label: 'Pickup Warehouses', icon: FiLayers },
            { id: 'settings', label: 'Shipping Rules', icon: FiSave },
            { id: 'diagnostics', label: 'API Diagnostics', icon: HiSparkles }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-[#4E641A] text-white border-[#4E641A] shadow-2xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <tab.icon className="text-sm" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Sub-Tab 1: Command Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in pt-2">
            
            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">AUTHENTICATION</span>
                <div className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${authStatus?.isAuthenticated ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span>{authStatus?.isAuthenticated ? 'Connected' : 'Disconnected'}</span>
                </div>
                <span className="text-[11px] text-stone-500 font-mono block truncate">
                  {authStatus?.expiresAt ? `Expires: ${new Date(authStatus.expiresAt).toLocaleDateString('en-IN')}` : 'No active token'}
                </span>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">ACTIVE SHIPMENTS</span>
                <div className="font-serif text-lg font-bold text-stone-900">
                  {orders.filter(o => o.shiprocketOrderId).length} Orders
                </div>
                <span className="text-[11px] text-stone-500">Synced with Shiprocket</span>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">DEFAULT PICKUP PINCODE</span>
                <div className="font-serif text-lg font-bold text-[#4E641A]">
                  {settings.pickupPincode}
                </div>
                <span className="text-[11px] text-stone-500 truncate block">{settings.defaultPickupLocation}</span>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">AUTOMATION STRATEGY</span>
                <div className="font-serif text-lg font-bold text-[#B8833E]">
                  {settings.preferredCourierMode}
                </div>
                <span className="text-[11px] text-stone-500">Auto Assign: {settings.autoAssignCourier ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            {/* Configured Credentials Info Banner */}
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <HiSparkles /> API User & Webhook Credentials
                </span>
                <span className="text-[10px] text-stone-400 font-mono">https://apiv2.shiprocket.in</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-stone-800 p-3 rounded-xl border border-stone-700">
                  <span className="text-stone-400 text-[10px] block uppercase font-sans">API User Email</span>
                  <span>{authStatus?.email || 'Configured in backend .env'}</span>
                </div>
                <div className="bg-stone-800 p-3 rounded-xl border border-stone-700">
                  <span className="text-stone-400 text-[10px] block uppercase font-sans">Webhook Secret</span>
                  <span>{authStatus?.isAuthenticated ? '••••••••••••••••' : 'Configured in backend .env'}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Sub-Tab 2: Recent Shipments */}
        {activeTab === 'shipments' && (
          <div className="space-y-4 animate-fade-in pt-2">
            <h3 className="font-serif text-lg font-bold text-stone-900">Recent Customer Orders & Shipments</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Shiprocket Order ID</th>
                    <th className="py-3 px-4">AWB Code</th>
                    <th className="py-3 px-4">Courier Partner</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Shiprocket Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.slice(0, 15).map(o => (
                    <tr key={o.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 px-4 font-serif font-bold text-stone-900">
                        #{o.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700 font-medium">
                        {o.user?.name || 'Customer'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-600">
                        {o.shiprocketOrderId ? `#${o.shiprocketOrderId}` : <span className="text-stone-300">Not Created</span>}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#4E641A]">
                        {o.awbCode || <span className="text-stone-300">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">
                        {o.courierName || <span className="text-stone-300">N/A</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 border border-stone-200 text-stone-700">
                          {o.shiprocketStatus || o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {!o.shiprocketOrderId && (
                            <button
                              type="button"
                              onClick={() => handleCreateShiprocketOrder(o.id)}
                              className="px-2.5 py-1 bg-[#4E641A] text-white text-[10px] font-bold rounded-lg cursor-pointer border-none"
                            >
                              + Create Order
                            </button>
                          )}
                          {o.shiprocketOrderId && !o.awbCode && (
                            <button
                              type="button"
                              onClick={() => handleAssignCourier(o.id)}
                              className="px-2.5 py-1 bg-[#B8833E] text-white text-[10px] font-bold rounded-lg cursor-pointer border-none"
                            >
                              Assign AWB
                            </button>
                          )}
                          {o.shipmentId && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleGenerateLabel(o.shipmentId, o.id)}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded-lg cursor-pointer border-none"
                                title="Print Shipping Label PDF"
                              >
                                📄 Label
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSchedulePickup(o.shipmentId, o.id)}
                                className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-lg cursor-pointer"
                                title="Schedule Dispatch Pickup"
                              >
                                🚚 Pickup
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sub-Tab 3: Rate Calculator */}
        {activeTab === 'rate-calculator' && (
          <div className="space-y-6 animate-fade-in pt-2">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900">Live Rate Calculator & Serviceability Sandbox</h3>
              
              <form onSubmit={handleCalculateRates} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-stone-700">Delivery Pincode *</label>
                  <input
                    type="text"
                    placeholder="e.g. 110001"
                    value={calcPincode}
                    onChange={(e) => setCalcPincode(e.target.value)}
                    className="bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#4E641A]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-stone-700">Package Weight (kg) *</label>
                  <input
                    type="text"
                    placeholder="0.5"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    className="bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#4E641A]"
                  />
                </div>

                <div className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    id="calcCod"
                    checked={calcCod}
                    onChange={(e) => setCalcCod(e.target.checked)}
                    className="w-4 h-4 text-[#4E641A] rounded border-stone-300"
                  />
                  <label htmlFor="calcCod" className="text-xs font-semibold text-stone-700 cursor-pointer">Cash on Delivery (COD)</label>
                </div>

                <button
                  type="submit"
                  disabled={isCalculatingRate}
                  className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer border-none"
                >
                  {isCalculatingRate ? 'Calculating...' : 'Calculate Shipping Rates'}
                </button>
              </form>
            </div>

            {/* Results Display */}
            {rateResults && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs font-bold">
                  <span>✅ Serviceable! Found {rateResults.couriers?.length || 0} courier partners.</span>
                  {rateResults.cheapest && (
                    <span>Cheapest: {rateResults.cheapest.courierName} (₹{rateResults.cheapest.rate})</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rateResults.couriers?.map((c, i) => (
                    <div key={i} className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 relative shadow-2xs">
                      {c.tag && (
                        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white ${c.tag === 'CHEAPEST' ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                          {c.tag}
                        </span>
                      )}
                      <h4 className="font-serif text-sm font-bold text-stone-900">{c.courierName}</h4>
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="font-serif text-lg font-bold text-dark-olive">₹{c.rate}</span>
                        <span className="text-xs text-stone-500 font-medium">Est. {c.estimatedDeliveryDays} Days</span>
                      </div>
                      <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100 flex justify-between">
                        <span>Rating: ⭐ {c.rating}</span>
                        <span>COD: {c.codAvailable ? 'Allowed' : 'Not Allowed'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sub-Tab 4: Pickup Warehouses */}
        {activeTab === 'warehouses' && (
          <div className="space-y-4 animate-fade-in pt-2">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold text-stone-900">Registered Shiprocket Warehouses</h3>
              <button
                type="button"
                onClick={loadLogisticsData}
                className="px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl cursor-pointer border-none"
              >
                Sync Warehouses
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pickupAddresses.map((addr, i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-2 text-xs text-stone-700 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-stone-150 pb-2">
                    <span className="font-serif font-bold text-sm text-stone-900">{addr.pickup_location}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      Active Warehouse
                    </span>
                  </div>
                  <p>{addr.address}, {addr.address_2}</p>
                  <p>{addr.city}, {addr.state} - {addr.pin_code}</p>
                  <p className="text-stone-400 font-mono text-[11px]">Phone: {addr.phone}</p>
                </div>
              ))}

              {pickupAddresses.length === 0 && (
                <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-stone-200 col-span-2">
                  Primary Pickup Warehouse configured in settings: <strong>{settings.defaultPickupLocation} ({settings.pickupPincode})</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sub-Tab 5: Shipping Rules */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in pt-2">
            <h3 className="font-serif text-lg font-bold text-stone-900">Shipping Rules & Package Defaults</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-semibold text-stone-700">Default Pickup Warehouse Location *</label>
                <input
                  type="text"
                  value={settings.defaultPickupLocation}
                  onChange={(e) => setSettings({ ...settings, defaultPickupLocation: e.target.value })}
                  className="bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-[#4E641A]"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-semibold text-stone-700">Pickup Pincode *</label>
                <input
                  type="text"
                  value={settings.pickupPincode}
                  onChange={(e) => setSettings({ ...settings, pickupPincode: e.target.value })}
                  className="bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-[#4E641A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-200">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-stone-700">Auto Assign Courier Strategy</label>
                <select
                  value={settings.preferredCourierMode}
                  onChange={(e) => setSettings({ ...settings, preferredCourierMode: e.target.value })}
                  className="bg-white border border-stone-300 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#4E641A] cursor-pointer"
                >
                  <option value="CHEAPEST">Cheapest Courier Partner</option>
                  <option value="FASTEST">Fastest Estimated Delivery</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-stone-700">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                  className="bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-[#4E641A]"
                />
              </div>

              <div className="flex flex-col gap-1 justify-center pt-4">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-6 py-3 rounded-xl font-bold text-xs transition cursor-pointer border-none shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Settings ✓'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Tab 6: Diagnostics & Test Suite */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6 animate-fade-in pt-2">
            <h3 className="font-serif text-lg font-bold text-stone-900">API Diagnostics & Test Suite</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleRunDiagnostic('auth')}
                disabled={!!runningDiagnostic}
                className="p-4 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-2xl text-left space-y-2 cursor-pointer transition"
              >
                <div className="font-serif font-bold text-sm text-stone-900">1. Test Auth Connection</div>
                <p className="text-[11px] text-stone-500">Validates API User credentials & token lifecycle.</p>
              </button>

              <button
                type="button"
                onClick={() => handleRunDiagnostic('rate')}
                disabled={!!runningDiagnostic}
                className="p-4 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-2xl text-left space-y-2 cursor-pointer transition"
              >
                <div className="font-serif font-bold text-sm text-stone-900">2. Test Rate Calculator</div>
                <p className="text-[11px] text-stone-500">Simulates shipping rate query for test pincode 110001.</p>
              </button>

              <button
                type="button"
                onClick={() => handleRunDiagnostic('webhook')}
                disabled={!!runningDiagnostic}
                className="p-4 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-2xl text-left space-y-2 cursor-pointer transition"
              >
                <div className="font-serif font-bold text-sm text-stone-900">3. Test Webhook Processor</div>
                <p className="text-[11px] text-stone-500">Fires simulated webhook event with anx-api-key header.</p>
              </button>
            </div>

            {/* Diagnostic Output Log */}
            {diagnosticResult && (
              <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 space-y-2 font-mono text-xs animate-fade-in">
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                  <span className="font-bold text-amber-400 font-sans">Diagnostic Output: {diagnosticResult.title}</span>
                  <span className={diagnosticResult.success ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {diagnosticResult.success ? 'PASSED ✓' : 'FAILED ✕'}
                  </span>
                </div>
                <pre className="text-[11px] overflow-x-auto p-2 bg-stone-950 rounded-xl max-h-64 text-emerald-300">
                  {JSON.stringify(diagnosticResult.data || diagnosticResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
