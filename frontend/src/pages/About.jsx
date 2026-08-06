import React from 'react';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiShield,
  FiAward,
  FiTrendingUp,
  FiCheck,
  FiHeart,
  FiFeather,
  FiBookOpen,
  FiTarget,
  FiEye,
  FiGlobe,
  FiUsers,
  FiZap,
  FiCpu
} from 'react-icons/fi';
import { GiSprout, GiSun, GiWheat } from 'react-icons/gi';
import SectionBadge from '../components/SectionBadge';

export default function About() {
  const philosophyList = [
    'Nature provides the goodness.',
    'Science preserves the nutrition.',
    'Quality protects the integrity.',
    'Trust creates lasting relationships.'
  ];

  const coreValues = [
    { title: 'Integrity', desc: 'We believe honesty is the strongest foundation of lasting customer relationships.', icon: FiShield },
    { title: 'Quality', desc: 'Quality is built into every process—not added at the end.', icon: FiAward },
    { title: 'Science', desc: 'Scientific knowledge guides our product development and quality standards.', icon: FiCheckCircle },
    { title: 'Customer Trust', desc: 'Trust is earned through consistency, transparency, and responsibility.', icon: FiUsers },
    { title: 'Innovation', desc: 'Research helps us continuously improve our products and processes.', icon: FiZap },
    { title: 'Sustainability', desc: 'We value responsible practices that support people, agriculture, and the environment.', icon: GiSprout }
  ];

  const qualityBullets = [
    'Carefully selected ingredients',
    'Responsible sourcing',
    'Hygienic processing',
    'Scientific product development',
    'Consistent quality practices',
    'Freshness',
    'Safe packaging',
    'Continuous improvement'
  ];

  const whyChooseItems = [
    {
      title: 'Science Behind Every Product',
      desc: 'Our products are developed under the guidance of experienced researchers and Doctorates in Botany, ensuring every stage follows scientifically guided quality practices.'
    },
    {
      title: 'Premium Quality',
      desc: 'We carefully select quality raw materials to maintain purity, freshness, consistency, and authenticity.'
    },
    {
      title: 'Hygienic Processing',
      desc: 'Every product is processed with strict hygiene standards to help preserve its natural nutritional value and freshness.'
    },
    {
      title: 'Quality Without Compromise',
      desc: 'From raw material selection to final packaging, every batch receives careful quality attention before it reaches our customers.'
    },
    {
      title: 'Honest & Transparent',
      desc: 'We believe trust is built through honesty. We avoid misleading claims and focus on delivering products that genuinely reflect our quality standards.'
    },
    {
      title: 'Customer First',
      desc: 'Your satisfaction inspires us to improve continuously through research, innovation, and responsible business practices.'
    }
  ];

  return (
    <div className="bg-[#FBF9F4] min-h-screen font-sans text-[#2F3B0C] selection:bg-[#4E641A] selection:text-white">
      
      {/* 1. A LETTER FROM SURYODAYA FARMS */}
      <section className="relative py-8 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#F4EFE6] via-[#FAF7F2] to-[#FBF9F4] border-b border-[#EDE7D9]">
        <div className="max-w-5xl mx-auto space-y-6 text-left">
          
          <div className="space-y-3 flex flex-col items-start">
            <SectionBadge text="Welcome to Suryodaya Farms" align="left" />
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2F3B0C] tracking-tight">
              A Letter from Suryodaya Farms
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4E641A] via-[#C68A2B] to-[#4E641A] rounded-full" />
          </div>

          <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-7 sm:p-12 shadow-sm space-y-5 text-stone-700 text-base sm:text-lg leading-[1.75] font-sans">
            <p className="font-serif text-lg sm:text-xl text-[#2F3B0C] font-semibold">Dear Customer,</p>
            <p>Welcome to <strong className="font-serif font-bold text-[#4E641A] text-lg sm:text-xl">Suryodaya Farms</strong>.</p>
            <p>Thank you for placing your trust in us.</p>
            <p className="font-serif italic text-lg sm:text-xl text-[#4E641A] border-l-4 border-[#C68A2B] pl-6 my-4 bg-[#F0F5E6]/40 py-3 rounded-r-xl">
              Every product we create begins with a simple belief:<br />
              Nature has the power to nourish. Science has the responsibility to preserve it.
            </p>
            <p>
              In today's fast-moving world, people deserve natural foods they can trust—products that are prepared with care, guided by science, and delivered with honesty.
            </p>
            <p>That belief is the foundation of <strong className="font-serif font-bold text-[#4E641A]">Suryodaya Farms</strong>.</p>
            <p>
              We are committed to developing premium natural superfoods through responsible sourcing, scientific product development, hygienic processing, and uncompromising quality standards.
            </p>
            <p>
              Every ingredient we select, every process we follow, and every package we prepare reflects our dedication to quality, integrity, and customer trust.
            </p>
            <p className="font-semibold text-[#2F3B0C]">
              Our journey is inspired by nature, strengthened by science, and driven by one purpose:<br />
              To help people make healthier choices with confidence.
            </p>
            <p>As we grow, our commitment will never change.</p>
            <p>We will continue to listen.</p>
            <p>We will continue to improve.</p>
            <p className="font-semibold text-[#2F3B0C]">We will continue to earn your trust—one product at a time.</p>
            <p>Thank you for being a part of the <strong className="font-serif font-bold text-[#4E641A]">Suryodaya Farms</strong> family.</p>
            <div className="pt-5 border-t border-[#EDE7D9] flex items-center justify-between">
              <div>
                <p className="font-serif text-base font-bold text-[#2F3B0C]">With gratitude,</p>
                <p className="font-serif text-lg font-bold text-[#4E641A]">Team Suryodaya Farms</p>
              </div>
              <GiSprout className="w-8 h-8 text-[#4E641A]/30" />
            </div>
          </div>

        </div>
      </section>

      {/* 2. OUR STORY (Redesigned Editorial 2-Column Luxury Layout) */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#F7F8F2] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        
        {/* Subtle Background Organic Watermark */}
        <div className="absolute top-10 right-10 opacity-5 text-[#4E641A] pointer-events-none">
          <GiSprout size={320} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Section Header */}
          <div className="space-y-3 flex flex-col items-start mb-8 lg:mb-10 text-left">
            <SectionBadge text="Every Sunrise Brings New Hope" align="left" />
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2F3B0C] tracking-tight">
                OUR STORY
              </h2>
              <GiSun className="w-8 h-8 text-[#C68A2B] animate-pulse" />
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4E641A] to-[#C68A2B] rounded-full mt-1" />
          </div>

          {/* Grid Layout: Desktop 2 Columns / Mobile Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Mobile-Only Image Placement (Shown under Header on Mobile/Tablet) */}
            <div className="block lg:hidden w-full">
              <div className="relative rounded-[28px] overflow-hidden border-4 border-white shadow-lg bg-stone-100">
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop" 
                  alt="Suryodaya Farms Organic Sunrise Fields" 
                  loading="lazy"
                  className="w-full h-[260px] sm:h-[320px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 shadow-sm flex items-center gap-3 text-left">
                  <GiSprout className="w-6 h-6 text-[#4E641A] shrink-0" />
                  <span className="font-serif text-xs font-bold text-[#2F3B0C] italic">
                    Every sunrise reminds us that healthy living begins with better choices.
                  </span>
                </div>
              </div>
            </div>

            {/* Left Column: Textual Story & Feature Cards (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6 text-left text-stone-700 text-base sm:text-lg leading-[1.75] font-sans max-w-[68ch]">
              
              {/* Feature Card 1: The Name Suryodaya */}
              <div className="bg-[#F7F4EB] border border-[#E4DDCB] p-6 rounded-2xl shadow-2xs flex items-start gap-4 hover:border-[#4E641A]/40 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-full bg-[#4E641A]/10 border border-[#4E641A]/20 flex items-center justify-center text-[#4E641A] shrink-0 group-hover:bg-[#4E641A] group-hover:text-white transition-colors duration-300">
                  <GiSun className="w-5 h-5 text-[#C68A2B] group-hover:text-white transition-colors duration-300" />
                </div>
                <p className="font-sans text-stone-800 leading-relaxed">
                  The name <strong className="font-serif text-lg font-bold text-[#4E641A] hover:underline cursor-pointer">Suryodaya</strong> means Sunrise—a symbol of hope, energy, renewal, and the beginning of a healthier tomorrow.
                </p>
              </div>

              {/* Callout Card 2: Vision Statement */}
              <div className="bg-[#F0F5E6] border-l-4 border-l-[#4E641A] border border-[#DCE8C8] p-6 sm:p-7 rounded-2xl shadow-2xs space-y-2 hover:shadow-md transition-all duration-300">
                <p className="font-sans text-stone-800">
                  <strong className="font-serif font-bold text-[#4E641A]">Suryodaya Farms</strong> was established with a simple yet meaningful vision:
                </p>
                <p className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C] leading-snug">
                  To reconnect people with the goodness of nature through products they can genuinely trust.
                </p>
              </div>

              {/* Standard Paragraph 1 */}
              <p className="text-stone-700">
                As awareness of healthy living grows, so does the need for natural foods that are prepared responsibly and backed by scientific understanding. We recognized that customers are not only looking for nutrition—they are looking for confidence in what they consume.
              </p>

              {/* Banner Card 3: Nature. Science. Trust. */}
              <div className="bg-gradient-to-r from-[#2F3B0C] via-[#3F4F16] to-[#4E641A] text-white p-6 sm:p-7 rounded-2xl shadow-md flex items-center gap-4 border border-[#4E641A]/30 transform hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <GiSprout className="w-6 h-6 text-[#C68A2B]" />
                </div>
                <p className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white leading-snug">
                  This belief inspired us to build <strong className="underline decoration-[#C68A2B] decoration-2 underline-offset-4">Suryodaya Farms</strong> on three enduring pillars: Nature. Science. Trust.
                </p>
              </div>

              {/* Standard Paragraph 2 */}
              <p className="text-stone-700">
                By combining carefully selected natural ingredients with scientific knowledge and rigorous quality standards, we strive to deliver products that preserve nature's goodness while meeting the expectations of today's health-conscious consumers.
              </p>

              {/* Standard Paragraph 3 */}
              <p className="text-stone-700 font-medium">
                For us, quality is not a final checkpoint—it is a responsibility carried through every stage of our work.
              </p>

              {/* Premium Checklist Rows */}
              <div className="space-y-3 pt-2">
                <div className="bg-white border border-[#EDE7D9] p-4.5 px-5 rounded-xl shadow-2xs flex items-center gap-4 hover:shadow-sm hover:border-[#4E641A]/40 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-7 h-7 rounded-full bg-[#F0F5E6] border border-[#4E641A]/20 flex items-center justify-center text-[#4E641A] shrink-0">
                    <FiCheck className="w-4 h-4 text-[#4E641A] stroke-[3px]" />
                  </div>
                  <span className="font-sans text-sm sm:text-base font-semibold text-[#2F3B0C]">
                    Every product reflects our commitment to purity, consistency, and integrity.
                  </span>
                </div>

                <div className="bg-white border border-[#EDE7D9] p-4.5 px-5 rounded-xl shadow-2xs flex items-center gap-4 hover:shadow-sm hover:border-[#4E641A]/40 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-7 h-7 rounded-full bg-[#F0F5E6] border border-[#4E641A]/20 flex items-center justify-center text-[#4E641A] shrink-0">
                    <FiCheck className="w-4 h-4 text-[#4E641A] stroke-[3px]" />
                  </div>
                  <span className="font-sans text-sm sm:text-base font-semibold text-[#2F3B0C]">
                    Every customer inspires us to improve.
                  </span>
                </div>

                <div className="bg-white border border-[#EDE7D9] p-4.5 px-5 rounded-xl shadow-2xs flex items-center gap-4 hover:shadow-sm hover:border-[#4E641A]/40 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-7 h-7 rounded-full bg-[#F0F5E6] border border-[#4E641A]/20 flex items-center justify-center text-[#4E641A] shrink-0">
                    <FiCheck className="w-4 h-4 text-[#4E641A] stroke-[3px]" />
                  </div>
                  <span className="font-sans text-sm sm:text-base font-semibold text-[#2F3B0C]">
                    Every sunrise reminds us that healthy living begins with better choices.
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Desktop Organic Visual Image (lg:col-span-5) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-28">
              <div className="relative rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-stone-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop" 
                  alt="Suryodaya Farms Organic Sunrise Fields" 
                  loading="lazy"
                  className="w-full h-[460px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2F3B0C]/80 via-transparent to-transparent" />
                
                {/* Floating Top Badge */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 shadow-sm flex items-center gap-2">
                  <GiSprout className="w-4 h-4 text-[#4E641A]" />
                  <span className="font-sans text-xs font-bold text-[#2F3B0C] tracking-wide uppercase">
                    Purity • Science • Trust
                  </span>
                </div>

                {/* Floating Bottom Card Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/90 shadow-lg space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <GiSun className="w-5 h-5 text-[#C68A2B]" />
                    <span className="font-serif text-sm font-bold text-[#4E641A] uppercase tracking-wider">
                      SURYODAYA FARMS
                    </span>
                  </div>
                  <p className="font-serif text-sm font-bold text-[#2F3B0C] italic leading-snug">
                    "Every sunrise reminds us that healthy living begins with better choices."
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. ABOUT SURYODAYA FARMS (Redesigned Editorial 2-Column Luxury Presentation) */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#FBF9F4] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        
        {/* Subtle Background Organic Leaf Watermark */}
        <div className="absolute -bottom-10 -left-10 opacity-5 text-[#4E641A] pointer-events-none">
          <GiWheat size={360} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Section Header */}
          <div className="space-y-3 flex flex-col items-start mb-8 lg:mb-10 text-left">
            <SectionBadge text="Nature's Goodness. Guided by Science." align="left" />
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2F3B0C] tracking-tight">
                ABOUT SURYODAYA FARMS
              </h2>
              <GiSprout className="w-8 h-8 text-[#4E641A] animate-bounce-subtle" />
            </div>
            <div className="w-28 h-1 bg-gradient-to-r from-[#4E641A] via-[#C68A2B] to-[#4E641A] rounded-full mt-1" />
          </div>

          {/* Grid Layout: Desktop 2 Columns / Mobile Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Mobile-Only Image Placement (Shown under Header on Mobile/Tablet) */}
            <div className="block lg:hidden w-full">
              <div className="relative rounded-[28px] overflow-hidden border-4 border-white shadow-lg bg-stone-100">
                <img 
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1000&auto=format&fit=crop" 
                  alt="Suryodaya Farms Pristine Products & Science Guidance" 
                  loading="lazy"
                  className="w-full h-[260px] sm:h-[320px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 shadow-sm flex items-center gap-3 text-left">
                  <FiShield className="w-5 h-5 text-[#4E641A] shrink-0" />
                  <span className="font-serif text-xs font-bold text-[#2F3B0C] italic">
                    Nature's Goodness. Guided by Science.
                  </span>
                </div>
              </div>
            </div>

            {/* Left Column: Story Content & Highlight Cards (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6 text-left text-stone-700 text-base sm:text-lg leading-[1.75] font-sans max-w-[68ch]">
              
              {/* Intro Glass Card 1 */}
              <div className="bg-[#F7F4EB] border border-[#E4DDCB] p-6 rounded-2xl shadow-2xs space-y-3 hover:border-[#4E641A]/40 transition-all duration-300">
                <p className="text-stone-800">
                  At <strong className="font-serif text-lg font-bold text-[#4E641A] hover:underline cursor-pointer">Suryodaya Farms</strong>, we believe that true wellness begins with pure, natural nutrition.
                </p>
                <p className="text-stone-700 text-sm sm:text-base">
                  We are a science-driven natural superfood company dedicated to developing products that combine the richness of nature with carefully guided scientific processes.
                </p>
              </div>

              {/* Standard Paragraph 2 */}
              <p className="text-stone-700">
                Our work encompasses responsible sourcing, product development, hygienic processing, quality assurance, and the supply of premium natural superfoods that support healthy lifestyles.
              </p>

              {/* Scientific Excellence Card 2 */}
              <div className="bg-white border-l-4 border-l-[#C68A2B] border border-[#EDE7D9] p-6 rounded-2xl shadow-2xs space-y-2 hover:shadow-md transition-all duration-300">
                <p className="font-serif text-lg font-bold text-[#2F3B0C]">
                  What distinguishes <span className="text-[#4E641A]">Suryodaya Farms</span> is our commitment to scientific excellence.
                </p>
                <p className="text-stone-600 text-sm sm:text-base">
                  Our product development and quality practices are guided by experienced researchers, technical professionals, and Doctorates in Botany, ensuring that every stage—from ingredient selection to packaging—is approached with knowledge, care, and responsibility.
                </p>
              </div>

              {/* Featured Philosophy Card 3 (Main Callout Card) */}
              <div className="bg-[#F0F5E6] border-l-4 border-l-[#4E641A] border border-[#DCE8C8] p-6 sm:p-7 rounded-2xl shadow-sm space-y-2 hover:shadow-md transition-all duration-300 relative group">
                <div className="flex items-center gap-2 text-[#4E641A] mb-1">
                  <FiFeather className="w-5 h-5 text-[#4E641A]" />
                  <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#4E641A]">
                    Core Philosophy
                  </span>
                </div>
                <p className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C] leading-snug">
                  We believe that science should never replace nature. Instead, science should help preserve the natural qualities that make wholesome foods valuable.
                </p>
              </div>

              {/* Standard Paragraph 4 */}
              <p className="text-stone-700 font-medium">
                That philosophy influences every decision we make.
              </p>

              {/* Standard Paragraph 5 */}
              <p className="text-stone-700">
                Rather than relying on exaggerated claims, we focus on delivering products that consistently reflect our values of quality, honesty, and transparency.
              </p>

              {/* Final Highlight Trust Card 4 */}
              <div className="bg-gradient-to-r from-[#2F3B0C] via-[#3F4F16] to-[#4E641A] text-white p-6 sm:p-7 rounded-2xl shadow-md flex items-center gap-4 border border-[#4E641A]/30 transform hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <FiHeart className="w-6 h-6 text-[#C68A2B]" />
                </div>
                <p className="font-serif text-base sm:text-lg font-semibold tracking-wide text-white leading-snug">
                  When customers choose <strong className="underline decoration-[#C68A2B] decoration-2 underline-offset-4">Suryodaya Farms</strong>, they are choosing more than a product. They are choosing a company committed to earning their trust every day.
                </p>
              </div>

            </div>

            {/* Right Column: Desktop Organic Visual Image (lg:col-span-5) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-28">
              <div className="relative rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-stone-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1200&auto=format&fit=crop" 
                  alt="Suryodaya Farms Pristine Products & Science Guidance" 
                  loading="lazy"
                  className="w-full h-[460px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2F3B0C]/80 via-transparent to-transparent" />
                
                {/* Floating Top Badge */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 shadow-sm flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-[#4E641A]" />
                  <span className="font-sans text-xs font-bold text-[#2F3B0C] tracking-wide uppercase">
                    Nature • Science • Trust
                  </span>
                </div>

                {/* Floating Bottom Card Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/90 shadow-lg space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <GiSprout className="w-5 h-5 text-[#4E641A]" />
                    <span className="font-serif text-sm font-bold text-[#4E641A] uppercase tracking-wider">
                      SURYODAYA FARMS
                    </span>
                  </div>
                  <p className="font-serif text-sm font-bold text-[#2F3B0C] italic leading-snug">
                    "Science should help preserve the natural qualities that make wholesome foods valuable."
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. OUR PHILOSOPHY */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#F7F8F2] border-b border-[#EDE7D9]">
        <div className="max-w-5xl mx-auto space-y-6 text-left">
          
          <div className="space-y-3 flex flex-col items-start">
            <SectionBadge text="Four Guiding Principles" align="left" />
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">OUR PHILOSOPHY</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#4E641A] to-[#C68A2B] rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {philosophyList.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#EDE7D9] p-6 rounded-2xl flex items-center gap-4 shadow-2xs hover:shadow-sm hover:border-[#4E641A]/40 transition-all duration-300">
                <span className="w-9 h-9 rounded-full bg-[#4E641A] text-white font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                  <GiSprout className="w-5 h-5 text-[#C68A2B]" />
                </span>
                <span className="font-serif text-base sm:text-lg font-bold text-[#2F3B0C]">{item}</span>
              </div>
            ))}
          </div>

          <p className="font-serif text-lg font-bold text-[#2F3B0C] italic pt-4 text-center border-t border-[#EDE7D9]">
            These four principles guide every decision we make.
          </p>
        </div>
      </section>

      {/* 5. OUR PURPOSE (Hero-Style Statement Banner) */}
      <section className="py-14 md:py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#F4EFE6] via-[#FAF7F2] to-[#FCFAF4] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        
        {/* Soft Background Sun & Leaf Watermarks */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 text-[#C68A2B] pointer-events-none">
          <GiSun size={420} />
        </div>
        <div className="absolute top-8 left-8 opacity-5 text-[#4E641A] pointer-events-none">
          <GiSprout size={180} />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 space-y-6 text-center flex flex-col items-center">
          
          {/* Badge & Heading */}
          <div className="space-y-3 flex flex-col items-center">
            <SectionBadge text="Guiding Purpose & Core Mission" align="center" />
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2F3B0C] tracking-tight">
              OUR PURPOSE
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#4E641A] via-[#C68A2B] to-[#4E641A] rounded-full mt-1" />
          </div>

          {/* Focal Statement Card */}
          <div className="w-full bg-white/90 backdrop-blur-md border border-[#4E641A]/20 rounded-[28px] p-8 sm:p-10 shadow-md hover:shadow-lg transition-all duration-300 relative group">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#F0F5E6] border border-[#4E641A]/30 flex items-center justify-center text-[#4E641A] shadow-xs">
              <GiSprout className="w-5 h-5 text-[#4E641A]" />
            </div>
            
            <span className="font-serif text-5xl text-[#C68A2B]/40 leading-none select-none block mb-2">“</span>
            
            <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-[#2F3B0C] leading-relaxed max-w-4xl mx-auto italic">
              To make premium natural nutrition accessible through products developed with scientific care, uncompromising quality, and genuine respect for customer well-being.
            </p>

            <div className="mt-6 pt-5 border-t border-[#EDE7D9]/80 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4E641A]" />
              <span className="font-sans text-xs font-bold text-[#4E641A] uppercase tracking-widest">
                Suryodaya Farms Purpose Statement
              </span>
              <span className="w-2 h-2 rounded-full bg-[#4E641A]" />
            </div>
          </div>

        </div>
      </section>

      {/* VISUAL BOTANICAL CONNECTOR DIVIDER */}
      <div className="w-full bg-[#FCFAF4] py-3 flex items-center justify-center gap-4 text-[#4E641A]/40 select-none">
        <div className="h-px bg-gradient-to-r from-transparent via-[#EDE7D9] to-[#EDE7D9] w-24 sm:w-40" />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F5E6] border border-[#4E641A]/20 text-[#4E641A] text-xs font-bold uppercase tracking-widest shadow-2xs">
          <GiSprout className="w-3.5 h-3.5 text-[#4E641A]" />
          <span>Nature • Science • Trust</span>
        </div>
        <div className="h-px bg-gradient-to-l from-transparent via-[#EDE7D9] to-[#EDE7D9] w-24 sm:w-40" />
      </div>

      {/* 6. OUR VISION (Redesigned Split Layout Presentation) */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#F7F8F2] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        
        {/* Subtle Background Organic Watermark */}
        <div className="absolute -top-10 -right-10 opacity-5 text-[#4E641A] pointer-events-none">
          <GiWheat size={360} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Section Header */}
          <div className="space-y-3 flex flex-col items-start mb-8 lg:mb-10 text-left">
            <SectionBadge text="Future Roadmap & Aspirations" align="left" />
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2F3B0C] tracking-tight">
                OUR VISION
              </h2>
              <FiEye className="w-8 h-8 text-[#C68A2B]" />
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4E641A] via-[#C68A2B] to-[#4E641A] rounded-full mt-1" />
          </div>

          {/* Grid Layout: Desktop 2 Columns / Mobile Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Mobile-Only Image Placement (Shown under Header on Mobile/Tablet) */}
            <div className="block lg:hidden w-full">
              <div className="relative rounded-[28px] overflow-hidden border-4 border-white shadow-lg bg-stone-100">
                <img 
                  src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=1000&auto=format&fit=crop" 
                  alt="Suryodaya Farms Vision & Future Growth" 
                  loading="lazy"
                  className="w-full h-[260px] sm:h-[320px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 shadow-sm flex items-center gap-3 text-left">
                  <GiSprout className="w-6 h-6 text-[#4E641A] shrink-0" />
                  <span className="font-serif text-xs font-bold text-[#2F3B0C] italic">
                    Building a legacy of trust and natural excellence for future generations.
                  </span>
                </div>
              </div>
            </div>

            {/* Left Column: Vision Story & Highlight Cards (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6 text-left text-stone-700 text-base sm:text-lg leading-[1.75] font-sans max-w-[68ch]">
              
              {/* Featured Vision Card 1 (Bold Highlight Statement) */}
              <div className="bg-[#F0F5E6] border-l-4 border-l-[#4E641A] border border-[#DCE8C8] p-6 sm:p-7 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition-all duration-300 relative group">
                <div className="flex items-center gap-2 text-[#4E641A] mb-1">
                  <GiSprout className="w-5 h-5 text-[#4E641A]" />
                  <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#4E641A]">
                    Vision Milestone
                  </span>
                </div>
                <p className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C] leading-snug">
                  To become one of India's most trusted and respected natural nutrition companies by combining the purity of nature with scientific excellence, uncompromising quality, responsible innovation, and lasting customer trust.
                </p>
              </div>

              {/* Standard Paragraph 2 */}
              <p className="text-stone-700">
                We aspire to create products that enrich everyday nutrition, inspire healthier lifestyles, and set high standards for quality, integrity, and responsible business practices.
              </p>

              {/* Standard Paragraph 3 */}
              <p className="text-stone-700">
                As we grow, we aim to build meaningful relationships with our customers, farmers, partners, and communities while continuously advancing through research, innovation, and sustainable development.
              </p>

              {/* Final Highlighted Statement Card 2 */}
              <div className="bg-gradient-to-r from-[#2F3B0C] via-[#3F4F16] to-[#4E641A] text-white p-6 sm:p-7 rounded-2xl shadow-md flex items-center gap-4 border border-[#4E641A]/30 transform hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <FiHeart className="w-6 h-6 text-[#C68A2B]" />
                </div>
                <p className="font-serif text-base sm:text-lg font-semibold tracking-wide text-white leading-snug">
                  Our vision is not only to grow as a company but also to earn the confidence of generations by delivering products that people can choose with trust.
                </p>
              </div>

            </div>

            {/* Right Column: Desktop Vision Visual Panel (lg:col-span-5) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-28">
              <div className="relative rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-stone-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=1200&auto=format&fit=crop" 
                  alt="Suryodaya Farms Vision & Future Growth" 
                  loading="lazy"
                  className="w-full h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2F3B0C]/80 via-transparent to-transparent" />
                
                {/* Floating Top Badge */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 shadow-sm flex items-center gap-2">
                  <GiSprout className="w-4 h-4 text-[#4E641A]" />
                  <span className="font-sans text-xs font-bold text-[#2F3B0C] tracking-wide uppercase">
                    Purity • Innovation • Future
                  </span>
                </div>

                {/* Floating Bottom Card Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/90 shadow-lg space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <FiEye className="w-5 h-5 text-[#C68A2B]" />
                    <span className="font-serif text-sm font-bold text-[#4E641A] uppercase tracking-wider">
                      SURYODAYA FARMS VISION
                    </span>
                  </div>
                  <p className="font-serif text-sm font-bold text-[#2F3B0C] italic leading-snug">
                    "Earn the confidence of generations by delivering products people choose with trust."
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. OUR MISSION */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#FBF9F4] border-b border-[#EDE7D9]">
        <div className="max-w-5xl mx-auto space-y-6 text-left">
          
          <div className="space-y-3 flex flex-col items-start">
            <SectionBadge text="Guiding Everyday Purpose" align="left" />
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">OUR MISSION</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#4E641A] to-[#C68A2B] rounded-full" />
          </div>

          <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-[1.75] font-sans">
            <p>
              At Suryodaya Farms, our mission is to develop and deliver premium-quality natural nutrition products by combining the goodness of nature with scientific expertise, responsible sourcing, hygienic processing, rigorous quality standards, and continuous innovation.
            </p>
            <p>
              We are committed to preserving the natural integrity of every ingredient while ensuring consistency, safety, and quality through disciplined processes and responsible practices.
            </p>
            <div className="bg-[#F0F5E6] border-l-4 border-l-[#4E641A] border border-[#DCE8C8] p-6 rounded-2xl shadow-2xs">
              <p className="font-bold text-[#2F3B0C] text-lg sm:text-xl font-serif leading-snug">
                By fostering a culture of research, continuous improvement, and customer-focused innovation, we strive to earn lasting trust and inspire healthier lifestyles for individuals and families.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 8. OUR CORE VALUES (RHYTHMIC 3x2 SHOWCASE WITH WATERMARKS) */}
      <section className="py-10 md:py-14 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#4E641A_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-8 lg:space-y-10 text-left relative z-10">
          
          <div className="space-y-3 flex flex-col items-center text-center">
            <SectionBadge text="Foundational Pillars" align="center" />
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2F3B0C]">OUR CORE VALUES</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4E641A] via-[#C68A2B] to-[#4E641A] rounded-full mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((val, idx) => {
              const IconComp = val.icon || FiShield;
              // Alternating subtle background tones and watermarks
              const styleVariants = [
                { bgClass: 'bg-white border-[#EDE7D9]', watermark: FiShield },
                { bgClass: 'bg-[#F7F8F2] border-[#DCE4CD]', watermark: FiAward },
                { bgClass: 'bg-[#FAF7F2] border-[#EDE7D9]', watermark: FiBookOpen },
                { bgClass: 'bg-[#F5F7EF] border-[#DCE4CD]', watermark: FiUsers },
                { bgClass: 'bg-white border-[#EDE7D9]', watermark: FiZap },
                { bgClass: 'bg-[#F7F8F2] border-[#DCE4CD]', watermark: GiSprout }
              ];
              const variant = styleVariants[idx % styleVariants.length];
              const Watermark = variant.watermark;

              return (
                <div 
                  key={idx} 
                  className={`${variant.bgClass} border p-6 sm:p-7 rounded-[22px] shadow-2xs hover:shadow-md hover:border-[#4E641A] transition-all duration-300 flex flex-col items-center text-center justify-between group relative overflow-hidden transform hover:-translate-y-1 cursor-pointer`}
                >
                  {/* Subtle 4-6% Opacity Watermark Icon */}
                  <div className="absolute right-3 bottom-2 text-[#4E641A]/5 group-hover:text-[#4E641A]/10 text-6xl pointer-events-none select-none transition-colors duration-300">
                    <Watermark />
                  </div>

                  <div className="space-y-4 relative z-10 flex flex-col items-center text-center w-full">
                    {/* Header: Centered Icon Badge & Title */}
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#4E641A]/10 text-[#4E641A] flex items-center justify-center shrink-0 group-hover:bg-[#4E641A] group-hover:text-white transition-colors duration-300 shadow-2xs mx-auto">
                        <IconComp className="w-5 h-5 stroke-[2px]" />
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition-colors leading-snug">
                        {val.title}
                      </h3>
                    </div>

                    <div className="border-b border-[#EDE7D9]/80 my-2 w-full" />

                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans text-center">
                      {val.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 9. OUR QUALITY COMMITMENT */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#FBF9F4] border-b border-[#EDE7D9]">
        <div className="max-w-5xl mx-auto space-y-8 text-left">
          
          <div className="space-y-3 flex flex-col items-start">
            <SectionBadge text="Uncompromising Excellence" align="left" />
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">OUR QUALITY COMMITMENT</h2>
            <p className="font-serif text-lg sm:text-xl font-bold text-[#4E641A]">
              Quality is not simply our objective—it is our responsibility.
            </p>
            <p className="text-stone-700 text-base font-semibold">
              Every product is prepared with attention to:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {qualityBullets.map((bullet, idx) => (
              <div key={idx} className="bg-white border border-[#EDE7D9] p-4.5 rounded-xl flex items-center gap-3.5 shadow-2xs hover:shadow-sm hover:border-[#4E641A]/30 transition-all duration-300">
                <div className="w-6 h-6 rounded-full bg-[#F0F5E6] border border-[#4E641A]/20 flex items-center justify-center text-[#4E641A] shrink-0">
                  <FiCheckCircle className="w-4 h-4 text-[#4E641A]" />
                </div>
                <span className="font-sans text-sm sm:text-base font-semibold text-[#2F3B0C]">{bullet}</span>
              </div>
            ))}
          </div>

          <p className="font-serif text-base sm:text-lg font-bold text-[#2F3B0C] italic pt-4 border-t border-[#EDE7D9]">
            Every step reflects our commitment to delivering products that meet the standards our customers expect and deserve.
          </p>
        </div>
      </section>

      {/* 10. OUR PROMISE */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#F7F8F2] border-b border-[#EDE7D9]">
        <div className="max-w-5xl mx-auto space-y-6 text-left text-stone-700 text-base sm:text-lg leading-[1.75] font-sans">
          
          <div className="space-y-3 flex flex-col items-start">
            <SectionBadge text="Unwavering Values" align="left" />
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">OUR PROMISE</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#4E641A] to-[#C68A2B] rounded-full" />
          </div>

          <div className="bg-white border border-[#EDE7D9] p-7 sm:p-10 rounded-2xl shadow-2xs space-y-4">
            <p className="text-stone-800">We promise to remain true to the values that define Suryodaya Farms.</p>
            
            <div className="space-y-3 pl-1">
              <div className="flex items-start gap-3">
                <GiSprout className="w-5 h-5 text-[#4E641A] shrink-0 mt-1" />
                <p className="font-bold text-[#2F3B0C] text-lg font-serif">We will never compromise on quality for convenience.</p>
              </div>
              <div className="flex items-start gap-3">
                <GiSprout className="w-5 h-5 text-[#4E641A] shrink-0 mt-1" />
                <p className="font-bold text-[#2F3B0C] text-lg font-serif">We will never compromise on integrity for growth.</p>
              </div>
              <div className="flex items-start gap-3">
                <GiSprout className="w-5 h-5 text-[#4E641A] shrink-0 mt-1" />
                <p className="font-bold text-[#2F3B0C] text-lg font-serif">We will continue learning, improving, and serving with responsibility.</p>
              </div>
            </div>

            <p className="font-serif text-xl font-bold text-[#4E641A] italic pt-3 border-t border-[#EDE7D9]">
              Because trust is something that must be earned—every single day.
            </p>
          </div>

        </div>
      </section>

      {/* 11. OUR TAGLINE */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-r from-[#2F3B0C] via-[#3F4F16] to-[#4E641A] text-white border-b border-[#EDE7D9] select-none">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-[#C68A2B] block">OUR TAGLINE</span>
          <h3 className="font-serif text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight md:whitespace-nowrap leading-tight">
            Pure Nature. Scientific Quality. Trusted Nutrition.
          </h3>
        </div>
      </section>

      {/* 12. WHY CHOOSE SURYODAYA FARMS? */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 bg-[#FBF9F4] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
          
          {/* Header with Fade-Up Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-center flex flex-col items-center max-w-2xl mx-auto"
          >
            <SectionBadge text="The Suryodaya Advantage" align="center" />
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2F3B0C] tracking-tight">
              WHY CHOOSE SURYODAYA FARMS?
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#4E641A] via-[#C68A2B] to-[#4E641A] rounded-full mt-1" />
          </motion.div>

          {/* 3x2 Grid of Cards with Staggered Entrance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 text-center benefits-grid">
            {whyChooseItems.map((item, idx) => {
              const icons = [FiCpu, FiAward, FiShield, FiCheckCircle, FiEye, FiUsers];
              const IconComp = icons[idx % icons.length];
              const isFeatured = idx === 0;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className={`${
                    isFeatured
                      ? 'bg-[#FBF9F3] border-[#4E641A]/40 shadow-xs'
                      : 'bg-white border-[#EDE7D9] shadow-2xs'
                  } border pt-8 pb-7 px-6 sm:px-8 rounded-[24px] hover:shadow-md hover:border-[#4E641A] hover:-translate-y-2 transition-all duration-300 ease-out group flex flex-col items-center text-center justify-between h-full cursor-pointer relative overflow-hidden`}
                >
                  <div className="space-y-4 flex flex-col items-center text-center w-full">
                    {/* Icon Container */}
                    <div className={`${
                      isFeatured ? 'w-14 h-14 bg-[#4E641A]/15 border-[#4E641A]/30' : 'w-13 h-13 bg-[#FAF7F2] border-[#EDE7D9]'
                    } rounded-full border text-[#4E641A] group-hover:bg-[#4E641A] group-hover:text-white group-hover:border-[#4E641A] group-hover:scale-105 shadow-inner flex items-center justify-center transition-all duration-300 shrink-0 mx-auto`}>
                      <IconComp className="w-6 h-6 stroke-[1.8px]" />
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C] group-hover:text-[#4E641A] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Thin Divider */}
                    <div className="border-b border-[#EDE7D9]/80 my-2 w-full max-w-[80%] mx-auto" />

                    {/* Description */}
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-sans font-light text-center">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 13. RESEARCH & INNOVATION */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#F7F8F2] border-b border-[#EDE7D9]">
        <div className="max-w-5xl mx-auto space-y-6 text-left">
          
          <div className="space-y-3 flex flex-col items-start">
            <SectionBadge text="Where Nature Meets Scientific Understanding" align="left" />
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">RESEARCH & INNOVATION</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#4E641A] to-[#C68A2B] rounded-full" />
          </div>

          <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-[1.75] font-sans">
            <p>
              At Suryodaya Farms, research and innovation are not separate activities—they are part of everything we do.
            </p>
            <p>
              We believe that nature provides remarkable nutritional potential, and science helps us understand, preserve, and responsibly develop that potential into products people can trust.
            </p>
            <p>
              Every product is thoughtfully developed through careful ingredient selection, scientific understanding, quality-focused practices, hygienic processing, and continuous improvement.
            </p>
            <p className="text-stone-800 font-medium">Our goal is not simply to create products.</p>
            <div className="bg-[#F0F5E6] border-l-4 border-l-[#4E641A] border border-[#DCE8C8] p-6 rounded-2xl shadow-2xs">
              <p className="font-serif text-xl font-bold text-[#4E641A]">
                Our goal is to create products that customers can choose with confidence.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 14. OUR RESEARCH, TECHNICAL & PRODUCT DEVELOPMENT TEAM */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        {/* Subtle background botanical watermarks */}
        <div className="absolute top-10 right-10 w-72 h-72 opacity-[0.025] pointer-events-none text-[#2F3B0C]">
          <GiSprout className="w-full h-full" />
        </div>
        <div className="absolute bottom-10 left-10 w-72 h-72 opacity-[0.025] pointer-events-none text-[#2F3B0C]">
          <GiSun className="w-full h-full" />
        </div>

        <div className="max-w-[820px] mx-auto space-y-8 text-left relative z-10 animate-fade-in">
          
          {/* Header */}
          <div className="space-y-3 flex flex-col items-start w-full">
            <SectionBadge text="Botany Doctorates & Research Professionals" align="left" />
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-[#2F3B0C] tracking-tight leading-tight">
              Our Research, Technical & Product Development Team
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4E641A] via-[#C68A2B] to-[#4E641A] rounded-full mt-1" />
          </div>

          {/* Grouped Intro Paragraphs Card */}
          <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-5 text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
            <p className="font-medium text-stone-700">
              Behind every Suryodaya Farms product is a dedicated Research, Technical & Product Development Team comprising highly experienced researchers, qualified professionals, and Ph.D.-qualified experts in Botany, working together with scientific responsibility and a shared commitment to excellence.
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-[#EDE7D9] to-transparent" />
            <p className="text-stone-600">
              Our team continuously studies natural ingredients, evaluates scientific developments, improves product quality, and refines manufacturing practices to ensure that every product reflects the values of Suryodaya Farms.
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-[#EDE7D9] to-transparent" />
            <p className="text-stone-600 font-normal">
              Rather than seeking recognition, our team works quietly behind every product—transforming knowledge, research, and experience into products that customers can trust.
            </p>
          </div>

          {/* Featured Quote Card */}
          <div className="bg-[#FAF7F2] border border-[#EDE7D9] hover:border-[#4E641A]/40 p-7 sm:p-9 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 space-y-3 relative overflow-hidden group">
            <div className="absolute top-4 right-6 text-5xl text-[#C68A2B]/15 font-serif select-none pointer-events-none">
              “
            </div>
            <p className="font-sans text-xs font-extrabold text-[#4E641A] uppercase tracking-wider block">
              Every decision is guided by one simple question:
            </p>
            <blockquote className="font-serif text-xl sm:text-2xl font-bold italic text-[#2F3B0C] leading-snug relative z-10">
              "How can we develop better products while earning and preserving our customers' trust?"
            </blockquote>
          </div>

        </div>
      </section>

      {/* 15. OUR RESEARCH PHILOSOPHY */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#F7F8F2] border-b border-[#EDE7D9]">
        <div className="max-w-5xl mx-auto space-y-6 text-left">
          
          <div className="space-y-3 flex flex-col items-start">
            <SectionBadge text="Scientific Integrity" align="left" />
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">Our Research Philosophy</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#4E641A] to-[#C68A2B] rounded-full" />
          </div>

          <div className="space-y-5 text-stone-700 text-base sm:text-lg leading-[1.75] font-sans">
            <p className="font-semibold text-[#2F3B0C] text-lg font-serif">
              We believe that true innovation is not about changing nature—it is about understanding nature better and using scientific knowledge responsibly.
            </p>

            <div className="space-y-3.5 pl-1">
              <div className="flex items-start gap-3">
                <GiSprout className="w-5 h-5 text-[#4E641A] shrink-0 mt-1" />
                <p className="font-serif text-lg font-bold text-[#2F3B0C]">Research is meaningful only when it improves quality.</p>
              </div>
              <div className="flex items-start gap-3">
                <GiSprout className="w-5 h-5 text-[#4E641A] shrink-0 mt-1" />
                <p className="font-serif text-lg font-bold text-[#2F3B0C]">Innovation is valuable only when it benefits people.</p>
              </div>
              <div className="flex items-start gap-3">
                <GiSprout className="w-5 h-5 text-[#4E641A] shrink-0 mt-1" />
                <p className="font-serif text-lg font-bold text-[#2F3B0C]">Knowledge has purpose only when it serves society.</p>
              </div>
            </div>

            <p className="font-serif text-xl font-bold text-[#4E641A] italic pt-3 border-t border-[#EDE7D9]">
              That philosophy inspires every product we develop.
            </p>
          </div>

        </div>
      </section>

      {/* 16. OUR COMMITMENT */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        {/* Subtle radial gradient & botanical watermark (Max opacity 5%) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#4E641A]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-12 right-12 w-80 h-80 opacity-[0.035] pointer-events-none text-[#2F3B0C]">
          <GiSprout className="w-full h-full" />
        </div>

        <div className="max-w-[820px] mx-auto space-y-8 text-left relative z-10 animate-fade-in">
          
          {/* Header */}
          <div className="space-y-3 flex flex-col items-start w-full">
            <SectionBadge text="Dedicated to Progress" align="left" />
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[42px] font-bold text-[#2F3B0C] tracking-tight leading-tight">
              Our Commitment
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4E641A] via-[#C68A2B] to-[#4E641A] rounded-full mt-1" />
          </div>

          <div className="space-y-6 text-stone-700 font-sans">
            {/* Lead Headline */}
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#4E641A] tracking-tight leading-snug">
              At Suryodaya Farms, research never stops.
            </p>

            {/* Explanation Paragraph */}
            <p className="text-base sm:text-lg text-stone-600 leading-[1.8] font-normal">
              We continuously learn, improve, innovate, and refine our products because we believe every customer deserves our very best.
            </p>

            {/* Featured Statement Card */}
            <div className="bg-white border border-[#EDE7D9] hover:border-[#4E641A]/40 p-6 sm:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="w-1.5 h-12 bg-[#4E641A] rounded-full absolute left-0 top-1/2 -translate-y-1/2" />
              <p className="font-semibold text-base sm:text-lg text-[#2F3B0C] leading-relaxed pl-3">
                Every improvement we make is dedicated to delivering better quality, greater consistency, and lasting customer confidence.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 17. OUR GUIDING PRINCIPLE */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#2F3B0C] via-[#3F4F16] to-[#1E2707] text-white relative overflow-hidden dark-section">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:32px_32px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-[#C68A2B] block">
              Our Guiding Principle
            </span>
          </div>

          <div className="relative">
            <span className="text-6xl sm:text-7xl font-serif text-[#C68A2B]/20 leading-none absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none">
              “
            </span>
            <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light italic leading-relaxed text-[#F9F6F0] max-w-3xl mx-auto relative z-10">
              "Nature inspires us. Science guides us. Innovation strengthens us. Quality defines us. Customer trust is our greatest achievement."
            </blockquote>
          </div>

          <div className="w-24 h-1 bg-[#C68A2B] mx-auto rounded-full mt-6" />
        </div>
      </section>

    </div>
  );
}
