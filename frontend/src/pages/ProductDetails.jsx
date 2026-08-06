import React, { useState, useEffect, Profiler } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiShoppingBag, FiInfo, FiTruck, FiArrowLeft, FiHeart, FiStar, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { GiSun } from 'react-icons/gi';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getWhatsAppUrl } from '../config/constants';
import { updateSEO } from '../hooks/useSEO';
import api from '../utils/api';

import { getOptimizedImageUrl, getImageSrcSet, resolveImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageOptimizer';
import DOMPurify from 'dompurify';
import DynamicSectionRenderer from '../components/DynamicSectionRenderer';
import { formatCurrency } from '../utils/currency';
import { fetchWithCache } from '../utils/cacheStore';
import SectionBadge from '../components/SectionBadge';

// Simple, high-quality, organic confetti effect
const triggerConfetti = (canvasEl) => {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  const width = canvasEl.width = canvasEl.offsetWidth;
  const height = canvasEl.height = canvasEl.offsetHeight;
  
  const colors = [
    '#4E641A', // Olive green (primary-green)
    '#2F3B0C', // Dark olive
    '#C68A2B', // Sunrise gold
    '#EAE4D8', // Light beige
    '#8FBC8F', // Soft sea green
  ];
  
  let particles = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * width,
    y: -10 - Math.random() * 20,
    r: 3 + Math.random() * 4,
    d: Math.random() * height,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngleIncremental: Math.random() * 0.05 + 0.02,
    tiltAngle: 0,
    vy: 1.5 + Math.random() * 1.5,
    vx: Math.random() * 1.5 - 0.75
  }));
  
  let animationFrameId;
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    let remaining = false;
    
    particles.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.tiltAngle) * 0.4;
      
      if (p.y < height) {
        remaining = true;
      }
      
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    
    if (remaining) {
      animationFrameId = requestAnimationFrame(draw);
    }
  };
  
  draw();
  return () => {
    cancelAnimationFrame(animationFrameId);
  };
};

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [navbarHeight, setNavbarHeight] = useState(120);

  useEffect(() => {
    const updateNavbarHeight = () => {
      const navEl = document.querySelector('.app-header-nav');
      if (navEl) {
        setNavbarHeight(navEl.offsetHeight);
      }
    };
    updateNavbarHeight();
    const timer = setTimeout(updateNavbarHeight, 150);
    window.addEventListener('resize', updateNavbarHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, []);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [allVariants, setAllVariants] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Storefront Product Content CMS states
  const [activeStorefrontFaq, setActiveStorefrontFaq] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedReviewDetails, setSubmittedReviewDetails] = useState(null);

  // Global Stores bindings
  const { addToCart } = useCartStore();
  const wishlistItems = useWishlistStore(state => state.wishlistItems);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const { isAuthenticated } = useAuthStore();
  const modal = useModalStore();
  const { settings, fetchSettings } = useSettingsStore();

  const isProductWishlisted = product
    ? wishlistItems.some((item) => item.productId === product.id || item.id === product.id)
    : false;

  const getCmsContent = (keyName) => {
    if (!product || !product.productContent) return null;
    const spec = (product.productContent.customSpecs || []).find(
      s => s.key.toLowerCase() === keyName.toLowerCase()
    );
    return spec ? spec.value : null;
  };


  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  useEffect(() => {
    setIsMainImageLoaded(false);
  }, [activeImage]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentlyViewed');
      if (saved) {
        setRecentlyViewed(JSON.parse(saved).filter(x => x.id !== product?.id).slice(0, 3));
      }
    } catch (e) {
      console.error(e);
    }
  }, [product]);

  const getProductVariants = (prod) => {
    if (!prod) return [];
    const baseVariant = {
      id: 'base',
      name: prod.weight || 'Default Size',
      price: prod.price,
      mrp: prod.compareAtPrice || prod.mrp || prod.price,
      sku: prod.sku,
      inventory: prod.inventory,
      stockStatus: prod.stockStatus,
      isBase: true
    };

    if (!prod.variants || prod.variants.length === 0) {
      return [baseVariant];
    }

    const baseWeightNorm = (prod.weight || '').toLowerCase().replace(/\s+/g, '').replace(/kb/g, 'kg');
    const hasBaseInVariants = prod.variants.some(
      v => (v.name || '').toLowerCase().replace(/\s+/g, '').replace(/kb/g, 'kg') === baseWeightNorm
    );

    let list = [...prod.variants];
    if (!hasBaseInVariants) {
      list.push(baseVariant);
    }
    return list.sort((a, b) => a.price - b.price);
  };

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithCache(`product_${slug}`, () => api.get(`/products/${slug}`), 5 * 60 * 1000);
      const prod = response.product;
      setProduct(prod);
      
      // Save to recently viewed
      try {
        const saved = localStorage.getItem('recentlyViewed');
        let list = saved ? JSON.parse(saved) : [];
        list = list.filter((x) => x.id !== prod.id);
        list.unshift({
          id: prod.id,
          slug: prod.slug,
          name: prod.name,
          price: prod.price,
          weight: prod.weight || '500g',
          image: prod.image || (prod.images?.length > 0 ? prod.images[0].url : '')
        });
        localStorage.setItem('recentlyViewed', JSON.stringify(list.slice(0, 6)));
      } catch (err) {
        console.error('Failed to save recently viewed product:', err);
      }

      setActiveImage(prod.image || (prod.images?.length > 0 ? prod.images[0].url : ''));
      
      const compiledVariants = getProductVariants(prod);
      setAllVariants(compiledVariants);

      if (compiledVariants.length > 0) {
        setSelectedVariant(compiledVariants[0]);
      } else {
        setSelectedVariant(null);
      }

      // Update dynamic SEO tags using client-approved brand metadata and Product Schema
      updateSEO({
        title: prod.seoTitle || `${prod.name} | Suryodaya Farms`,
        description: prod.seoDescription || prod.shortDescription || `${prod.name} by Suryodaya Farms. Pure, natural and nutritious superfood developed with scientific care.`,
        image: (prod.images && prod.images.length > 0 ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0].url) : prod.image) || undefined,
        ogType: 'product',
        productData: prod
      });
      
      // Fetch related products under same category - isolated error handling
      try {
        const categoryName = (prod.categories && prod.categories.length > 0)
          ? prod.categories[0].name
          : (prod.category?.name || 'Staples');
        const relResponse = await api.get(`/products?category=${categoryName}&limit=4`);
        if (relResponse && relResponse.products) {
          setRelatedProducts(relResponse.products.filter(p => p.id !== prod.id).slice(0, 3));
        }
      } catch (relErr) {
        console.error("Failed to fetch related products, using fallback empty list:", relErr);
        setRelatedProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedVariantId = () => {
    if (!selectedVariant || selectedVariant.isBase || selectedVariant.id === 'base') {
      return null;
    }
    return selectedVariant.id;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true);
      return;
    }
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, getSelectedVariantId(), quantity);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      useAuthStore.getState().setCheckoutResumeRedirect('/checkout');
      useAuthStore.getState().setLoginRequiredModalOpen(true);
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await addToCart(product.id, getSelectedVariantId(), quantity, true);
      navigate('/checkout');
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true, "Please login to save items to your wishlist.");
      return;
    }
    try {
      await toggleWishlist(product.id);
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      useAuthStore.getState().setLoginRequiredModalOpen(true);
      return;
    }

    try {
      const response = await api.post(`/products/${product.id}/reviews`, { 
        rating, 
        reviewTitle, 
        reviewText: comment, 
        reviewImages: reviewImages 
      });
      if (response.success) {
        setSubmittedReviewDetails({
          rating,
          title: reviewTitle,
          text: comment,
          productName: product.name,
          status: response.review?.status || 'PENDING'
        });
        setShowSuccessModal(true);
      }
      setReviewSuccess(true);
      setComment('');
      setReviewTitle('');
      setReviewImages([]);
      fetchProductDetails();
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err) {
      modal.alert('Action Failed', err.message, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-bg flex items-center justify-center pt-20">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <GiSun className="text-sunrise-gold text-4xl animate-spin-slow" />
          <span className="font-sans text-xs font-semibold text-dark-olive uppercase tracking-widest">Loading Premium Staples...</span>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = selectedVariant
    ? (selectedVariant.isBase
      ? (selectedVariant.inventory <= 0 || product.stockStatus === 'OUT_OF_STOCK')
      : (selectedVariant.inventory <= 0))
    : (product.inventory <= 0 || product.stockStatus === 'OUT_OF_STOCK');

  const whatsappMessage = encodeURIComponent(
    `Namaste Suryodaya Farms! I am interested in inquiring about your premium organic "${product.name}" (${selectedVariant ? selectedVariant.price : product.price}). Please share more details.`
  );

  const getProductImagesList = () => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images.map(img => img.url).filter(Boolean);
    }
    return [product.image].filter(Boolean);
  };

  const getBenefitsList = () => {
    const list = [];
    const cmsBenefits = getCmsContent("Benefits") || getCmsContent("Key Benefits");
    if (cmsBenefits) {
      return [{ title: 'Health Benefits', desc: cmsBenefits, icon: '🌿' }];
    }
    if (product.productContent?.highlights) {
      return product.productContent.highlights.map((hl, idx) => ({
        title: `Harvest Benefit #${idx + 1}`,
        desc: hl,
        icon: ['🌿', '🌱', '☀️', '💧', '🌾', '🐝'][idx % 6]
      }));
    }
    return list;
  };

  const parseNutritionData = () => {
    const text = getCmsContent("Nutrition Information") || getCmsContent("Nutrition") || product.nutrients;
    if (!text) return [];
    
    const items = text.split(/[,\n]/);
    return items.map(item => {
      const parts = item.split(':');
      return {
        name: parts[0]?.trim() || 'Nutrient',
        value: parts[1]?.trim() || 'Rich'
      };
    }).filter(x => x.name);
  };

  const renderProductTitle = () => (
    <div className="space-y-3 flex flex-col items-start">
      <SectionBadge text={(product.categories && product.categories.length > 0) ? product.categories[0].name : (product.category?.name || 'Vedic Staples')} align="left" />
      <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C] leading-tight">
        {product.name}
      </h1>
      
      {/* Ratings */}
      <div className="flex items-center gap-1.5">
        <div className="flex text-[#C68A2B]">
          {[...Array(5)].map((_, i) => (
            <FiStar key={i} className={`text-sm ${
              i < Math.round(product.averageRating || 0) ? 'text-[#C68A2B] fill-[#C68A2B]' : 'text-stone-300'
            }`} />
          ))}
        </div>
        <span className="font-sans text-xs text-stone-500 font-semibold pl-1">
          {product.totalReviews > 0 ? (
            `${product.averageRating} (${product.totalReviews} Reviews)`
          ) : (
            'No reviews yet'
          )}
        </span>
      </div>
    </div>
  );

  const onRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    if (import.meta.env.DEV) {
      console.log(`[Profiler] ${id} - Phase: ${phase} - Actual Duration: ${actualDuration.toFixed(2)}ms`);
    }
  };



  return (
    <Profiler id="ProductDetails" onRender={onRenderCallback}>
      <div className="min-h-screen bg-[#FCFAF5] pb-32 lg:pb-20 pt-6 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-12">
          
          {/* Back navigation */}
          <button
            onClick={() => navigate('/products')}
            className="self-start flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-[#4E641A] hover:text-[#C68A2B] transition-colors duration-300 cursor-pointer border-none bg-transparent"
          >
            <FiArrowLeft />
            <span>Back to Marketplace</span>
          </button>
          
          {/* Two-Column Shopify Grid (Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* COLUMN 1: Main Content (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-12 text-left">
              
              {/* Product Gallery */}
              <div className="flex flex-col gap-4">
                <div 
                  className="relative aspect-square w-full rounded-[32px] overflow-hidden bg-white border border-[#EDE7D9] flex items-center justify-center"
                >
                  {!isMainImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#FCFAF5]">
                      <div className="w-16 h-16 rounded-full border-4 border-stone-100 border-t-[#4E641A] animate-spin" />
                    </div>
                  )}
                  <img
                    src={getOptimizedImageUrl(activeImage || product?.image, { width: 1500, cropMode: 'limit' })}
                    srcSet={getImageSrcSet(activeImage || product?.image, { widths: [400, 800, 1500], cropMode: 'limit' })}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    alt={product.name}
                    width={1500}
                    height={1500}
                    loading="lazy"
                    onLoad={() => setIsMainImageLoaded(true)}
                    onError={(e) => {
                      setIsMainImageLoaded(true);
                      handleImageError(e, DEFAULT_FALLBACK_IMAGE);
                    }}
                    className="w-full h-full object-contain p-6 transition-all duration-300 opacity-100"
                  />
                  
                  <button
                    onClick={handleToggleWishlist}
                    className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-[#2F3B0C] hover:text-[#4E641A] hover:bg-white transition-all duration-300 border border-[#EDE7D9] cursor-pointer"
                  >
                    <FiHeart size={20} className={isProductWishlisted ? 'fill-[#4E641A] text-[#4E641A]' : ''} />
                  </button>
                </div>

                {/* Thumbnails row */}
                <div className="flex flex-wrap gap-3">
                  {getProductImagesList().map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer bg-white p-1 flex items-center justify-center ${
                        activeImage === img ? 'border-[#4E641A] scale-95 shadow-inner' : 'border-[#EDE7D9] hover:border-[#C68A2B]'
                      }`}
                    >
                      <img 
                        src={getOptimizedImageUrl(img, { width: 200, cropMode: 'limit' })} 
                        alt={`Product Thumbnail ${i + 1}`} 
                        onError={(e) => handleImageError(e)}
                        className="w-full h-full object-contain" 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile View: Quantity selector & buy buttons */}
              <div className="block lg:hidden space-y-6 bg-white border border-[#EDE7D9] rounded-3xl p-6 shadow-xs">
                {renderProductTitle()}
                <div className="flex justify-between items-baseline border-b border-stone-100 pb-4 pt-2">
                  <span className="font-serif text-2xl font-bold text-[#4E641A]">
                    {formatCurrency(selectedVariant ? selectedVariant.price : product.price)}
                  </span>
                  {(() => {
                    const mrpVal = selectedVariant ? (selectedVariant.mrp || product.compareAtPrice) : product.compareAtPrice;
                    const priceVal = selectedVariant ? selectedVariant.price : product.price;
                    if (!mrpVal || mrpVal <= priceVal) return null;
                    const discVal = Math.round(((mrpVal - priceVal) / mrpVal) * 100);
                    return (
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs line-through text-stone-400">{formatCurrency(mrpVal)}</span>
                        <span className="text-[10px] font-bold text-[#C68A2B] bg-[#C68A2B]/10 px-2 py-0.5 rounded">{discVal}% OFF</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Mobile Variant Selector */}
                {allVariants.length > 1 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Size:</span>
                    <div className="flex flex-wrap gap-2">
                      {allVariants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase border cursor-pointer transition ${
                            selectedVariant?.id === v.id ? 'bg-[#4E641A] text-white border-transparent' : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Quantity selector */}
                <div className="flex items-center justify-between border-t border-b border-stone-100 py-3">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center border border-[#EDE7D9] rounded-xl bg-[#FCFAF5]">
                    <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="p-2 text-stone-500 hover:text-[#4E641A] border-none bg-transparent cursor-pointer">
                      <FiMinus size={12} />
                    </button>
                    <span className="px-4 text-xs font-bold text-[#2F3B0C]">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-stone-500 hover:text-[#4E641A] border-none bg-transparent cursor-pointer">
                      <FiPlus size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`flex items-center justify-center gap-2 font-sans text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl border transition ${
                      isOutOfStock || isAdding
                        ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                        : 'border-[#4E641A] text-[#4E641A] hover:bg-[#4E641A] hover:text-white bg-transparent cursor-pointer'
                    }`}
                  >
                    <FiShoppingBag />
                    <span>{isOutOfStock ? 'Sold Out' : isAdding ? 'Adding...' : 'Add to Basket'}</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock || isProcessing}
                    className="flex items-center justify-center font-sans text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl bg-[#4E641A] hover:bg-[#37411A] text-white border-none cursor-pointer"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>

              {/* Quick Highlights (6-8 feature badges) */}
              <div className="bg-white border border-[#EDE7D9] rounded-[32px] p-6 shadow-xs space-y-4">
                <h4 className="font-serif text-sm font-bold text-[#2F3B0C] uppercase tracking-wider border-b border-stone-100 pb-2">Harvest Highlights</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  {[
                    { label: 'Certified Organic', desc: 'Cultivated without chemical additives' },
                    { label: 'Traditional Vedic Methods', desc: 'Slow, handcrafted small batches' },
                    { label: 'Desi Seed Cultivation', desc: 'Native crop variety preservation' },
                    { label: 'Direct Dryland Sourcing', desc: 'Concentrated natural flavors' },
                    { label: 'Eco-Packaging Preserve', desc: 'Glass & cotton preservation' },
                    { label: 'Direct Farmer Support', desc: 'Ensuring fair dryland wages' }
                  ].map((badge, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="text-[#C68A2B] text-sm shrink-0">✓</span>
                      <div className="space-y-0.5">
                        <span className="font-sans text-xs font-bold text-stone-850 block">{badge.label}</span>
                        <span className="font-sans text-[10px] text-stone-400 font-light block">{badge.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ===== MODULAR CONTENT SECTIONS ===== */}
              <div className="space-y-6">

                {/* DYNAMIC CMS CONTENT SECTIONS */}
                <DynamicSectionRenderer sections={product.contentSections} />

                {/* DETAILED PRODUCT DESCRIPTION (Fallback if no sections defined) */}
                {Boolean(product.detailedDescription && product.detailedDescription.trim() && (!product.contentSections || product.contentSections.length === 0)) && (
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 md:p-10 shadow-xs max-w-[900px] mx-auto">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#EDE7D9]">
                      <span className="text-2xl">✨</span>
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Deep Dive & Specifications</span>
                        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">Detailed Product Description</h2>
                      </div>
                    </div>
                    <div 
                      className="detailed-product-description prose max-w-none text-left select-text"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.detailedDescription) }}
                    />
                  </div>
                )}

                {/* SECTION 1: Product Description */}
                {(product.productContent?.about || product.description) && (
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs max-w-[900px] mx-auto">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EDE7D9]">
                      <span className="text-2xl">📄</span>
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Product Story</span>
                        <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">Product Overview</h2>
                      </div>
                    </div>
                    {product.shortDescription && (
                      <p className="font-sans text-sm text-stone-700 leading-relaxed font-semibold italic border-l-2 border-[#C68A2B] pl-4 py-1 mb-5">{product.shortDescription}</p>
                    )}
                    <div className="font-sans text-sm text-stone-600 leading-relaxed prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.productContent?.about || product.description || '') }} />
                    </div>
                  </div>
                )}

                {/* SECTION 2: Why Choose Suryodaya Farms */}
                {(() => {
                  const whyChoose = product.productContent?.whyChoose;
                  const hasFeatures = whyChoose?.features?.length > 0;
                  const fallbackFeatures = [
                    { icon: '🌾', heading: 'Dryland Harvest', description: 'Grown using natural rainfall, producing concentrated nutrients and rich earthy flavors.' },
                    { icon: '🌱', heading: 'Traditional Vedic Care', description: 'Handcrafted in dryland communities using classical Vedic recipes.' },
                    { icon: '🤝', heading: 'Farmer Enrichment', description: 'Direct-from-farm model ensuring legacy farming families receive fair wages.' }
                  ];
                  const features = hasFeatures ? whyChoose.features : fallbackFeatures;
                  return (
                    <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs">
                      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EDE7D9]">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Our Promise</span>
                          <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">{whyChoose?.title || 'Why Choose Suryodaya Farms'}</h2>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {features.map((feat, idx) => (
                          <div key={idx} className="flex flex-col gap-2 bg-[#FCFAF5] border border-[#EDE7D9] rounded-2xl p-5 hover:border-[#C68A2B]/40 hover:shadow-sm transition-all duration-300">
                            <span className="text-2xl">{feat.icon}</span>
                            <h4 className="font-serif text-sm font-bold text-[#2F3B0C]">{feat.heading}</h4>
                            {feat.description && <p className="font-sans text-xs text-stone-500 leading-relaxed font-light">{feat.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* SECTION 3: Ways To Enjoy */}
                {product.productContent?.waysToEnjoy?.items?.length > 0 && (
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EDE7D9]">
                      <span className="text-2xl">🥤</span>
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Usage Guide</span>
                        <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">{product.productContent.waysToEnjoy.title || 'Ways To Enjoy'}</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {product.productContent.waysToEnjoy.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 bg-[#FCFAF5] border border-[#EDE7D9] rounded-2xl p-4 text-center hover:border-[#C68A2B]/40 hover:shadow-sm transition-all duration-300">
                          <span className="text-3xl">{item.icon}</span>
                          <span className="font-serif text-xs font-bold text-[#2F3B0C]">{item.title}</span>
                          {item.description && <p className="font-sans text-[10px] text-stone-400 font-light leading-snug">{item.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 4: Ingredients */}
                {product.productContent?.ingredients && (
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EDE7D9]">
                      <span className="text-2xl">🌱</span>
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">What's Inside</span>
                        <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">Ingredients</h2>
                      </div>
                    </div>
                    <div className="bg-[#FCFAF5] border border-[#EDE7D9] rounded-2xl p-5">
                      {product.productContent.ingredients.split(/[\n,]/).filter(Boolean).map((ing, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-2 border-b border-[#EDE7D9]/50 last:border-0">
                          <span className="text-[#4E641A] text-sm shrink-0">✦</span>
                          <span className="font-serif text-sm font-semibold text-[#2F3B0C]">{ing.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 5: Storage Instructions */}
                {product.productContent?.storageInstructions?.length > 0 && (
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EDE7D9]">
                      <span className="text-2xl">📦</span>
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Care Guide</span>
                        <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">Storage Instructions</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.productContent.storageInstructions.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-[#FCFAF5] border border-[#EDE7D9] rounded-xl p-4">
                          <span className="text-[#4E641A] font-bold text-sm shrink-0 mt-0.5">✔</span>
                          <span className="font-sans text-xs text-stone-700 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 5b: Quality Commitment */}
                {product.productContent?.qualityCommitment?.length > 0 && (
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EDE7D9]">
                      <span className="text-2xl">✨</span>
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Our Standards</span>
                        <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">Quality Commitment</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.productContent.qualityCommitment.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-[#FCFAF5] border border-[#EDE7D9] rounded-xl p-4">
                          <span className="text-[#C68A2B] font-bold text-sm shrink-0 mt-0.5">✨</span>
                          <span className="font-sans text-xs text-stone-700 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 6: Product Highlights (Key Features) */}
                {product.productContent?.highlights?.length > 0 && (
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EDE7D9]">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Key Features</span>
                        <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">Product Highlights</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.productContent.highlights.map((hl, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-[#FCFAF5] border border-[#EDE7D9] rounded-xl p-4 hover:border-[#4E641A]/30 transition-all duration-300">
                          <span className="text-[#C68A2B] font-bold text-base shrink-0">✓</span>
                          <span className="font-sans text-xs text-stone-700 leading-relaxed font-medium">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 7: Specifications */}
                {product.productContent?.customSpecs?.length > 0 && (
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EDE7D9]">
                      <span className="text-2xl">⚙️</span>
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Technical Details</span>
                        <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">Specifications</h2>
                      </div>
                    </div>
                    <div className="border border-[#EDE7D9] rounded-2xl overflow-hidden">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <tbody>
                          {product.productContent.customSpecs.map((spec, idx) => (
                            <tr key={idx} className="border-b border-stone-100 last:border-0 hover:bg-[#FCFAF5] transition-colors">
                              <td className="p-4 font-bold text-stone-700 uppercase tracking-wide bg-[#FCFAF5] w-2/5 border-r border-stone-100">{spec.key}</td>
                              <td className="p-4 text-stone-600">{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SECTION 8: FAQs */}
                {product.productContent?.faqs?.length > 0 && (
                  <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EDE7D9]">
                      <span className="text-2xl">❓</span>
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Customer Support</span>
                        <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">Frequently Asked Questions</h2>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {product.productContent.faqs.map((faq, idx) => (
                        <div key={idx} className="bg-[#FCFAF5] border border-[#EDE7D9] rounded-2xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setActiveStorefrontFaq(activeStorefrontFaq === idx ? null : idx)}
                            className="w-full flex justify-between items-center bg-transparent border-none cursor-pointer px-5 py-4 text-left font-serif text-sm font-bold text-[#2F3B0C] hover:bg-[#EDE7D9]/30 transition"
                          >
                            <span>{faq.question}</span>
                            <span className="text-[#C68A2B] text-xs shrink-0 ml-4">{activeStorefrontFaq === idx ? '▲' : '▼'}</span>
                          </button>
                          {activeStorefrontFaq === idx && (
                            <div className="px-5 pb-5 pt-2 border-t border-[#EDE7D9]/40 font-sans text-sm text-stone-600 leading-relaxed font-light">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 9: Reviews */}
                <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#EDE7D9]">
                    <span className="text-2xl">💬</span>
                    <div>
                      <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Family Feedback</span>
                      <h2 className="font-serif text-xl font-bold text-[#2F3B0C]">Customer Reviews ({product.totalReviews || 0})</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Review list */}
                    <div className="space-y-5">
                      {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((rev) => (
                          <div key={rev.id} className="border-b border-[#EDE7D9]/50 pb-5 last:border-0">
                            <div className="flex justify-between items-baseline gap-2 mb-1.5">
                              <span className="font-serif text-xs font-bold text-stone-850">{rev.customerName || rev.user?.name}</span>
                              <span className="font-sans text-[10px] text-stone-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className={`text-xs ${i < rev.rating ? 'text-[#C68A2B] fill-[#C68A2B]' : 'text-stone-300'}`} />
                              ))}
                            </div>
                            {rev.reviewTitle && <h5 className="font-serif text-xs font-bold text-stone-850 mb-1">{rev.reviewTitle}</h5>}
                            <p className="font-sans text-xs text-stone-500 leading-relaxed font-light">{rev.reviewText || rev.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-[#FCFAF5] border border-dashed border-[#EDE7D9] rounded-2xl p-6 text-center text-xs font-sans text-stone-450 italic">
                          Be the first to review this harvest.
                        </div>
                      )}
                    </div>
                    {/* Review form */}
                    <div className="bg-[#FCFAF5] border border-[#EDE7D9] rounded-2xl p-6 space-y-4">
                      <h4 className="font-serif text-sm font-bold text-[#2F3B0C] uppercase tracking-wider">Submit Your Review</h4>
                      <form onSubmit={handleAddReview} className="space-y-4 font-sans text-xs">
                        {reviewSuccess && (
                          <div className="bg-[#4E641A]/10 border border-[#4E641A]/20 rounded-xl p-3 text-[10px] text-[#4E641A] font-bold">
                            Namaste! Your review has been submitted for moderation.
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-stone-600 font-bold uppercase tracking-wider">Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} type="button" onClick={() => setRating(star)} className="text-base focus:outline-none border-none bg-transparent cursor-pointer">
                                <FiStar className={star <= rating ? 'text-[#C68A2B] fill-[#C68A2B]' : 'text-stone-300'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 text-left">
                          <label className="text-stone-600 font-bold">Review Title</label>
                          <input type="text" placeholder="Summarize your experience" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} className="bg-white border border-[#EDE7D9] rounded-xl py-2 px-3 text-xs w-full focus:outline-none focus:border-[#C68A2B]" />
                        </div>
                        <div className="flex flex-col gap-1.5 text-left">
                          <label className="text-stone-600 font-bold">Review Comments</label>
                          <textarea placeholder="Details about texture, packaging, or taste..." rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="bg-white border border-[#EDE7D9] rounded-xl py-2 px-3 text-xs w-full focus:outline-none focus:border-[#C68A2B] resize-none" required />
                        </div>
                        <button type="submit" className="w-full bg-[#4E641A] hover:bg-[#37411A] text-white font-sans text-xs font-bold uppercase tracking-widest py-3 rounded-xl border-none cursor-pointer">
                          Submit Review
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

              </div>



            </div>

            {/* COLUMN 2: Sticky Sidebar Purchase Summary (Desktop Only, sticky Top) */}
            <div className="lg:col-span-4 sticky top-28 self-start hidden lg:block w-full">
              <div className="bg-white border border-[#EDE7D9] rounded-[32px] p-6 shadow-sm space-y-6 text-left">
                {renderProductTitle()}
                <div className="flex justify-between items-baseline border-b border-stone-100 pb-4">
                  <span className="font-serif text-2xl font-bold text-[#4E641A]">
                    {formatCurrency(selectedVariant ? selectedVariant.price : product.price)}
                  </span>
                  {(() => {
                    const mrpVal = selectedVariant ? (selectedVariant.mrp || product.compareAtPrice) : product.compareAtPrice;
                    const priceVal = selectedVariant ? selectedVariant.price : product.price;
                    if (!mrpVal || mrpVal <= priceVal) return null;
                    const discVal = Math.round(((mrpVal - priceVal) / mrpVal) * 100);
                    return (
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs line-through text-stone-400">{formatCurrency(mrpVal)}</span>
                        <span className="text-[10px] font-bold text-[#C68A2B] bg-[#C68A2B]/10 px-2 py-0.5 rounded">{discVal}% OFF</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Variant Selector */}
                {allVariants.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Select Package Size:</span>
                    <div className="flex flex-wrap gap-2">
                      {allVariants.map((v) => {
                        const vLabel = v.weight ? `${v.weight}${v.unit || 'g'}` : (v.name || 'Default');
                        const isSel = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase border cursor-pointer transition-all ${
                              isSel
                                ? 'bg-[#4E641A] text-white border-transparent shadow-xs scale-102'
                                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                            }`}
                          >
                            {vLabel}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Variant Weight Display */}
                    {(selectedVariant || product?.weight) && (
                      <div className="flex items-center gap-2 pt-1 text-xs font-sans text-stone-600 border-t border-stone-100">
                        <span className="bg-[#FCFAF5] px-3 py-1.5 rounded-xl border border-[#EDE7D9] font-medium">
                          Weight: <strong className="text-[#4E641A] font-bold">{selectedVariant?.weight ? `${selectedVariant.weight}${selectedVariant.unit || 'g'}` : (selectedVariant?.name || product?.weight)}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity selector */}
                <div className="flex items-center justify-between border-t border-b border-stone-100 py-3">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Select Quantities:</span>
                  <div className="flex items-center border border-[#EDE7D9] rounded-xl bg-[#FCFAF5]">
                    <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="p-2.5 text-stone-500 hover:text-[#4E641A] border-none bg-transparent cursor-pointer">
                      <FiMinus size={12} />
                    </button>
                    <span className="px-4 text-xs font-bold text-[#2F3B0C] select-none">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 text-stone-500 hover:text-[#4E641A] border-none bg-transparent cursor-pointer">
                      <FiPlus size={12} />
                    </button>
                  </div>
                </div>

                {/* Buy buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`w-full flex items-center justify-center gap-2 border font-sans text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition duration-300 shadow-xs cursor-pointer ${
                      isOutOfStock || isAdding
                        ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                        : 'border-[#4E641A] text-[#4E641A] hover:bg-[#4E641A] hover:text-white bg-transparent'
                    }`}
                  >
                    <FiShoppingBag />
                    <span>{isOutOfStock ? 'Sold Out' : isAdding ? 'Adding...' : 'Add to Basket'}</span>
                  </button>
                  
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock || isProcessing}
                    className={`w-full flex items-center justify-center font-sans text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition border-none shadow-md cursor-pointer ${
                      isOutOfStock || isProcessing
                        ? 'bg-stone-300 text-stone-400 cursor-not-allowed'
                        : 'bg-[#4E641A] hover:bg-[#37411A] text-white'
                    }`}
                  >
                    {isOutOfStock ? 'Out of Stock' : isProcessing ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>

                {/* Shipping & Delivery details */}
                <div className="bg-[#4E641A]/5 border border-[#4E641A]/10 rounded-2xl p-4.5 space-y-2">
                  <span className="text-[9px] font-bold text-[#4E641A] uppercase tracking-wider flex items-center gap-1.5">
                    <FiTruck className="text-xs" /> Delivery information
                  </span>
                  <p className="font-sans text-[10px] text-stone-500 leading-relaxed font-light">
                    Enjoy <strong className="font-semibold text-[#4E641A]">FREE Delivery</strong> for orders above <strong className="font-semibold text-stone-700">{settings.freeDeliveryThreshold || '2'} KG</strong>. Standard shipping rate of {formatCurrency(settings.shippingCharge || 80)} applies for smaller orders.
                  </p>
                  <p className="font-sans text-[9.5px] text-[#4E641A] font-bold flex items-center gap-1 pt-0.5">
                    <span>🌍 PAN INDIA DELIVERY</span>
                  </p>
                  <p className="font-sans text-[9px] text-stone-500 font-light">
                    We currently deliver across India. Delivery timelines may vary depending on your location and service availability.
                  </p>
                </div>

                {/* WhatsApp Inquiry */}
                <a
                  href={getWhatsAppUrl(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-sans text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#1ebd59] transition-colors shadow-xs"
                >
                  <FaWhatsapp size={14} />
                  <span>Inquire via WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

          {/* Curated Frequently Bought Together bundle */}
          {relatedProducts.length > 0 && (
            <div className="bg-white border border-[#EDE7D9] rounded-[32px] p-6 sm:p-8 shadow-xs text-left space-y-6">
              <h4 className="font-serif text-lg font-bold text-[#2F3B0C]">Frequently Bought Together</h4>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Main Product Card preview */}
                <div className="flex gap-4 items-center bg-[#FCFAF5] p-3 rounded-2xl border border-stone-100 w-full sm:max-w-xs">
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-contain p-1" />
                  <div className="text-left">
                    <span className="font-serif text-xs font-bold text-[#2F3B0C] block line-clamp-1">{product.name}</span>
                    <span className="font-sans text-xs text-[#4E641A] font-bold">{formatCurrency(product.price)}</span>
                  </div>
                </div>

                <span className="text-stone-400 font-bold text-lg">+</span>

                {/* Bundle Item Card preview */}
                <div className="flex gap-4 items-center bg-[#FCFAF5] p-3 rounded-2xl border border-stone-100 w-full sm:max-w-xs cursor-pointer hover:border-[#4E641A] transition" onClick={() => navigate(`/products/${relatedProducts[0].slug}`)}>
                  <img src={relatedProducts[0].image || relatedProducts[0].images?.[0]?.url} alt={relatedProducts[0].name} className="w-16 h-16 object-contain p-1" />
                  <div className="text-left">
                    <span className="font-serif text-xs font-bold text-[#2F3B0C] block line-clamp-1">{relatedProducts[0].name}</span>
                    <span className="font-sans text-xs text-[#4E641A] font-bold">{formatCurrency(relatedProducts[0].price)}</span>
                  </div>
                </div>

                {/* Bundle Action */}
                <div className="sm:ml-auto text-left sm:text-right space-y-2">
                  <p className="text-xs text-stone-500 font-light">Bundle Price: <strong className="text-[#4E641A] font-bold text-sm">{formatCurrency(product.price + relatedProducts[0].price)}</strong></p>
                  <button
                    onClick={async () => {
                      if (!isAuthenticated) {
                        useAuthStore.getState().setLoginRequiredModalOpen(true);
                        return;
                      }
                      try {
                        await addToCart(product.id, getSelectedVariantId(), 1);
                        await addToCart(relatedProducts[0].id, null, 1);
                        useFeedbackStore.getState().showToast('🛍️ Bundle added to basket successfully!', 'success');
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-5 py-2.5 bg-[#4E641A] hover:bg-[#37411A] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl border-none cursor-pointer shadow-xs active:scale-95 transition"
                  >
                    Add Both to Basket
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Related seasonal harvests */}
          {relatedProducts.length > 0 && (
            <div className="flex flex-col gap-6 text-left w-full">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">Related Seasonal Harvests</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedProducts.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/products/${p.slug}`)}
                    className="group bg-white border border-[#EDE7D9] rounded-3xl overflow-hidden shadow-xxs hover:shadow-xs transition-all duration-300 cursor-pointer flex flex-col h-full"
                  >
                    <div className="relative aspect-square w-full bg-white flex items-center justify-center p-4">
                      <img src={p.image || p.images?.[0]?.url} alt={p.name} className="w-full h-full object-contain p-2 filter drop-shadow-sm group-hover:scale-103 transition duration-500" />
                    </div>
                    <div className="p-4 border-t border-stone-100 text-left space-y-1.5 flex-1 flex flex-col justify-between">
                      <strong className="font-serif text-xs font-bold text-stone-800 group-hover:text-[#4E641A] transition line-clamp-2">{p.name}</strong>
                      <span className="font-serif text-xs font-bold text-[#4E641A]">{formatCurrency(p.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently viewed list */}
          {recentlyViewed.length > 0 && (
            <div className="flex flex-col gap-6 text-left w-full border-t border-[#EDE7D9]/60 pt-10">
              <h3 className="font-serif text-xl font-bold text-[#2F3B0C]">Recently Viewed</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recentlyViewed.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/products/${p.slug}`)}
                    className="group bg-white border border-[#EDE7D9] rounded-2xl p-3 cursor-pointer hover:shadow-xxs transition flex gap-3 items-center"
                  >
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-[#FCFAF5] p-1 rounded-lg" />
                    <div className="text-left truncate">
                      <strong className="font-serif text-[11px] font-bold text-stone-850 truncate block">{p.name}</strong>
                      <span className="font-sans text-[10px] text-[#4E641A] font-bold block">{formatCurrency(p.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Mobile Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE7D9] p-3 flex gap-3 z-40 lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`flex-1 flex items-center justify-center gap-2 font-sans text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl border transition ${
              isOutOfStock || isAdding
                ? 'bg-stone-50 border border-stone-250 text-stone-400'
                : 'border-[#4E641A] text-[#4E641A] bg-[#FCFAF5] active:bg-[#FCFAF5]/50'
            }`}
          >
            <FiShoppingBag />
            <span>{isOutOfStock ? 'Sold Out' : isAdding ? 'Adding...' : 'Add to Basket'}</span>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock || isProcessing}
            className={`flex-grow flex items-center justify-center font-sans text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition ${
              isOutOfStock || isProcessing
                ? 'bg-stone-300 text-stone-400'
                : 'bg-[#4E641A] text-white active:bg-[#37411A]'
            }`}
          >
            <span>{isOutOfStock ? 'Out of Stock' : isProcessing ? 'Processing...' : 'Buy Now'}</span>
          </button>
        </div>

        {/* Product Review Success Dialog */}
        {showSuccessModal && submittedReviewDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3B0C]/40 backdrop-blur-md animate-fade-in font-sans">
            {submittedReviewDetails.rating >= 4 && (
              <canvas
                ref={(el) => {
                  if (el) triggerConfetti(el);
                }}
                className="absolute inset-0 pointer-events-none w-full h-full z-10"
              />
            )}
            <div className="relative w-full max-w-lg bg-[#FCFAF5] border border-[#EDE7D9] rounded-[32px] p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden animate-scale-up z-20">
              <div className="w-16 h-16 bg-[#4E641A]/10 text-[#4E641A] rounded-full flex items-center justify-center mb-5">
                <FiStar className="w-8 h-8 fill-current text-[#4E641A]" />
              </div>
              {submittedReviewDetails.status === 'PENDING' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 mb-4 select-none">
                  🕒 Pending Approval
                </span>
              )}
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C] mb-3 leading-snug">
                Thank You For Sharing Your Experience 🌿
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-light mb-6 px-2">
                Your review has been submitted successfully.
                <br />
                Our team will verify and publish it shortly.
              </p>
              <div className="w-full bg-white border border-[#EDE7D9] rounded-2xl p-4 mb-6 flex flex-col items-center gap-2 select-none text-xs">
                <span className="text-[9px] font-extrabold tracking-widest text-[#C68A2B] uppercase">Your Review</span>
                <span className="font-serif text-xs font-bold text-stone-850 truncate max-w-xs">{submittedReviewDetails.productName}</span>
                <div className="flex text-[#C68A2B]">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`w-4 h-4 ${i < submittedReviewDetails.rating ? 'fill-current' : 'text-stone-200'}`} />
                  ))}
                </div>
                {submittedReviewDetails.title && (
                  <span className="font-serif text-[11px] font-bold text-stone-800 italic mt-1">
                    "{submittedReviewDetails.title}"
                  </span>
                )}
              </div>
              <div className="flex gap-3 w-full font-bold text-xs select-none">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/products');
                  }}
                  className="flex-1 py-3 px-5 bg-[#4E641A] hover:bg-[#37411A] text-white rounded-xl uppercase tracking-wider border-none shadow-md cursor-pointer font-extrabold"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-3 px-5 bg-transparent border border-[#EDE7D9] hover:bg-stone-105 text-[#2F3B0C] rounded-xl uppercase tracking-wider cursor-pointer font-extrabold"
                >
                  Stay Here
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Profiler>
  );
}
