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
  FiAlertCircle,
  FiCompass,
  FiStar
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

  // Structured client lists with associated visual icons for clean grid rendering
  const partnershipOpportunities = [
    { title: 'Distribution Partnerships', icon: FiTruck },
    { title: 'Wholesale Supply', icon: FiBox },
    { title: 'Retail & Supermarket Partnerships', icon: FiBriefcase },
    { title: 'Institutional & Corporate Supply', icon: FiUsers },
    { title: 'Export Opportunities', icon: FiGlobe },
    { title: 'Private Label & Contract Manufacturing', icon: FiLayers },
    { title: 'Product Development & Strategic Collaborations', icon: GiSprout }
  ];

  const whyPartnerItems = [
    'Premium-Quality Natural Products',
    'Science-Guided Product Development',
    'Carefully Selected Ingredients',
    'Hygienic Processing & Quality-Focused Manufacturing',
    'Food-Grade Packaging',
    'Ethical & Transparent Business Practices',
    'Reliable Customer Service',
    'Continuous Product Improvement',
    'Long-Term Business Relationships',
    'Sustainable Growth through Mutual Success'
  ];

  const promiseValues = [
    'Respect for Nature',
    'Science-Guided Product Development',
    'Quality without Compromise',
    'Honest & Transparent Relationships',
    'Continuous Innovation',
    'Sustainable Growth',
    'Shared Success'
  ];

  const expectItems = [
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
    <div className="bg-[#F9F6F0] min-h-screen font-sans text-[#2F3B0C] selection:bg-[#4E641A] selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-24 lg:pb-28 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#F4EFE6] via-[#FAF7F2] to-[#F9F6F0] overflow-hidden border-b border-[#EDE7D9]">
        <div className="absolute -top-48 -left-48 w-[540px] h-[540px] bg-[#4E641A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-48 w-[540px] h-[540px] bg-[#B8833E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#4E641A_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#4E641A]/10 border border-[#4E641A]/20 backdrop-blur-md text-[#4E641A] text-xs sm:text-sm font-semibold uppercase tracking-widest mx-auto shadow-xs"
          >
            <GiSun className="text-[#B8833E] text-lg" />
            <span>Growing Together. Building a Healthier Future.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#2F3B0C] leading-[1.12] tracking-tight max-w-6xl mx-auto whitespace-nowrap"
          >
            Partner with <span className="text-[#4E641A]">Suryodaya Farms</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center pt-4"
          >
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.99] cursor-pointer"
            >
              <span>Submit Partnership Request</span>
              <FiArrowRight className="text-lg" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. INTRODUCTION */}
      <section className="py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <div className="w-16 h-1 bg-[#4E641A] rounded-full mb-8" />
          <div className="space-y-6 text-stone-700 text-base sm:text-lg lg:text-xl font-sans leading-[1.8] font-normal">
            <p className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#2F3B0C] font-semibold leading-relaxed">
              At Suryodaya Farms, we believe that the strongest partnerships are built on trust, shared values, mutual respect, integrity, and a common purpose.
            </p>
            <p>
              We warmly welcome distributors, retailers, wholesalers, exporters, institutions, corporate buyers, entrepreneurs, and strategic business partners to join us on our journey.
            </p>
            <p>
              Together, we can achieve more than business success. We can make premium-quality natural nutrition more accessible, inspire healthier lifestyles, strengthen healthier communities, and create lasting value for future generations.
            </p>
            <p className="font-bold text-[#2F3B0C] pt-2 border-l-4 border-[#B8833E] pl-6 italic">
              We believe that when people work together with honesty, responsibility, and a shared vision, everyone grows—our partners, our customers, our communities, and our future.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PARTNERSHIP OPPORTUNITIES */}
      <section className="py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-sans text-xs font-bold text-[#B8833E] uppercase tracking-widest">Collaborative Avenues</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">Partnership Opportunities</h2>
            <p className="text-stone-600 text-base sm:text-lg font-sans">We welcome collaborations in the following areas:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {partnershipOpportunities.map((opp, idx) => {
              const Icon = opp.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-white border border-[#EDE7D9] p-8 sm:p-10 rounded-[28px] shadow-xs hover:shadow-xl hover:border-[#4E641A]/50 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center text-2xl group-hover:bg-[#4E641A] group-hover:text-white transition-colors duration-300 shadow-inner">
                      <Icon />
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition-colors leading-snug">
                      {opp.title}
                    </h3>
                  </div>
                  <div className="pt-8 border-t border-[#EDE7D9]/60 mt-8 flex items-center gap-2 text-xs font-bold text-[#4E641A] uppercase tracking-wider">
                    <span>Explore Collaboration</span>
                    <FiArrowRight className="group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. WHY PARTNER WITH SURYODAYA FARMS? */}
      <section className="py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-5xl mx-auto space-y-4">
            <span className="font-sans text-xs font-bold text-[#4E641A] uppercase tracking-widest">Our Foundation</span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2F3B0C] whitespace-nowrap">Why Partner with Suryodaya Farms?</h2>
            <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-sans font-normal">
              When you choose Suryodaya Farms, you gain more than a supplier—you gain a reliable business partner committed to long-term success.
            </p>
            <p className="text-[#4E641A] text-sm sm:text-base font-bold uppercase tracking-wider pt-2">
              We are committed to providing:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-5xl mx-auto">
            {whyPartnerItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
                className="bg-[#FAF7F2] border border-[#EDE7D9] p-6 sm:p-8 rounded-[24px] shadow-xs flex items-center gap-4 hover:border-[#4E641A] hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-full bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center text-base font-bold shrink-0 shadow-inner">
                  ✔
                </div>
                <span className="font-serif text-base sm:text-lg font-bold text-[#2F3B0C]">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LET'S BEGIN THE JOURNEY TOGETHER */}
      <section className="py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 bg-[#F4EFE6] border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-[#EDE7D9] rounded-[40px] p-10 sm:p-16 shadow-lg text-center space-y-8 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-[#B8833E]/10 text-[#B8833E] flex items-center justify-center text-3xl mx-auto">
              <GiSprout />
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">Let's Begin the Journey Together</h2>
            
            <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-relaxed font-sans max-w-2xl mx-auto">
              <p>
                Whether you are an established organization or an emerging entrepreneur, we would be delighted to explore opportunities to work with you.
              </p>
              <p>
                If our values align with yours, let us build a partnership founded on trust, quality, innovation, responsibility, and long-term success.
              </p>
              <p className="font-bold text-[#2F3B0C] text-lg sm:text-xl pt-2">
                Our team looks forward to understanding your business goals and exploring opportunities to grow together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OUR PARTNERSHIP PHILOSOPHY */}
      <section className="py-28 sm:py-36 lg:py-40 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#2F3B0C] to-[#1E2707] text-white relative overflow-hidden dark-section">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:32px_32px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <span className="text-7xl font-serif text-[#B8833E]/50 leading-none block select-none">“</span>
          
          <span className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-[#B8833E] block">Our Partnership Philosophy</span>

          <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light italic leading-relaxed text-[#F9F6F0] max-w-4xl mx-auto">
            "A true partnership is not simply about doing business together. It is about growing together, learning together, creating lasting value, and building relationships founded on trust, integrity, and shared success."
          </blockquote>

          <div className="w-24 h-1 bg-[#B8833E] mx-auto rounded-full mt-8" />
        </div>
      </section>

      {/* 7. OUR SHARED VISION */}
      <section className="py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="font-sans text-xs font-bold text-[#4E641A] uppercase tracking-widest">Forward Together</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">Our Shared Vision</h2>
          
          <div className="space-y-6 text-stone-700 text-base sm:text-lg lg:text-xl leading-relaxed font-sans max-w-3xl mx-auto">
            <p>
              We envision a future where responsible businesses work together to make premium-quality natural nutrition more accessible for everyone.
            </p>
            <p className="font-bold text-[#2F3B0C] font-serif text-xl sm:text-2xl leading-relaxed italic text-[#4E641A] pt-4 border-t border-[#EDE7D9]">
              Together, we can inspire healthier lifestyles, strengthen healthier communities, support sustainable growth, and create a brighter future for generations to come.
            </p>
          </div>
        </div>
      </section>

      {/* 8. OUR PROMISE TO EVERY PARTNER (PREMIUM 2-COLUMN LAYOUT) */}
      <section className="py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-sans text-xs font-bold text-[#B8833E] uppercase tracking-widest">Unwavering Principles</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">Our Promise to Every Partner</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Intro Paragraphs */}
            <div className="lg:col-span-6 space-y-6 text-left text-stone-700 text-base sm:text-lg leading-relaxed font-sans">
              <div className="bg-white border border-[#EDE7D9] rounded-[32px] p-8 sm:p-10 shadow-xs space-y-6">
                <p>
                  When you partner with Suryodaya Farms, you become more than a business associate.
                </p>
                <p>
                  You become part of a relationship built on trust, shared growth, professional excellence, and a common commitment to delivering premium-quality natural products with integrity.
                </p>
                <p className="font-bold text-[#4E641A] text-lg pt-2 border-t border-[#EDE7D9]">
                  Every partnership is guided by our core values:
                </p>
              </div>
            </div>

            {/* Right Column: Values Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {promiseValues.map((val, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="bg-white border border-[#EDE7D9] p-6 rounded-2xl shadow-xs flex items-center gap-3.5 hover:border-[#4E641A] hover:shadow-md transition duration-200"
                >
                  <div className="w-3 h-3 rounded-full bg-[#4E641A] shrink-0" />
                  <span className="font-serif text-base font-bold text-[#2F3B0C]">{val}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Full Width Concluding Statement */}
          <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-8 sm:p-10 shadow-xs text-center max-w-4xl mx-auto">
            <p className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C] italic leading-relaxed">
              Because we believe your success is our success, and our growth is meaningful only when we grow together.
            </p>
          </div>
        </div>
      </section>

      {/* 9. WHAT YOU CAN EXPECT */}
      <section className="py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-sans text-xs font-bold text-[#4E641A] uppercase tracking-widest">Operational Excellence</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">What You Can Expect</h2>
            <p className="text-stone-700 text-base sm:text-lg font-sans">As our business partner, you can expect:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {expectItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="bg-[#FAF7F2] border border-[#EDE7D9] p-8 rounded-[24px] shadow-xs flex items-center gap-4 hover:bg-white hover:border-[#4E641A]/50 hover:shadow-md transition-all duration-300"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-[#B8833E] shrink-0" />
                <span className="font-serif text-base sm:text-lg font-bold text-[#2F3B0C]">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. OUR COMMITMENT */}
      <section className="py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 bg-[#F4EFE6] border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-[#EDE7D9] rounded-[40px] p-10 sm:p-16 shadow-lg text-center space-y-8">
            <span className="font-sans text-xs font-bold text-[#B8833E] uppercase tracking-widest">Our Promise</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">Our Commitment</h2>
            
            <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-relaxed font-sans max-w-2xl mx-auto">
              <p>
                Every decision we make is guided by our commitment to quality, integrity, responsibility, and continuous improvement.
              </p>
              <p>
                We strive to build partnerships that create value not only for businesses, but also for customers, communities, and society.
              </p>
              <p className="font-bold text-[#2F3B0C] text-lg sm:text-xl pt-2">
                Our goal is to establish relationships that are trusted, sustainable, and beneficial for everyone involved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. JOIN HANDS WITH SURYODAYA FARMS & APPLICATION FORM */}
      <section id="partner-form-section" className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-12 bg-[#2F3B0C] text-white relative overflow-hidden dark-section">
        <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12 text-center relative z-10">
          <div className="space-y-6 max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight whitespace-nowrap">
              Join Hands with Suryodaya Farms
            </h2>
            <p className="text-white/90 text-base sm:text-lg lg:text-xl leading-relaxed font-sans font-normal">
              At Suryodaya Farms, we believe every successful partnership begins with trust and grows through shared commitment. Whether you are expanding your business, entering new markets, or looking for a dependable partner, we are ready to grow with you. Together, let us deliver premium-quality natural nutrition, inspire healthier lifestyles, help build healthier communities, and create lasting value for generations to come.
            </p>
            <p className="text-white/90 text-base sm:text-lg lg:text-xl leading-relaxed font-sans font-medium pt-4 border-t border-white/20">
              Because true success is measured not only by business growth, but also by the trust we earn, the relationships we build, the lives we enrich, and the positive impact we create for society.
            </p>
          </div>

          {/* APPLICATION FORM INSIDE SECTION 11 */}
          <div className="bg-white text-[#2F3B0C] border border-[#EDE7D9] rounded-[36px] p-8 sm:p-14 shadow-2xl text-left mt-8 sm:mt-10">
            {/* Header above form */}
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4E641A]/10 border border-[#4E641A]/20 text-[#4E641A] text-xs font-bold uppercase tracking-widest shadow-2xs">
                <GiSprout className="text-[#4E641A] text-sm" />
                <span>Application Portal</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#2F3B0C] leading-tight">
                Join Our Partnership Network
              </h3>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans font-normal max-w-2xl mx-auto">
                Complete the application below to explore partnership opportunities with Suryodaya Farms. Our team will carefully review your submission and get in touch with you to discuss the next steps.
              </p>

              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#C68A2B]/60 to-transparent mx-auto pt-1 rounded-full" />
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
                    <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">Partnership Request Received!</h4>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      Thank you for submitting your application. A confirmation message has been logged. Our representative will get in touch with you shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white font-sans text-xs font-bold uppercase tracking-wider px-9 py-4 rounded-xl transition duration-200 cursor-pointer shadow-md"
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
                  className="space-y-7"
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
                        className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Company / Organization Name *</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Apex Organic Distributors"
                        className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                      />
                    </div>
                  </div>

                  {/* Grid 2: Business Type & GST */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Business Type *</label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                      >
                        <option value="">Select Business Type</option>
                        {partnershipTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">GST / Tax Registration No.</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. 36AAAAA0000A1Z5"
                        className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                      />
                    </div>
                  </div>

                  {/* Grid 3: Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Business Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. partner@company.com"
                        className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Phone / Mobile Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. +91 9876543210"
                        className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
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
                        className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">State / Province *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Telangana"
                        className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
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
                        className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                      />
                    </div>
                  </div>

                  {/* Additional details */}
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Brief Business Overview & Partnership Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Share brief details about your organization, operating regions, and partnership goals..."
                      className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>

                  {/* Consent checkbox */}
                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="agreeToContact"
                      name="agreeToContact"
                      checked={formData.agreeToContact}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-[#4E641A] focus:ring-[#4E641A] border-[#EDE7D9] rounded cursor-pointer"
                    />
                    <label htmlFor="agreeToContact" className="text-xs text-stone-600 cursor-pointer">
                      I agree to be contacted by Suryodaya Farms representative regarding this partnership inquiry.
                    </label>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#4E641A] hover:bg-[#2F3B0C] text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase py-4 rounded-xl shadow-lg transition duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <span>Submit Partnership Request</span>
                        <FiArrowRight />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 12. FOOTER MOTTO */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto text-center border-t border-[#EDE7D9] bg-[#FAF7F2]">
        <div className="space-y-5">
          <h3 className="font-serif text-4xl sm:text-5xl font-bold text-[#2F3B0C]">Suryodaya Farms</h3>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-[#B8833E]">
            NATURE • SCIENCE • QUALITY • TRUST
          </p>
          <p className="font-serif text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl italic text-[#4E641A] font-semibold max-w-full mx-auto leading-relaxed whitespace-nowrap">
            Together, We Cultivate Trust, Deliver Quality, and Grow a Healthier Future.
          </p>
        </div>
      </section>

    </div>
  );
}
