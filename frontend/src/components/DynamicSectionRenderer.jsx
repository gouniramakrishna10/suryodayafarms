import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { FiChevronDown, FiCheck, FiInfo, FiAlertTriangle, FiHelpCircle } from 'react-icons/fi';

export default function DynamicSectionRenderer({ sections = [] }) {
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  // Filter visible sections and sort by orderIndex
  const visibleSections = sections
    .filter(s => s && s.isVisible !== false)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  if (visibleSections.length === 0) return null;

  return (
    <div className="space-y-8 max-w-[900px] mx-auto text-left font-sans my-8 select-text">
      {visibleSections.map((sec, idx) => (
        <div key={sec.id || idx} className="animate-fade-in">
          {renderSingleSection(sec, idx, activeFaqIndex, setActiveFaqIndex)}
        </div>
      ))}
    </div>
  );
}

function renderSingleSection(sec, idx, activeFaqIndex, setActiveFaqIndex) {
  const content = sec.content || {};
  const sectionTitle = sec.title;

  switch (sec.sectionType) {
    case 'HERO':
      return (
        <div className="bg-gradient-to-br from-[#2F3B0C] via-[#37411A] to-[#4E641A] text-white rounded-[32px] p-8 sm:p-12 shadow-md relative overflow-hidden space-y-4 border border-[#4E641A]/30">
          <div className="space-y-1">
            {content.collectionName && (
              <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">
                {content.collectionName}
              </span>
            )}
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              {sectionTitle || 'Product Overview'}
            </h1>
            {content.tagline && (
              <p className="font-serif italic text-amber-200 text-sm sm:text-base">
                {content.tagline}
              </p>
            )}
          </div>
          {content.intro && (
            <p className="font-sans text-xs sm:text-sm text-stone-200 leading-relaxed font-light max-w-2xl border-t border-white/10 pt-4">
              {content.intro}
            </p>
          )}
        </div>
      );

    case 'WHY_CHOOSE_US':
    case 'BENEFITS': {
      const cardList = content.cards || [];
      return (
        <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
          {sectionTitle && (
            <div className="flex items-center gap-3 pb-4 border-b border-[#EDE7D9]">
              <span className="text-2xl">🏆</span>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Why Choose Us</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">{sectionTitle}</h2>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cardList.map((c, cIdx) => (
              <div key={cIdx} className="flex flex-col gap-2 bg-[#FCFAF5] border border-[#EDE7D9] rounded-2xl p-5 hover:border-[#C68A2B]/40 hover:shadow-sm transition duration-300">
                <span className="text-2xl">{c.icon || '✦'}</span>
                <h4 className="font-serif text-sm font-bold text-[#2F3B0C]">{c.title}</h4>
                {c.description && <p className="font-sans text-xs text-stone-500 leading-relaxed font-light">{c.description}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'WAYS_TO_ENJOY': {
      const recipesList = content.recipes || [];
      return (
        <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EDE7D9]">
            <span className="text-2xl">🥤</span>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Usage Guide</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">{sectionTitle || 'Ways to Enjoy'}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recipesList.map((r, rIdx) => (
              <div key={rIdx} className="flex flex-col gap-2 bg-[#FCFAF5] border border-[#EDE7D9] rounded-2xl p-5 hover:border-[#C68A2B]/40 hover:shadow-sm transition duration-300">
                <span className="text-3xl">{r.icon || '🥤'}</span>
                <h4 className="font-serif text-sm font-bold text-[#2F3B0C]">{r.title}</h4>
                {r.description && <p className="font-sans text-xs text-stone-500 leading-relaxed font-light">{r.description}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'HIGHLIGHTS':
    case 'STORAGE':
    case 'QUALITY':
    case 'SUGGESTED_SERVING': {
      const itemsList = content.items || content.instructions || [];
      return (
        <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EDE7D9]">
            <span className="text-2xl">✨</span>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Highlights</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">{sectionTitle || 'Product Features'}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {itemsList.map((item, itemIdx) => (
              <div key={itemIdx} className="flex items-start gap-3 bg-[#FCFAF5] border border-[#EDE7D9] rounded-xl p-4">
                <span className="text-[#4E641A] font-bold text-sm shrink-0 mt-0.5">✔</span>
                <span className="font-sans text-xs sm:text-sm text-stone-700 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'NUTRIENTS': {
      const nutrientsList = content.items || [];
      return (
        <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EDE7D9]">
            <span className="text-2xl">🧪</span>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Nutritional Profile</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">{sectionTitle || 'Naturally Occurring Nutrients'}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {nutrientsList.map((n, nIdx) => (
              <div key={nIdx} className="bg-[#FCFAF5] border border-[#EDE7D9] rounded-2xl p-4 text-center space-y-1">
                <span className="font-serif text-lg font-bold text-[#4E641A] block">{n.value}</span>
                <span className="font-sans text-xs text-stone-600 font-semibold block">{n.name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'FAQS': {
      const faqList = content.items || [];
      return (
        <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EDE7D9]">
            <span className="text-2xl">❓</span>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Customer Support</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">{sectionTitle || 'Frequently Asked Questions'}</h2>
            </div>
          </div>
          <div className="space-y-3">
            {faqList.map((faq, fIdx) => {
              const isOpen = activeFaqIndex === `${idx}-${fIdx}`;
              return (
                <div key={fIdx} className="border border-[#EDE7D9] rounded-2xl overflow-hidden bg-[#FCFAF5] transition">
                  <button
                    type="button"
                    onClick={() => setActiveFaqIndex(isOpen ? null : `${idx}-${fIdx}`)}
                    className="w-full p-4 flex justify-between items-center text-left font-serif text-sm font-bold text-[#2F3B0C] cursor-pointer border-none bg-transparent"
                  >
                    <span>{faq.question}</span>
                    <FiChevronDown className={`text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#4E641A]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed border-t border-[#EDE7D9]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'SPECIFICATIONS':
    case 'NUTRITION_FACTS': {
      const pairList = content.pairs || [];
      return (
        <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EDE7D9]">
            <span className="text-2xl">📋</span>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Product Details</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">{sectionTitle || 'Specifications'}</h2>
            </div>
          </div>
          <div className="border border-[#EDE7D9] rounded-2xl overflow-hidden divide-y divide-[#EDE7D9]">
            {pairList.map((p, pIdx) => (
              <div key={pIdx} className="flex justify-between items-center px-5 py-3.5 bg-white even:bg-[#FCFAF5]">
                <span className="font-serif text-xs sm:text-sm font-bold text-[#2F3B0C]">{p.key}</span>
                <span className="font-sans text-xs sm:text-sm text-stone-600 font-medium">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'IMAGE':
      if (!content.imageUrl) return null;
      return (
        <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-4">
          {sectionTitle && (
            <h2 className="font-serif text-xl font-bold text-[#2F3B0C] pb-2 border-b border-[#EDE7D9]">{sectionTitle}</h2>
          )}
          <img 
            src={content.imageUrl} 
            alt={content.caption || sectionTitle || 'Product Content Image'}
            className="w-full rounded-2xl border border-stone-200 object-cover max-h-[500px]"
          />
          {content.caption && (
            <p className="text-xs text-stone-500 font-serif italic text-center">{content.caption}</p>
          )}
        </div>
      );

    case 'VIDEO':
      if (!content.videoUrl) return null;
      return (
        <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-4">
          {sectionTitle && (
            <h2 className="font-serif text-xl font-bold text-[#2F3B0C] pb-2 border-b border-[#EDE7D9]">{sectionTitle}</h2>
          )}
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
            <iframe
              src={content.videoUrl.replace('watch?v=', 'embed/')}
              title={sectionTitle || 'Product Video'}
              className="w-full h-full border-none"
              allowFullScreen
            />
          </div>
        </div>
      );

    case 'DIVIDER':
      return <hr className="border-t border-[#EDE7D9] my-8" />;

    case 'CALLOUT':
    case 'QUOTE':
    case 'WARNING':
      return (
        <div className="bg-[#FDFBF7] border-l-4 border-[#C68A2B] rounded-r-3xl p-6 sm:p-8 shadow-2xs space-y-2">
          {sectionTitle && (
            <h4 className="font-serif text-sm font-bold text-[#2F3B0C] uppercase tracking-wider">{sectionTitle}</h4>
          )}
          <p className="font-serif italic text-stone-800 text-sm sm:text-base leading-relaxed">
            "{content.text}"
          </p>
          {content.author && (
            <span className="text-xs text-[#4E641A] font-sans font-bold block pt-1">— {content.author}</span>
          )}
        </div>
      );

    default: {
      // Standard Rich Text Section (RICH_TEXT, ABOUT_PRODUCT, BRAND_STORY, INGREDIENTS, PACKAGING, OUR_PROMISE, CUSTOM)
      if (!content.html) return null;
      return (
        <div className="bg-white border border-[#EDE7D9] rounded-[28px] p-6 sm:p-8 md:p-10 shadow-xs">
          {sectionTitle && (
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#EDE7D9]">
              <span className="text-2xl">📝</span>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#C68A2B] uppercase block">Detailed Info</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3B0C]">{sectionTitle}</h2>
              </div>
            </div>
          )}
          <div 
            className="detailed-product-description prose max-w-none text-left select-text"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.html) }}
          />
        </div>
      );
    }
  }
}
