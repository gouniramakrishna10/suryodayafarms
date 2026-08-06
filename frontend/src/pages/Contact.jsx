import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiArrowRight,
  FiBriefcase,
  FiShield,
  FiExternalLink,
  FiAlertCircle,
  FiArrowUpRight
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { GiSprout, GiSun, GiWheat } from 'react-icons/gi';
import SectionBadge from '../components/SectionBadge';
import api from '../utils/api';
import { getWhatsAppUrl, WHATSAPP_FORMATTED_PHONE } from '../config/constants';
import { useSettingsStore } from '../store/useSettingsStore';

export default function Contact() {
  const { settings, fetchSettings } = useSettingsStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    agreeToPrivacy: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const contactCategories = [
    'General Enquiry',
    'Product Information',
    'Order Support',
    'Business Enquiry',
    'Wholesale',
    'Distributor',
    'Retail Partner',
    'Export',
    'Private Label',
    'Feedback',
    'Complaint',
    'Suggestion'
  ];

  const contactCards = [
    {
      title: 'Registered Office',
      icon: FiMapPin,
      lines: [
        'H.No: 4-6-90/1, Street No: 02,',
        'Peerzadiguda, Kuruma Nagar,',
        'Hyderabad, Telangana - 500098, India.'
      ]
    },
    {
      title: 'Support Phone',
      icon: FiPhone,
      lines: ['+91 9100422140', 'Mon – Sat | 9:00 AM – 6:00 PM IST']
    },
    {
      title: 'Email Address',
      icon: FiMail,
      lines: ['care@suryodayafarms.com', 'support@suryodayafarms.com']
    },
    {
      title: 'Official Website',
      icon: FiGlobe,
      lines: ['www.suryodayafarms.com', 'Natural Nutrition & Superfoods']
    }
  ];

  const socialLinks = [
    { 
      name: 'Facebook', 
      url: settings.socialLinks?.facebook || 'https://facebook.com/suryodayafarms', 
      icon: FaFacebook, 
      iconColor: 'text-[#1877F2]',
      bgClass: 'bg-white border-[#EDE7D9]',
      watermark: FaFacebook
    },
    { 
      name: 'Instagram', 
      url: settings.socialLinks?.instagram || 'https://instagram.com/suryodayafarms', 
      icon: FaInstagram, 
      iconColor: 'text-[#E4405F]',
      bgClass: 'bg-[#F7F8F2] border-[#DCE4CD]',
      watermark: FaInstagram
    },
    { 
      name: 'YouTube', 
      url: settings.socialLinks?.youtube || 'https://youtube.com/@suryodayafarms', 
      icon: FaYoutube, 
      iconColor: 'text-[#FF0000]',
      bgClass: 'bg-[#FAF7F2] border-[#EDE7D9]',
      watermark: FaYoutube
    },
    { 
      name: 'LinkedIn', 
      url: settings.socialLinks?.linkedin || 'https://linkedin.com/company/suryodayafarms', 
      icon: FaLinkedin, 
      iconColor: 'text-[#0A66C2]',
      bgClass: 'bg-[#F5F7EF] border-[#DCE4CD]',
      watermark: FaLinkedin
    }
  ];

  const scrollToContactForm = () => {
    const el = document.getElementById('contact-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.agreeToPrivacy) {
      setErrorMessage('Please accept the Privacy Policy to submit your message.');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setErrorMessage('Please fill in all mandatory fields marked with (*).');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/public/contact', formData);
      if (response && response.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          category: 'General Enquiry',
          message: '',
          attachment: '',
          agreeToPrivacy: false
        });
      } else {
        setErrorMessage(response?.message || 'Failed to submit contact message.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleMapsSearchUrl = "https://www.google.com/maps/search/?api=1&query=Suryodaya+Farms+Plot+No+20+Bhrundavanam+Apartment+Peerzadiguda+Medipally+Hyderabad";
  const googleMapsDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Plot+No+20+Bhrundavanam+Apartment+Peerzadiguda+Medipally+Hyderabad";

  return (
    <div className="bg-[#F9F6F0] min-h-screen font-sans text-[#2F3B0C]">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F4EFE6] via-[#F9F6F0] to-[#F9F6F0] overflow-hidden border-b border-[#EDE7D9]/60">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] bg-[#4E641A]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] bg-[#B8833E]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <SectionBadge text="We're Here to Help" align="center" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2F3B0C] leading-[1.15] tracking-tight"
          >
            Contact <span className="text-[#4E641A]">Us</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-stone-600/90 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto font-sans leading-relaxed font-normal"
          >
            Thank you for your interest in Suryodaya Farms. Whether you have a question about our products, need assistance with an order, would like to share your feedback, or are interested in a business partnership, our team is always happy to assist you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-6"
          >
            <button
              onClick={scrollToContactForm}
              className="inline-flex items-center gap-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-9 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer"
            >
              <span>Contact Support</span>
              <FiArrowRight className="text-base" />
            </button>

            <Link
              to="/become-a-partner"
              className="inline-flex items-center gap-3 bg-white hover:bg-[#FAF7F2] text-[#2F3B0C] border border-[#EDE7D9] font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-9 py-4 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200"
            >
              <span>Become a Partner</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. CONTACT INFORMATION CARDS */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#EDE7D9]/80">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3 flex flex-col items-center">
          <SectionBadge text="Connect Directly" align="center" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C] tracking-tight">Contact Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left items-stretch">
          
          {/* 1. Registered Office */}
          <div className="bg-white border border-[#EDE7D9] rounded-[32px] p-8 sm:p-10 shadow-xs hover:shadow-lg hover:border-[#4E641A]/40 transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-300">
                <FiMapPin />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">Registered Office</h3>
                <p className="font-serif font-bold text-sm text-[#4E641A]">Suryodaya Farms</p>
              </div>
              
              <div className="text-stone-600 text-sm leading-[1.7] font-sans pt-1 space-y-0.5">
                <p>Plot No: 20,</p>
                <p>Bhrundavanam Apartment,</p>
                <p>Near Arca School,</p>
                <p>Kuruma Nagar,</p>
                <p>Peerzadiguda,</p>
                <p>Medipally,</p>
                <p>Medchal Malkajgiri,</p>
                <p>Hyderabad,</p>
                <p>Telangana,</p>
                <p className="font-semibold text-[#2F3B0C]">India – 500039</p>
              </div>
            </div>
            
            <a
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#4E641A] hover:text-[#2F3B0C] transition-colors pt-2 group-hover:translate-x-1 duration-200"
            >
              <span>View Location on Map</span>
              <FiExternalLink />
            </a>
          </div>

          {/* 2. Direct Channels (Phone, WhatsApp, Email, Website) */}
          <div className="space-y-5 flex flex-col justify-between">
            {/* Phone & WhatsApp Card */}
            <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-7 shadow-xs hover:shadow-md transition-all duration-300 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center text-xl shrink-0">
                  <FiPhone />
                </div>
                <div>
                  <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-stone-400">Phone Support</h4>
                  <a href={`tel:${WHATSAPP_FORMATTED_PHONE.replace(/\s/g, '')}`} className="font-serif text-lg font-bold text-[#2F3B0C] hover:text-[#4E641A] transition-colors block">
                    {WHATSAPP_FORMATTED_PHONE}
                  </a>
                </div>
              </div>
              
              <a
                href={getWhatsAppUrl("Namaste Suryodaya Farms! I would like to know more.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#25D366] bg-[#25D366]/10 px-4 py-2.5 rounded-xl w-full justify-center hover:bg-[#25D366]/20 transition-all duration-200"
              >
                <FaWhatsapp size={17} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-7 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center text-xl shrink-0">
                <FiMail />
              </div>
              <div>
                <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-stone-400">Email Address</h4>
                <a href="mailto:care@suryodayafarms.com" className="font-serif text-base sm:text-lg font-bold text-[#2F3B0C] hover:text-[#4E641A] transition-colors">
                  care@suryodayafarms.com
                </a>
              </div>
            </div>

            {/* Website Card */}
            <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-5.5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center text-xl shrink-0">
                <FiGlobe />
              </div>
              <div>
                <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-stone-400">Official Website</h4>
                <a href="https://www.suryodayafarms.com" target="_blank" rel="noopener noreferrer" className="font-serif text-base sm:text-lg font-bold text-[#2F3B0C] hover:text-[#4E641A] transition-colors">
                  www.suryodayafarms.com
                </a>
              </div>
            </div>
          </div>

          {/* 3. Customer Support Hours */}
          <div className="bg-white border border-[#EDE7D9] rounded-[32px] p-8 sm:p-10 shadow-xs hover:shadow-lg hover:border-[#4E641A]/40 transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-5">
              <div className="w-13 h-13 rounded-2xl bg-[#B8833E]/10 text-[#B8833E] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-300">
                <FiClock />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">Customer Support Hours</h3>
              
              <div className="bg-[#FAF7F2] border border-[#EDE7D9]/80 p-4.5 sm:p-6 rounded-2xl space-y-3.5 font-sans overflow-x-auto">
                {/* Working Days */}
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <span className="text-[11px] sm:text-xs md:text-sm font-medium text-stone-600 shrink-0">Working Days:</span>
                  <span className="text-[11px] sm:text-xs md:text-sm font-bold text-[#2F3B0C] whitespace-nowrap text-right">Monday – Saturday</span>
                </div>

                {/* Support Hours */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#EDE7D9]/60 min-w-0">
                  <span className="text-[11px] sm:text-xs md:text-sm font-medium text-stone-600 shrink-0">Support Hours:</span>
                  <span className="text-[11px] sm:text-xs md:text-sm font-bold text-[#4E641A] whitespace-nowrap text-right">9:00 AM – 6:00 PM (IST)</span>
                </div>

                {/* Sunday */}
                <div className="flex items-start justify-between gap-3 pt-3 border-t border-[#EDE7D9]/60 min-w-0">
                  <span className="text-[11px] sm:text-xs md:text-sm font-medium text-stone-600 shrink-0 mt-0.5">Sunday:</span>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-[11px] sm:text-xs md:text-sm font-bold text-stone-700 block whitespace-nowrap">Customer Support Closed</span>
                    <span className="text-[10px] sm:text-[11px] md:text-xs text-stone-500 font-normal block mt-0.5 whitespace-nowrap">
                      (Online Orders Accepted 24/7)
                    </span>
                  </div>
                </div>
              </div>

              {/* Final Paragraph */}
              <div className="pt-2">
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans font-normal">
                  Our customer support team is available during the above business hours to assist you with inquiries, orders, and product-related questions. Orders can be placed through our website at any time, including Sundays and public holidays.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. GOOGLE MAP SECTION */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#EDE7D9]/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">
          <div className="space-y-2 max-w-2xl flex flex-col items-start">
            <SectionBadge text="Our Location" align="left" />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C] tracking-tight">Visit Our Registered Office</h2>
            <p className="text-stone-600 text-sm font-sans leading-relaxed">
              Plot No: 20, Bhrundavanam Apartment, Near Arca School, Peerzadiguda, Medipally, Hyderabad – 500039
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-white border border-[#EDE7D9] hover:bg-[#FAF7F2] text-[#2F3B0C] rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-xs"
            >
              <FiExternalLink />
              <span>Open in Google Maps</span>
            </a>

            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <FiMapPin />
              <span>Get Directions</span>
            </a>
          </div>
        </div>

        <div className="bg-white border border-[#EDE7D9] rounded-[36px] p-3 sm:p-4 shadow-sm">
          <div className="w-full h-[380px] sm:h-[460px] lg:h-[500px] rounded-[28px] overflow-hidden border border-[#EDE7D9] relative bg-stone-100">
            <iframe
              title="Suryodaya Farms Registered Office Map"
              src="https://maps.google.com/maps?q=Peerzadiguda+Kuruma+Nagar+Hyderabad+Telangana&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 4. SOCIAL MEDIA CARDS (RHYTHMIC SHOWCASE WITH WATERMARKS) */}
      <section className="py-12 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] border-b border-[#EDE7D9]/80 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#4E641A_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2 flex flex-col items-center">
            <span className="font-sans text-xs font-bold text-[#B8833E] uppercase tracking-widest">Follow Our Journey</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C] tracking-tight">Connect on Social Media</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialLinks.map((social, idx) => {
              const Icon = social.icon;
              const Watermark = social.watermark || Icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className={`${social.bgClass} border p-6 sm:p-7 rounded-[24px] shadow-2xs hover:shadow-lg hover:border-[#4E641A] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden transform hover:-translate-y-1.5 cursor-pointer`}
                >
                  {/* Subtle 4–6% Opacity Watermark Illustration */}
                  <div className="absolute right-3 bottom-2 text-[#4E641A]/5 group-hover:text-[#4E641A]/10 text-6xl pointer-events-none select-none transition-colors duration-300">
                    <Watermark />
                  </div>

                  <div className="space-y-4 relative z-10">
                    {/* Top Row: Icon Beside Platform Name & External Arrow */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-[#F0F5E6] flex items-center justify-center shrink-0 group-hover:bg-[#4E641A] transition-colors duration-300 shadow-2xs">
                          <Icon className={`text-xl ${social.iconColor} group-hover:text-white transition-colors duration-300 group-hover:scale-110 transform`} />
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition-colors leading-snug">
                            {social.name}
                          </h3>
                          <span className="text-[11px] text-stone-500 font-mono block">@suryodayafarms</span>
                        </div>
                      </div>

                      <FiArrowUpRight className="opacity-0 group-hover:opacity-100 text-[#4E641A] transition-all duration-300 text-lg transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. BUSINESS HOURS & RESPONSE COMMITMENT */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#EDE7D9]/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Column: Timely Response Promise Card */}
          <div className="bg-white/90 backdrop-blur-md border border-[#4E641A]/30 rounded-[36px] p-8 sm:p-10 shadow-md relative overflow-hidden space-y-5 text-left flex flex-col justify-between h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4E641A]/8 rounded-bl-full pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2.5 text-[#4E641A]">
                <FiShield className="text-2xl shrink-0" />
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">Timely Response Promise</h3>
              </div>

              <div className="space-y-3.5 text-stone-600 text-xs sm:text-sm font-sans leading-[1.75] font-normal pt-1">
                <p>
                  At Suryodaya Farms, we believe that trust begins with communication. We value every customer inquiry and are committed to providing prompt, helpful, and reliable support.
                </p>
                <p>
                  Every email, message, and inquiry is important to us. We strive to respond to all customer communications within 24 business hours, ensuring that you receive the care, attention, and assistance you deserve.
                </p>
                <p>
                  During weekends, public holidays, or periods of unusually high inquiry volume, response times may be slightly longer. We appreciate your patience and understanding during such times.
                </p>
                <p>
                  Thank you for your trust in Suryodaya Farms. We look forward to serving you and ensuring a positive experience with every interaction.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Feedback + Commercial Partnerships / Business Enquiries Stack */}
          <div className="space-y-6 text-left flex flex-col justify-between h-full">
            
            {/* Customer Feedback Card */}
            <div className="bg-white border border-[#EDE7D9] rounded-[32px] p-7 sm:p-9 shadow-xs space-y-3 flex flex-col items-start">
              <SectionBadge text="We Value Your Thoughts" align="left" />
              <h2 className="font-serif text-2xl font-bold text-[#2F3B0C]">Customer Feedback</h2>
              <p className="text-stone-600 text-sm leading-relaxed font-sans">
                Your feedback is important to us. Every suggestion, appreciation, or concern helps us improve our products, services, and customer experience.
              </p>
            </div>

            {/* Business Enquiries Highlighted Section */}
            <div className="bg-[#2F3B0C] text-white rounded-[32px] p-7 sm:p-9 shadow-xl text-left space-y-5 relative overflow-hidden flex flex-col justify-between flex-1">
              <div className="absolute -right-28 -bottom-28 w-96 h-96 bg-[#4E641A]/30 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-start">
                  <SectionBadge text="Commercial Partnerships" align="left" />
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-white">
                  Business Enquiries
                </h2>
                
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-sans font-normal">
                  For wholesale, distribution, retail partnerships, institutional supply, export opportunities, private label manufacturing, and strategic collaborations, please contact our Business Development Team.
                </p>
              </div>

              <div className="pt-2 relative z-10">
                <Link
                  to="/become-a-partner"
                  className="inline-flex items-center gap-3 bg-[#4E641A] hover:bg-white hover:text-[#2F3B0C] text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-3.5 rounded-2xl shadow-lg transition-all duration-200"
                >
                  <span>Become a Partner</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CONTACT FORM SECTION (FOCAL POINT) */}
      <section id="contact-form-section" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white border border-[#EDE7D9] rounded-[44px] p-8 sm:p-14 lg:p-16 shadow-2xl text-left relative overflow-hidden">
          
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3 flex flex-col items-center">
            <SectionBadge text="Send Us a Direct Message" align="center" />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2F3B0C] tracking-tight">Contact Form</h2>
            <p className="text-stone-600 text-sm font-sans leading-relaxed">Please fill out your information below. We respond to every message within 24 business hours.</p>
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
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C]">Message Received!</h3>
                  <p className="text-stone-600 text-sm leading-relaxed font-sans">
                    Thank you for contacting Suryodaya Farms. An acknowledgement email has been sent to your inbox. Our team will get back to you shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white font-sans text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md"
                >
                  Send Another Message
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
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium flex items-center gap-2.5">
                    <FiAlertCircle className="shrink-0 text-base" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2.5">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Vikram Reddy"
                      className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#4E641A] focus:border-transparent transition-all duration-200 text-sm text-[#2F3B0C] font-sans placeholder-stone-400 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2.5">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. vikram@example.com"
                      className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#4E641A] focus:border-transparent transition-all duration-200 text-sm text-[#2F3B0C] font-sans placeholder-stone-400 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Row 2: Phone & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2.5">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. +91 9100422140"
                      className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#4E641A] focus:border-transparent transition-all duration-200 text-sm text-[#2F3B0C] font-sans placeholder-stone-400 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2.5">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#4E641A] focus:border-transparent transition-all duration-200 text-sm text-[#2F3B0C] font-sans cursor-pointer shadow-2xs"
                    >
                      {contactCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Subject */}
                <div>
                  <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2.5">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Inquiry regarding Sprouted Ragi Powder"
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#4E641A] focus:border-transparent transition-all duration-200 text-sm text-[#2F3B0C] font-sans placeholder-stone-400 shadow-2xs"
                  />
                </div>

                {/* Row 4: Message */}
                <div>
                  <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2.5">Message *</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Please type your message details here..."
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#4E641A] focus:border-transparent transition-all duration-200 text-sm text-[#2F3B0C] font-sans placeholder-stone-400 shadow-2xs resize-none"
                  />
                </div>

                {/* Optional Attachment Link */}
                <div>
                  <label className="block text-xs font-bold text-[#2F3B0C] uppercase tracking-wider mb-2.5">Attachment URL / Document Link (Optional)</label>
                  <input
                    type="url"
                    name="attachment"
                    value={formData.attachment}
                    onChange={handleInputChange}
                    placeholder="https://example.com/file.pdf"
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#EDE7D9] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#4E641A] focus:border-transparent transition-all duration-200 text-sm text-[#2F3B0C] font-sans placeholder-stone-400 shadow-2xs"
                  />
                </div>

                {/* Checkbox: Privacy Policy */}
                <div className="flex items-start sm:items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="agreeToPrivacy"
                    name="agreeToPrivacy"
                    checked={formData.agreeToPrivacy}
                    onChange={handleInputChange}
                    required
                    className="w-4.5 h-4.5 mt-0.5 sm:mt-0 text-[#4E641A] focus:ring-[#4E641A] border-[#EDE7D9] rounded cursor-pointer shrink-0"
                  />
                  <label htmlFor="agreeToPrivacy" className="text-xs text-stone-600 cursor-pointer leading-relaxed">
                    I agree to the <Link to="/privacy" className="text-[#4E641A] font-bold hover:underline">Privacy Policy</Link> and give consent to contact me regarding my message.
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#4E641A] hover:bg-[#2F3B0C] disabled:bg-stone-300 text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase py-4.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiSend className="text-base" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 7. FOOTER TRANSITION BUFFER */}
      <div className="bg-gradient-to-b from-[#F9F6F0] via-[#F9F6F0] to-[#F4EFE6] pt-12 pb-6 border-t border-[#EDE7D9]/40" />

    </div>
  );
}
