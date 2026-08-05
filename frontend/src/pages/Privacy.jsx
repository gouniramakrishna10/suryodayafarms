import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiLock,
  FiEye,
  FiUserCheck,
  FiDatabase,
  FiShare2,
  FiLayers,
  FiCheckCircle,
  FiMail,
  FiPhone,
  FiGlobe,
  FiCalendar,
  FiChevronRight,
  FiHeart,
  FiAward
} from 'react-icons/fi';
import { GiSun, GiSprout } from 'react-icons/gi';

export default function Privacy() {
  const [activeSection, setActiveSection] = useState('welcome');

  const navItems = [
    { id: 'welcome', label: 'Welcome & Introduction' },
    { id: 'info-collected', label: '1. Information We Collect' },
    { id: 'why-collected', label: '2. Why We Collect Information' },
    { id: 'protecting-info', label: '3. Protecting Your Information' },
    { id: 'sharing-info', label: '4. How We Share Information' },
    { id: 'cookies', label: '5. Cookies' },
    { id: 'your-rights', label: '6. Your Rights' },
    { id: 'data-security', label: '7. Data Security' },
    { id: 'policy-updates', label: '8. Policy Updates' },
    { id: 'contact-us', label: '9. Contact Us' },
    { id: 'privacy-promise', label: 'Our Privacy Promise' },
    { id: 'guiding-principle', label: 'Guiding Principle & Thank You' }
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ScrollSpy listener to update active Section index
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#F9F6F0] min-h-screen font-sans text-[#2F3B0C]">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F4EFE6] via-[#F9F6F0] to-[#F9F6F0] overflow-hidden border-b border-[#EDE7D9]/60">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] bg-[#4E641A]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] bg-[#B8833E]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2F3B0C] leading-[1.15] tracking-tight"
          >
            Privacy <span className="text-[#4E641A]">Policy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif italic text-xl sm:text-2xl text-[#B8833E] font-medium"
          >
            Your Privacy. Our Responsibility.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 bg-white/80 border border-[#EDE7D9] px-4 py-2 rounded-full shadow-2xs"
          >
            <FiCalendar className="text-[#4E641A]" />
            <span>Last Updated: August 2026</span>
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTENT AREA WITH STICKY TABLE OF CONTENTS */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* DESKTOP STICKY SIDEBAR TABLE OF CONTENTS */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-[calc(var(--navbar-height,80px)+20px)] space-y-4">
            <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 shadow-xs text-left space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EDE7D9]">
                <GiSprout className="text-[#4E641A] text-lg" />
                <h3 className="font-serif font-bold text-base text-[#2F3B0C]">Table of Contents</h3>
              </div>

              <nav className="space-y-1.5 text-left">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-between cursor-pointer border-none ${
                      activeSection === item.id
                        ? 'bg-[#4E641A] text-white font-bold shadow-xs'
                        : 'text-stone-600 hover:bg-[#FAF7F2] hover:text-[#2F3B0C]'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <FiChevronRight className={`text-xs shrink-0 transition-transform ${activeSection === item.id ? 'translate-x-0.5' : 'opacity-40'}`} />
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-[#FAF7F2] border border-[#EDE7D9] rounded-[28px] p-6 text-left space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E641A]">Privacy Desk</span>
              <h4 className="font-serif font-bold text-sm text-[#2F3B0C]">Have Questions About Your Data?</h4>
              <p className="text-stone-600 text-xs leading-relaxed font-sans">
                Our support team is available Monday through Saturday to address any privacy inquiries.
              </p>
              <a
                href="mailto:care@suryodayafarms.com"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#4E641A] hover:underline pt-1"
              >
                <FiMail />
                <span>care@suryodayafarms.com</span>
              </a>
            </div>
          </aside>

          {/* MAIN DOCUMENT BODY */}
          <main className="lg:col-span-8 space-y-12 text-left">
            
            {/* WELCOME SECTION */}
            <article id="welcome" className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 text-[#4E641A]">
                <div className="w-12 h-12 rounded-2xl bg-[#4E641A]/10 flex items-center justify-center text-2xl">
                  <GiSun />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8833E]">Suryodaya Farms</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">Welcome</h2>
                </div>
              </div>

              <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-4 font-sans font-normal">
                <p>Welcome to <strong>Suryodaya Farms</strong>.</p>
                <p>Thank you for placing your trust in us.</p>
                <p>
                  Just as we are committed to delivering quality natural products, we are equally committed to protecting your privacy and handling your personal information responsibly.
                </p>
                <p>
                  This Privacy Policy explains what information we collect, why we collect it, how we use it, and how we protect it.
                </p>
              </div>

              {/* Commitment Highlight Card */}
              <div className="bg-[#FAF7F2] border-l-4 border-[#4E641A] p-6 rounded-r-2xl space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4E641A] block">Our Commitment</span>
                <p className="font-serif text-base sm:text-lg font-bold text-[#2F3B0C]">
                  "We respect your privacy, protect your information, and use it responsibly."
                </p>
              </div>
            </article>

            {/* 1. INFORMATION WE COLLECT */}
            <article id="info-collected" className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 text-[#4E641A]">
                <div className="w-12 h-12 rounded-2xl bg-[#4E641A]/10 flex items-center justify-center text-xl">
                  <FiDatabase />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">1. Information We Collect</h2>
              </div>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                To provide you with the best possible service, we may collect information such as:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Name',
                  'Mobile Number',
                  'Email Address',
                  'Billing and Shipping Address',
                  'Order Details',
                  'Customer Support Enquiries',
                  'Feedback and Reviews',
                  'Website Usage Information (Cookies and Analytics)'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[#FAF8F5] border border-[#EDE7D9] p-4 rounded-2xl">
                    <FiCheckCircle className="text-[#4E641A] text-base shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-[#2F3B0C]">{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#4E641A]/5 border border-[#4E641A]/15 p-5 rounded-2xl text-xs sm:text-sm text-stone-700 font-sans">
                <strong>Data Minimization Standard:</strong> We collect only the information necessary to provide our products and services.
              </div>
            </article>

            {/* 2. WHY WE COLLECT YOUR INFORMATION */}
            <article id="why-collected" className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 text-[#4E641A]">
                <div className="w-12 h-12 rounded-2xl bg-[#4E641A]/10 flex items-center justify-center text-xl">
                  <FiUserCheck />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">2. Why We Collect Your Information</h2>
              </div>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                Your information helps us to:
              </p>

              <ul className="space-y-3 font-sans text-sm text-stone-700">
                {[
                  'Process and deliver your orders',
                  'Provide customer support',
                  'Send order confirmations and delivery updates',
                  'Respond to your enquiries',
                  'Improve our products and services',
                  'Enhance your shopping experience',
                  'Comply with applicable legal requirements'
                ].map((purpose, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-[#FAF8F5] border border-[#EDE7D9]/80 p-3.5 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-[#4E641A] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-[#2F3B0C] font-semibold pt-0.5">{purpose}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-[#B8833E]/10 border border-[#B8833E]/20 p-5 rounded-2xl text-xs sm:text-sm text-[#2F3B0C] font-sans">
                <strong>Legitimate Business Use:</strong> We use your information only for legitimate business purposes related to serving you better.
              </div>
            </article>

            {/* 3. PROTECTING YOUR INFORMATION */}
            <article id="protecting-info" className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 text-[#4E641A]">
                <div className="w-12 h-12 rounded-2xl bg-[#4E641A]/10 flex items-center justify-center text-xl">
                  <FiLock />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">3. Protecting Your Information</h2>
              </div>

              <div className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans space-y-4">
                <p>We understand that your personal information is valuable.</p>
                <p>
                  We use appropriate administrative, technical, and organizational safeguards to help protect your information from unauthorized access, misuse, alteration, or disclosure.
                </p>
                <p className="font-semibold text-[#2F3B0C]">
                  Protecting your privacy is one of our ongoing responsibilities.
                </p>
              </div>
            </article>

            {/* 4. HOW WE SHARE YOUR INFORMATION */}
            <article id="sharing-info" className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 text-[#4E641A]">
                <div className="w-12 h-12 rounded-2xl bg-[#4E641A]/10 flex items-center justify-center text-xl">
                  <FiShare2 />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">4. How We Share Your Information</h2>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3">
                <FiCheckCircle className="text-emerald-600 text-xl shrink-0" />
                <span>Zero Sale Policy: We do not sell, rent, or trade your personal information.</span>
              </div>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                Your information may be shared only when necessary, such as with:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Delivery Partners', desc: 'To ship and track your orders safely to your doorstep.' },
                  { title: 'Payment Gateways', desc: 'Secure PCI-DSS compliant providers processing transaction payments.' },
                  { title: 'Technology Service Providers', desc: 'Infrastructure providers supporting our secure website.' },
                  { title: 'Legal Authorities', desc: 'Government or regulatory authorities when strictly required by law.' }
                ].map((partner, idx) => (
                  <div key={idx} className="bg-[#FAF8F5] border border-[#EDE7D9] p-5 rounded-2xl space-y-1">
                    <h4 className="font-serif font-bold text-sm text-[#2F3B0C]">{partner.title}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{partner.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#FAF7F2] border border-[#EDE7D9] p-4 rounded-xl text-xs text-stone-700 font-sans">
                <strong>Strict Boundary:</strong> We share only the minimum information necessary to provide our services.
              </div>
            </article>

            {/* 5. COOKIES */}
            <article id="cookies" className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 text-[#4E641A]">
                <div className="w-12 h-12 rounded-2xl bg-[#4E641A]/10 flex items-center justify-center text-xl">
                  <FiLayers />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">5. Cookies</h2>
              </div>

              <div className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans space-y-4">
                <p>
                  Our website may use cookies and similar technologies to improve website performance, understand visitor preferences, and enhance your browsing experience.
                </p>
                <p>
                  You may manage your cookie preferences through your browser settings at any time.
                </p>
              </div>
            </article>

            {/* 6. YOUR RIGHTS */}
            <article id="your-rights" className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 text-[#4E641A]">
                <div className="w-12 h-12 rounded-2xl bg-[#4E641A]/10 flex items-center justify-center text-xl">
                  <FiEye />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">6. Your Rights</h2>
              </div>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                We believe you should remain in control of your personal information. Where applicable, you may request to:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Access your personal information',
                  'Correct inaccurate information',
                  'Update your details',
                  'Request deletion of your information',
                  'Opt out of promotional communications'
                ].map((right, idx) => (
                  <div key={idx} className="bg-[#FAF8F5] border border-[#EDE7D9] p-4 rounded-2xl flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#4E641A] shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-[#2F3B0C]">{right}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-stone-600 font-sans pt-2">
                We will respond to such requests in accordance with applicable laws.
              </p>
            </article>

            {/* 7. DATA SECURITY */}
            <article id="data-security" className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 text-[#4E641A]">
                <div className="w-12 h-12 rounded-2xl bg-[#4E641A]/10 flex items-center justify-center text-xl">
                  <FiShield />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">7. Data Security</h2>
              </div>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                Although no online system can guarantee absolute security, we continuously work to protect your information through appropriate security practices and regular improvements.
              </p>
            </article>

            {/* 8. POLICY UPDATES */}
            <article id="policy-updates" className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 text-[#4E641A]">
                <div className="w-12 h-12 rounded-2xl bg-[#4E641A]/10 flex items-center justify-center text-xl">
                  <FiCalendar />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">8. Policy Updates</h2>
              </div>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                As our business grows and regulations evolve, we may update this Privacy Policy. The latest version will always be available on our website.
              </p>
            </article>

            {/* 9. CONTACT US */}
            <article id="contact-us" className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 text-[#4E641A]">
                <div className="w-12 h-12 rounded-2xl bg-[#4E641A]/10 flex items-center justify-center text-xl">
                  <FiMail />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">9. Contact Us</h2>
              </div>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                If you have any questions regarding this Privacy Policy or how your information is handled, please feel free to contact us. We will be happy to assist you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <a href="mailto:care@suryodayafarms.com" className="bg-[#FAF8F5] border border-[#EDE7D9] p-5 rounded-2xl hover:border-[#4E641A] transition text-center space-y-1">
                  <FiMail className="text-[#4E641A] text-xl mx-auto" />
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Email</span>
                  <span className="text-xs font-bold text-[#2F3B0C] block truncate">care@suryodayafarms.com</span>
                </a>

                <a href="tel:+919100422140" className="bg-[#FAF8F5] border border-[#EDE7D9] p-5 rounded-2xl hover:border-[#4E641A] transition text-center space-y-1">
                  <FiPhone className="text-[#4E641A] text-xl mx-auto" />
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Phone</span>
                  <span className="text-xs font-bold text-[#2F3B0C] block">+91 9100422140</span>
                </a>

                <a href="https://www.suryodayafarms.com" target="_blank" rel="noopener noreferrer" className="bg-[#FAF8F5] border border-[#EDE7D9] p-5 rounded-2xl hover:border-[#4E641A] transition text-center space-y-1">
                  <FiGlobe className="text-[#4E641A] text-xl mx-auto" />
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Website</span>
                  <span className="text-xs font-bold text-[#2F3B0C] block truncate">www.suryodayafarms.com</span>
                </a>
              </div>
            </article>

            {/* 10. OUR PRIVACY PROMISE (GLASSMORPHIC CALLOUT CARD) */}
            <article id="privacy-promise" className="bg-white/80 backdrop-blur-md border border-[#4E641A]/30 rounded-[36px] p-8 sm:p-12 shadow-lg relative overflow-hidden space-y-6 scroll-mt-28">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#4E641A]/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 text-[#4E641A]">
                <FiAward className="text-3xl shrink-0" />
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">Our Privacy Promise</h2>
              </div>

              <div className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans space-y-4 font-normal">
                <p>At Suryodaya Farms, privacy is more than a policy—it is a responsibility.</p>
                <p>When you choose us, you trust us not only with your order but also with your personal information.</p>
                <p>We honour that trust by handling your information with care, respect, integrity, and responsibility.</p>
                <p className="font-bold text-[#2F3B0C] text-base sm:text-lg pt-2">
                  We believe that protecting your privacy is just as important as maintaining the quality of our products.
                </p>
              </div>
            </article>

            {/* 11. OUR GUIDING PRINCIPLE & THANK YOU */}
            <article id="guiding-principle" className="space-y-8 scroll-mt-28">
              
              {/* Highlighted Quote Box */}
              <div className="dark-section bg-[#2F3B0C] text-white rounded-[36px] p-9 sm:p-14 shadow-xl text-center space-y-4 relative overflow-hidden">
                <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-[#4E641A]/30 rounded-full blur-3xl pointer-events-none" />
                
                <span className="text-xs font-bold uppercase tracking-widest text-[#B8833E]">Our Guiding Principle</span>
                <blockquote className="font-serif text-xl sm:text-2xl font-bold italic max-w-2xl mx-auto leading-relaxed">
                  "When you share your information with Suryodaya Farms, you place your trust in us. We are committed to protecting that trust with honesty, responsibility, and respect."
                </blockquote>
              </div>

              {/* Thank You Section */}
              <div className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-12 shadow-xs text-center space-y-6">
                <div className="w-14 h-14 rounded-full bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center text-2xl mx-auto">
                  <FiHeart />
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Thank You</h3>

                <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
                  Thank you for choosing Suryodaya Farms. Your confidence in us inspires us to continuously improve—not only in the products we create but also in the way we protect your privacy and serve you. We value your trust and remain committed to earning it every day.
                </p>

                <div className="pt-4 border-t border-[#EDE7D9]/80 max-w-lg mx-auto">
                  <p className="font-serif text-sm font-bold italic text-[#4E641A]">
                    "Every policy we create is not only to protect our company—it is also to protect the trust our customers place in us."
                  </p>
                </div>
              </div>

            </article>

          </main>

        </div>
      </section>

      {/* FOOTER BUFFER */}
      <div className="bg-gradient-to-b from-[#F9F6F0] to-[#F4EFE6] pt-10 pb-6 border-t border-[#EDE7D9]/40" />

    </div>
  );
}
