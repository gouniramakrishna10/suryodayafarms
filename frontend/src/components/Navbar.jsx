import React, { useState, useEffect, useRef, memo } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiChevronRight, FiShoppingBag, FiUser, FiTrash2, FiPlus, FiMinus, FiHeart } from 'react-icons/fi';
import { GiSun } from 'react-icons/gi';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { getOptimizedImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageOptimizer';

const Navbar = memo(function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Global stores bindings
  const { user, isAuthenticated, setAuthModalOpen } = useAuthStore();
  const { cartItems, subtotal, updateQuantity, removeItem, fetchCart } = useCartStore();
  const wishlistItems = useWishlistStore(state => state.wishlistItems);

  // Dynamically calculate and set current navbar height on root element
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (navRef.current) {
        const height = navRef.current.offsetHeight;
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    };

    updateHeaderHeight();

    let resizeObserver;
    if (navRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(navRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [isScrolled, isCartOpen, isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when drawers are open
  useEffect(() => {
    if (isMobileMenuOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isCartOpen]);

  // Fetch cart on mount or when auth state updates
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Close overlays on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Our Team', path: '/our-team' },
    { label: 'Products', path: '/products' },
    { label: 'FAQs', path: '/faq' },
    { label: 'Become a Partner', path: '/become-a-partner' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      setAuthModalOpen(true);
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out px-2.5 xs:px-3 sm:px-8 lg:px-16 xl:px-20 border-b app-header-nav ${
          isScrolled || isCartOpen || isMobileMenuOpen
            ? 'bg-[#FBF9F4]/95 backdrop-blur-md shadow-md border-[#E8E3D6] py-2 xs:py-2.5 sm:py-3 lg:py-4'
            : 'bg-[#FBF9F4]/90 backdrop-blur-md border-[#E8E3D6] py-2.5 xs:py-3 sm:py-3.5 lg:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-0">
          
          {/* LEFT: Compact Responsive Logo & Brand Information */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group select-none text-left shrink-0 transition-transform duration-300 hover:opacity-95"
          >
            <img 
              src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
              alt="Suryodaya Farms Logo" 
              loading="eager"
              fetchPriority="high"
              className="w-12 h-12 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 object-contain transition-all duration-300 filter drop-shadow-2xs group-hover:scale-[1.04] shrink-0"
            />
            <div className="flex flex-col justify-center text-left shrink-0 space-y-0.5">
              <span className="font-serif text-[16px] sm:text-base md:text-lg lg:text-xl font-bold tracking-wider text-[#2F2F2F] group-hover:text-[#556B2F] transition-colors duration-300 uppercase leading-none whitespace-nowrap">
                SURYODAYA FARMS
              </span>
              <span className="font-sans text-[7.5px] sm:text-[8.5px] md:text-[9px] font-bold tracking-wider text-[#556B2F] uppercase leading-none flex items-center gap-0.5 sm:gap-1 mt-0.5 whitespace-nowrap">
                <span>PURE</span>
                <span className="text-[#C68A2B]">•</span>
                <span>NATURAL</span>
                <span className="text-[#C68A2B]">•</span>
                <span>NUTRITIOUS</span>
              </span>
            </div>
          </Link>

          {/* CENTER: Navigation Menu (Desktop) */}
          <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 mx-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  relative font-sans text-[15px] font-medium tracking-wide py-1.5 transition-all duration-300 select-none cursor-pointer transform hover:-translate-y-0.5
                  ${isActive 
                    ? 'text-[#556B2F] font-semibold' 
                    : 'text-[#2F2F2F]/85 hover:text-[#556B2F]'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    <span 
                      className={`absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#556B2F] rounded-full transition-all duration-300 origin-left ${
                        isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100'
                      }`} 
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* RIGHT: Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-transparent hover:bg-[#556B2F]/10 text-[#2F2F2F] hover:text-[#556B2F] transition-all duration-300 transform hover:scale-105 relative cursor-pointer"
              title="Wishlist"
            >
              <FiHeart size={21} className="stroke-[1.8px]" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#556B2F] text-white font-sans text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FBF9F4] shadow-2xs">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Profile Button */}
            <button
              onClick={handleProfileClick}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-transparent hover:bg-[#556B2F]/10 text-[#2F2F2F] hover:text-[#556B2F] transition-all duration-300 transform hover:scale-105 relative cursor-pointer"
              title={isAuthenticated ? "My Account" : "Sign In / Login"}
            >
              <FiUser size={21} className="stroke-[1.8px]" />
              {isAuthenticated && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#556B2F] border-2 border-[#FBF9F4]" />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-transparent hover:bg-[#556B2F]/10 text-[#2F2F2F] hover:text-[#556B2F] transition-all duration-300 transform hover:scale-105 relative cursor-pointer ml-1"
              title="Shopping Cart"
            >
              <FiShoppingBag size={21} className="stroke-[1.8px]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#556B2F] text-white font-sans text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FBF9F4] shadow-2xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Actions & Menu Trigger: Layout [Wishlist] [Account] [Cart] [☰] */}
          <div className="lg:hidden flex items-center gap-0.5 xs:gap-1 sm:gap-2 shrink-0 ml-auto pl-1">
            {/* 1. Wishlist Icon */}
            <Link
              to="/wishlist"
              className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#2F2F2F] hover:text-[#556B2F] hover:bg-[#556B2F]/10 active:bg-[#556B2F]/20 transition-colors relative cursor-pointer shrink-0"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <FiHeart size={18} className="stroke-[2px]" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#556B2F] text-white font-sans text-[8.5px] font-bold w-3.5 h-3.5 xs:w-4 xs:h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* 2. Account Icon */}
            <button
              onClick={handleProfileClick}
              className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#2F2F2F] hover:text-[#556B2F] hover:bg-[#556B2F]/10 active:bg-[#556B2F]/20 transition-colors relative cursor-pointer shrink-0"
              title={isAuthenticated ? "My Account" : "Sign In / Login"}
              aria-label={isAuthenticated ? "My Account" : "Sign In"}
            >
              <FiUser size={18} className="stroke-[2px]" />
              {isAuthenticated && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-[#556B2F] border border-white" />
              )}
            </button>

            {/* 3. Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#2F2F2F] hover:text-[#556B2F] hover:bg-[#556B2F]/10 active:bg-[#556B2F]/20 transition-colors relative cursor-pointer shrink-0"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <FiShoppingBag size={18} className="stroke-[2px]" />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#556B2F] text-white font-sans text-[8.5px] font-bold w-3.5 h-3.5 xs:w-4 xs:h-4 rounded-full flex items-center justify-center border border-white">
                  {totalCartCount}
                </span>
              )}
            </button>
            
            {/* 4. Hamburger Menu Icon (Clearly Visible 40px-44px Touch Target) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9.5 h-9.5 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-[#2F2F2F] hover:text-[#556B2F] bg-[#556B2F]/12 hover:bg-[#556B2F]/22 active:bg-[#556B2F]/30 transition-all cursor-pointer shrink-0 ml-0.5 border border-[#556B2F]/20"
              title={isMobileMenuOpen ? "Close Menu" : "Open Navigation Menu"}
              aria-label={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
            >
              {isMobileMenuOpen ? (
                <FiX size={21} className="stroke-[2.5px] text-[#556B2F]" />
              ) : (
                <FiMenu size={21} className="stroke-[2.5px] text-[#2F2F2F]" />
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* Cart Drawer Sliding Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[#2F2F2F]/45 backdrop-blur-xs transition-opacity duration-350 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-md z-[60] bg-[#FBF9F4] shadow-2xl border-l border-[#E8E3D6] flex flex-col justify-between py-8 px-6 transition-transform duration-350 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden text-left">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8E3D6] pb-5 shrink-0">
            <span className="font-serif text-xl font-bold text-[#2F2F2F] flex items-center gap-2.5">
              <FiShoppingBag className="text-[#556B2F]" />
              <span>Shopping Cart</span>
            </span>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-[#2F2F2F] p-1.5 rounded-full bg-[#E8E3D6]/50 hover:bg-[#556B2F]/15 transition-colors cursor-pointer"
            >
              <FiX size={19} />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-grow overflow-y-auto py-6 flex flex-col gap-5 no-scrollbar">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center gap-4">
                <FiShoppingBag className="text-[#2F2F2F]/20 text-5xl" />
                <p className="font-serif text-base text-[#2F2F2F] font-semibold">Your cart is empty.</p>
                <p className="font-sans text-xs text-stone-600 max-w-[220px] mx-auto">Explore our pure natural staples and nourish your family with trusted care.</p>
                <Link
                  to="/products"
                  onClick={() => setIsCartOpen(false)}
                  className="font-sans text-xs font-bold tracking-widest uppercase bg-[#556B2F] hover:bg-[#3F5023] text-white px-6 py-3 rounded-xl shadow-sm block text-center mt-2 transition-colors"
                >
                  Explore Staples
                </Link>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemPrice = item.variant ? item.variant.price : item.product.price;
                const rawImgUrl = typeof item.product?.images?.[0] === 'string' ? item.product.images[0] : (item.product?.images?.[0]?.url || item.product?.image);
                const itemImg = getOptimizedImageUrl(rawImgUrl, { width: 80, height: 80, cropMode: 'fit' });
                
                return (
                  <div key={item.id} className="flex gap-4 items-start border-b border-[#E8E3D6]/60 pb-5 last:border-b-0">
                    <div className="w-16 h-16 bg-transparent shrink-0 flex items-center justify-center relative">
                      <img
                        src={itemImg}
                        alt={item.product.name}
                        onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                        className="w-full h-full object-contain p-1 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.08)]"
                      />
                    </div>
                    <div className="flex-grow flex flex-col gap-1">
                      <span className="font-serif text-sm font-bold text-[#2F2F2F] leading-tight">
                        {item.product.name}
                      </span>
                      {item.variant && (
                        <span className="font-sans text-[10px] text-[#C68A2B] uppercase tracking-wider font-semibold">
                          Variant: {item.variant.name}
                        </span>
                      )}
                      
                      <div className="flex justify-between items-center mt-2.5">
                        {/* Quantity triggers */}
                        <div className="flex items-center border border-[#E8E3D6] rounded-lg bg-white">
                          <button
                            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                            className="p-1.5 text-[#2F2F2F] hover:text-[#556B2F]"
                          >
                            <FiMinus size={10} />
                          </button>
                          <span className="font-sans text-xs font-semibold px-2.5 text-[#2F2F2F] select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-[#2F2F2F] hover:text-[#556B2F]"
                          >
                            <FiPlus size={10} />
                          </button>
                        </div>

                        <span className="font-serif text-sm font-bold text-[#556B2F]">
                          ₹{itemPrice * item.quantity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Remove Item"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Subtotal & Checkout links */}
          {cartItems.length > 0 && (
            <div className="border-t border-[#E8E3D6] pt-5 shrink-0 flex flex-col gap-4">
              <div className="flex justify-between items-baseline font-serif text-base font-bold text-[#2F2F2F]">
                <span>Subtotal Basket:</span>
                <span className="text-[#556B2F] text-lg">₹{subtotal}</span>
              </div>
              
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    if (isAuthenticated) {
                      navigate('/checkout');
                    } else {
                      useAuthStore.getState().setCheckoutResumeRedirect('/checkout');
                      setAuthModalOpen(true);
                    }
                  }}
                  className="w-full font-sans text-xs font-bold tracking-widest uppercase bg-[#556B2F] text-white py-3.5 rounded-xl hover:bg-[#3F5023] transition-colors shadow-md text-center block cursor-pointer"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full font-sans text-xs font-bold tracking-widest uppercase border border-[#E8E3D6] text-[#2F2F2F] py-3.5 rounded-xl hover:bg-[#E8E3D6]/40 transition-colors text-center block bg-white"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Slide-In Nav Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-[#2F2F2F]/50 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Navigation Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] sm:w-[320px] max-w-sm z-[70] bg-[#FBF9F4] shadow-2xl border-l border-[#E8E3D6] flex flex-col justify-between py-6 px-5 sm:px-6 transition-transform duration-350 ease-in-out lg:hidden overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#E8E3D6] pb-4 text-left">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                <img 
                  src="https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png" 
                  alt="Suryodaya Farms Logo" 
                  className="h-10 w-auto object-contain"
                />
                <div className="flex flex-col justify-center">
                  <span className="font-serif text-base font-bold text-[#2F2F2F] leading-none uppercase tracking-wider">
                    Suryodaya
                  </span>
                  <span className="font-sans text-[8.5px] font-semibold tracking-[0.2em] text-[#C68A2B] mt-0.5 uppercase">
                    Farms
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#2F2F2F] p-2.5 rounded-full bg-[#E8E3D6]/50 hover:bg-[#556B2F]/15 hover:text-[#556B2F] transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <FiX size={20} className="stroke-[2.5px]" />
              </button>
            </div>

            {/* Navigation Menu Links */}
            <nav className="flex flex-col gap-1.5 mt-5 text-left">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center justify-between font-sans text-sm font-semibold tracking-wide py-3 px-4 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-[#556B2F] text-white shadow-md font-bold'
                      : 'text-[#2F2F2F] hover:bg-[#556B2F]/10 hover:text-[#556B2F]'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <span>{item.label}</span>
                      <FiChevronRight size={16} className={`transition-transform ${isActive ? 'translate-x-0.5' : 'text-[#2F2F2F]/40'}`} />
                    </>
                  )}
                </NavLink>
              ))}

              <div className="border-t border-[#E8E3D6] my-2 pt-2 flex flex-col gap-1">
                <NavLink
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center justify-between font-sans text-sm font-semibold tracking-wide py-3 px-4 rounded-xl transition-all duration-200
                    ${isActive ? 'bg-[#556B2F] text-white font-bold shadow-md' : 'text-[#2F2F2F] hover:bg-[#556B2F]/10 hover:text-[#556B2F]'}
                  `}
                >
                  <span className="flex items-center gap-2.5">
                    <FiHeart size={16} />
                    <span>Wishlist</span>
                  </span>
                  {wishlistItems.length > 0 && (
                    <span className="bg-[#556B2F] text-white font-sans text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                </NavLink>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full flex items-center justify-between font-sans text-sm font-semibold tracking-wide py-3 px-4 rounded-xl text-[#2F2F2F] hover:bg-[#556B2F]/10 hover:text-[#556B2F] bg-transparent border-none cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <FiShoppingBag size={16} className="text-[#556B2F]" />
                    <span>Cart</span>
                  </span>
                  {totalCartCount > 0 && (
                    <span className="bg-[#556B2F] text-white font-sans text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {totalCartCount}
                    </span>
                  )}
                </button>
              </div>
            </nav>
          </div>

          {/* Drawer Footer Actions */}
          <div className="pt-4 border-t border-[#E8E3D6] flex flex-col gap-3 mt-auto">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleProfileClick();
              }}
              className="w-full flex items-center justify-center gap-2 font-sans text-xs font-bold tracking-widest uppercase bg-[#C68A2B] hover:bg-[#B8833E] text-white py-3.5 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <FiUser size={16} />
              <span>{isAuthenticated ? "My Account / Orders" : "Sign In / Login"}</span>
            </button>
            <div className="text-center pt-1">
              <span className="font-sans text-[7.5px] font-bold tracking-wider text-[#556B2F] uppercase flex items-center justify-center gap-1">
                <span>PURE</span>
                <span className="text-[#C68A2B]">•</span>
                <span>NATURAL</span>
                <span className="text-[#C68A2B]">•</span>
                <span>NUTRITIOUS</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default Navbar;
