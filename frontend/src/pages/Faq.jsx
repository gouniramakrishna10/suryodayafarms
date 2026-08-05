import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiPhone,
  FiHelpCircle,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiAward,
  FiMessageSquare,
  FiSend,
  FiPaperclip,
  FiX,
  FiAlertCircle,
  FiLayers
} from 'react-icons/fi';
import { GiSun, GiSprout, GiShield, GiHeartOrgan } from 'react-icons/gi';
import api from '../utils/api';

export default function Faq() {
  const location = useLocation();

  // Search, Filter & Accordion States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openFaqIds, setOpenFaqIds] = useState([]);

  // Contact Support Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'General',
    message: '',
    orderNumber: '',
    attachment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    'All',
    'General',
    'Products',
    'Quality',
    'Usage',
    'Storage',
    'Customer Support'
  ];

  const commitmentCards = [
    { title: 'Respect for Nature', desc: 'Chemical-free soil nutrition, heirloom non-hybrid seeds, and regenerative farming practices.', icon: GiSprout },
    { title: 'Science-Guided Development', desc: 'Preserving ancient Vedic processing while testing enzyme activity and purity under 35°C.', icon: FiAward },
    { title: 'Quality Without Compromise', desc: 'Hand-sorted crops, unadulterated ingredients, and clean-room hygienic packaging.', icon: FiShield },
    { title: 'Honest Communication', desc: 'Complete transparency regarding farm origins, processing methods, and nutritional values.', icon: FiMessageSquare },
    { title: 'Customer Trust', desc: 'A sacred obligation to deliver pure, nourishing staples directly from our farm fields to your home.', icon: GiHeartOrgan }
  ];

  const faqsList = [
    {
      id: 1,
      category: 'General',
      question: 'Why should I choose Suryodaya Farms?',
      answer: 'Suryodaya Farms is dedicated to regenerative Vedic agriculture, heirloom non-hybrid seeds, and chemical-free soil nutrition in Wardha. We carefully process every staple under 35°C to preserve vital enzymes, natural aroma, and mineral richness.'
    },
    {
      id: 2,
      category: 'General',
      question: 'What makes Suryodaya Farms different from other brands?',
      answer: 'Unlike mass-market brands that rely on high-temperature machinery, artificial polishing, and synthetic additives, Suryodaya Farms preserves traditional Vedic methods like wooden Ghani cold-pressing and authentic Vedic Bilona ghee churning from A2 Gir cows.'
    },
    {
      id: 3,
      category: 'General',
      question: 'Who develops Suryodaya Farms products?',
      answer: 'Our products are guided by experienced Vedic agricultural practitioners, food technology experts, and traditional farming families who combine ancient wisdom with modern quality testing.'
    },
    {
      id: 4,
      category: 'Quality',
      question: 'How do you maintain product quality?',
      answer: 'We enforce strict end-to-end quality controls—from seed selection and pesticide-free organic soil nutrition to clean-room packaging and batch-level quality testing.'
    },
    {
      id: 5,
      category: 'Quality',
      question: 'Why do you describe your products as Science-Guided?',
      answer: 'While we honor traditional Vedic farming rituals, we validate our methods using science—measuring nutrient retention, soil microbial activity, and zero-chemical purity standards.'
    },
    {
      id: 6,
      category: 'Customer Support',
      question: 'Do you really listen to customer feedback?',
      answer: 'Absolutely. Customer feedback is central to our continuous innovation process. We review every suggestion, product review, and inquiry to refine our offerings and service.'
    },
    {
      id: 7,
      category: 'Customer Support',
      question: 'What if I am not satisfied with a product?',
      answer: 'Your trust is paramount. If you receive a product that does not meet our quality promise, our Customer Support team will happily resolve the issue with a replacement or full refund.'
    },
    {
      id: 8,
      category: 'Quality',
      question: 'Why may natural products vary slightly in colour, aroma, or taste?',
      answer: 'Because our crops are grown naturally without synthetic dyes, artificial flavor enhancers, or chemical standardization, seasonal variations in sunlight, rain, and harvest batches naturally influence shade and aroma.'
    },
    {
      id: 9,
      category: 'Products',
      question: 'Are your products 100% natural?',
      answer: 'Yes, 100%. All Suryodaya Farms products are completely free from synthetic chemicals, artificial fertilizers, toxic pesticides, and genetic modification.'
    },
    {
      id: 10,
      category: 'Products',
      question: 'Do your products contain artificial colours, flavours, or preservatives?',
      answer: 'Never. We strictly prohibit artificial food dyes, synthetic fragrance enhancers, chemical bleaching agents, or harmful preservatives.'
    },
    {
      id: 11,
      category: 'Usage',
      question: 'How should I use Suryodaya Farms products?',
      answer: 'Our products are natural daily food staples and functional nutrition items. Usage instructions and traditional recipe recommendations are provided on each product packaging label.'
    },
    {
      id: 12,
      category: 'Products',
      question: 'Are Suryodaya Farms products medicines?',
      answer: 'No. Suryodaya Farms products are wholesome, natural food staples and organic dietary ingredients designed to nourish your daily life, not pharmaceutical medicines.'
    },
    {
      id: 13,
      category: 'Storage',
      question: 'How should I store the products after opening?',
      answer: 'Store in a cool, dry place away from direct sunlight inside airtight glass or food-grade containers to preserve freshness, natural aroma, and essential oils.'
    },
    {
      id: 14,
      category: 'Customer Support',
      question: 'What should I do if my package is damaged?',
      answer: 'If your package arrives damaged, please take a quick photo and contact our support team immediately via phone, email, or the form below. We will send a prompt replacement.'
    },
    {
      id: 15,
      category: 'Quality',
      question: 'Do you continue improving your products?',
      answer: 'Yes. We continuously invest in sustainable packaging improvements, eco-friendly processing refinements, and expanded natural product offerings based on customer insights.'
    },
    {
      id: 16,
      category: 'Customer Support',
      question: 'What does customer trust mean to Suryodaya Farms?',
      answer: 'Customer trust is our sacred responsibility. It represents the sacred bond between our farm fields and your family table, built on complete honesty, quality, and care.'
    }
  ];

  // Deep linking: Open FAQ matching URL hash on mount or hash change
  useEffect(() => {
    if (location.hash) {
      const match = location.hash.match(/#faq-(\d+)/);
      if (match && match[1]) {
        const idNum = parseInt(match[1], 10);
        if (!openFaqIds.includes(idNum)) {
          setOpenFaqIds(prev => [...prev, idNum]);
        }
        setTimeout(() => {
          const el = document.getElementById(`faq-item-${idNum}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [location.hash]);

  // Filtered FAQs based on category and search query
  const filteredFaqs = faqsList.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id) => {
    if (openFaqIds.includes(id)) {
      setOpenFaqIds(prev => prev.filter(i => i !== id));
    } else {
      setOpenFaqIds(prev => [...prev, id]);
    }
  };

  const handleExpandAll = () => {
    setOpenFaqIds(filteredFaqs.map(f => f.id));
  };

  const handleCollapseAll = () => {
    setOpenFaqIds([]);
  };

  const scrollToSupportForm = () => {
    const el = document.getElementById('support-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.category || !formData.message) {
      setErrorMessage('Please fill in all mandatory fields marked with (*).');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/public/support-request', formData);
      if (response && response.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          category: 'General',
          message: '',
          orderNumber: '',
          attachment: ''
        });
      } else {
        setErrorMessage(response?.message || 'Failed to submit support request.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9F6F0] min-h-screen pt-24 pb-16 font-sans text-[#2F3B0C]">
      
      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#F4EFE6] via-[#F9F6F0] to-[#F9F6F0] overflow-hidden border-b border-[#EDE7D9]/60">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4E641A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#B8833E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#4E641A]/10 border border-[#4E641A]/20 text-[#4E641A] text-xs font-semibold uppercase tracking-wider mx-auto"
          >
            <GiSun className="text-[#B8833E] text-base" />
            <span>We're Here to Help</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2F3B0C] leading-tight"
          >
            Customer Care & <span className="text-[#4E641A]">Support Centre</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-stone-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed"
          >
            At Suryodaya Farms, we believe every question deserves a clear, honest, and respectful answer. Whether you'd like to know more about our products, ingredients, quality practices, packaging, or how to use our products, our team is always happy to assist you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={scrollToSupportForm}
              className="inline-flex items-center gap-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Contact Support</span>
              <FiArrowRight className="text-base" />
            </button>

            <Link
              to="/become-a-partner"
              className="inline-flex items-center gap-3 bg-white hover:bg-[#F4EFE6] text-[#2F3B0C] border border-[#EDE7D9] font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <span>Become a Partner</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* OUR COMMITMENT SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-b border-[#EDE7D9]">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="font-sans text-xs font-semibold text-[#B8833E] uppercase tracking-widest">Pillars of Trust</span>
          <h2 className="font-serif text-3xl font-bold text-[#2F3B0C]">Our Commitment</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {commitmentCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-[#EDE7D9] p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-[#4E641A]/40 transition duration-300 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center text-xl mb-4">
                    <Icon />
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#2F3B0C] mb-2 leading-snug">{card.title}</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SEARCHABLE FAQ SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <span className="font-sans text-xs font-semibold text-[#4E641A] uppercase tracking-widest">Find Direct Answers</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C]">Frequently Asked Questions</h2>
          <p className="text-stone-600 text-sm max-w-xl mx-auto">Search our knowledge base or filter by category to find instant answers.</p>

          {/* Search Input Bar */}
          <div className="relative max-w-xl mx-auto pt-4">
            <FiSearch className="absolute left-4 top-1/2 translate-y-1 text-stone-400 text-lg" />
            <input
              type="text"
              placeholder="Search questions (e.g. storage, natural, ghee, delivery)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-4 bg-white border border-[#EDE7D9] rounded-2xl text-sm text-[#2F3B0C] shadow-sm focus:ring-2 focus:ring-[#4E641A] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 translate-y-1 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-[#EDE7D9] pb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#4E641A] text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-[#EDE7D9] hover:bg-[#FAF7F2]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-[#4E641A]">
            <button
              onClick={handleExpandAll}
              className="hover:underline cursor-pointer bg-transparent border-none"
            >
              Expand All
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={handleCollapseAll}
              className="hover:underline cursor-pointer bg-transparent border-none text-stone-500 hover:text-stone-700"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 text-left">
          {filteredFaqs.length === 0 ? (
            <div className="py-16 text-center bg-white border border-[#EDE7D9] rounded-3xl p-8 space-y-3">
              <FiHelpCircle className="text-4xl text-stone-300 mx-auto" />
              <p className="font-serif text-lg font-bold text-[#2F3B0C]">No matching questions found.</p>
              <p className="text-xs text-stone-500">Try searching for different keywords or select "All" categories.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${
                    isOpen ? 'border-[#4E641A] shadow-md' : 'border-[#EDE7D9] shadow-xs hover:border-[#4E641A]/50'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-6 text-left flex items-start justify-between gap-4 cursor-pointer bg-transparent border-none"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#B8833E] block">
                        {faq.category}
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#2F3B0C]">
                        {faq.id}. {faq.question}
                      </h3>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'bg-[#4E641A] text-white rotate-180' : 'bg-[#FAF7F2] text-[#2F3B0C]'
                    }`}>
                      <FiChevronDown size={18} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-[#EDE7D9]/60 px-6 py-5 bg-[#FAF7F2]/40"
                      >
                        <p className="text-stone-700 text-sm leading-relaxed font-sans">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* STILL NEED HELP CTA SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto my-8">
        <div className="dark-section bg-[#2F3B0C] text-white rounded-[36px] p-8 sm:p-14 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-[#4E641A]/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sunrise-gold text-xs font-semibold uppercase tracking-wider mx-auto">
            <FiHelpCircle />
            <span>Dedicated Support</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold">Didn't find your answer?</h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto">
            Our Customer Support Team will be happy to assist you with any questions or order inquiries.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToSupportForm}
              className="bg-[#4E641A] hover:bg-white hover:text-[#2F3B0C] text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-2xl shadow-lg transition duration-300 cursor-pointer"
            >
              Contact Support
            </button>

            <a
              href="mailto:care@suryodayafarms.com"
              className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-2xl transition duration-300 flex items-center gap-2"
            >
              <FiMail />
              <span>Email Us</span>
            </a>

            <a
              href="tel:+919100422140"
              className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-2xl transition duration-300 flex items-center gap-2"
            >
              <FiPhone />
              <span>Call Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* SUPPORT CONTACT FORM SECTION */}
      <section id="support-form-section" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-14 shadow-xl text-left">
          
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="font-sans text-xs font-semibold text-[#4E641A] uppercase tracking-widest">Get In Touch</span>
            <h2 className="font-serif text-3xl font-bold text-[#2F3B0C]">Send Us a Message</h2>
            <p className="text-stone-600 text-sm">Please fill out the form below. We will respond to your query within 24 hours.</p>
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
                  <h3 className="font-serif text-2xl font-bold text-[#2F3B0C]">Support Request Submitted!</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Thank you. We have received your support inquiry. A confirmation message has been recorded. Our team will contact you shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white font-sans text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl transition duration-300 cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleFormSubmit}
                className="space-y-6"
              >
                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                    <FiAlertCircle className="shrink-0 text-base" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Ananya Sharma"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. ananya@example.com"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>
                </div>

                {/* Row 2: Phone & Order Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. +91 9100422140"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Order Number (Optional)</label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. SUR-100234"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>
                </div>

                {/* Row 3: Category & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Inquiry Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    >
                      <option value="General">General</option>
                      <option value="Products">Products & Ingredients</option>
                      <option value="Quality">Quality & Standards</option>
                      <option value="Usage">Usage & Storage</option>
                      <option value="Customer Support">Orders & Delivery</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Storage recommendations for A2 Ghee"
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                    />
                  </div>
                </div>

                {/* Row 4: Message */}
                <div>
                  <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Message *</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Please write your detailed inquiry here..."
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                  />
                </div>

                {/* Attachment Link Optional */}
                <div>
                  <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2">Attachment URL / Image Link (Optional)</label>
                  <input
                    type="url"
                    name="attachment"
                    value={formData.attachment}
                    onChange={handleInputChange}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EDE7D9] rounded-xl focus:ring-2 focus:ring-[#4E641A] focus:outline-none text-sm text-[#2F3B0C]"
                  />
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
                      <FiSend className="text-base" />
                      <span>Submit Support Request</span>
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
