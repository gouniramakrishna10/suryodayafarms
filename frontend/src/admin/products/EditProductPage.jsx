import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import ProductForm from './ProductForm';
import { useFeedbackStore } from '../../store/useFeedbackStore';
import api from '../../utils/api';

export default function EditProductPage({
  categories = [],
  handleUpdateProduct,
  setShowAiModal,
  setAiSelectedFile,
  setAiFilePreview,
  setAiFilePdfText,
  setIsAiGenerating,
  setAiProgressStep,
  aiGeneratedProductData
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productModalTab, setProductModalTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    categoryId: '',
    categoryIds: [],
    description: '',
    shortDescription: '',
    detailedDescription: '',
    brand: 'Suryodaya Farms',
    productType: '',
    price: '',
    compareAtPrice: '',
    mrp: '',
    discountPercent: 0,
    taxPercent: 0,
    stockStatus: 'IN_STOCK',
    sku: '',
    inventory: '',
    hoverImage: '',
    mobileBanner: '',
    isFeatured: false,
    isTrending: false,
    isBestseller: false,
    isNewLaunch: false,
    isVisible: true,
    isComingSoon: false,
    nutrients: '',
    origin: '',
    shelfLife: '',
    deliveryEta: '2-3 Days',
    codAvailable: true,
    returnEligible: false,
    weight: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    image: '',
    images: ['', '', '', ''],
    variants: [],
    productContent: {
      about: '',
      highlights: [],
      faqs: [],
      ourPromise: '',
      suryodayaDifference: '',
      customSpecs: [],
      whyChoose: { title: 'Why Choose Suryodaya Farms', features: [] },
      waysToEnjoy: { title: 'Ways To Enjoy', items: [] },
      ingredients: '',
      storageInstructions: [],
      qualityCommitment: []
    }
  });

  useEffect(() => {
    if (!aiGeneratedProductData) return;
    console.log('⚛️ [EditProductPage] Syncing AI Generated Data into local productForm state:', aiGeneratedProductData);

    const generatedName = aiGeneratedProductData.productName || aiGeneratedProductData.name || '';
    const generatedShortDesc = aiGeneratedProductData.shortDescription || '';
    const generatedDesc = aiGeneratedProductData.description || aiGeneratedProductData.detailedDescription || '';
    const generatedIngredients = aiGeneratedProductData.ingredients || '';
    const generatedNutrition = aiGeneratedProductData.nutrition || aiGeneratedProductData.nutrients || '';
    const generatedOrigin = aiGeneratedProductData.origin || '';
    const generatedShelfLife = aiGeneratedProductData.shelfLife || '';
    const generatedSections = aiGeneratedProductData.sections || aiGeneratedProductData.productContentSections || [];

    let matchedCatIds = [];
    let matchedCatId = '';
    if (aiGeneratedProductData.categories && Array.isArray(aiGeneratedProductData.categories) && aiGeneratedProductData.categories.length > 0 && categories) {
      const catMatch = categories.find(c =>
        aiGeneratedProductData.categories.some(catName => c.name.toLowerCase().includes(catName.toLowerCase()) || catName.toLowerCase().includes(c.name.toLowerCase()))
      );
      if (catMatch) {
        matchedCatIds = [catMatch.id];
        matchedCatId = catMatch.id;
      }
    }

    setProductForm(prev => ({
      ...prev,
      name: generatedName || prev.name,
      shortDescription: generatedShortDesc || prev.shortDescription,
      description: generatedDesc || prev.description,
      detailedDescription: generatedDesc || prev.detailedDescription,
      ingredients: generatedIngredients || prev.ingredients,
      nutrients: generatedNutrition || prev.nutrients,
      origin: generatedOrigin || prev.origin,
      shelfLife: generatedShelfLife || prev.shelfLife,
      categoryId: matchedCatId || prev.categoryId,
      categoryIds: matchedCatIds.length > 0 ? matchedCatIds : prev.categoryIds,
      seoTitle: aiGeneratedProductData.seo?.seoTitle || prev.seoTitle || generatedName,
      seoDescription: aiGeneratedProductData.seo?.seoDescription || prev.seoDescription || generatedShortDesc,
      seoKeywords: aiGeneratedProductData.seo?.seoKeywords || prev.seoKeywords,
      contentSections: generatedSections.length > 0 ? generatedSections : prev.contentSections,
      productContent: {
        ...(prev.productContent || {}),
        ingredients: generatedIngredients || prev.productContent?.ingredients,
        about: generatedDesc || prev.productContent?.about
      }
    }));
  }, [aiGeneratedProductData, categories]);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/admin/products/${id}`);
        const prod = res.product || res;
        
        const loadedVariants = (prod.variants && prod.variants.length > 0)
          ? prod.variants.map((v, i) => ({
              id: v.id || '',
              weight: v.weight || (v.name ? v.name.replace(/[^0-9.]/g, '') : ''),
              unit: v.unit || (v.name ? (v.name.match(/(g|kg|ml|l|pcs)/i)?.[0] || 'g') : 'g'),
              mrp: v.mrp ? v.mrp.toString() : '',
              price: v.price ? v.price.toString() : '',
              inventory: v.inventory !== undefined ? v.inventory.toString() : '50',
              sku: v.sku || `${prod.sku || 'SURY'}-${i + 1}`,
              isExpanded: i === 0
            }))
          : [
              {
                id: '',
                weight: (prod.weight ? prod.weight.replace(/[^0-9.]/g, '') : '250'),
                unit: (prod.weight ? (prod.weight.match(/(g|kg|ml|l|pcs)/i)?.[0] || 'g') : 'g'),
                mrp: prod.mrp ? prod.mrp.toString() : '',
                price: prod.price ? prod.price.toString() : '',
                inventory: prod.inventory !== undefined ? prod.inventory.toString() : '50',
                sku: prod.sku || '',
                isExpanded: true
              }
            ];

        setProductForm({
          ...prod,
          detailedDescription: prod.detailedDescription || '',
          contentSections: prod.contentSections || [],
          categoryIds: prod.categoryIds || (prod.categoryId ? [prod.categoryId] : []),
          images: prod.images || [prod.image || '', '', '', ''],
          variants: loadedVariants
        });
      } catch (err) {
        console.error('Failed to fetch product details for edit:', err);
        useFeedbackStore.getState().showToast('Failed to load product details.', 'error');
        navigate('/admin/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleBackClick = () => {
    navigate('/admin/products');
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      await handleUpdateProduct(id, productForm);
      useFeedbackStore.getState().showToast('✅ Product updated successfully', 'success');
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveDraft = async () => {
    setIsSaving(true);
    try {
      const draftData = { ...productForm, isVisible: false };
      await handleUpdateProduct(id, draftData);
      useFeedbackStore.getState().showToast('✅ Product draft saved successfully', 'success');
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-stone-200/80 rounded-3xl p-12 text-center text-stone-500 font-sans space-y-3">
        <div className="w-8 h-8 border-3 border-[#4E641A] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 animate-scale-up text-left font-sans">
      
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackClick}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4E641A] hover:text-[#2F3B0C] transition cursor-pointer bg-transparent border-none"
          >
            <FiArrowLeft className="text-sm" />
            <span>Back to Products</span>
          </button>
          <span className="text-stone-300">|</span>
          <h3 className="font-serif text-xl font-bold text-stone-900">Edit Product</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setAiSelectedFile(null);
              setAiFilePreview('');
              setAiFilePdfText('');
              setIsAiGenerating(false);
              setAiProgressStep(0);
              setShowAiModal(true);
            }}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#C68A2B] border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <HiSparkles className="text-amber-500" />
            <span>Generate with AI</span>
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer bg-white"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs border-none flex items-center gap-1.5"
          >
            <FiCheck className="text-sm" />
            <span>Update Product</span>
          </button>
        </div>
      </div>

      {/* Shared Reusable Product Form */}
      <ProductForm
        productForm={productForm}
        setProductForm={setProductForm}
        categories={categories}
        productModalTab={productModalTab}
        setProductModalTab={setProductModalTab}
        onSave={onSave}
        onSaveDraft={onSaveDraft}
        isSaving={isSaving}
        mode="edit"
      />

    </div>
  );
}
