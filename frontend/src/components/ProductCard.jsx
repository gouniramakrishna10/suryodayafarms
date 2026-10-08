import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiMinus, FiPlus } from 'react-icons/fi';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { getOptimizedImageUrl, getImageSrcSet, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageOptimizer';
import { formatCurrency } from '../utils/currency';

const ProductCard = memo(function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem, updateQuantity, removeItem, cartItems } = useCartStore();
  const wishlistItems = useWishlistStore(state => state.wishlistItems);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const { isAuthenticated } = useAuthStore();

  const [isAdding, setIsAdding] = useState(false);
  const [isUpdatingQty, setIsUpdatingQty] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getProductVariants = (prod) => {
    if (!prod) return [];
    const baseVariant = {
      id: 'base',
      name: prod.weight || '500g',
      price: prod.price,
      mrp: prod.originalPrice || prod.compareAtPrice || prod.mrp || prod.price,
      sku: prod.sku,
      inventory: prod.inventory,
      stockStatus: prod.stockStatus,
      isBase: true
    };

    const rawVariants = prod.variants || [];
    if (rawVariants.length === 0) {
      return [baseVariant];
    }

    const baseWeightNorm = (prod.weight || '').toLowerCase().replace(/\s+/g, '').replace(/kb/g, 'kg');
    const hasBaseInVariants = rawVariants.some(
      v => (v.name || '').toLowerCase().replace(/\s+/g, '').replace(/kb/g, 'kg') === baseWeightNorm
    );

    let list = [...rawVariants];
    if (!hasBaseInVariants) {
      list.push(baseVariant);
    }
    return list.sort((a, b) => a.price - b.price);
  };

  const variants = getProductVariants(product);

  // State for selected package variant (defaults to first variant)
  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    return variants[0]?.id || 'base';
  });

  useEffect(() => {
    if (variants.length > 0) {
      setSelectedVariantId(variants[0].id);
    }
  }, [product?.id]);

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0] || {
    price: product?.price || 0,
    mrp: product?.compareAtPrice || product?.price || 0,
    name: product?.weight || '500g'
  };

  const categoryName = (product?.categories && product.categories.length > 0)
    ? product.categories[0].name
    : (product?.category?.name || product?.category || product?.tag || 'PURE & NATURAL');

  const isProductWishlisted = wishlistItems.some(
    (item) => item.productId === product?.id || item.id === product?.id
  );

  // Cart item detection for the selected package variant
  const variantId = selectedVariant.isBase ? null : (selectedVariant.id === 'base' ? null : selectedVariant.id);
  const cartItem = cartItems.find((item) => {
    const itemPId = item.productId || item.product?.id || (typeof item.product === 'string' ? item.product : null);
    const matchesProduct = (itemPId === product?.id) || (product?._id && itemPId === product._id);
    if (!matchesProduct) return false;

    const itemVId = item.variantId || item.variant?.id || null;
    if (!variantId) {
      return !itemVId || itemVId === 'base';
    } else {
      return itemVId === variantId;
    }
  });

  const currentQty = cartItem ? cartItem.quantity : 0;

  const handleWishlistToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true, "Please login to save items to your wishlist.");
      return;
    }
    await toggleWishlist(product.id);
  };

  const primaryImageRaw = typeof product?.images?.[0] === 'string'
    ? product.images[0]
    : (product?.images?.[0]?.url || product?.image || DEFAULT_FALLBACK_IMAGE);

  const hoverImageRaw = product?.hoverImage || (typeof product?.images?.[1] === 'string' ? product.images[1] : product?.images?.[1]?.url);

  const activeImageRaw = (isHovered && hoverImageRaw) ? hoverImageRaw : primaryImageRaw;
  const optimizedImageUrl = getOptimizedImageUrl(activeImageRaw, { width: 350, cropMode: 'limit' });

  const isOutOfStock = Boolean(product?.isOutOfStock) || (selectedVariant.isBase
    ? (selectedVariant.inventory <= 0 || product?.stockStatus === 'OUT_OF_STOCK')
    : (selectedVariant.inventory <= 0));

  const discountPercent = (selectedVariant.mrp > selectedVariant.price)
    ? Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true, "Please login to add items to your cart.");
      return;
    }

    if (isAdding || isOutOfStock) return;

    setIsAdding(true);
    try {
      await addItem(product.id, variantId, 1, true);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrementQty = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!cartItem || isUpdatingQty) return;

    setIsUpdatingQty(true);
    try {
      await updateQuantity(cartItem.id, currentQty + 1);
    } catch (err) {
      console.error('Failed to increment quantity:', err);
    } finally {
      setIsUpdatingQty(false);
    }
  };

  const handleDecrementQty = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!cartItem || isUpdatingQty) return;

    setIsUpdatingQty(true);
    try {
      if (currentQty <= 1) {
        await removeItem(cartItem.id);
      } else {
        await updateQuantity(cartItem.id, currentQty - 1);
      }
    } catch (err) {
      console.error('Failed to decrement quantity:', err);
    } finally {
      setIsUpdatingQty(false);
    }
  };

  const handleBuyNow = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      useAuthStore.getState().setCheckoutResumeRedirect('/checkout');
      useAuthStore.getState().setLoginRequiredModalOpen(true, "Please login to proceed to checkout.");
      return;
    }

    if (isOutOfStock || isBuyingNow) return;

    setIsBuyingNow(true);
    try {
      if (!cartItem) {
        await addItem(product.id, variantId, 1, true);
      }
      navigate('/checkout');
    } catch (err) {
      console.error('Buy now error:', err);
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleCardClick = () => {
    if (product?.slug) {
      navigate(`/products/${product.slug}`);
    }
  };

  const productNameLower = (product?.name || '').toLowerCase();
  const isSampleOrLogo = productNameLower.includes('sample') || productNameLower.includes('logo') || productNameLower.includes('test');

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-[16px] border border-[#EAE4D8] hover:border-[#4E641A]/40 transition-all duration-300 flex flex-col justify-between group h-full shadow-2xs overflow-hidden relative text-left select-none product-card-wrapper min-w-0 w-full max-w-full"
    >
      {/* 1. Image Container */}
      <div 
        onClick={handleCardClick}
        className="relative aspect-square w-full bg-[#FAF8F5] p-2 sm:p-3 flex items-center justify-center border-b border-[#EAE4D8]/40 shrink-0 overflow-hidden cursor-pointer product-card-image-wrapper min-w-0"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F5]">
            <div className="w-7 h-7 rounded-full bg-stone-200/60 animate-pulse" />
          </div>
        )}

        <img
          src={optimizedImageUrl}
          srcSet={getImageSrcSet(activeImageRaw, { widths: [300, 600], cropMode: 'limit' })}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageLoaded(true);
            handleImageError(e, DEFAULT_FALLBACK_IMAGE);
          }}
          className={`w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform duration-300 product-card-image ${
            isSampleOrLogo ? 'product-card-image-sample' : ''
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Heart Icon Button */}
        <button 
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 w-7.5 h-7.5 sm:w-8 sm:h-8 bg-white/95 backdrop-blur-xs border border-[#EAE4D8] text-stone-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer z-20 product-card-wishlist"
          title="Save to Wishlist"
        >
          <FiHeart className={`w-3.5 h-3.5 ${isProductWishlisted ? 'fill-red-500 text-red-500' : 'text-stone-400'}`} />
        </button>
      </div>

      {/* 2. Content Details Section */}
      <div className="p-2 sm:p-2.5 pb-2.5 sm:pb-3 flex flex-col justify-between flex-grow gap-1 product-card-details min-w-0 w-full">
        <div className="min-w-0 w-full">
          {/* Category Eyebrow */}
          <span className="font-sans text-[8px] sm:text-[9px] font-bold text-[#C68A2B] uppercase tracking-[0.14em] block leading-none mb-1 truncate min-w-0">
            {categoryName}
          </span>

          {/* Product Name */}
          <h3 
            onClick={handleCardClick}
            className="font-serif text-xs sm:text-sm font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition-colors leading-snug line-clamp-2 block mb-1 min-h-[30px] sm:min-h-[34px] cursor-pointer product-card-title break-words min-w-0"
          >
            {product.name}
          </h3>

          {/* Price & Discount Display */}
          <div className="flex items-baseline gap-1 flex-wrap mb-1 min-w-0">
            <span className="font-serif text-xs sm:text-sm font-bold text-[#4E641A]">
              {formatCurrency(selectedVariant.price)}
            </span>
            {selectedVariant.mrp > selectedVariant.price && (
              <span className="font-sans text-[10px] text-stone-400 line-through font-medium">
                {formatCurrency(selectedVariant.mrp)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="font-sans text-[8.5px] font-bold text-[#C68A2B]">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* 3. Package Size Selection & Purchasing Controls */}
        <div className="flex flex-col gap-1 pt-1 mt-auto w-full min-w-0">
          {/* Compact Package Size Dropdown */}
          {variants.length > 0 && (
            <div className="w-full min-w-0">
              <span className="font-sans text-[8px] sm:text-[8.5px] font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                Package Size
              </span>
              <div className="relative w-full min-w-0">
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[#FAF8F5] border border-[#EAE4D8] focus:border-[#4E641A] rounded-lg py-1 px-1.5 pr-5 font-sans text-[10px] sm:text-[11px] font-bold text-[#2F3B0C] appearance-none cursor-pointer outline-none transition-all truncate"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {formatCurrency(v.price)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500 text-[8px]">
                  ▼
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Compact Action Buttons (30px-32px Height) */}
          <div className="mobile-cta-wrapper flex items-center gap-[6px] w-full min-w-0 mt-2">
            {currentQty > 0 ? (
              /* Inline Quantity Selector for Selected Variant */
              <div className="mobile-cta-qty bg-[#FAF8F5] border border-[#4E641A] rounded-[7px] flex items-center justify-between px-1 shadow-2xs min-w-0 flex-1 h-[32px]">
                <button
                  type="button"
                  onClick={handleDecrementQty}
                  disabled={isUpdatingQty}
                  className="w-6 h-6 rounded-[5px] bg-white border border-[#EAE4D8] text-[#4E641A] hover:bg-[#4E641A] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 text-xs font-bold shrink-0"
                  title="Decrease quantity"
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="w-2.5 h-2.5 stroke-[2.5]" />
                </button>

                <span className="font-serif text-[10px] sm:text-xs font-bold text-[#2F3B0C] px-0.5 select-none whitespace-nowrap leading-none">
                  {currentQty}
                </span>

                <button
                  type="button"
                  onClick={handleIncrementQty}
                  disabled={isUpdatingQty}
                  className="w-[#24px] h-[#24px] rounded-[5px] bg-[#4E641A] text-white hover:bg-[#2F3B0C] flex items-center justify-center transition-all cursor-pointer active:scale-95 text-xs font-bold shrink-0"
                  title="Increase quantity"
                  aria-label="Increase quantity"
                >
                  <FiPlus className="w-2.5 h-2.5 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              /* Primary Add to Cart Button */
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`mobile-cta-btn mobile-cta-btn-add font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-tight rounded-[7px] transition-all duration-200 flex items-center justify-center gap-1 shadow-2xs cursor-pointer border-none min-w-0 flex-1 h-[32px] py-1 px-1 sm:px-2 ${
                  isOutOfStock
                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    : 'bg-[#4E641A] hover:bg-[#2F3B0C] text-white active:scale-[0.98]'
                }`}
              >
                <FiShoppingBag className="w-[11px] h-[11px] shrink-0" />
                <span className="whitespace-nowrap truncate">
                  {isOutOfStock ? 'OUT' : isAdding ? 'ADDING...' : 'ADD TO CART'}
                </span>
              </button>
            )}

            {/* Secondary Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock || isBuyingNow}
              className={`mobile-cta-btn mobile-cta-btn-buy font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-tight rounded-[7px] transition-all duration-200 flex items-center justify-center shadow-2xs cursor-pointer border min-w-0 flex-1 h-[32px] py-1 px-1 sm:px-2 ${
                isOutOfStock
                  ? 'bg-transparent text-stone-400 border-stone-200 cursor-not-allowed'
                  : 'bg-white hover:bg-[#FAF8F5] text-[#2F3B0C] border-[#4E641A]/60 hover:border-[#4E641A] active:scale-[0.98]'
              }`}
            >
              <span className="whitespace-nowrap truncate">
                {isBuyingNow ? '...' : 'BUY NOW'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
