import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import ProductForm from './ProductForm';
import { useFeedbackStore } from '../../store/useFeedbackStore';

export default function CreateProductPage({
  categories = [],
  handleCreateProduct,
  setShowAiModal,
  setAiSelectedFile,
  setAiFilePreview,
  setAiFilePdfText,
  setIsAiGenerating,
  setAiProgressStep
}) {
  const navigate = useNavigate();
  const [productModalTab, setProductModalTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    categoryId: '',
    categoryIds: [],
    description: '',
    shortDescription: '',
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
    variants: [
      {
        id: '',
        weight: '250',
        unit: 'g',
        mrp: '',
        price: '',
        inventory: '50',
        sku: '',
        isExpanded: true
      }
    ],
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

  const isFormDirty = () => {
    return !!(
      productForm.name ||
      productForm.description ||
      productForm.shortDescription ||
      productForm.price ||
      (productForm.variants && productForm.variants.some(v => v.price || v.mrp))
    );
  };

  const handleBackClick = () => {
    if (isFormDirty()) {
      setShowDiscardModal(true);
    } else {
      navigate('/admin/products');
    }
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      await handleCreateProduct(productForm);
      useFeedbackStore.getState().showToast('✅ Product published successfully', 'success');
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
      await handleCreateProduct(draftData);
      useFeedbackStore.getState().showToast('✅ Product draft saved successfully', 'success');
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

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
          <h3 className="font-serif text-xl font-bold text-stone-900">Create New Product</h3>
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
            <span>Publish Product</span>
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
        mode="create"
      />

      {/* Discard Changes Dialog Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-[9999] bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up text-left">
            <h4 className="font-serif text-lg font-bold text-stone-900">Discard unsaved changes?</h4>
            <p className="text-xs text-stone-600 font-sans">
              You have unsaved edits on this product. If you leave now, your changes will be lost.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer bg-white"
              >
                Stay on Page
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardModal(false);
                  navigate('/admin/products');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer border-none"
              >
                Discard & Go Back
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
