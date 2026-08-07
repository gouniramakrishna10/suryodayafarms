import React, { useState, useEffect, useCallback } from 'react';
import {
  FiMail,
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
  FiPhone,
  FiCheck,
  FiX,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiPaperclip,
  FiArchive
} from 'react-icons/fi';
import api from '../utils/api';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { useModalStore } from '../store/useModalStore';

export default function ContactAdminPage() {
  const modal = useModalStore();

  const [contactMessages, setContactMessages] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    newMessages: 0,
    replied: 0,
    resolved: 0,
    archived: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 15
  });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);

  // Detail Modal & Action States
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingAdminNotes, setEditingAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const categoryOptions = [
    'ALL',
    'General Enquiry',
    'Product Information',
    'Order Support',
    'Business Enquiry',
    'Wholesale',
    'Distributor',
    'Retail Partner',
    'Export',
    'Private Label',
    'Feedback',
    'Complaint',
    'Suggestion'
  ];

  const fetchContactMessages = useCallback(async () => {
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

      const response = await api.get('/admin/contact', { params });
      if (response && response.success) {
        setContactMessages(response.contactMessages || []);
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
      console.error('Failed to fetch contact messages:', err);
      useFeedbackStore.getState().showToast(`Error: ${err.message || 'Unable to load contact messages.'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, sortBy, statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchContactMessages();
  }, [fetchContactMessages]);

  const handleOpenDetails = (msg) => {
    setSelectedMessage(msg);
    setEditingAdminNotes(msg.adminNotes || '');
    setUpdatingStatus(msg.status || 'NEW');
    setShowDetailModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    setIsSavingNotes(true);
    try {
      const res = await api.patch(`/admin/contact/${selectedMessage.id}`, {
        adminNotes: editingAdminNotes
      });
      if (res && res.success) {
        useFeedbackStore.getState().showToast('✅ Internal admin notes saved successfully', 'success');
        setSelectedMessage(res.contactMessage);
        fetchContactMessages();
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`Failed to update notes: ${err.message}`, 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedMessage) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/admin/contact/${selectedMessage.id}`, {
        status: newStatus
      });
      if (res && res.success) {
        useFeedbackStore.getState().showToast(`✅ Status updated to ${newStatus}`, 'success');
        setUpdatingStatus(newStatus);
        setSelectedMessage(res.contactMessage);
        fetchContactMessages();
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`Failed to update status: ${err.message}`, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteMessage = async (id, name) => {
    const confirmed = await modal.confirm(
      'Delete Contact Message?',
      `Are you sure you want to permanently delete the contact message from "${name}"? This action cannot be undone.`,
      'warning',
      'Delete',
      'Cancel'
    );

    if (!confirmed) return;

    try {
      const res = await api.delete(`/admin/contact/${id}`);
      if (res && res.success) {
        useFeedbackStore.getState().showToast('✅ Message deleted successfully', 'success');
        if (showDetailModal && selectedMessage?.id === id) {
          setShowDetailModal(false);
          setSelectedMessage(null);
        }
        fetchContactMessages();
      }
    } catch (err) {
      useFeedbackStore.getState().showToast(`Failed to delete message: ${err.message}`, 'error');
    }
  };

  const handleExportCSV = () => {
    if (contactMessages.length === 0) {
      useFeedbackStore.getState().showToast('No contact messages available to export.', 'info');
      return;
    }

    const headers = [
      'ID', 'Date', 'Customer Name', 'Email', 'Phone',
      'Category', 'Subject', 'Message', 'Attachment', 'Status', 'Admin Notes'
    ];

    const rows = contactMessages.map(m => [
      m.id,
      new Date(m.createdAt).toLocaleString('en-IN'),
      `"${(m.name || '').replace(/"/g, '""')}"`,
      `"${(m.email || '').replace(/"/g, '""')}"`,
      `"${(m.phone || '').replace(/"/g, '""')}"`,
      `"${(m.category || '').replace(/"/g, '""')}"`,
      `"${(m.subject || '').replace(/"/g, '""')}"`,
      `"${(m.message || '').replace(/"/g, '""')}"`,
      `"${(m.attachment || '').replace(/"/g, '""')}"`,
      m.status,
      `"${(m.adminNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Suryodaya_Contact_Messages_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    useFeedbackStore.getState().showToast('✅ Contact messages exported to CSV', 'success');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REPLIED':
        return 'bg-[#B8833E]/10 text-[#B8833E] border-[#B8833E]/30';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ARCHIVED':
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
            <span className="text-xs font-bold text-[#4E641A] uppercase tracking-wider">Communication</span>
            <span className="text-stone-300">|</span>
            <span className="text-xs font-semibold text-stone-500">Contact Form Inquiries</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C] mt-1">Contact Messages</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchContactMessages}
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

      {/* DASHBOARD METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-[#2F3B0C] text-white border-[#2F3B0C] shadow-md' : 'bg-white text-[#2F3B0C] border-[#EDE7D9] hover:border-[#4E641A]'
          }`}
        >
          <span className="text-xs uppercase font-semibold tracking-wider opacity-80 block">Total Messages</span>
          <span className="font-serif text-2xl font-bold mt-1 block">{stats.total}</span>
        </button>

        <button
          onClick={() => setStatusFilter('NEW')}
          className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer ${
            statusFilter === 'NEW' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-[#2F3B0C] border-[#EDE7D9] hover:border-blue-500'
          }`}
        >
          <span className="text-xs uppercase font-semibold tracking-wider text-blue-600 block">Unread / New</span>
          <span className="font-serif text-2xl font-bold mt-1 block">{stats.newMessages}</span>
        </button>

        <button
          onClick={() => setStatusFilter('REPLIED')}
          className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer ${
            statusFilter === 'REPLIED' ? 'bg-[#B8833E] text-white border-[#B8833E] shadow-md' : 'bg-white text-[#2F3B0C] border-[#EDE7D9] hover:border-[#B8833E]'
          }`}
        >
          <span className="text-xs uppercase font-semibold tracking-wider text-[#B8833E] block">Replied</span>
          <span className="font-serif text-2xl font-bold mt-1 block">{stats.replied}</span>
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
          onClick={() => setStatusFilter('ARCHIVED')}
          className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer ${
            statusFilter === 'ARCHIVED' ? 'bg-stone-700 text-white border-stone-700 shadow-md' : 'bg-white text-[#2F3B0C] border-[#EDE7D9] hover:border-stone-400'
          }`}
        >
          <span className="text-xs uppercase font-semibold tracking-wider text-stone-500 block">Archived</span>
          <span className="font-serif text-2xl font-bold mt-1 block">{stats.archived}</span>
        </button>

      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white border border-[#EDE7D9] p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
          <input
            type="text"
            placeholder="Search customer, email, phone, subject..."
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
              <option value="NEW">Unread / New</option>
              <option value="REPLIED">Replied</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl text-xs font-medium text-[#2F3B0C] focus:ring-1 focus:ring-[#4E641A] focus:outline-none max-w-[160px] truncate"
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
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date Received</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE7D9]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500">
                    <div className="w-6 h-6 border-2 border-[#4E641A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading contact messages...</span>
                  </td>
                </tr>
              ) : contactMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500">
                    <FiMail className="text-3xl text-stone-300 mx-auto mb-2" />
                    <p className="font-semibold">No contact messages found.</p>
                    <p className="text-xs text-stone-400">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                contactMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-[#FAF8F5] transition duration-150">
                    
                    <td className="py-4 px-4">
                      <div className="font-bold text-sm text-[#2F3B0C]">{msg.subject}</div>
                      <div className="text-stone-600 font-medium">{msg.name}</div>
                      <div className="text-[11px] text-stone-400 font-mono mt-0.5">{msg.email} | {msg.phone}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block bg-[#4E641A]/10 text-[#4E641A] font-semibold text-[11px] px-2.5 py-1 rounded-lg">
                        {msg.category || 'General Enquiry'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusBadgeClass(msg.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {msg.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-stone-500 font-mono text-[11px]">
                      {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(msg)}
                          className="p-2 bg-white border border-[#EDE7D9] hover:border-[#4E641A] hover:bg-[#FAF7F2] text-[#2F3B0C] rounded-lg transition cursor-pointer"
                          title="View Contact Message"
                        >
                          <FiEye size={14} />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteMessage(msg.id, msg.name)}
                          className="p-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                          title="Delete Contact Message"
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
      {showDetailModal && selectedMessage && (
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
                <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(selectedMessage.status)}`}>
                  {selectedMessage.status}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  Received: {new Date(selectedMessage.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2F3B0C] mt-2">{selectedMessage.subject}</h2>
              <p className="text-xs text-stone-500 font-medium">Customer: {selectedMessage.name} ({selectedMessage.category})</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF7F2] border border-[#EDE7D9] p-4 rounded-2xl">
              <div>
                <span className="text-[11px] font-bold uppercase text-stone-400 block mb-1">Email Address</span>
                <a href={`mailto:${selectedMessage.email}`} className="text-xs font-semibold text-[#4E641A] hover:underline flex items-center gap-1.5">
                  <FiMail size={14} />
                  <span>{selectedMessage.email}</span>
                </a>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-stone-400 block mb-1">Phone Number</span>
                <a href={`tel:${selectedMessage.phone}`} className="text-xs font-semibold text-[#4E641A] hover:underline flex items-center gap-1.5">
                  <FiPhone size={14} />
                  <span>{selectedMessage.phone}</span>
                </a>
              </div>

              {selectedMessage.attachment && (
                <div className="col-span-2">
                  <span className="text-[11px] font-bold uppercase text-stone-400 block mb-1">Attachment Link</span>
                  <a href={selectedMessage.attachment} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <FiPaperclip size={14} />
                    <span>Open Attachment Document</span>
                    <FiExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Message Content */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Message Content</span>
              <p className="text-xs text-stone-700 bg-[#FAF8F5] border border-[#EDE7D9] p-4 rounded-xl leading-relaxed whitespace-pre-wrap font-sans">
                {selectedMessage.message}
              </p>
            </div>

            {/* Status & Admin Notes Controls */}
            <div className="pt-4 border-t border-[#EDE7D9] space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2F3B0C] mb-2">Update Message Status</label>
                <div className="flex items-center gap-3">
                  <select
                    value={updatingStatus}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="px-4 py-2.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl text-xs font-bold text-[#2F3B0C] focus:ring-2 focus:ring-[#4E641A] focus:outline-none cursor-pointer"
                  >
                    <option value="NEW">Unread / New</option>
                    <option value="REPLIED">Replied</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  {isUpdatingStatus && <span className="text-xs text-stone-400 animate-pulse">Saving status...</span>}
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2F3B0C] mb-2">Internal Management Notes</label>
                <textarea
                  rows={3}
                  value={editingAdminNotes}
                  onChange={(e) => setEditingAdminNotes(e.target.value)}
                  placeholder="Add internal remarks, phone logs, or reply follow-ups..."
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
