import React, { useState, useMemo } from 'react';
import { 
  FiPlus, FiTrash2, FiEye, FiEyeOff, FiChevronUp, FiChevronDown, 
  FiCopy, FiGrid, FiList, FiEdit3, FiCheck, FiX, FiHelpCircle, 
  FiImage, FiFileText, FiSearch, FiSidebar, FiMaximize2, FiMinimize2,
  FiArrowLeft, FiSave, FiLayers, FiCheckCircle, FiTerminal
} from 'react-icons/fi';
import LazyRichTextEditor from './LazyRichTextEditor';
import UnifiedUploader from '../../components/UnifiedUploader';
import AiContentGeneratorModal from './AiContentGeneratorModal';
import { useFeedbackStore } from '../../store/useFeedbackStore';

export const SECTION_TYPES = [
  { id: 'HERO', label: 'Hero Banner', category: 'Intro', icon: '👑', desc: 'Product Name, Collection tag, Tagline & Intro paragraph' },
  { id: 'RICH_TEXT', label: 'Rich Text Block', category: 'Content', icon: '📝', desc: 'Full-width formatted text with headings, lists, tables & images' },
  { id: 'ABOUT_PRODUCT', label: 'About Product', category: 'Content', icon: '📄', desc: 'Detailed story and overview about the product' },
  { id: 'ABOUT_INGREDIENT', label: 'About Ingredient', category: 'Content', icon: '🌿', desc: 'Deep dive into key natural ingredient benefits' },
  { id: 'WHY_CHOOSE_US', label: 'Why Choose Us', category: 'Features', icon: '🏆', desc: 'Grid of feature cards with icons, titles & descriptions' },
  { id: 'HIGHLIGHTS', label: 'Product Highlights', category: 'Checklists', icon: '✨', desc: 'Checklist of key product highlights & badges' },
  { id: 'NUTRIENTS', label: 'Naturally Occurring Nutrients', category: 'Nutrition', icon: '🧪', desc: 'Grid of nutrient badges & percentage values' },
  { id: 'BENEFITS', label: 'Health Benefits', category: 'Features', icon: '💚', desc: 'Grid of health benefit cards' },
  { id: 'WAYS_TO_ENJOY', label: 'Ways to Enjoy (Recipes)', category: 'Guides', icon: '🥤', desc: 'Serving suggestions and recipe ideas' },
  { id: 'SUGGESTED_SERVING', label: 'Suggested Serving', category: 'Guides', icon: '🥄', desc: 'Recommended daily intake & serving steps' },
  { id: 'STORAGE', label: 'Storage Instructions', category: 'Guides', icon: '📦', desc: 'Care and preservation instructions' },
  { id: 'INGREDIENTS', label: 'Ingredients Breakdown', category: 'Nutrition', icon: '🌱', desc: 'Clean natural ingredient breakdown' },
  { id: 'PACKAGING', label: 'Packaging Info', category: 'Info', icon: '🛍️', desc: 'Eco-packaging details & bottle preservation' },
  { id: 'CERTIFICATIONS', label: 'Certifications & Seals', category: 'Trust', icon: '🛡️', desc: 'Organic, Vedic & ISO certification badges' },
  { id: 'QUALITY', label: 'Quality Commitment', category: 'Trust', icon: '💎', desc: 'Checklist of lab testing & quality standards' },
  { id: 'FAQS', label: 'Frequently Asked Questions', category: 'Support', icon: '❓', desc: 'Expandable Q&A accordion list' },
  { id: 'OUR_PROMISE', label: 'Our Promise', category: 'Brand', icon: '🤝', desc: 'Pledge to farmers and pure dryland agriculture' },
  { id: 'BRAND_STORY', label: 'Brand Story', category: 'Brand', icon: '📖', desc: 'The heritage and journey of Suryodaya Farms' },
  { id: 'SURVEYODAYA_DIFFERENCE', label: 'The Suryodaya Farms Difference', category: 'Brand', icon: '☀️', desc: 'What sets dryland Vedic farming apart' },
  { id: 'SPECIFICATIONS', label: 'Product Specifications', category: 'Specs', icon: '📋', desc: 'Key-value table (Weight, Shelf Life, Origin, SKU)' },
  { id: 'NUTRITION_FACTS', label: 'Nutrition Facts Table', category: 'Specs', icon: '📊', desc: 'Caloric & macronutrient table per 100g' },
  { id: 'IMAGE', label: 'Featured Image', category: 'Media', icon: '🖼️', desc: 'Full width image with caption' },
  { id: 'VIDEO', label: 'Video Embed', category: 'Media', icon: '🎥', desc: 'YouTube or Vimeo product video' },
  { id: 'CALLOUT', label: 'Callout Box', category: 'Formatting', icon: '💡', desc: 'Highlighted info box with icon accent' },
  { id: 'QUOTE', label: 'Quote / Testimonial', category: 'Formatting', icon: '💬', desc: 'Quote card with author citation' },
  { id: 'WARNING', label: 'Warning / Caution', category: 'Formatting', icon: '⚠️', desc: 'Allergen or health caution box' },
  { id: 'DIVIDER', label: 'Section Divider', category: 'Formatting', icon: '➖', desc: 'Horizontal line divider' },
  { id: 'CUSTOM', label: 'Custom Section', category: 'Custom', icon: '⚙️', desc: 'Custom title with rich text / cards layout' }
];

export default function ProductContentBuilder({ 
  sections = [], 
  onChange, 
  onProductFieldsGenerated,
  onBack,
  onSave,
  onSaveDraft,
  isSaving = false 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Developer Debug Panel State
  const [debugLog, setDebugLog] = useState(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [activeDebugTab, setActiveDebugTab] = useState('sections');

  const toggleExpand = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: prev[index] === undefined ? false : !prev[index]
    }));
  };

  const handleAddSection = (typeObj) => {
    const defaultContent = getDefaultContentForType(typeObj.id);
    const newSec = {
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sectionType: typeObj.id,
      title: typeObj.label,
      content: defaultContent,
      orderIndex: sections.length,
      isVisible: true
    };
    onChange([...sections, newSec]);
    setExpandedSections(prev => ({ ...prev, [sections.length]: true }));
    useFeedbackStore.getState().showToast(`✅ Added "${typeObj.label}" section`, 'success');
  };

  const handleUpdateSection = (index, updatedFields) => {
    const next = [...sections];
    next[index] = { ...next[index], ...updatedFields };
    onChange(next);
  };

  const handleUpdateContent = (index, key, value) => {
    const next = [...sections];
    const currentSec = next[index];
    next[index] = {
      ...currentSec,
      content: {
        ...(currentSec.content || {}),
        [key]: value
      }
    };
    onChange(next);
  };

  const handleReorder = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const next = [...sections];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    
    const reindexed = next.map((sec, idx) => ({ ...sec, orderIndex: idx }));
    onChange(reindexed);
  };

  const handleDuplicate = (index) => {
    const source = sections[index];
    if (!source) return;
    const dup = {
      ...JSON.parse(JSON.stringify(source)),
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `${source.title || 'Section'} (Copy)`,
      orderIndex: index + 1
    };
    const next = [...sections];
    next.splice(index + 1, 0, dup);
    const reindexed = next.map((sec, idx) => ({ ...sec, orderIndex: idx }));
    onChange(reindexed);
    useFeedbackStore.getState().showToast('📋 Section duplicated', 'success');
  };

  const handleDelete = (index) => {
    const deletedTitle = sections[index]?.title || 'Section';
    const next = sections.filter((_, i) => i !== index).map((sec, idx) => ({ ...sec, orderIndex: idx }));
    onChange(next);
    useFeedbackStore.getState().showToast(`🗑️ Deleted "${deletedTitle}"`, 'info');
  };

  const categoriesList = useMemo(() => ['All', ...new Set(SECTION_TYPES.map(s => s.category))], []);

  const filteredSectionTypes = useMemo(() => {
    return SECTION_TYPES.filter(s => {
      const matchesCat = activeCategoryFilter === 'All' || s.category === activeCategoryFilter;
      const matchesSearch = !searchQuery || 
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, activeCategoryFilter]);

  return (
    <div className="w-full flex flex-col bg-[#FAF8F5] min-h-[calc(100vh-120px)] rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs text-left font-sans">
      
      {/* 1. TOP CMS WORKSPACE HEADER BAR */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 shadow-xxs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl text-stone-500 hover:text-[#4E641A] hover:bg-stone-100 transition cursor-pointer border-none bg-transparent"
              title="Go Back"
            >
              <FiArrowLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">Product Content CMS Workspace</h2>
              <span className="text-[10px] font-extrabold text-[#4E641A] bg-[#4E641A]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {sections.length} Sections
              </span>
            </div>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              Shopify & Notion-style full-width builder. Insert sections from library, reorder, and edit rich content.
            </p>
          </div>
        </div>

        {/* Top Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#4E641A] to-[#37411A] hover:from-[#2F3B0C] hover:to-[#2F3B0C] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm border-none flex items-center gap-1.5"
          >
            <span className="text-amber-300 animate-pulse text-sm">✨</span>
            <span>Generate Page with AI</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1 ${
              showDebugPanel
                ? 'bg-stone-900 text-amber-300 border-stone-800'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
            }`}
            title="Toggle Developer Debug Panel"
          >
            <FiTerminal size={14} />
            <span className="hidden sm:inline">🛠️ Dev Debug</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
              isLibraryOpen 
                ? 'bg-[#4E641A]/10 text-[#4E641A] border-[#4E641A]/20' 
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <FiSidebar size={14} />
            <span className="hidden md:inline">{isLibraryOpen ? 'Hide Library' : 'Show Library'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#C68A2B] border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <FiPlus size={14} />
            <span>Add Section</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
              isPreviewMode 
                ? 'bg-[#4E641A] text-white border-transparent' 
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <FiEye size={14} />
            <span>{isPreviewMode ? 'Edit Mode' : 'Preview'}</span>
          </button>

          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer bg-white"
            >
              Save Draft
            </button>
          )}

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="px-5 py-2 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs border-none flex items-center gap-1.5"
            >
              <FiCheck className="text-sm" />
              <span>Save & Publish</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full overflow-hidden">
        
        {/* LEFT PANEL: SECTION LIBRARY (30% Width on Desktop) */}
        {isLibraryOpen && (
          <aside className="w-full lg:w-[340px] xl:w-[380px] bg-white border-r border-stone-200 flex flex-col shrink-0 min-h-0 max-h-[calc(100vh-180px)] lg:max-h-none overflow-hidden text-left shadow-xxs">
            
            {/* Search & Header */}
            <div className="p-4 border-b border-stone-200 space-y-3 bg-[#FDFBF7] shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-850 uppercase tracking-wider flex items-center gap-1.5">
                  <FiLayers className="text-[#4E641A]" />
                  <span>Section Library</span>
                </span>
                <span className="text-[10px] text-stone-400 font-bold">
                  {filteredSectionTypes.length} Available
                </span>
              </div>

              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-stone-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sections (e.g. Hero, FAQ, Recipes...)"
                  className="w-full bg-white border border-stone-300 rounded-xl py-2 pl-8 pr-8 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 text-xs border-none bg-transparent cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scroll pt-1">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                      activeCategoryFilter === cat
                        ? 'bg-[#4E641A] text-white border-transparent'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Section Types List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll">
              {filteredSectionTypes.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs font-medium space-y-1">
                  <p>No section types match "{searchQuery}"</p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setActiveCategoryFilter('All'); }}
                    className="text-[#4E641A] font-bold underline border-none bg-transparent cursor-pointer"
                  >
                    Reset Search
                  </button>
                </div>
              ) : (
                filteredSectionTypes.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleAddSection(t)}
                    className="group p-3 rounded-2xl border border-stone-200 hover:border-[#4E641A] hover:bg-[#FCFAF5] bg-white transition cursor-pointer flex items-start gap-3 text-left shadow-2xs hover:shadow-xs"
                  >
                    <span className="text-2xl shrink-0 group-hover:scale-110 transition mt-0.5">{t.icon}</span>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h5 className="font-serif text-xs font-bold text-stone-900 group-hover:text-[#4E641A] truncate">{t.label}</h5>
                        <span className="text-[8px] font-extrabold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">{t.category}</span>
                      </div>
                      <p className="text-[10px] text-stone-500 leading-snug line-clamp-2">{t.desc}</p>
                    </div>
                    <span className="text-xs font-bold text-[#4E641A] opacity-0 group-hover:opacity-100 transition shrink-0 self-center">
                      + Add
                    </span>
                  </div>
                ))
              )}
            </div>

          </aside>
        )}

        {/* RIGHT PANEL: CONTENT CANVAS (70% Width on Desktop, Unlimited Vertical Space) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 custom-scroll min-w-0 text-left bg-[#FAF8F5]">
          
          {/* Quick Toolbar above canvas */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
              <FiLayers className="text-[#4E641A]" />
              <span>Canvas Sections ({sections.length})</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const allExpanded = Object.values(expandedSections).every(v => v === true);
                  const nextState = {};
                  sections.forEach((_, idx) => { nextState[idx] = !allExpanded; });
                  setExpandedSections(nextState);
                }}
                className="text-xs font-bold text-stone-600 hover:text-[#4E641A] border-none bg-transparent cursor-pointer"
              >
                Toggle Expand All
              </button>
              <span className="text-stone-300">|</span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="text-xs font-bold text-[#4E641A] hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"
              >
                <FiPlus /> Add Section
              </button>
            </div>
          </div>

          {/* Empty Canvas State */}
          {sections.length === 0 ? (
            <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border-2 border-dashed border-stone-300 space-y-6 max-w-2xl mx-auto my-8">
              <div className="w-16 h-16 bg-[#FCFAF5] rounded-full flex items-center justify-center mx-auto text-stone-400 text-3xl border border-[#EDE7D9]">
                ✨
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xl font-bold text-stone-900">Your Content Canvas is Empty</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  Click any section in the left Section Library or choose a starter section below to build your rich product page.
                </p>
              </div>

              {/* Starter Quick-Add Badges */}
              <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                {[
                  { id: 'HERO', label: '👑 Hero Banner' },
                  { id: 'WHY_CHOOSE_US', label: '🏆 Why Choose Us' },
                  { id: 'RICH_TEXT', label: '📝 About Product Story' },
                  { id: 'HIGHLIGHTS', label: '✨ Highlights Checklist' },
                  { id: 'FAQS', label: '❓ FAQ Accordion' },
                  { id: 'SPECIFICATIONS', label: '📋 Specifications Table' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const typeObj = SECTION_TYPES.find(s => s.id === item.id);
                      if (typeObj) handleAddSection(typeObj);
                    }}
                    className="px-4 py-2 bg-[#FCFAF5] hover:bg-[#4E641A] hover:text-white border border-[#EDE7D9] text-[#2F3B0C] text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Canvas Section Cards List */
            <div className="space-y-6">
              {sections.map((sec, idx) => {
                const isExpanded = expandedSections[idx] !== false;
                const meta = SECTION_TYPES.find(s => s.id === sec.sectionType) || { icon: '⚙️', label: sec.sectionType };

                return (
                  <div
                    key={sec.id || idx}
                    className={`bg-white border rounded-3xl overflow-hidden transition-all duration-200 shadow-xs ${
                      sec.isVisible ? 'border-stone-250' : 'border-stone-200 opacity-60 bg-stone-50/50'
                    }`}
                  >
                    {/* Spacious Card Header */}
                    <div className="bg-[#FDFBF7] px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-stone-200 select-none">
                      <div 
                        onClick={() => toggleExpand(idx)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 w-full"
                      >
                        <span className="text-stone-400 text-xs font-bold shrink-0">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        <span className="text-2xl shrink-0">{meta.icon}</span>
                        <div className="flex flex-col min-w-0 text-left space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-serif text-sm sm:text-base font-bold text-stone-900 leading-snug whitespace-normal break-words">
                              {sec.title || meta.label}
                            </h4>
                            {!sec.isVisible && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono flex-wrap">
                            <span className="font-bold text-stone-500 shrink-0">Section #{idx + 1}</span>
                            <span className="shrink-0">•</span>
                            <span className="bg-stone-200/70 text-stone-600 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide shrink-0 whitespace-nowrap">
                              {sec.sectionType}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Header Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateSection(idx, { isVisible: !sec.isVisible })}
                          title={sec.isVisible ? 'Hide Section' : 'Show Section'}
                          className={`p-2 rounded-xl text-xs font-bold transition border-none bg-transparent cursor-pointer ${
                            sec.isVisible ? 'text-stone-500 hover:text-stone-800 hover:bg-stone-100' : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                          }`}
                        >
                          {sec.isVisible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                        </button>

                        <span className="w-[1px] h-5 bg-stone-250 mx-1" />

                        <button
                          type="button"
                          onClick={() => handleReorder(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-20 cursor-pointer bg-transparent border-none"
                        >
                          <FiChevronUp size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(idx, 'down')}
                          disabled={idx === sections.length - 1}
                          title="Move Down"
                          className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-20 cursor-pointer bg-transparent border-none"
                        >
                          <FiChevronDown size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(idx)}
                          title="Duplicate Section"
                          className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer bg-transparent border-none"
                        >
                          <FiCopy size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(idx)}
                          title="Delete Section"
                          className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer bg-transparent border-none"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Large Card Form Body */}
                    {isExpanded && (
                      <div className="p-6 space-y-5 bg-white text-left animate-fade-in">
                        
                        {/* Title Row */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Section Title</label>
                          <input
                            type="text"
                            value={sec.title || ''}
                            onChange={(e) => handleUpdateSection(idx, { title: e.target.value })}
                            placeholder="e.g. Why Choose Suryodaya Farms"
                            className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-[#4E641A]"
                          />
                        </div>

                        {/* Specialized Editor Body */}
                        {renderSectionEditor(sec, idx, handleUpdateContent)}

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      {/* 3. SLIDE-IN RIGHT DRAWER FOR QUICK SECTION INSERTION */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[99999] bg-stone-950/50 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl text-left animate-slide-in-right">
            
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-[#FDFBF7]">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="font-serif text-lg font-bold text-stone-900">Add Content Section</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition cursor-pointer border-none bg-transparent"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-stone-200 bg-stone-50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search section library..."
                className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#4E641A]"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scroll">
              {filteredSectionTypes.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    handleAddSection(t);
                    setIsDrawerOpen(false);
                  }}
                  className="p-3.5 rounded-2xl border border-stone-200 hover:border-[#4E641A] hover:bg-[#FCFAF5] transition cursor-pointer flex items-start gap-3 bg-white text-left shadow-2xs group"
                >
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition">{t.icon}</span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif text-xs font-bold text-stone-900 group-hover:text-[#4E641A] truncate">{t.label}</h5>
                      <span className="text-[8px] font-extrabold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{t.category}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-snug">{t.desc}</p>
                  </div>
                  <span className="text-xs font-bold text-[#4E641A] opacity-0 group-hover:opacity-100 transition shrink-0 self-center">
                    + Add
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* 4. AI CONTENT GENERATOR MODAL */}
      <AiContentGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        registry={SECTION_TYPES}
        onGenerate={(mappedProduct, debugData) => {
          const generatedSections = mappedProduct?.productContentSections || (Array.isArray(mappedProduct) ? mappedProduct : []);
          console.log('STEP 6: Log Mapped Product Object:', mappedProduct);
          console.log('STEP 7: Updating Form State. Existing Sections:', sections.length, 'New Sections:', generatedSections.length);

          const updatedSections = [...sections, ...generatedSections];
          console.log('STEP 7: Final contentSections array in state:', updatedSections);
          onChange(updatedSections);

          if (onProductFieldsGenerated && typeof onProductFieldsGenerated === 'function') {
            console.log('STEP 7: Populating core product fields into Product Form:', mappedProduct);
            onProductFieldsGenerated(mappedProduct);
          }

          setDebugLog(debugData);
        }}
      />

      {/* 4. DEVELOPER DEBUG PANEL */}
      {showDebugPanel && (
        <div className="bg-stone-900 text-stone-100 p-5 border-t border-stone-800 space-y-4 animate-fade-in text-left">
          <div className="flex justify-between items-center border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">🛠️ AI Generation Debug Trace Inspector</span>
              <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">Dev Mode</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDebugPanel(false)}
              className="text-stone-400 hover:text-white border-none bg-transparent cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Debug Inspector Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'request', label: '📥 AI Request' },
              { id: 'response', label: '📤 AI Response' },
              { id: 'parsed', label: '🧩 Parsed JSON' },
              { id: 'mapped', label: '📦 Mapped Product' },
              { id: 'sections', label: '📄 Generated Sections' },
              { id: 'state', label: '⚛️ React State' },
              { id: 'save', label: '💾 Save Payload' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDebugTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border ${
                  activeDebugTab === tab.id
                    ? 'bg-amber-500 text-stone-950 border-amber-400'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 max-h-80 overflow-y-auto custom-scroll font-mono text-[11px] leading-relaxed text-amber-200">
            {activeDebugTab === 'request' && (
              <pre>{JSON.stringify(debugLog?.aiRequest || { note: 'No AI Request logged yet. Click "Generate Page with AI" to test.' }, null, 2)}</pre>
            )}
            {activeDebugTab === 'response' && (
              <pre>{debugLog?.aiRawResponse || 'No AI Raw Response logged yet.'}</pre>
            )}
            {activeDebugTab === 'parsed' && (
              <pre>{JSON.stringify(debugLog?.parsedJson || { note: 'No Parsed JSON logged yet.' }, null, 2)}</pre>
            )}
            {activeDebugTab === 'mapped' && (
              <pre>{JSON.stringify(debugLog?.mappedProduct || { note: 'No Mapped Product logged yet.' }, null, 2)}</pre>
            )}
            {activeDebugTab === 'sections' && (
              <pre>{JSON.stringify(debugLog?.generatedSections || { note: 'No Generated Sections logged yet.' }, null, 2)}</pre>
            )}
            {activeDebugTab === 'state' && (
              <pre>{JSON.stringify({ activeSectionsCount: sections.length, contentSections: sections }, null, 2)}</pre>
            )}
            {activeDebugTab === 'save' && (
              <pre>{JSON.stringify({ payloadContentSections: sections }, null, 2)}</pre>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Default initial content structure
function getDefaultContentForType(type) {
  switch (type) {
    case 'HERO':
      return { collectionName: 'Organic Dryland Collection', tagline: 'Pure & Vedic Handcrafted', intro: 'Cultivated in native rainfed drylands with traditional care.' };
    case 'RICH_TEXT':
    case 'ABOUT_PRODUCT':
    case 'ABOUT_INGREDIENT':
    case 'INGREDIENTS':
    case 'PACKAGING':
    case 'OUR_PROMISE':
    case 'BRAND_STORY':
    case 'SURVEYODAYA_DIFFERENCE':
      return { html: '<p>Write detailed information here...</p>' };
    case 'WHY_CHOOSE_US':
    case 'BENEFITS':
      return {
        cards: [
          { icon: '🔬', title: 'SCIENTIFICALLY GUIDED QUALITY', description: 'Expert-led cultivation, processing, and quality assurance.' },
          { icon: '🌿', title: 'PURE & NATURAL', description: 'Carefully selected ingredients with no unnecessary additives.' },
          { icon: '⚡', title: 'NUTRIENT-CONSCIOUS PROCESSING', description: 'Designed to preserve natural goodness and nutritional value.' }
        ]
      };
    case 'HIGHLIGHTS':
    case 'STORAGE':
    case 'QUALITY':
    case 'SUGGESTED_SERVING':
      return { items: ['Pure Vedic Quality', 'No Added Preservatives or Chemicals', 'Eco-friendly Glass Packaging'] };
    case 'NUTRIENTS':
      return { items: [{ name: 'Vitamin C', value: '4x of Orange' }, { name: 'Calcium', value: '17x of Milk' }, { name: 'Iron', value: '25x of Spinach' }] };
    case 'WAYS_TO_ENJOY':
      return {
        recipes: [
          { icon: '🥤', title: 'Morning Smoothie', description: 'Mix 1 tsp with warm water or fruit smoothie.' },
          { icon: '🍵', title: 'Herbal Tea', description: 'Brew with warm honey water for a rich tonic.' }
        ]
      };
    case 'FAQS':
      return {
        items: [
          { question: 'How is this product cultivated?', answer: 'Grown on native dryland farms without synthetic pesticides or chemical fertilizers.' },
          { question: 'What is the shelf life?', answer: 'Best before 12 months from date of packaging when stored in a cool dry place.' }
        ]
      };
    case 'SPECIFICATIONS':
    case 'NUTRITION_FACTS':
      return {
        pairs: [
          { key: 'Weight', value: '500g' },
          { key: 'Shelf Life', value: '12 Months' },
          { key: 'Origin', value: 'Rajasthan, India' }
        ]
      };
    case 'IMAGE':
      return { imageUrl: '', caption: '' };
    case 'VIDEO':
      return { videoUrl: '', title: '' };
    case 'CALLOUT':
    case 'QUOTE':
    case 'WARNING':
      return { text: 'Special highlight message or quote citation.', author: 'Suryodaya Farms Quality Team', type: 'info' };
    case 'DIVIDER':
      return { style: 'solid' };
    case 'CUSTOM':
      return { customTitle: 'Custom Information Section', html: '<p>Custom rich content details...</p>' };
    default:
      return { html: '' };
  }
}

// Render dynamic form inputs for editing section content in Admin
function renderSectionEditor(sec, index, handleUpdateContent) {
  const content = sec.content || {};

  switch (sec.sectionType) {
    case 'HERO':
      return (
        <div className="space-y-4 bg-stone-50/60 p-4 rounded-2xl border border-stone-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-500">Collection Name</label>
              <input
                type="text"
                value={content.collectionName || ''}
                onChange={(e) => handleUpdateContent(index, 'collectionName', e.target.value)}
                placeholder="Natural Superfoods Collection"
                className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#4E641A]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-500">Tagline</label>
              <input
                type="text"
                value={content.tagline || ''}
                onChange={(e) => handleUpdateContent(index, 'tagline', e.target.value)}
                placeholder="Pure | Natural | Nutritious"
                className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#4E641A]"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-stone-500">Intro Paragraph</label>
            <textarea
              value={content.intro || ''}
              onChange={(e) => handleUpdateContent(index, 'intro', e.target.value)}
              placeholder="Brief introductory summary..."
              className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs h-20 resize-none focus:outline-none focus:border-[#4E641A]"
            />
          </div>
        </div>
      );

    case 'WHY_CHOOSE_US':
    case 'BENEFITS':
    case 'WAYS_TO_ENJOY': {
      const isRecipe = sec.sectionType === 'WAYS_TO_ENJOY';
      const rawList = content.cards || content.recipes || content.items || [];
      const listKey = isRecipe ? 'recipes' : 'cards';

      const cardList = (Array.isArray(rawList) ? rawList : []).map((c, cIdx) => {
        if (typeof c === 'string') {
          const parts = c.split(/[:–-]/);
          return {
            icon: isRecipe ? '🥤' : '🏆',
            title: parts[0]?.trim() || `Card ${cIdx + 1}`,
            description: parts.slice(1).join(' ').trim() || c
          };
        }
        if (c && typeof c === 'object') {
          return {
            icon: c.icon || (isRecipe ? '🥤' : '🏆'),
            title: c.title || c.name || c.heading || `Card ${cIdx + 1}`,
            description: c.description || c.detail || c.text || c.value || ''
          };
        }
        return { icon: isRecipe ? '🥤' : '🏆', title: `Card ${cIdx + 1}`, description: '' };
      });

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-700">Cards List ({cardList.length})</span>
            <button
              type="button"
              onClick={() => {
                const next = [...cardList, { icon: isRecipe ? '🥤' : '✦', title: 'New Card', description: 'Card description details...' }];
                handleUpdateContent(index, listKey, next);
              }}
              className="px-3.5 py-1.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold rounded-xl transition cursor-pointer border-none flex items-center gap-1 shadow-2xs"
            >
              + Add Card
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {cardList.map((c, cIdx) => (
              <div key={cIdx} className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200/90 relative flex flex-col gap-3 group hover:border-[#4E641A]/40 transition shadow-2xs overflow-hidden w-full max-w-full">
                <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 pb-2 min-w-0 w-full overflow-hidden">
                  <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                    <input
                      type="text"
                      value={c.icon || ''}
                      onChange={(e) => {
                        const next = [...cardList];
                        next[cIdx].icon = e.target.value;
                        handleUpdateContent(index, listKey, next);
                      }}
                      placeholder="Emoji"
                      className="w-10 text-center bg-white border border-stone-300 rounded-xl py-1 px-1 text-sm font-bold shrink-0 focus:outline-none focus:border-[#4E641A]"
                    />
                    <input
                      type="text"
                      value={c.title || ''}
                      onChange={(e) => {
                        const next = [...cardList];
                        next[cIdx].title = e.target.value;
                        handleUpdateContent(index, listKey, next);
                      }}
                      placeholder="Card Heading / Title"
                      className="min-w-0 flex-1 bg-white border border-stone-300 rounded-xl py-1.5 px-3 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#4E641A] truncate"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = cardList.filter((_, i) => i !== cIdx);
                      handleUpdateContent(index, listKey, next);
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer shrink-0"
                    title="Remove Card"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>

                <textarea
                  value={c.description || ''}
                  onChange={(e) => {
                    const next = [...cardList];
                    next[cIdx].description = e.target.value;
                    handleUpdateContent(index, listKey, next);
                  }}
                  placeholder="Card description detail..."
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-800 h-24 resize-y focus:outline-none focus:border-[#4E641A] font-sans"
                />
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
      const rawList = content.items || content.instructions || [];
      const itemsList = (Array.isArray(rawList) ? rawList : []).map(it => typeof it === 'string' ? it : (it?.text || String(it || '')));

      return (
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-700">Checklist Items ({itemsList.length})</span>
            <button
              type="button"
              onClick={() => {
                const next = [...itemsList, 'New highlight item'];
                handleUpdateContent(index, 'items', next);
              }}
              className="px-3.5 py-1.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold rounded-xl transition cursor-pointer border-none flex items-center gap-1 shadow-2xs"
            >
              + Add Item
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {itemsList.map((itemStr, itemIdx) => (
              <div key={itemIdx} className="flex items-center gap-2 bg-stone-50/80 p-2.5 rounded-xl border border-stone-200">
                <span className="text-sm text-[#4E641A] shrink-0 font-bold">✔</span>
                <input
                  type="text"
                  value={itemStr || ''}
                  onChange={(e) => {
                    const next = [...itemsList];
                    next[itemIdx] = e.target.value;
                    handleUpdateContent(index, 'items', next);
                  }}
                  placeholder="Bullet item text..."
                  className="flex-1 bg-white border border-stone-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#4E641A]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = itemsList.filter((_, i) => i !== itemIdx);
                    handleUpdateContent(index, 'items', next);
                  }}
                  className="p-1 text-stone-400 hover:text-red-600 rounded-lg transition border-none bg-transparent cursor-pointer shrink-0"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'NUTRIENTS': {
      const rawItems = content.items || [];
      const itemsList = (Array.isArray(rawItems) ? rawItems : []).map((it, iIdx) => {
        if (typeof it === 'string') {
          const parts = it.split(/[:–-]/);
          return { name: parts[0]?.trim() || `Nutrient ${iIdx + 1}`, value: parts.slice(1).join(' ').trim() || 'High' };
        }
        if (it && typeof it === 'object') {
          return { name: it.name || it.key || `Nutrient ${iIdx + 1}`, value: it.value || it.amount || '' };
        }
        return { name: `Nutrient ${iIdx + 1}`, value: '' };
      });

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-700">Nutrients List ({itemsList.length})</span>
            <button
              type="button"
              onClick={() => {
                const next = [...itemsList, { name: 'Calcium', value: '344mg' }];
                handleUpdateContent(index, 'items', next);
              }}
              className="px-3.5 py-1.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold rounded-xl transition cursor-pointer border-none flex items-center gap-1 shadow-2xs"
            >
              + Add Nutrient
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {itemsList.map((it, iIdx) => (
              <div key={iIdx} className="flex items-center gap-2 bg-stone-50/80 p-3 rounded-2xl border border-stone-200">
                <input
                  type="text"
                  value={it.name || ''}
                  onChange={(e) => {
                    const next = [...itemsList];
                    next[iIdx].name = e.target.value;
                    handleUpdateContent(index, 'items', next);
                  }}
                  placeholder="Nutrient Name (e.g. Calcium)"
                  className="flex-1 bg-white border border-stone-300 rounded-xl py-1.5 px-3 text-xs font-bold focus:outline-none focus:border-[#4E641A]"
                />
                <input
                  type="text"
                  value={it.value || ''}
                  onChange={(e) => {
                    const next = [...itemsList];
                    next[iIdx].value = e.target.value;
                    handleUpdateContent(index, 'items', next);
                  }}
                  placeholder="Value (e.g. 344mg)"
                  className="w-28 bg-white border border-stone-300 rounded-xl py-1.5 px-3 text-xs font-semibold text-[#4E641A] focus:outline-none focus:border-[#4E641A]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = itemsList.filter((_, i) => i !== iIdx);
                    handleUpdateContent(index, 'items', next);
                  }}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition border-none bg-transparent cursor-pointer shrink-0"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'FAQS': {
      const rawItems = content.items || content.faqs || [];
      const itemsList = (Array.isArray(rawItems) ? rawItems : []).map((faq, fIdx) => {
        if (typeof faq === 'string') {
          return { question: faq, answer: 'Detailed response...' };
        }
        if (faq && typeof faq === 'object') {
          return { question: faq.question || faq.q || `Question ${fIdx + 1}`, answer: faq.answer || faq.a || '' };
        }
        return { question: `Question ${fIdx + 1}`, answer: '' };
      });

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-700">FAQ Accordion List ({itemsList.length})</span>
            <button
              type="button"
              onClick={() => {
                const next = [...itemsList, { question: 'Is this product organic?', answer: 'Yes, certified organic.' }];
                handleUpdateContent(index, 'items', next);
              }}
              className="px-3.5 py-1.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold rounded-xl transition cursor-pointer border-none flex items-center gap-1 shadow-2xs"
            >
              + Add FAQ
            </button>
          </div>

          <div className="space-y-3">
            {itemsList.map((faq, fIdx) => (
              <div key={fIdx} className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200 space-y-2.5 relative">
                <div className="flex justify-between items-center gap-2">
                  <input
                    type="text"
                    value={faq.question || ''}
                    onChange={(e) => {
                      const next = [...itemsList];
                      next[fIdx].question = e.target.value;
                      handleUpdateContent(index, 'items', next);
                    }}
                    placeholder="Question text..."
                    className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#4E641A]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = itemsList.filter((_, i) => i !== fIdx);
                      handleUpdateContent(index, 'items', next);
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition border-none bg-transparent cursor-pointer shrink-0"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={faq.answer || ''}
                  onChange={(e) => {
                    const next = [...itemsList];
                    next[fIdx].answer = e.target.value;
                    handleUpdateContent(index, 'items', next);
                  }}
                  placeholder="Answer text..."
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-800 h-16 resize-none focus:outline-none focus:border-[#4E641A]"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'SPECIFICATIONS':
    case 'NUTRITION_FACTS': {
      const rawPairs = content.pairs || content.customSpecs || [];
      const pairsList = (Array.isArray(rawPairs) ? rawPairs : []).map((p, pIdx) => {
        if (typeof p === 'string') {
          const parts = p.split(/[:–-]/);
          return { key: parts[0]?.trim() || `Spec ${pIdx + 1}`, value: parts.slice(1).join(' ').trim() || p };
        }
        if (p && typeof p === 'object') {
          return { key: p.key || p.name || `Spec ${pIdx + 1}`, value: p.value || p.amount || '' };
        }
        return { key: `Spec ${pIdx + 1}`, value: '' };
      });

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-700">Specifications Table ({pairsList.length})</span>
            <button
              type="button"
              onClick={() => {
                const next = [...pairsList, { key: 'Shelf Life', value: '12 Months' }];
                handleUpdateContent(index, 'pairs', next);
              }}
              className="px-3.5 py-1.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold rounded-xl transition cursor-pointer border-none flex items-center gap-1 shadow-2xs"
            >
              + Add Spec Pair
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pairsList.map((p, pIdx) => (
              <div key={pIdx} className="flex items-center gap-2 bg-stone-50/80 p-3 rounded-2xl border border-stone-200">
                <input
                  type="text"
                  value={p.key || ''}
                  onChange={(e) => {
                    const next = [...pairsList];
                    next[pIdx].key = e.target.value;
                    handleUpdateContent(index, 'pairs', next);
                  }}
                  placeholder="Key (e.g. Shelf Life)"
                  className="w-1/2 bg-white border border-stone-300 rounded-xl py-1.5 px-3 text-xs font-bold focus:outline-none focus:border-[#4E641A]"
                />
                <input
                  type="text"
                  value={p.value || ''}
                  onChange={(e) => {
                    const next = [...pairsList];
                    next[pIdx].value = e.target.value;
                    handleUpdateContent(index, 'pairs', next);
                  }}
                  placeholder="Value (e.g. 12 Months)"
                  className="w-1/2 bg-white border border-stone-300 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-[#4E641A]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = pairsList.filter((_, i) => i !== pIdx);
                    handleUpdateContent(index, 'pairs', next);
                  }}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition border-none bg-transparent cursor-pointer shrink-0"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'IMAGE':
      return (
        <div className="space-y-4">
          <UnifiedUploader
            value={content.imageUrl || ''}
            onChange={(url) => handleUpdateContent(index, 'imageUrl', url)}
            label="Featured Image (Large Preview)"
            folder="product-sections"
          />
          <div>
            <label className="text-[10px] font-bold uppercase text-stone-500">Caption</label>
            <input
              type="text"
              value={content.caption || ''}
              onChange={(e) => handleUpdateContent(index, 'caption', e.target.value)}
              placeholder="Image description or caption..."
              className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs"
            />
          </div>
        </div>
      );

    case 'VIDEO':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-stone-500">Video Embed URL (YouTube/Vimeo)</label>
            <input
              type="text"
              value={content.videoUrl || ''}
              onChange={(e) => handleUpdateContent(index, 'videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-2 w-full">
          <label className="text-xs font-bold text-stone-700">Full-Width Rich Content Editor</label>
          <LazyRichTextEditor
            value={content.html || ''}
            onChange={(htmlVal) => handleUpdateContent(index, 'html', htmlVal)}
            placeholder="Craft formatted rich content for this section..."
          />
        </div>
      );
  }
}
