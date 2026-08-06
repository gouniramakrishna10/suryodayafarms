import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiYoutube, FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { GiSun } from 'react-icons/gi';
import { useSettingsStore } from '../store/useSettingsStore';

const Footer = memo(function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { settings, fetchSettings } = useSettingsStore();
  
  // Mobile accordion states
  const [activeAccordion, setActiveAccordion] = useState({
    quickLinks: false,
    contact: false,
    newsletter: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const toggleAccordion = (sec) => {
    setActiveAccordion(prev => ({
      ...prev,
      [sec]: !prev[sec]
    }));
  };

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Products', path: '/products' },
    { label: 'Become a Partner', path: '/become-a-partner' },
    { label: 'FAQs', path: '/faq' },
    { label: 'Contact', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy' },
  ];

  return (
    <footer className="dark-section bg-dark-olive text-cream-bg pt-10 pb-6 px-4 md:pt-16 md:pb-8 md:px-12 border-t border-primary-green/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 mb-8 md:mb-16">
        
        {/* Brand Section */}
        <div className="flex flex-col gap-4 text-left border-b border-primary-green/10 md:border-b-0 pb-6 md:pb-0">
          <Link to="/" className="flex items-center gap-2 cursor-pointer select-none">
            <GiSun className="text-sunrise-gold text-3xl animate-spin-slow" />
            <div className="flex flex-col text-left">
              <span className="font-serif text-2xl font-bold tracking-wide text-white">
                SURYODAYA FARMS
              </span>
            </div>
          </Link>
          <p className="font-sans text-xs sm:text-sm text-light-beige/80 leading-relaxed font-normal">
            Rooted in nature and guided by science, we produce pure, nutrient-rich superfoods with uncompromising quality. Carefully crafted to support healthier lives and promote natural wellness.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-green/30 flex items-center justify-center text-light-beige hover:bg-sunrise-gold hover:text-dark-olive transition-all duration-300">
              <FiInstagram size={18} />
            </a>
            <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-green/30 flex items-center justify-center text-light-beige hover:bg-sunrise-gold hover:text-dark-olive transition-all duration-300">
              <FiFacebook size={18} />
            </a>
            <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-green/30 flex items-center justify-center text-light-beige hover:bg-sunrise-gold hover:text-dark-olive transition-all duration-300">
              <FiYoutube size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links Accordion */}
        <div className="flex flex-col gap-3 md:gap-5 lg:pl-8 border-b border-primary-green/10 md:border-b-0 pb-4 md:pb-0">
          <button
            onClick={() => toggleAccordion('quickLinks')}
            className="w-full md:pointer-events-none flex items-center justify-between font-serif text-base sm:text-lg font-semibold tracking-wide text-white border-b border-primary-green/20 pb-2 text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none"
          >
            <span>Quick Navigation</span>
            <span className="md:hidden text-sunrise-gold text-sm font-bold">
              {activeAccordion.quickLinks ? '−' : '+'}
            </span>
          </button>
          <ul className={`flex flex-col gap-3 transition-all duration-300 md:flex ${activeAccordion.quickLinks ? 'flex' : 'hidden'}`}>
            {quickLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="font-sans text-xs sm:text-sm text-light-beige/75 hover:text-sunrise-gold transition-colors duration-300 flex items-center gap-1 group text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sunrise-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info Accordion */}
        <div className="flex flex-col gap-3 md:gap-5 border-b border-primary-green/10 md:border-b-0 pb-4 md:pb-0">
          <button
            onClick={() => toggleAccordion('contact')}
            className="w-full md:pointer-events-none flex items-center justify-between font-serif text-base sm:text-lg font-semibold tracking-wide text-white border-b border-primary-green/20 pb-2 text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none"
          >
            <span>Contact Information</span>
            <span className="md:hidden text-sunrise-gold text-sm font-bold">
              {activeAccordion.contact ? '−' : '+'}
            </span>
          </button>
          <ul className={`flex flex-col gap-3.5 text-left transition-all duration-300 md:flex ${activeAccordion.contact ? 'flex' : 'hidden'}`}>
            <li className="flex gap-3 items-start">
              <FiMapPin className="text-sunrise-gold text-base mt-0.5 shrink-0" />
              <span className="font-sans text-xs sm:text-sm text-light-beige/75 leading-relaxed font-light">
                {settings.address?.includes('India') ? settings.address : `${settings.address}, India`}
              </span>
            </li>
            <li className="flex gap-3 items-center">
              <FiPhone className="text-sunrise-gold text-sm shrink-0" />
              <a href={`tel:${settings.phone?.replace(/\s/g, '') || '+919100422140'}`} className="font-sans text-xs sm:text-sm text-light-beige/75 hover:text-sunrise-gold transition-colors font-light">
                {settings.phone || '+91 9100422140'}
              </a>
            </li>
            <li className="flex gap-3 items-center">
              <FaWhatsapp className="text-[#25D366] text-base shrink-0" />
              <a
                href="https://wa.me/919100422140"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-xs sm:text-sm text-light-beige/75 hover:text-[#25D366] transition-colors font-light"
              >
                +91 9100422140
              </a>
            </li>
            <li className="flex gap-3 items-center">
              <FiMail className="text-sunrise-gold text-sm shrink-0" />
              <a href={`mailto:${settings.email || 'care@suryodayafarms.com'}`} className="font-sans text-xs sm:text-sm text-light-beige/75 hover:text-sunrise-gold transition-colors font-light">
                {settings.email || 'care@suryodayafarms.com'}
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Section Accordion */}
        <div className="flex flex-col gap-3 md:gap-5">
          <button
            onClick={() => toggleAccordion('newsletter')}
            className="w-full md:pointer-events-none flex items-center justify-between font-serif text-base sm:text-lg font-semibold tracking-wide text-white border-b border-primary-green/20 pb-2 text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none"
          >
            <span>Suryodaya Farms Newsletter</span>
            <span className="md:hidden text-sunrise-gold text-sm font-bold">
              {activeAccordion.newsletter ? '−' : '+'}
            </span>
          </button>
          <div className={`flex flex-col gap-3 transition-all duration-300 md:flex ${activeAccordion.newsletter ? 'flex' : 'hidden'}`}>
            <p className="font-sans text-xs sm:text-sm text-light-beige/70 leading-relaxed font-light text-left">
              Stay connected with us. Subscribe to receive wellness tips, superfood insights, product updates, new launches, exclusive offers, and the latest news from Suryodaya Farms—delivered directly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center mt-1 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full bg-[#394713] border border-primary-green/40 rounded-full py-2.5 px-4 pr-10 font-sans text-xs text-white placeholder-light-beige/40 focus:outline-none focus:border-sunrise-gold transition-colors duration-300"
                required
              />
              <button
                type="submit"
                className="absolute right-1 w-8 h-8 rounded-full bg-sunrise-gold flex items-center justify-center text-dark-olive hover:bg-white hover:text-primary-green transition-all duration-300 cursor-pointer"
              >
                <FiArrowRight size={14} />
              </button>
            </form>
            {subscribed && (
              <p className="font-sans text-xs text-sunrise-gold animate-pulse text-left">
                Thank you! You are now subscribed to the Suryodaya Farms Newsletter.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-primary-green/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="font-sans text-[10px] sm:text-xs text-light-beige/50 text-center md:text-left">
          © {new Date().getFullYear()} {settings.companyName || 'Suryodaya Farms'}. All rights reserved.
        </p>
        <p className="font-sans text-[10px] sm:text-xs text-light-beige/40 text-center md:text-right flex items-center gap-1 font-light">
          Nurtured by Nature. Perfected by Science.
        </p>
      </div>
    </footer>
  );
});

export default Footer;
