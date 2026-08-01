import { create } from 'zustand';

export const useProductFilterStore = create((set) => ({
  searchQuery: '',
  categoryFilter: 'ALL',
  stockFilter: 'ALL',
  statusFilter: 'ALL',
  currentPage: 1,
  scrollPosition: 0,

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setCategoryFilter: (catId) => set({ categoryFilter: catId, currentPage: 1 }),
  setStockFilter: (stock) => set({ stockFilter: stock, currentPage: 1 }),
  setStatusFilter: (status) => set({ statusFilter: status, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setScrollPosition: (pos) => set({ scrollPosition: pos }),

  resetFilters: () => set({
    searchQuery: '',
    categoryFilter: 'ALL',
    stockFilter: 'ALL',
    statusFilter: 'ALL',
    currentPage: 1,
    scrollPosition: 0
  })
}));
