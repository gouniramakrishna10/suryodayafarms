import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import EmptyState from '../../components/EmptyState';
import { useProductFilterStore } from '../../store/useProductFilterStore';
import { getOptimizedImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageOptimizer';
import { formatCurrency } from '../../utils/currency';

export default function ProductsListPage({
  products = [],
  categories = [],
  handleDeleteProduct,
  isLoading
}) {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    statusFilter,
    setStatusFilter,
    scrollPosition,
    setScrollPosition
  } = useProductFilterStore();

  // Restore scroll position when list mounts
  useEffect(() => {
    window.scrollTo(0, scrollPosition);
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollPosition, setScrollPosition]);

  const filteredProducts = products.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    if (categoryFilter !== 'ALL') {
      const pCatIds = p.categoryIds || [p.categoryId];
      if (!pCatIds.includes(categoryFilter)) return false;
    }
    if (stockFilter !== 'ALL' && p.stockStatus !== stockFilter) return false;
    if (statusFilter === 'VISIBLE' && !p.isVisible) return false;
    if (statusFilter === 'HIDDEN' && p.isVisible) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in w-full text-left font-sans">
      
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">PRODUCT MANAGEMENT</span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-dark-olive">Storefront Products</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products/new')}
            className="px-5 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center space-x-2 shadow-xs cursor-pointer border-none active:scale-98"
          >
            <FiPlus className="text-sm" />
            <span>Publish Product</span>
          </button>
        </div>
      </div>

      {/* CLEAN PRODUCT CATALOG LIST & SEARCH/FILTERS */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-6 text-left">
        
        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs text-stone-700 focus:outline-none focus:border-[#4E641A] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs text-stone-700 focus:outline-none focus:border-[#4E641A] cursor-pointer"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs text-stone-700 focus:outline-none focus:border-[#4E641A] cursor-pointer"
          >
            <option value="ALL">All Visibility Statuses</option>
            <option value="VISIBLE">Visible</option>
            <option value="HIDDEN">Hidden</option>
          </select>
        </div>

        {/* Table View */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="📦 No Products Found"
            description="No products available matching the current search filters."
            illustration="📦"
            actionLabel="Publish First Product"
            onAction={() => navigate('/admin/products/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getOptimizedImageUrl(typeof prod.images?.[0] === 'string' ? prod.images[0] : (prod.images?.[0]?.url || prod.image), { width: 100 })}
                          alt={prod.name}
                          onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                          className="w-11 h-11 object-cover rounded-xl border border-stone-200 bg-cream-bg shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="font-serif text-sm font-bold text-dark-olive line-clamp-1">{prod.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono">SKU: {prod.sku || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-medium">
                      {prod.categories?.map(c => c.name).join(', ') || prod.category?.name || 'Uncategorized'}
                    </td>
                    <td className="py-3 px-4 font-bold text-dark-olive">
                      {formatCurrency(prod.price)} {prod.mrp && <span className="text-stone-400 text-[10px] font-normal line-through ml-1">{formatCurrency(prod.mrp)}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        prod.inventory > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {prod.inventory > 0 ? `In Stock (${prod.inventory})` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        prod.isVisible ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}>
                        {prod.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/products/${prod.id}/edit`)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer border-none"
                          title="Edit Product"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer border-none"
                          title="Delete Product"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
