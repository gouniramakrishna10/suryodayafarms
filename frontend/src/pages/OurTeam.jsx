import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiAward,
  FiTrendingUp,
  FiBookOpen,
  FiUsers,
  FiCheckCircle,
  FiArrowRight,
  FiHeart
} from 'react-icons/fi';
import { GiSprout, GiSun, GiWheat } from 'react-icons/gi';
import SectionBadge from '../components/SectionBadge';
import { useSEO } from '../hooks/useSEO';

export default function OurTeam() {
  // SEO Meta Sync
  useSEO();

  return (
    <div className="bg-[#FAF7F2] min-h-screen font-sans text-[#2F3B0C] selection:bg-[#4E641A] selection:text-white">
      
      {/* 1. PAGE HERO / HEADER */}
      <section className="relative pt-6 pb-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#F4EFE6] via-[#FAF7F2] to-[#FAF7F2] border-b border-[#EDE7D9] overflow-hidden select-none">
        
        {/* Subtle Background Organic Watermarks */}
        <div className="absolute top-10 right-10 opacity-5 text-[#4E641A] pointer-events-none">
          <GiSprout size={360} />
        </div>
        <div className="absolute bottom-6 left-8 opacity-5 text-[#C68A2B] pointer-events-none">
          <GiSun size={280} />
        </div>

        <div className="max-w-5xl mx-auto space-y-5 text-center flex flex-col items-center relative z-10">
          <SectionBadge text="Leadership & Scientific Excellence" align="center" />
          
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#2F3B0C] tracking-tight leading-tight">
            Meet Our Team
          </h1>

          <p className="font-serif text-lg sm:text-2xl text-[#4E641A] font-semibold italic max-w-2xl mx-auto">
            The Dedicated Minds Behind Suryodaya Farms
          </p>

          <div className="w-24 h-1 bg-gradient-to-r from-[#4E641A] via-[#C68A2B] to-[#4E641A] rounded-full my-1" />

          <p className="font-sans text-stone-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto pt-2">
            Rooted in agriculture, guided by science, and committed to customer trust. Meet the dedicated leadership, botanical experts, and researchers who drive Suryodaya Farms forward.
          </p>
        </div>
      </section>

      {/* 2. MAIN TEAM CONTENT */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] relative overflow-hidden select-none">
        {/* Subtle Background Botanical Watermarks */}
        <div className="absolute top-24 right-12 opacity-5 text-[#4E641A] pointer-events-none">
          <GiSprout size={320} />
        </div>
        <div className="absolute bottom-24 left-12 opacity-5 text-[#C68A2B] pointer-events-none">
          <GiWheat size={280} />
        </div>

        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 relative z-10">

          {/* Founder & Marketing Head Subsection */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[#EDE7D9] pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E641A]" />
              <h2 className="font-sans text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-[#4E641A]">
                Founder & Leadership
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              
              {/* Card 1: Founder */}
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 lg:p-9 shadow-2xs hover:shadow-md hover:border-[#4E641A]/40 transition-all duration-300 flex flex-col justify-between h-full group text-left">
                <div className="space-y-6">
                  {/* Avatar & Header */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#F0F5E6] via-[#FAF7F2] to-[#E4DDCB] border-2 border-[#4E641A]/30 flex items-center justify-center shadow-xs group-hover:border-[#4E641A] transition-colors duration-300 relative overflow-hidden">
                        <GiSprout className="absolute opacity-10 text-[#4E641A] w-12 h-12" />
                        <span className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">GR</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#4E641A] text-white flex items-center justify-center text-xs shadow-sm">
                        <GiSprout className="w-4 h-4 text-[#C68A2B]" />
                      </div>
                    </div>

                    <div className="space-y-1 flex-1">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C] leading-tight">
                        G. Ramakrishna
                      </h3>
                      <p className="font-sans text-sm sm:text-base font-semibold text-[#4E641A]">
                        Founder | Suryodaya Farms
                      </p>
                    </div>
                  </div>

                  {/* Highlight Quote */}
                  <div className="bg-[#F0F5E6] border-l-4 border-[#4E641A] p-4 sm:p-5 rounded-r-2xl">
                    <p className="font-serif italic text-base sm:text-lg text-[#2F3B0C] leading-snug font-medium">
                      "Rooted in Agriculture. Driven by Purpose. Committed to Better Food."
                    </p>
                  </div>

                  {/* Complete Profile */}
                  <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                    <p>
                      G. Ramakrishna comes from a farming background and brings hands-on agricultural experience along with 12+ years of corporate experience in managerial and financial advisory roles with reputed organizations including Indiabulls, Tata Capital Financial Services, RBL Bank Ltd., and SMFG India Credit Company Ltd.
                    </p>
                    <p>
                      His journey led to a clear entrepreneurial vision—to create better food from quality agricultural resources and serve consumers with products they can trust. To pursue this vision, he collaborated with farmers, R&D institutions, scientists, and Botany experts, developing a research-driven approach to food innovation.
                    </p>
                    <p>
                      As Founder of Suryodaya Farms, he drives the company’s strategic direction, product development, and growth, bringing together agriculture, science, and consumer needs.
                    </p>
                  </div>
                </div>

                {/* Closing Statement */}
                <div className="mt-6 pt-5 border-t border-[#EDE7D9] bg-[#FAF7F2] p-4 rounded-xl border border-[#EDE7D9]/60">
                  <p className="font-serif italic text-sm sm:text-base text-[#2F3B0C]">
                    “My dream is simple—to transform the goodness of agriculture into food that people can trust and choose for a healthier future.”
                  </p>
                </div>
              </div>

              {/* Card 2: Marketing Head */}
              <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 lg:p-9 shadow-2xs hover:shadow-md hover:border-[#4E641A]/40 transition-all duration-300 flex flex-col justify-between h-full group text-left">
                <div className="space-y-6">
                  {/* Avatar & Header */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#F0F5E6] via-[#FAF7F2] to-[#E4DDCB] border-2 border-[#4E641A]/30 flex items-center justify-center shadow-xs group-hover:border-[#4E641A] transition-colors duration-300 relative overflow-hidden">
                        <GiSun className="absolute opacity-10 text-[#C68A2B] w-12 h-12" />
                        <span className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">BL</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#4E641A] text-white flex items-center justify-center text-xs shadow-sm">
                        <FiTrendingUp className="w-3.5 h-3.5 text-[#C68A2B]" />
                      </div>
                    </div>

                    <div className="space-y-1 flex-1">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3B0C] leading-tight">
                        Bandaru Lalith
                      </h3>
                      <p className="font-sans text-sm sm:text-base font-semibold text-[#4E641A]">
                        Marketing Head | Suryodaya Farms
                      </p>
                    </div>
                  </div>

                  {/* Highlight Quote */}
                  <div className="bg-[#F0F5E6] border-l-4 border-[#4E641A] p-4 sm:p-5 rounded-r-2xl">
                    <p className="font-serif italic text-base sm:text-lg text-[#2F3B0C] leading-snug font-medium">
                      "Connecting Quality Products with Consumers. Building Trust. Driving Growth."
                    </p>
                  </div>

                  {/* Complete Profile */}
                  <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                    <p>
                      Bandaru Lalith brings 10+ years of managerial experience in the financial services sector, having worked with reputed organizations including ICICI Bank, HDFC Bank, L&T Finance, RBL Bank, Federal Bank, IDFC Bank, and SMFG India Credit Company.
                    </p>
                    <p>
                      He holds an MCA and combines his expertise in management, technology, customer relationships, and business development with a strong understanding of market needs.
                    </p>
                    <p>
                      As Marketing Head at Suryodaya Farms, he is responsible for marketing strategy, brand positioning, customer engagement, market development, and business growth, with a focus on connecting Suryodaya Farms products with consumers and building lasting customer trust.
                    </p>
                    <p>
                      His approach is centered on understanding consumer needs, communicating product value, strengthening the brand, and creating sustainable market opportunities for Suryodaya Farms.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Research & Scientific Team Subsection */}
          <div className="space-y-8 pt-4">
            <div className="flex items-center gap-3 border-b border-[#EDE7D9] pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C68A2B]" />
              <h2 className="font-sans text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-[#4E641A]">
                RESEARCH & SCIENTIFIC TEAM
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              
              {/* Card 1: Dr. Raghu K. */}
              <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-6 sm:p-7 shadow-2xs hover:shadow-md hover:border-[#4E641A]/40 transition-all duration-300 flex flex-col justify-between h-full group text-left">
                <div className="space-y-5">
                  {/* Avatar & Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#F0F5E6] via-[#FAF7F2] to-[#E4DDCB] border-2 border-[#4E641A]/30 flex items-center justify-center shadow-xs group-hover:border-[#4E641A] transition-colors duration-300 relative overflow-hidden">
                        <GiWheat className="absolute opacity-10 text-[#4E641A] w-10 h-10" />
                        <span className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C]">RK</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#4E641A] text-white flex items-center justify-center text-xs shadow-sm">
                        <FiAward className="w-3 h-3 text-[#C68A2B]" />
                      </div>
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C] leading-snug">
                        Dr. Raghu K., Ph.D. (Botany)
                      </h3>
                      <p className="font-sans text-xs sm:text-sm font-semibold text-[#4E641A]">
                        Head – Research & Product Development | Suryodaya Farms
                      </p>
                    </div>
                  </div>

                  {/* Vision Quote Tagline */}
                  <div className="bg-[#F0F5E6] border-l-4 border-[#4E641A] p-3.5 sm:p-4 rounded-r-xl">
                    <p className="font-serif italic text-xs sm:text-sm text-[#2F3B0C] leading-relaxed font-medium">
                      "His vision is simple: to create and serve food products with quality, honesty, and scientific responsibility—building lasting customer trust and contributing to a healthier future."
                    </p>
                  </div>

                  {/* Complete Profile */}
                  <div className="space-y-3.5 text-stone-700 text-xs sm:text-sm leading-relaxed font-sans">
                    <p>
                      Dr. Raghu K. is an Assistant Professor (PT), Department of Botany, University College of Science (UCS), Osmania University, Hyderabad, with expertise in Plant Sciences, Ethnomycology, Mushroom Cultivation, Hydroponics, Microgreens, Plant-Based Food Research, and Sustainable Farming Technologies. He holds an M.Sc. and Ph.D. in Botany from Osmania University and is qualified in TS-SET and ICAR-NET.
                    </p>
                    <p>
                      With continuous learning through specialized training programmes, workshops, institutional visits, and exposure to emerging agricultural and food technologies, he brings scientific knowledge and practical experience into product development.
                    </p>
                    <p>
                      At Suryodaya Farms, he leads Research & Product Development, driving scientific research, product innovation, raw-material evaluation, quality development, and continuous improvement to transform agricultural resources into innovative, nutritious, and high-quality food products.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Dr. A.B. Rajitha Sri */}
              <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-6 sm:p-7 shadow-2xs hover:shadow-md hover:border-[#4E641A]/40 transition-all duration-300 flex flex-col justify-between h-full group text-left">
                <div className="space-y-5">
                  {/* Avatar & Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#F0F5E6] via-[#FAF7F2] to-[#E4DDCB] border-2 border-[#4E641A]/30 flex items-center justify-center shadow-xs group-hover:border-[#4E641A] transition-colors duration-300 relative overflow-hidden">
                        <GiSprout className="absolute opacity-10 text-[#4E641A] w-10 h-10" />
                        <span className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C]">RS</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#4E641A] text-white flex items-center justify-center text-xs shadow-sm">
                        <FiAward className="w-3 h-3 text-[#C68A2B]" />
                      </div>
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C] leading-snug">
                        Dr. A.B. Rajitha Sri, Ph.D. (Botany)
                      </h3>
                      <p className="font-sans text-xs sm:text-sm font-semibold text-[#4E641A]">
                        Research & Technical Team | Suryodaya Farms
                      </p>
                    </div>
                  </div>

                  {/* Key Distinction Badge */}
                  <div className="bg-[#FAF7F2] border border-[#EDE7D9] px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                    <FiAward className="w-4 h-4 text-[#C68A2B] shrink-0" />
                    <span className="font-serif text-xs font-bold text-[#2F3B0C] italic">
                      Osmania University Gold Medalist
                    </span>
                  </div>

                  {/* Complete Profile */}
                  <div className="space-y-3.5 text-stone-700 text-xs sm:text-sm leading-relaxed font-sans">
                    <p>
                      Dr. A.B. Rajitha Sri holds a Ph.D. in Botany from Osmania University and is an Osmania University Gold Medalist, UGC Junior Research Fellow (BSR-RFSMS), and DST INSPIRE Research fellow. She has strong research experience in Plant Sciences, Agricultural Research, Plant–Microbe Interactions, Plant Health, Crop Research, Disease Management, Plant Microbiology, and Fungal Biotechnology.
                    </p>
                    <p>
                      As a member of the Research & Technical Team at Suryodaya Farms, she contributes her scientific expertise to raw material evaluation, research-based product development, quality assessment, product formulation, and continuous improvement.
                    </p>
                    <p>
                      Her knowledge of plant science and research methodologies supports Suryodaya Farms in developing safe, nutritious, high-quality, and scientifically guided natural food products.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Dr. L. Paramesh Lingala */}
              <div className="bg-white border border-[#EDE7D9] rounded-[24px] p-6 sm:p-7 shadow-2xs hover:shadow-md hover:border-[#4E641A]/40 transition-all duration-300 flex flex-col justify-between h-full group text-left">
                <div className="space-y-5">
                  {/* Avatar & Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#F0F5E6] via-[#FAF7F2] to-[#E4DDCB] border-2 border-[#4E641A]/30 flex items-center justify-center shadow-xs group-hover:border-[#4E641A] transition-colors duration-300 relative overflow-hidden">
                        <GiWheat className="absolute opacity-10 text-[#4E641A] w-10 h-10" />
                        <span className="font-serif text-lg sm:text-xl font-bold text-[#2F3B0C]">PL</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#4E641A] text-white flex items-center justify-center text-xs shadow-sm">
                        <FiBookOpen className="w-3 h-3 text-[#C68A2B]" />
                      </div>
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C] leading-snug">
                        Dr. L. Paramesh Lingala, Ph.D. (Botany)
                      </h3>
                      <p className="font-sans text-xs sm:text-sm font-semibold text-[#4E641A]">
                        Botanical & Scientific Consultant | Suryodaya Farms
                      </p>
                    </div>
                  </div>

                  {/* Key Distinction Badge */}
                  <div className="bg-[#FAF7F2] border border-[#EDE7D9] px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                    <FiBookOpen className="w-4 h-4 text-[#C68A2B] shrink-0" />
                    <span className="font-serif text-xs font-bold text-[#2F3B0C] italic">
                      M.Sc. Botany Gold Medalist
                    </span>
                  </div>

                  {/* Complete Profile */}
                  <div className="space-y-3.5 text-stone-700 text-xs sm:text-sm leading-relaxed font-sans">
                    <p>
                      Dr. L. Paramesh Lingala is an Assistant Professor (PT), Department of Botany, Osmania University, Hyderabad, with over 14 years of research and field experience in Plant Taxonomy, Medicinal Botany, Ethnobotany, and Botanical Sciences.
                    </p>
                    <p>
                      An M.Sc. Botany Gold Medalist, Ph.D. in Botany, and TS-SET qualified, Dr. Lingala has contributed 40+ research publications in reputed national and international journals and has authored three books. His expertise in plant identification, taxonomic documentation, and botanical research provides valuable scientific support to Suryodaya Farms.
                    </p>
                    <p>
                      As the Botanical & Scientific Consultant at Suryodaya Farms, Dr. Lingala provides expert guidance in the identification, selection, evaluation, and scientific documentation of plant-based raw materials, supporting the company's focus on quality, authenticity, and scientific integrity.
                    </p>
                    <p>
                      His expertise strengthens Suryodaya Farms' vision of developing safe, nutritious, high-quality, and nature-based food products, bringing together scientific knowledge, responsible sourcing, and the goodness of nature.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. CONCLUDING CALLOUT / FOOTER BANNER */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-r from-[#2F3B0C] via-[#3F4F16] to-[#4E641A] text-white text-center select-none border-t border-[#4E641A]/30">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto shadow-xs">
            <GiSprout className="w-6 h-6 text-[#C68A2B]" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Driven by Science. Inspired by Nature. Built on Trust.
          </h2>

          <p className="font-sans text-stone-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
            Our multidisciplinary team connects traditional agricultural wisdom with modern scientific research to deliver superfoods you can choose with complete confidence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              to="/products"
              className="px-6 py-3 rounded-xl bg-[#C68A2B] hover:bg-[#b07820] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>Explore Products</span>
              <FiArrowRight size={14} />
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
