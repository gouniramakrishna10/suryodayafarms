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
            <p>Welcome to Suryodaya Farms.</p>
            <p>Thank you for placing your trust in us.</p>
            <p className="font-serif italic text-lg sm:text-xl text-[#4E641A] border-l-4 border-[#B8833E] pl-6 my-4">
              Every product we create begins with a simple belief:<br />
              Nature has the power to nourish. Science has the responsibility to preserve it.
            </p>
            <p>
              In today's fast-moving world, people deserve natural foods they can trust—products that are prepared with care, guided by science, and delivered with honesty.
            </p>
            <p>That belief is the foundation of Suryodaya Farms.</p>
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
            <p>Thank you for being a part of the Suryodaya Farms family.</p>
            <div className="pt-6 border-t border-[#EDE7D9]">
              <p className="font-serif text-base font-bold text-[#2F3B0C]">With gratitude,</p>
              <p className="font-serif text-lg font-bold text-[#4E641A]">Team Suryodaya Farms</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR STORY */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <div className="space-y-3">
            <span className="font-sans text-xs font-bold text-[#B8833E] uppercase tracking-widest">Every Sunrise Brings New Hope</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">OUR STORY</h2>
          </div>

          <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
            <p>
              The name Suryodaya means Sunrise—a symbol of hope, energy, renewal, and the beginning of a healthier tomorrow.
            </p>
            <p>
              Suryodaya Farms was established with a simple yet meaningful vision:<br />
              <strong className="text-[#2F3B0C]">To reconnect people with the goodness of nature through products they can genuinely trust.</strong>
            </p>
            <p>
              As awareness of healthy living grows, so does the need for natural foods that are prepared responsibly and backed by scientific understanding. We recognized that customers are not only looking for nutrition—they are looking for confidence in what they consume.
            </p>
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#4E641A] py-2">
              This belief inspired us to build Suryodaya Farms on three enduring pillars: Nature. Science. Trust.
            </p>
            <p>
              By combining carefully selected natural ingredients with scientific knowledge and rigorous quality standards, we strive to deliver products that preserve nature's goodness while meeting the expectations of today's health-conscious consumers.
            </p>
            <p>
              For us, quality is not a final checkpoint—it is a responsibility carried through every stage of our work.
            </p>
            <div className="bg-[#FAF7F2] border border-[#EDE7D9] p-6 rounded-2xl space-y-2 font-semibold text-[#2F3B0C]">
              <p>Every product reflects our commitment to purity, consistency, and integrity.</p>
              <p>Every customer inspires us to improve.</p>
              <p>Every sunrise reminds us that healthy living begins with better choices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SURYODAYA FARMS */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF7F2] border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <div className="space-y-3">
            <span className="font-sans text-xs font-bold text-[#4E641A] uppercase tracking-widest">Nature's Goodness. Guided by Science.</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">ABOUT SURYODAYA FARMS</h2>
          </div>

          <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
            <p>
              At Suryodaya Farms, we believe that true wellness begins with pure, natural nutrition.
            </p>
            <p>
              We are a science-driven natural superfood company dedicated to developing products that combine the richness of nature with carefully guided scientific processes.
            </p>
            <p>
              Our work encompasses responsible sourcing, product development, hygienic processing, quality assurance, and the supply of premium natural superfoods that support healthy lifestyles.
            </p>
            <p>
              What distinguishes Suryodaya Farms is our commitment to scientific excellence.
            </p>
            <p>
              Our product development and quality practices are guided by experienced researchers, technical professionals, and Doctorates in Botany, ensuring that every stage—from ingredient selection to packaging—is approached with knowledge, care, and responsibility.
            </p>
            <p className="font-bold text-[#2F3B0C]">
              We believe that science should never replace nature. Instead, science should help preserve the natural qualities that make wholesome foods valuable.
            </p>
            <p>That philosophy influences every decision we make.</p>
            <p>
              Rather than relying on exaggerated claims, we focus on delivering products that consistently reflect our values of quality, honesty, and transparency.
            </p>
            <p className="font-semibold text-[#4E641A]">
              When customers choose Suryodaya Farms, they are choosing more than a product. They are choosing a company committed to earning their trust every day.
            </p>
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
                <span className="w-9 h-9 rounded-full bg-[#4E641A] text-white font-serif font-bold text-lg flex items-center justify-center shrink-0">
                  {idx + 1}
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

      {/* 5. OUR PURPOSE */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#F4EFE6] border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">OUR PURPOSE</h2>
          <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-[#2F3B0C] leading-relaxed max-w-3xl mx-auto">
            To make premium natural nutrition accessible through products developed with scientific care, uncompromising quality, and genuine respect for customer well-being.
          </p>
        </div>
      </section>

      {/* 6. OUR VISION */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EDE7D9]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2F3B0C]">OUR VISION</h2>

          <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-[1.8] font-sans">
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#4E641A]">
              To become one of India's most trusted and respected natural nutrition companies by combining the purity of nature with scientific excellence, uncompromising quality, responsible innovation, and lasting customer trust.
            </p>
            <p>
              We aspire to create products that enrich everyday nutrition, inspire healthier lifestyles, and set high standards for quality, integrity, and responsible business practices.
            </p>
            <p>
              As we grow, we aim to build meaningful relationships with our customers, farmers, partners, and communities while continuously advancing through research, innovation, and sustainable development.
            </p>
            <p className="font-semibold text-[#2F3B0C]">
              Our vision is not only to grow as a company but also to earn the confidence of generations by delivering products that people can choose with trust.
            </p>
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
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-[#B8833E]">OUR TAGLINE</span>
          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2F3B0C]">
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
