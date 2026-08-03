import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiBox,
  FiTruck,
  FiGlobe,
  FiLayers,
  FiBriefcase,
  FiHeart,
  FiCheck,
  FiPhoneCall,
  FiMail,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import { GiSprout, GiSun, GiWheat, GiHand } from 'react-icons/gi';
import api from '../utils/api';

export default function Partner() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    businessType: '',
    gstNumber: '',
    email: '',
    phone: '',
    country: 'India',
    state: '',
    city: '',
    website: '',
    partnershipType: 'Distributor',
    yearsInBusiness: '',
    monthlyRequirement: '',
    businessDescription: '',
    message: '',
    agreeToContact: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const partnershipTypes = [
    'Distributor',
    'Retailer',
    'Wholesaler',
    'Exporter',
    'Institution',
    'Corporate Buyer',
    'Private Label',
    'Strategic Partner',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const scrollToForm = () => {
    const el = document.getElementById('partner-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.companyName || !formData.businessType || !formData.email || !formData.phone || !formData.country || !formData.state || !formData.city) {
      setErrorMessage('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    if (!formData.agreeToContact) {
      setErrorMessage('Please confirm agreement to be contacted by Suryodaya Farms.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/public/partner-request', formData);
      if (response && response.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          companyName: '',
          businessType: '',
          gstNumber: '',
          email: '',
          phone: '',
          country: 'India',
          state: '',
          city: '',
          website: '',
          partnershipType: 'Distributor',
          yearsInBusiness: '',
          monthlyRequirement: '',
          businessDescription: '',
          message: '',
          agreeToContact: false
        });
      } else {
        setErrorMessage(response?.message || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'An error occurred while submitting your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Content Arrays
  const partnershipOpportunities = [
    { title: 'Distribution Partnerships', desc: 'Expand Suryodaya Farms’ pristine Vedic staples across regional, state, and nationwide distribution networks.', icon: FiTruck },
    { title: 'Wholesale Supply', desc: 'Bulk procurement and direct farm supply for grain merchants, food traders, and commercial aggregators.', icon: FiBox },
    { title: 'Retail & Supermarket Partnerships', desc: 'Premium shelf placement and co-branded retail programs for organic chains and modern trade stores.', icon: FiBriefcase },
    { title: 'Institutional & Corporate Supply', desc: 'Healthy, chemical-free nutrition programs tailored for corporate cafeterias, wellness retreats, and educational institutions.', icon: FiUsers },
    { title: 'Export Opportunities', desc: 'International distribution of ISO-standard heirloom millets, cold-pressed oils, and Vedic Bilona Ghee worldwide.', icon: FiGlobe },
    { title: 'Private Label & Contract Manufacturing', desc: 'Custom white-label packaging and contract processing adhering to clean-room hygienic food standards.', icon: FiLayers },
    { title: 'Strategic Product Collaborations', desc: 'Co-creating functional health foods, ancient grain blends, and natural wellness innovations.', icon: GiSprout }
  ];

  const whyPartnerWithUs = [
    { title: 'Premium-Quality Natural Products', desc: '100% heirloom seeds, unadulterated processing, and chemical-free soil nutrition.' },
    { title: 'Science-Guided Product Development', desc: 'Preserving ancient Vedic wisdom with modern enzyme testing and strict quality protocols.' },
    { title: 'Carefully Selected Ingredients', desc: 'Hand-sorted grains and seed selections from certified biodiverse farms.' },
    { title: 'Hygienic Manufacturing', desc: 'Low-temperature processing under 35°C in clean-room certified processing units.' },
    { title: 'Food Grade Packaging', desc: 'Aroma-sealed, moisture-barrier food grade packaging for extended shelf stability.' },
    { title: 'Ethical Business Practices', desc: 'Transparent pricing, fair trade farmer support, and dependable commercial contracts.' },
    { title: 'Reliable Customer Support', desc: 'Dedicated partner relationship managers and quick inquiry turnaround times.' },
    { title: 'Continuous Product Innovation', desc: 'Regular releases of novel millet blends, health superfoods, and cold-pressed oils.' },
    { title: 'Long-Term Business Relationships', desc: 'Building sustainable commercial growth founded on mutual respect and shared profitability.' },
    { title: 'Sustainable Growth', desc: 'Ecological responsibility aligned with scalable commercial success.' }
  ];

  const ourPromises = [
    'Respect for Nature',
    'Science-Guided Product Development',
    'Quality Without Compromise',
    'Honest Relationships',
    'Continuous Innovation',
    'Sustainable Growth',
    'Shared Success'
  ];

  const whatYouCanExpect = [
    'Consistent Product Quality',
    'Responsible Quality Management',
    'Reliable Supply Support',
    'Professional Customer Service',
    'Transparent Communication',
    'Ethical Business Practices',
    'Continuous Product Innovation',
    'Long-Term Collaboration',
    'Mutual Growth Opportunities'
  ];

  return (
    <div className="bg-[#F9F6F0] min-h-screen pt-24 pb-16 font-sans text-[#2F3B0C]">
      
      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#F4EFE6] via-[#F9F6F0] to-[#F9F6F0] overflow-hidden border-b border-[#EDE7D9]/60">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4E641A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#B8833E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#4E641A]/10 border border-[#4E641A]/20 text-[#4E641A] text-xs font-semibold uppercase tracking-wider mx-auto"
          >
            <GiSun className="text-[#B8833E] text-base" />
            <span>Growing Together. Building a Healthier Future.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2F3B0C] leading-tight"
          >
            Partner with <span className="text-[#4E641A]">Suryodaya Farms</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-stone-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed"
          >
            At Suryodaya Farms, we believe meaningful partnerships are built on trust, shared values, integrity, and long-term success. Whether you're a distributor, retailer, wholesaler, exporter, institution, entrepreneur, or corporate buyer, we welcome opportunities to grow together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Become a Partner</span>
              <FiArrowRight className="text-base" />
            </button>

            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-white hover:bg-[#F4EFE6] text-[#2F3B0C] border border-[#EDE7D9] font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <span>Contact Our Team</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 1: PARTNERSHIP OPPORTUNITIES */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-sans text-xs font-semibold text-[#B8833E] uppercase tracking-widest">Collaborative Avenues</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C]">Partnership Opportunities</h2>
          <p className="text-stone-600 text-sm">Explore tailored channels to bring natural, unadulterated staples to your customers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partnershipOpportunities.map((opp, idx) => {
            const Icon = opp.icon;
            return (
              <motion.div
                key={opp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white border border-[#EDE7D9] p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#4E641A]/40 transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center text-2xl group-hover:bg-[#4E641A] group-hover:text-white transition-colors duration-300">
                    <Icon />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition-colors">{opp.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{opp.desc}</p>
                </div>
                <div className="pt-6 border-t border-[#EDE7D9]/50 mt-6 flex items-center gap-2 text-xs font-bold text-[#4E641A] uppercase tracking-wider">
                  <span>Explore Collaboration</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: WHY PARTNER WITH US */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-y border-[#EDE7D9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="font-sans text-xs font-semibold text-[#4E641A] uppercase tracking-widest">Our Foundation</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C]">Why Partner With Us</h2>
            <p className="text-stone-600 text-sm">Built on relentless product standards, ethical farming, and long-term trust.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {whyPartnerWithUs.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="bg-white border border-[#EDE7D9] p-6 rounded-2xl shadow-xs hover:border-[#4E641A] hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-full bg-[#B8833E]/10 text-[#B8833E] flex items-center justify-center text-sm font-bold mb-3">
                    <FiCheck />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#2F3B0C] mb-2 leading-snug">{item.title}</h4>
                  <p className="text-stone-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: OUR PARTNERSHIP PHILOSOPHY */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#2F3B0C] to-[#1E2707] text-white p-10 sm:p-16 rounded-[40px] shadow-2xl relative overflow-hidden text-center space-y-6"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <GiSprout className="text-4xl text-[#B8833E] mx-auto" />
          
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#B8833E] block">Our Partnership Philosophy</span>

          <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl font-light italic leading-relaxed text-[#F9F6F0] max-w-3xl mx-auto">
            "A true partnership is not simply about doing business together. It is about growing together, learning together, creating lasting value, and building relationships founded on trust, integrity, and shared success."
          </blockquote>

          <div className="w-16 h-0.5 bg-[#B8833E] mx-auto rounded-full" />
          <span className="font-sans text-xs font-semibold tracking-wider text-stone-300 block">Suryodaya Farms Leadership Core</span>
        </motion.div>
      </section>

      {/* SECTION 4: OUR SHARED VISION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto border-b border-[#EDE7D9]">
        <div className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-14 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 relative">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-md border border-[#EDE7D9]">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"
                alt="Suryodaya Organic Farm Fields"
                className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-[#4E641A] text-white p-4 rounded-2xl shadow-lg font-serif text-xs font-bold uppercase tracking-wider hidden sm:block">
              Organic Farming Excellence
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8833E]/10 text-[#B8833E] text-xs font-semibold uppercase tracking-wider">
              <GiSun />
              <span>Forward Together</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C]">Our Shared Vision</h2>
            <p className="font-serif text-lg text-stone-700 italic leading-relaxed">
              "We envision a future where responsible businesses work together to make premium-quality natural nutrition more accessible, inspire healthier lifestyles, strengthen communities, and create lasting value for future generations."
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: OUR PROMISE */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-sans text-xs font-semibold text-[#4E641A] uppercase tracking-widest">Unwavering Commitments</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C]">Our Promise</h2>
          <p className="text-stone-600 text-sm">Every agreement and product batch is anchored in these seven core principles.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ourPromises.map((promise, idx) => (
            <motion.div
              key={promise}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white border border-[#EDE7D9] p-6 rounded-2xl shadow-xs hover:border-[#4E641A] hover:shadow-md transition duration-300 flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#4E641A]/10 text-[#4E641A] shrink-0 flex items-center justify-center font-bold">
                <FiCheckCircle size={20} />
              </div>
              <span className="font-serif text-base font-bold text-[#2F3B0C]">{promise}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 6: WHAT YOU CAN EXPECT */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-t border-[#EDE7D9]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="font-sans text-xs font-semibold text-[#B8833E] uppercase tracking-widest">Operational Standards</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C]">What You Can Expect</h2>
            <p className="text-stone-600 text-sm">A seamless, reliable partnership experience engineered for commercial performance.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whatYouCanExpect.map((item, idx) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="bg-white border border-[#EDE7D9] p-6 rounded-2xl shadow-xs flex items-center gap-3.5 text-left"
              >
                <div className="w-3 h-3 rounded-full bg-[#B8833E] shrink-0" />
                <span className="font-serif text-base font-semibold text-[#2F3B0C]">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: JOIN HANDS WITH SURYODAYA FARMS (CTA BANNER) */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto my-8">
        <div className="bg-[#2F3B0C] text-white rounded-[36px] p-8 sm:p-14 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#4E641A]/30 rounded-full blur-3xl pointer-events-none" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">Join Hands With Suryodaya Farms</h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto">
            Take the first step towards building a resilient, high-growth commercial partnership rooted in natural purity.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToForm}
              className="bg-[#4E641A] hover:bg-white hover:text-[#2F3B0C] text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-2xl shadow-lg transition duration-300 cursor-pointer"
            >
              Become a Partner
            </button>
            <Link
              to="/contact"
              className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-2xl transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* PARTNER APPLICATION FORM SECTION */}
      <section id="partner-form-section" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-14 shadow-xl text-left">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4E641A]/10 text-[#4E641A] text-xs font-semibold uppercase tracking-wider">
              <GiHand />
              <span>Application Portal</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C]">Submit Partnership Request</h2>
            <p className="text-stone-600 text-sm">Fill out your organization details below. Our business development team will review your application within 24 hours.</p>
          </div>

          <AnimatePresence mode="wait">
            {submitSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-16 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-[#4E641A]/10 text-[#4E641A] rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                  <FiCheckCircle className="animate-bounce" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Partnership Request Received!</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Thank you for submitting your application. A confirmation message has been logged. Our representative will get in touch with you shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white font-sans text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl transition duration-300 cursor-pointer"
                >
                  Submit Another Request
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                    <FiAlertCircle className="shrink-0 text-base" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Grid 1: Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Green Earth Traders Pvt Ltd"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>
                </div>

                {/* Grid 2: Business Type & GST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Business Type *</label>
                    <input
                      type="text"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Wholesale Trader / Supermarket Chain"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">GST Number (Optional)</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 36AAAAA0000A1Z5"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>
                </div>

                {/* Grid 3: Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. partner@company.com"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>
                </div>

                {/* Grid 4: Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Telangana"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Hyderabad"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>
                </div>

                {/* Grid 5: Partnership Type & Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Partnership Type *</label>
                    <select
                      name="partnershipType"
                      value={formData.partnershipType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    >
                      {partnershipTypes.map(pt => (
                        <option key={pt} value={pt}>{pt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Business Website (Optional)</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>
                </div>

                {/* Grid 6: Business Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Years in Business</label>
                    <input
                      type="text"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleInputChange}
                      placeholder="e.g. 5 Years"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Monthly Requirement</label>
                    <input
                      type="text"
                      name="monthlyRequirement"
                      value={formData.monthlyRequirement}
                      onChange={handleInputChange}
                      placeholder="e.g. 500 Quintals / 2000 Units"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Business Description</label>
                  <textarea
                    name="businessDescription"
                    rows={3}
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your existing distribution, retail presence, or market operations..."
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Additional Message</label>
                  <textarea
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Any specific questions or proposals..."
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                  />
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="agreeToContact"
                    name="agreeToContact"
                    checked={formData.agreeToContact}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#4E641A] accent-[#4E641A] rounded focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="agreeToContact" className="text-xs text-stone-600 cursor-pointer select-none">
                    I agree to be contacted by Suryodaya Farms regarding this partnership inquiry. *
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#4E641A] hover:bg-[#2F3B0C] disabled:bg-stone-400 text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase py-4 rounded-2xl shadow-lg transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Partnership Request</span>
                      <FiArrowRight className="text-base" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
}
