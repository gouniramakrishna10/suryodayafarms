import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-[#EAE4D8] rounded-[16px] p-3 space-y-3 animate-pulse shadow-2xs">
          <div className="aspect-square w-full bg-stone-100 rounded-xl" />
          <div className="space-y-2 pt-1">
            <div className="h-2.5 w-14 bg-stone-200 rounded" />
            <div className="h-4 w-5/6 bg-stone-300 rounded" />
            <div className="h-4 w-1/3 bg-stone-200 rounded" />
          </div>
          <div className="h-10 w-full bg-stone-200 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, isLoading } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const savedCount = wishlistItems.length;

  return (
    <div className="bg-[#FAF8F5] pt-4 sm:pt-6 pb-12 sm:pb-16 px-4 sm:px-6 md:px-12 min-h-[60vh]">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. Page Header */}
        <div className="flex flex-col gap-0.5 mb-4 sm:mb-5 text-left">
          <span className="font-sans text-[9.5px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-[#C68A2B]">
            YOUR PREMIUM COLLECTION
          </span>
          <div className="flex flex-wrap items-baseline gap-2 justify-between">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#2F3B0C] leading-tight">
              My Favorites
            </h1>
            {isAuthenticated && (
              <span className="font-sans text-xs font-semibold text-stone-500">
                {savedCount} {savedCount === 1 ? 'Saved Product' : 'Saved Products'}
              </span>
            )}
          </div>
          <div className="w-12 h-[2px] bg-[#C68A2B] mt-1 rounded-full" />
        </div>

        {/* 2. Page Content */}
        {!isAuthenticated ? (
          /* Authentication Required State */
          <div className="bg-white border border-[#EAE4D8] rounded-[16px] py-12 sm:py-16 px-6 text-center max-w-md mx-auto flex flex-col items-center gap-4 shadow-2xs my-6">
            <div className="w-14 h-14 rounded-full bg-[#E8EFE0] border border-[#D5E2C7] flex items-center justify-center text-[#4E641A]">
              <FiHeart className="w-6 h-6 text-[#4E641A] animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">
                Authentication Required
              </h2>
              <p className="font-sans text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xs mx-auto">
                Sign in to save and synchronize your favorite superfoods across all your devices.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                useAuthStore.getState().setAuthModalTab('login');
                useAuthStore.getState().setAuthModalOpen(true);
              }}
              className="font-sans text-xs font-bold tracking-wider uppercase bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-6 py-3 rounded-xl shadow-2xs transition-all duration-300 border-none cursor-pointer mt-1"
            >
              Sign In to Account
            </button>
          </div>
        ) : isLoading && savedCount === 0 ? (
          <WishlistSkeleton />
        ) : savedCount === 0 ? (
          /* Empty Favorites State */
          <div className="bg-white border border-[#EAE4D8] rounded-[16px] py-12 sm:py-16 px-6 text-center max-w-md mx-auto flex flex-col items-center gap-4 shadow-2xs my-6">
            <div className="w-14 h-14 rounded-full bg-[#E8EFE0] border border-[#D5E2C7] flex items-center justify-center text-[#4E641A]">
              <FiHeart className="w-6 h-6 fill-[#4E641A]/20 text-[#4E641A]" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">
                Your Favorites Are Empty
              </h2>
              <p className="font-sans text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xs mx-auto">
                Save products you love and they'll appear here.
              </p>
            </div>
            <Link
              to="/products"
              className="font-sans text-xs font-bold tracking-wider uppercase bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-6 py-3 rounded-xl shadow-2xs transition-all duration-300 mt-1 inline-block"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          /* Modern Responsive Wishlist Grid */
          <div className={`wishlist-products-grid grid gap-4 sm:gap-5 ${
            wishlistItems.length === 1 
              ? 'grid-cols-1 max-w-sm mx-auto' 
              : wishlistItems.length === 2 
                ? 'grid-cols-2 max-w-2xl mx-auto' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
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
    </div>
  );
}
