import React, { useState } from 'react';
import { 
  FiX, FiUpload, FiFileText, FiCheck, 
  FiAlertTriangle, FiHelpCircle, FiArrowRight, FiCopy, FiRefreshCw, FiTerminal, FiCode 
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { useFeedbackStore } from '../../store/useFeedbackStore';
import { processAiDocumentPipeline } from '../utils/aiProductPipeline';

const SAMPLE_DOCUMENT = `SPROUTED RAGI FLOUR
Collection: Organic Vedic Harvest
Tagline: Pure, Sprouted & Traditional Dryland Harvest
Intro: Cultivated on rainfed organic drylands of Rajasthan. Sprouted traditionally to multiply bio-available iron, calcium, and digestion ease.

ABOUT PRODUCT
Our Sprouted Ragi Flour is made from whole finger millet grains that undergo a meticulous 48-hour soaking, sprouting, and sun-drying process. This ancient Vedic method unlocks maximum nutrients, neutralizes anti-nutrients, and provides a rich nutty flavor suitable for all ages.

WHY CHOOSE US
- Sprouted Grains: Sprouting activates enzymes and quadruples bio-available iron.
- Rainfed Dryland Harvest: Grown naturally with rainwater on rich native soils without chemicals.
- Traditional Stone Ground: Slow-milled at low temperatures to preserve delicate vitamins and dietary fiber.

PRODUCT HIGHLIGHTS
- Organic & Non-GMO Verified
- Zero Added Sugar, Preservatives or Artificial Flavors
- Rich Source of Calcium, Dietary Fiber and Iron
- Easy to Digest & Ideal for Baby Porridge & Rotis

NATURALLY OCCURRING NUTRIENTS
- Calcium: 344mg per 100g (3x of Milk)
- Iron: 3.9mg per 100g (High Bio-availability)
- Dietary Fiber: 11.5g per 100g (Gut Health Support)
- Protein: 7.3g per 100g (Plant-based Energy)

WAYS TO ENJOY
- Warm Ragi Malt: Whisk 2 tbsp flour with warm milk or water and jaggery for a morning energizer.
- Soft Ragi Rotis: Knead with warm water to make soft gluten-free Indian flatbreads.
- Ragi Dosa & Cheela: Mix with curd and spices for a crispy instant breakfast pancake.

STORAGE INSTRUCTIONS
- Store in a cool, dry place away from direct sunlight.
- Transfer contents into an airtight glass or steel container after opening.
- Best before 9 months from the date of packaging.

INGREDIENTS
Pure Organic Sprouted Finger Millet (Ragi / Nachni) Flour.

SPECIFICATIONS
Weight: 500g
Shelf Life: 9 Months
Origin: Rajasthan, India
Diet Type: Vegetarian, Vegan, Gluten-Free
Processing Method: Sprouted & Cold Stone Ground

FREQUENTLY ASKED QUESTIONS
Q: Is this suitable for babies and toddlers?
A: Yes! Sprouted ragi flour is naturally easy to digest and is one of the most recommended traditional first foods for babies over 6 months.

Q: Does it contain any added wheat or preservatives?
A: No. It is pure sprouted ragi with zero wheat, gluten, preservatives, or added additives.

OUR PROMISE
At Suryodaya Farms, we pledge complete transparency and fair-trade partnerships with native dryland farmers. Every batch is lab-tested for purity and crafted with Vedic reverence.`;

export default function AiContentGeneratorModal({ isOpen, onClose, onGenerate, categories = [], registry = [] }) {
  const [activeTab, setActiveTab] = useState('paste');
  const [inputText, setInputText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [rawErrorDebug, setRawErrorDebug] = useState(null);

  const [fileBase64, setFileBase64] = useState(null);

  if (!isOpen) return null;

  const handleUseSample = () => {
    setInputText(SAMPLE_DOCUMENT);
    setFileBase64(null);
    useFeedbackStore.getState().showToast('Loaded sample product document', 'info');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const isDocx = file.name.toLowerCase().endsWith('.docx');

    if (isDocx) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileBase64(event.target?.result);
        setInputText(`[DOCX File Loaded: ${file.name}]`);
        useFeedbackStore.getState().showToast(`Loaded DOCX file "${file.name}" for server extraction`, 'success');
      };
      reader.readAsDataURL(file);
    } else {
      setFileBase64(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setInputText(content);
          useFeedbackStore.getState().showToast(`Loaded "${file.name}"`, 'success');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleStartGeneration = async () => {
    setRawErrorDebug(null);

    if (!inputText && !fileBase64) {
      useFeedbackStore.getState().showToast('Please paste text or upload a document to proceed.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);
    setProgressPercent(25);

    try {
      await new Promise(r => setTimeout(r, 300));
      setAnalysisStep(2);
      setProgressPercent(50);

      let mappedProduct = null;
      let debugTrace = null;

      // Call Backend Endpoint with mammoth extraction
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const payload = {
        documentText: inputText,
        fileBase64: fileBase64,
        fileName: selectedFileName || 'Product Document',
        fileType: (selectedFileName && selectedFileName.toLowerCase().endsWith('.docx')) ? 'docx' : 'text'
      };

      const response = await fetch('/api/admin/products/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to extract text or generate product data.');
      }

      const backendData = resData.data;

      // Check for ZIP/XML binary headers
      const containsGarbage = /PK\s*!|\[Content_Types\]\.xml|word\/document\.xml|_rels|docProps/i.test(backendData.productName || '');
      if (containsGarbage) {
        throw new Error('Document extraction failed: Returned raw ZIP/XML binary signatures instead of Word text.');
      }

      mappedProduct = {
        productName: backendData.productName || 'Sprouted Ragi Flour',
        shortDescription: backendData.shortDescription || '',
        detailedDescription: backendData.description || '',
        description: backendData.description || '',
        ingredients: backendData.ingredients || '',
        nutrition: backendData.nutrition || '',
        origin: backendData.origin || '',
        shelfLife: backendData.shelfLife || '',
        categories: backendData.categories || [],
        seo: backendData.seo || {},
        productContentSections: backendData.sections || []
      };

      debugTrace = {
        extractedText: inputText,
        aiRequestPayload: payload,
        rawAiResponse: JSON.stringify(backendData),
        parsedJson: mappedProduct,
        mappedObject: mappedProduct,
        generatedSections: mappedProduct.productContentSections,
        timestamp: new Date().toISOString()
      };

      setAnalysisStep(4);
      setProgressPercent(100);
      await new Promise(r => setTimeout(r, 200));

      setIsAnalyzing(false);
      onGenerate(mappedProduct, debugTrace);
      onClose();
      useFeedbackStore.getState().showToast(`✅ Generated & populated product details with ${mappedProduct.productContentSections.length} sections!`, 'success');
    } catch (err) {
      console.error('❌ [AI Generation Pipeline Failure]:', err);

      setIsAnalyzing(false);
      setRawErrorDebug({
        message: err.message || 'Failed to parse AI document.',
        stack: err.stack || '',
        rawInput: inputText
      });
      useFeedbackStore.getState().showToast(`AI Parsing Failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-left animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2F3B0C] via-[#37411A] to-[#4E641A] text-white p-6 sm:p-8 flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <h3 className="font-serif text-xl font-bold">AI Product Content Generator</h3>
            </div>
            <p className="text-xs text-stone-200 font-sans max-w-md">
              Dynamically reads {registry.length} active section schemas and populates the CMS workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isAnalyzing}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer border-none bg-transparent"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* RAW ERROR DEBUG MODAL */}
        {rawErrorDebug ? (
          <div className="p-6 space-y-4 bg-red-50/60 text-left">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm border-b border-red-200 pb-3">
              <FiAlertTriangle className="text-lg" />
              <span>AI Parsing Error - Raw Response Debug</span>
            </div>
            <p className="text-xs text-red-600 font-semibold">{rawErrorDebug.message}</p>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase">Raw Input Document</span>
              <pre className="p-3 bg-stone-900 text-amber-300 rounded-xl text-[11px] font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                {rawErrorDebug.rawInput}
              </pre>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setRawErrorDebug(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-xl border-none cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleStartGeneration}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl border-none cursor-pointer"
              >
                Retry Generation
              </button>
            </div>
          </div>
        ) : isAnalyzing ? (
          /* Animated Progress Loading State */
          <div className="p-12 text-center space-y-6 my-auto">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-[#4E641A]/20 border-t-[#4E641A] animate-spin" />
              <HiSparkles className="absolute inset-0 m-auto text-[#C68A2B] text-2xl animate-pulse" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-stone-900">
                {analysisStep === 1 && '🔍 Step 1 & 2: Logging Request & Extracting Text...'}
                {analysisStep === 2 && '🧩 Step 3 & 4: Raw Response & Document Parsing...'}
                {analysisStep === 3 && '🎨 Step 5 & 6: Schema Validation & Mapping Fields...'}
                {analysisStep === 4 && '✨ Step 7 & 8: Setting React State & Verification...'}
              </h4>
              <p className="text-xs text-stone-500 font-sans">
                Inspecting {registry.length} live section schemas dynamically.
              </p>
            </div>

            <div className="w-full max-w-xs mx-auto bg-stone-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#4E641A] to-[#C68A2B] h-full transition-all duration-300" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        ) : (
          /* Normal Input Form */
          <div className="p-6 space-y-6">
            
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  activeTab === 'paste'
                    ? 'bg-[#4E641A] text-white border-transparent shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                1. Paste Product Document
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  activeTab === 'upload'
                    ? 'bg-[#4E641A] text-white border-transparent shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                2. Upload DOCX / PDF / TXT
              </button>
            </div>

            {/* TAB 1: PASTE TEXT */}
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-stone-700">Paste Product Copy / Raw Brief</label>
                  <button
                    type="button"
                    onClick={handleUseSample}
                    className="text-xs font-bold text-[#4E641A] hover:underline border-none bg-transparent cursor-pointer"
                  >
                    + Load Sample Copy
                  </button>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste product text here... (AI will dynamically inspect all active section types in the CMS registry)"
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-4 text-xs font-sans text-stone-900 focus:outline-none focus:border-[#4E641A] h-64 resize-none leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>{inputText.length} characters</span>
                  <span>Reads dynamic {registry.length} section registry</span>
                </div>
              </div>
            )}

            {/* TAB 2: UPLOAD FILE */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-stone-300 hover:border-[#4E641A] rounded-3xl p-8 text-center bg-stone-50 transition space-y-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-[#4E641A] text-xl shadow-xs">
                    <FiUpload />
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-bold text-stone-800">Upload Product Document</h5>
                    <p className="text-xs text-stone-500 mt-0.5">Supports .TXT, .PDF, or .DOCX files</p>
                  </div>
                  <label className="inline-block px-5 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs">
                    Select File
                    <input
                      type="file"
                      accept=".txt,.pdf,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {selectedFileName && (
                    <p className="text-xs text-[#4E641A] font-bold mt-2">✓ Loaded: {selectedFileName}</p>
                  )}
                </div>

                {inputText && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-stone-500">Extracted Document Preview</span>
                    <div className="p-3 bg-stone-100 rounded-xl max-h-32 overflow-y-auto text-[11px] font-mono text-stone-700 whitespace-pre-wrap">
                      {inputText.slice(0, 500)}...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartGeneration}
                className="px-6 py-2.5 bg-gradient-to-r from-[#4E641A] to-[#37411A] hover:from-[#2F3B0C] hover:to-[#2F3B0C] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-2 border-none"
              >
                <HiSparkles className="text-amber-300" />
                <span>Generate Product Page with AI</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
