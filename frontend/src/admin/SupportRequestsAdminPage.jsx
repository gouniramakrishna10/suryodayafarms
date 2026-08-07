import React, { useState, useEffect, useCallback } from 'react';
import {
  FiHelpCircle,
  FiSearch,
  FiFilter,
  FiEye,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDownload,
  FiRefreshCw,
  FiMessageSquare,
  FiCheck,
  FiX,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiTag,
  FiPaperclip,
  FiShoppingBag
} from 'react-icons/fi';
import api from '../utils/api';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { useModalStore } from '../store/useModalStore';

export default function SupportRequestsAdminPage() {
  const modal = useModalStore();

  const [supportRequests, setSupportRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    newRequests: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 15
  });

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);

  // Detail Modal & Action States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingAdminNotes, setEditingAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const categoryOptions = [
    'ALL',
    'General',
    'Products',
    'Quality',
    'Usage',
    'Storage',
    'Customer Support',
    'Other'
  ];

  const fetchSupportRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy,
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery
      };

      const response = await api.get('/admin/support-requests', { params });
      if (response && response.success) {
        setSupportRequests(response.supportRequests || []);
        if (response.stats) {
          setStats(response.stats);
        }
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.totalItems
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch support requests:', err);
      useFeedbackStore.getState().showToast(`Error: ${err.message || 'Unable to load support requests.'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, sortBy, statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchSupportRequests();
  }, [fetchSupportRequests]);

  const handleOpenDetails = (req) => {
    setSelectedRequest(req);
    setEditingAdminNotes(req.adminNotes || '');
    setUpdatingStatus(req.status || 'NEW');
    setShowDetailModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    setIsSavingNotes(true);
    try {
      const res = await api.patch(`/admin/support-requests/${selectedRequest.id}`, {
        adminNotes: editingAdminNotes
      });
      if (res && res.success) {
        useFeedbackStore.getState().showToast('✅ Admin notes updated successfully', 'success');
        setSelectedRequest(res.supportRequest);
        fetchSupportRequests();
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`Failed to update notes: ${err.message}`, 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedRequest) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/admin/support-requests/${selectedRequest.id}`, {
        status: newStatus
      });
      if (res && res.success) {
        useFeedbackStore.getState().showToast(`✅ Status updated to ${newStatus}`, 'success');
        setUpdatingStatus(newStatus);
        setSelectedRequest(res.supportRequest);
        fetchSupportRequests();
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`Failed to update status: ${err.message}`, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteRequest = async (id, subject) => {
    const confirmed = await modal.confirm(
      'Delete Support Request?',
      `Are you sure you want to permanently delete the support inquiry "${subject}"? This action cannot be undone.`,
      'warning',
      'Delete',
      'Cancel'
    );

    if (!confirmed) return;

    try {
      const res = await api.delete(`/admin/support-requests/${id}`);
      if (res && res.success) {
        useFeedbackStore.getState().showToast('✅ Request deleted successfully', 'success');
        if (showDetailModal && selectedRequest?.id === id) {
          setShowDetailModal(false);
          setSelectedRequest(null);
        }
        fetchSupportRequests();
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`Failed to delete request: ${err.message}`, 'error');
    }
  };

  const handleExportCSV = () => {
    if (supportRequests.length === 0) {
      useFeedbackStore.getState().showToast('No support requests available to export.', 'info');
      return;
    }

    const headers = [
      'ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Order Number',
      'Category', 'Subject', 'Message', 'Attachment', 'Status', 'Admin Notes'
    ];

    const rows = supportRequests.map(r => [
      r.id,
      new Date(r.createdAt).toLocaleString('en-IN'),
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.orderNumber || '').replace(/"/g, '""')}"`,
      `"${(r.category || '').replace(/"/g, '""')}"`,
      `"${(r.subject || '').replace(/"/g, '""')}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${(r.attachment || '').replace(/"/g, '""')}"`,
      r.status,
      `"${(r.adminNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Suryodaya_Support_Requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    useFeedbackStore.getState().showToast('✅ Support requests exported to CSV', 'success');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-[#B8833E]/10 text-[#B8833E] border-[#B8833E]/30';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 text-left bg-[#F9F6F0] min-h-screen">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDE7D9] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#4E641A] uppercase tracking-wider">Customer Care</span>
            <span className="text-stone-300">|</span>
            <span className="text-xs font-semibold text-stone-500">Inquiries & Tickets</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C] mt-1">Support Requests</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSupportRequests}
            disabled={isLoading}
            className="px-4 py-2.5 bg-white border border-[#EDE7D9] hover:bg-[#FAF7F2] text-[#2F3B0C] rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD STATISTICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-[#2F3B0C] text-white border-[#2F3B0C] shadow-md' : 'bg-white text-[#2F3B0C] border-[#EDE7D9] hover:border-[#4E641A]'
          }`}
        >
          <span className="text-xs uppercase font-semibold tracking-wider opacity-80 block">Total Requests</span>
          <span className="font-serif text-2xl font-bold mt-1 block">{stats.total}</span>
        </button>

        <button
          onClick={() => setStatusFilter('NEW')}
          className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer ${
            statusFilter === 'NEW' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-[#2F3B0C] border-[#EDE7D9] hover:border-blue-500'
          }`}
        >
          <span className="text-xs uppercase font-semibold tracking-wider text-blue-600 block">New Requests</span>
          <span className="font-serif text-2xl font-bold mt-1 block">{stats.newRequests}</span>
        </button>

        <button
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer ${
            statusFilter === 'IN_PROGRESS' ? 'bg-[#B8833E] text-white border-[#B8833E] shadow-md' : 'bg-white text-[#2F3B0C] border-[#EDE7D9] hover:border-[#B8833E]'
          }`}
        >
          <span className="text-xs uppercase font-semibold tracking-wider text-[#B8833E] block">In Progress</span>
          <span className="font-serif text-2xl font-bold mt-1 block">{stats.inProgress}</span>
        </button>

        <button
          onClick={() => setStatusFilter('RESOLVED')}
          className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer ${
            statusFilter === 'RESOLVED' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-[#2F3B0C] border-[#EDE7D9] hover:border-emerald-500'
          }`}
        >
          <span className="text-xs uppercase font-semibold tracking-wider text-emerald-600 block">Resolved</span>
          <span className="font-serif text-2xl font-bold mt-1 block">{stats.resolved}</span>
        </button>

        <button
          onClick={() => setStatusFilter('CLOSED')}
          className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer ${
            statusFilter === 'CLOSED' ? 'bg-stone-700 text-white border-stone-700 shadow-md' : 'bg-white text-[#2F3B0C] border-[#EDE7D9] hover:border-stone-400'
          }`}
        >
          <span className="text-xs uppercase font-semibold tracking-wider text-stone-500 block">Closed</span>
          <span className="font-serif text-2xl font-bold mt-1 block">{stats.closed}</span>
        </button>

      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white border border-[#EDE7D9] p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
          <input
            type="text"
            placeholder="Search name, email, phone, subject, order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl text-xs text-[#2F3B0C] focus:ring-2 focus:ring-[#4E641A] focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <FiX />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl text-xs font-medium text-[#2F3B0C] focus:ring-1 focus:ring-[#4E641A] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl text-xs font-medium text-[#2F3B0C] focus:ring-1 focus:ring-[#4E641A] focus:outline-none"
            >
              {categoryOptions.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl text-xs font-medium text-[#2F3B0C] focus:ring-1 focus:ring-[#4E641A] focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-[#EDE7D9] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2F3B0C]">
            <thead className="bg-[#FAF7F2] border-b border-[#EDE7D9] font-serif font-bold uppercase tracking-wider text-[11px] text-stone-600">
              <tr>
                <th className="py-3.5 px-4">Customer & Subject</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE7D9]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    <div className="w-6 h-6 border-2 border-[#4E641A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading support requests...</span>
                  </td>
                </tr>
              ) : supportRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    <FiHelpCircle className="text-3xl text-stone-300 mx-auto mb-2" />
                    <p className="font-semibold">No support requests found.</p>
                    <p className="text-xs text-stone-400">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                supportRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF8F5] transition duration-150">
                    
                    <td className="py-4 px-4">
                      <div className="font-bold text-sm text-[#2F3B0C]">{req.subject}</div>
                      <div className="text-stone-500 font-medium">{req.name}</div>
                      <div className="text-[11px] text-stone-400 font-mono mt-0.5">{req.email} | {req.phone}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block bg-[#4E641A]/10 text-[#4E641A] font-semibold text-[11px] px-2.5 py-1 rounded-lg">
                        {req.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-semibold text-stone-700">
                      {req.orderNumber ? (
                        <span className="text-[#2F3B0C] font-bold">{req.orderNumber}</span>
                      ) : (
                        <span className="text-stone-400 font-normal">N/A</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusBadgeClass(req.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {req.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-stone-500 font-mono text-[11px]">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(req)}
                          className="p-2 bg-white border border-[#EDE7D9] hover:border-[#4E641A] hover:bg-[#FAF7F2] text-[#2F3B0C] rounded-lg transition cursor-pointer"
                          title="View Request Details"
                        >
                          <FiEye size={14} />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteRequest(req.id, req.subject)}
                          className="p-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                          title="Delete Support Request"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="py-3.5 px-4 bg-[#FAF7F2] border-t border-[#EDE7D9] flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Showing page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalItems} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage <= 1}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                className="px-3 py-1.5 bg-white border border-[#EDE7D9] disabled:opacity-40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FiChevronLeft />
                <span>Prev</span>
              </button>

              <button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                className="px-3 py-1.5 bg-white border border-[#EDE7D9] disabled:opacity-40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW DETAILS & STATUS MODAL */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EDE7D9] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-left relative">
            
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
            >
              <FiX size={20} />
            </button>

            {/* Header */}
            <div className="border-b border-[#EDE7D9] pb-4 pr-10">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  Submitted: {new Date(selectedRequest.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2F3B0C] mt-2">{selectedRequest.subject}</h2>
              <p className="text-xs text-stone-500 font-medium">Customer: {selectedRequest.name} ({selectedRequest.category})</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF7F2] border border-[#EDE7D9] p-4 rounded-2xl">
              <div>
                <span className="text-[11px] font-bold uppercase text-stone-400 block mb-1">Customer Email</span>
                <a href={`mailto:${selectedRequest.email}`} className="text-xs font-semibold text-[#4E641A] hover:underline flex items-center gap-1.5">
                  <FiMail size={14} />
                  <span>{selectedRequest.email}</span>
                </a>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-stone-400 block mb-1">Phone Number</span>
                <a href={`tel:${selectedRequest.phone}`} className="text-xs font-semibold text-[#4E641A] hover:underline flex items-center gap-1.5">
                  <FiPhone size={14} />
                  <span>{selectedRequest.phone}</span>
                </a>
              </div>

              {selectedRequest.orderNumber && (
                <div>
                  <span className="text-[11px] font-bold uppercase text-stone-400 block mb-1">Order Number</span>
                  <span className="text-xs font-mono font-bold text-[#2F3B0C] flex items-center gap-1.5">
                    <FiShoppingBag size={14} className="text-[#4E641A]" />
                    <span>{selectedRequest.orderNumber}</span>
                  </span>
                </div>
              )}

              {selectedRequest.attachment && (
                <div>
                  <span className="text-[11px] font-bold uppercase text-stone-400 block mb-1">Attachment Link</span>
                  <a href={selectedRequest.attachment} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <FiPaperclip size={14} />
                    <span>View Attachment</span>
                    <FiExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Customer Message</span>
              <p className="text-xs text-stone-700 bg-[#FAF8F5] border border-[#EDE7D9] p-4 rounded-xl leading-relaxed whitespace-pre-wrap font-sans">
                {selectedRequest.message}
              </p>
            </div>

            {/* Status Update & Admin Notes */}
            <div className="pt-4 border-t border-[#EDE7D9] space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2F3B0C] mb-2">Update Ticket Status</label>
                <div className="flex items-center gap-3">
                  <select
                    value={updatingStatus}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="px-4 py-2.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl text-xs font-bold text-[#2F3B0C] focus:ring-2 focus:ring-[#4E641A] focus:outline-none cursor-pointer"
                  >
                    <option value="NEW">New</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  {isUpdatingStatus && <span className="text-xs text-stone-400 animate-pulse">Syncing status...</span>}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2F3B0C] mb-2">Internal Management Notes</label>
                <textarea
                  rows={3}
                  value={editingAdminNotes}
                  onChange={(e) => setEditingAdminNotes(e.target.value)}
                  placeholder="Record support resolution, phone callback notes, or internal remarks..."
                  className="w-full p-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl text-xs text-[#2F3B0C] focus:ring-2 focus:ring-[#4E641A] focus:outline-none"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="mt-2 px-5 py-2 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  {isSavingNotes ? 'Saving Notes...' : 'Save Internal Notes'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
