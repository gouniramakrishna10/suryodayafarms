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
  FiGlobe
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
    { title: 'Integrity', desc: 'We believe honesty is the strongest foundation of lasting customer relationships.' },
    { title: 'Quality', desc: 'Quality is built into every process—not added at the end.' },
    { title: 'Science', desc: 'Scientific knowledge guides our product development and quality standards.' },
    { title: 'Customer Trust', desc: 'Trust is earned through consistency, transparency, and responsibility.' },
    { title: 'Innovation', desc: 'Research helps us continuously improve our products and processes.' },
    { title: 'Sustainability', desc: 'We value responsible practices that support people, agriculture, and the environment.' }
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
    <div className="bg-[#F9F6F0] min-h-screen font-sans text-[#2F3B0C] selection:bg-[#4E641A] selection:text-white">
      
      {/* 1. A LETTER FROM SURYODAYA FARMS */}
      <section className="relative pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#F4EFE6] via-[#FAF7F2] to-[#F9F6F0] border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">
            A Letter from Suryodaya Farms
          </h1>

          <div className="bg-white border border-[#EDE7D9] rounded-[36px] p-8 sm:p-14 shadow-sm space-y-6 text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
            <p className="font-serif text-lg sm:text-xl text-[#2F3B0C] font-semibold">Dear Customer,</p>
            <p>Welcome to <strong className="font-serif font-bold text-[#4E641A] text-lg sm:text-xl">Suryodaya Farms</strong>.</p>
            <p>Thank you for placing your trust in us.</p>
            <p className="font-serif italic text-lg sm:text-xl text-[#4E641A] border-l-4 border-[#B8833E] pl-6 my-4">
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
            <div className="pt-6 border-t border-[#EDE7D9]">
              <p className="font-serif text-base font-bold text-[#2F3B0C]">With gratitude,</p>
              <p className="font-serif text-lg font-bold text-[#4E641A]">Team Suryodaya Farms</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR STORY (Redesigned Editorial 2-Column Luxury Layout) */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#FCFAF4] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        
        {/* Subtle Background Organic Watermark */}
        <div className="absolute top-10 right-10 opacity-5 text-[#4E641A] pointer-events-none">
          <GiSprout size={320} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Section Header */}
          <div className="space-y-4 flex flex-col items-start mb-10 lg:mb-14 text-left">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
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
            <div className="lg:col-span-7 space-y-7 text-left text-stone-700 text-base sm:text-lg leading-[1.75] font-sans max-w-[68ch]">
              
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
                  className="w-full h-[540px] object-cover transition-transform duration-700 group-hover:scale-105"
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
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        
        {/* Subtle Background Organic Leaf Watermark */}
        <div className="absolute -bottom-10 -left-10 opacity-5 text-[#4E641A] pointer-events-none">
          <GiWheat size={360} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Section Header */}
          <div className="space-y-4 flex flex-col items-start mb-10 lg:mb-14 text-left">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Mobile-Only Image Placement (Shown under Header on Mobile/Tablet) */}
            <div className="block lg:hidden w-full">
              <div className="relative rounded-[28px] overflow-hidden border-4 border-white shadow-lg bg-stone-100">
                <img 
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1000&auto=format&fit=crop" 
                  alt="Suryodaya Farms Pristine Harvest & Science Guidance" 
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
            <div className="lg:col-span-7 space-y-7 text-left text-stone-700 text-base sm:text-lg leading-[1.75] font-sans max-w-[68ch]">
              
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
                  alt="Suryodaya Farms Pristine Harvest & Science Guidance" 
                  loading="lazy"
                  className="w-full h-[540px] object-cover transition-transform duration-700 group-hover:scale-105"
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
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">OUR PHILOSOPHY</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {philosophyList.map((item, idx) => (
              <div key={idx} className="bg-[#FAF7F2] border border-[#EDE7D9] p-6 rounded-2xl flex items-center gap-4">
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
      <section className="py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#F4EFE6] via-[#FAF7F2] to-[#FCFAF4] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        
        {/* Soft Background Sun & Leaf Watermarks */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 text-[#C68A2B] pointer-events-none">
          <GiSun size={420} />
        </div>
        <div className="absolute top-8 left-8 opacity-5 text-[#4E641A] pointer-events-none">
          <GiSprout size={180} />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 space-y-8 text-center flex flex-col items-center">
          
          {/* Badge & Heading */}
          <div className="space-y-3 flex flex-col items-center">
            <SectionBadge text="Guiding Purpose & Core Mission" align="center" />
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2F3B0C] tracking-tight">
              OUR PURPOSE
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#4E641A] via-[#C68A2B] to-[#4E641A] rounded-full mt-1" />
          </div>

          {/* Focal Statement Card */}
          <div className="w-full bg-white/90 backdrop-blur-md border border-[#4E641A]/20 rounded-[28px] p-8 sm:p-12 shadow-md hover:shadow-lg transition-all duration-300 relative group">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#F0F5E6] border border-[#4E641A]/30 flex items-center justify-center text-[#4E641A] shadow-xs">
              <GiSprout className="w-5 h-5 text-[#4E641A]" />
            </div>
            
            <span className="font-serif text-5xl text-[#C68A2B]/40 leading-none select-none block mb-2">“</span>
            
            <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-[#2F3B0C] leading-relaxed max-w-4xl mx-auto italic">
              To make premium natural nutrition accessible through products developed with scientific care, uncompromising quality, and genuine respect for customer well-being.
            </p>

            <div className="mt-6 pt-6 border-t border-[#EDE7D9]/80 flex items-center justify-center gap-2">
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
      <div className="w-full bg-[#FCFAF4] py-4 flex items-center justify-center gap-4 text-[#4E641A]/40 select-none">
        <div className="h-px bg-gradient-to-r from-transparent via-[#EDE7D9] to-[#EDE7D9] w-24 sm:w-40" />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F5E6] border border-[#4E641A]/20 text-[#4E641A] text-xs font-bold uppercase tracking-widest shadow-2xs">
          <GiSprout className="w-3.5 h-3.5 text-[#4E641A]" />
          <span>Nature • Science • Trust</span>
        </div>
        <div className="h-px bg-gradient-to-l from-transparent via-[#EDE7D9] to-[#EDE7D9] w-24 sm:w-40" />
      </div>

      {/* 6. OUR VISION (Redesigned Split Layout Presentation) */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#FCFAF4] border-b border-[#EDE7D9] relative overflow-hidden select-none">
        
        {/* Subtle Background Organic Watermark */}
        <div className="absolute -top-10 -right-10 opacity-5 text-[#4E641A] pointer-events-none">
          <GiWheat size={360} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Section Header */}
          <div className="space-y-4 flex flex-col items-start mb-10 lg:mb-14 text-left">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
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
            <div className="lg:col-span-7 space-y-7 text-left text-stone-700 text-base sm:text-lg leading-[1.75] font-sans max-w-[68ch]">
              
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
                  className="w-full h-[520px] object-cover transition-transform duration-700 group-hover:scale-105"
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
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">OUR MISSION</h2>

          <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
            <p>
              At Suryodaya Farms, our mission is to develop and deliver premium-quality natural nutrition products by combining the goodness of nature with scientific expertise, responsible sourcing, hygienic processing, rigorous quality standards, and continuous innovation.
            </p>
            <p>
              We are committed to preserving the natural integrity of every ingredient while ensuring consistency, safety, and quality through disciplined processes and responsible practices.
            </p>
            <p className="font-bold text-[#2F3B0C]">
              By fostering a culture of research, continuous improvement, and customer-focused innovation, we strive to earn lasting trust and inspire healthier lifestyles for individuals and families.
            </p>
          </div>
        </div>
      </section>

      {/* 8. OUR CORE VALUES */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-6xl mx-auto space-y-12 text-left">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C] text-center">OUR CORE VALUES</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((val, idx) => (
              <div key={idx} className="bg-[#FAF7F2] border border-[#EDE7D9] p-8 rounded-[24px] space-y-3">
                <h3 className="font-serif text-xl font-bold text-[#4E641A]">{val.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed font-sans">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. OUR QUALITY COMMITMENT */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <div className="space-y-3">
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
              <div key={idx} className="bg-white border border-[#EDE7D9] p-4 rounded-xl flex items-center gap-3">
                <FiCheckCircle className="text-[#4E641A] text-lg shrink-0" />
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
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-6 text-left text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">OUR PROMISE</h2>
          <p>We promise to remain true to the values that define Suryodaya Farms.</p>
          <p className="font-bold text-[#2F3B0C]">We will never compromise on quality for convenience.</p>
          <p className="font-bold text-[#2F3B0C]">We will never compromise on integrity for growth.</p>
          <p>We will continue learning, improving, and serving with responsibility.</p>
          <p className="font-serif text-xl font-bold text-[#4E641A] italic pt-2">
            Because trust is something that must be earned—every single day.
          </p>
        </div>
      </section>

      {/* 11. OUR TAGLINE */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#F4EFE6] border-b border-[#EDE7D9]">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <span className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-[#B8833E]">OUR TAGLINE</span>
          <h3 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#2F3B0C] whitespace-nowrap">
            Pure Nature. Scientific Quality. Trusted Nutrition.
          </h3>
        </div>
      </section>

      {/* 12. WHY CHOOSE SURYODAYA FARMS? */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-7xl mx-auto space-y-16">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C] text-center">WHY CHOOSE SURYODAYA FARMS?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {whyChooseItems.map((item, idx) => (
              <div key={idx} className="bg-[#FAF7F2] border border-[#EDE7D9] p-8 rounded-[28px] space-y-4 hover:shadow-md transition">
                <h3 className="font-serif text-xl font-bold text-[#2F3B0C]">{item.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. RESEARCH & INNOVATION */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <div className="space-y-3">
            <span className="font-sans text-xs font-bold text-[#B8833E] uppercase tracking-widest">Where Nature Meets Scientific Understanding</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">RESEARCH & INNOVATION</h2>
          </div>

          <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
            <p>
              At Suryodaya Farms, research and innovation are not separate activities—they are part of everything we do.
            </p>
            <p>
              We believe that nature provides remarkable nutritional potential, and science helps us understand, preserve, and responsibly develop that potential into products people can trust.
            </p>
            <p>
              Every product is thoughtfully developed through careful ingredient selection, scientific understanding, quality-focused practices, hygienic processing, and continuous improvement.
            </p>
            <p>Our goal is not simply to create products.</p>
            <p className="font-serif text-xl font-bold text-[#4E641A]">
              Our goal is to create products that customers can choose with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* 14. OUR RESEARCH, TECHNICAL & PRODUCT DEVELOPMENT TEAM */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-6xl mx-auto space-y-8 text-left">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#2F3B0C] whitespace-nowrap">
            Our Research, Technical & Product Development Team
          </h2>

          <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
            <p>
              Behind every Suryodaya Farms product is a dedicated Research, Technical & Product Development Team comprising highly experienced researchers, qualified professionals, and Ph.D.-qualified experts in Botany, working together with scientific responsibility and a shared commitment to excellence.
            </p>
            <p>
              Our team continuously studies natural ingredients, evaluates scientific developments, improves product quality, and refines manufacturing practices to ensure that every product reflects the values of Suryodaya Farms.
            </p>
            <p>
              Rather than seeking recognition, our team works quietly behind every product—transforming knowledge, research, and experience into products that customers can trust.
            </p>
            <div className="bg-[#FAF7F2] border border-[#EDE7D9] p-8 rounded-[28px] space-y-2 mt-6">
              <p className="font-sans text-xs font-bold text-[#B8833E] uppercase tracking-wider">Every decision is guided by one simple question:</p>
              <blockquote className="font-serif text-xl sm:text-2xl font-bold italic text-[#2F3B0C]">
                "How can we develop better products while earning and preserving our customers' trust?"
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* 15. OUR RESEARCH PHILOSOPHY */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">Our Research Philosophy</h2>

          <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
            <p className="font-semibold text-[#2F3B0C]">
              We believe that true innovation is not about changing nature—it is about understanding nature better and using scientific knowledge responsibly.
            </p>
            <p>Research is meaningful only when it improves quality.</p>
            <p>Innovation is valuable only when it benefits people.</p>
            <p>Knowledge has purpose only when it serves society.</p>
            <p className="font-serif text-xl font-bold text-[#4E641A] italic pt-2">
              That philosophy inspires every product we develop.
            </p>
          </div>
        </div>
      </section>

      {/* 16. OUR COMMITMENT */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">Our Commitment</h2>

          <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
            <p className="font-serif text-2xl font-bold text-[#4E641A]">At Suryodaya Farms, research never stops.</p>
            <p>
              We continuously learn, improve, innovate, and refine our products because we believe every customer deserves our very best.
            </p>
            <p className="font-semibold text-[#2F3B0C]">
              Every improvement we make is dedicated to delivering better quality, greater consistency, and lasting customer confidence.
            </p>
          </div>
        </div>
      </section>

      {/* 17. OUR GUIDING PRINCIPLE */}
      <section className="py-14 sm:py-18 lg:py-22 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#2F3B0C] to-[#1E2707] text-white relative overflow-hidden dark-section">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:32px_32px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <span className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-[#B8833E] block">Our Guiding Principle</span>

          <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light italic leading-relaxed text-[#F9F6F0] max-w-4xl mx-auto">
            "Nature inspires us. Science guides us. Innovation strengthens us. Quality defines us. Customer trust is our greatest achievement."
          </blockquote>

          <div className="w-24 h-1 bg-[#B8833E] mx-auto rounded-full mt-8" />
        </div>
      </section>

    </div>
  );
}
