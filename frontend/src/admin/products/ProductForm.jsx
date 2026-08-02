import React, { useState, useEffect } from 'react';
import UnifiedUploader from '../../components/UnifiedUploader';
import ImageCropper from '../components/ImageCropper';
import LazyRichTextEditor from '../components/LazyRichTextEditor';
import ProductContentBuilder from '../components/ProductContentBuilder';
import { useFeedbackStore } from '../../store/useFeedbackStore';

export default function ProductForm({
  productForm,
  setProductForm,
  categories = [],
  productModalTab,
  setProductModalTab,
  onSave,
  onSaveDraft,
  isSaving,
  mode = 'create'
}) {
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [previewDeviceMode, setPreviewDeviceMode] = useState('desktop');
  const [cropTarget, setCropTarget] = useState(null);

  console.log("🎨 [ProductForm Render] Rendering Product Name:", productForm.name);
  console.log("🎨 [ProductForm Render] Rendering Short Description:", productForm.shortDescription);
  console.log("🎨 [ProductForm Render] Rendering Ingredients:", productForm.ingredients || productForm.productContent?.ingredients);
  console.log("🎨 [ProductForm Render] Rendering Nutrients:", productForm.nutrients || productForm.nutrition);
  console.log("🎨 [ProductForm Render] Rendering Content Sections Count:", (productForm.contentSections || []).length);

  // Variant Helper Functions
  const handleAddVariant = () => {
    setProductForm(prev => {
      const currentVariants = prev.variants || [];
      const nextNum = currentVariants.length + 1;
      const cleanName = (prev.name || 'PRODUCT').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      const defaultWeight = nextNum === 1 ? '250' : (nextNum === 2 ? '500' : '1000');
      const defaultUnit = nextNum >= 3 ? 'kg' : 'g';
      const autoSku = `SURY-${cleanName}-${defaultWeight}${defaultUnit.toUpperCase()}`;

      const newVariant = {
        id: '',
        weight: defaultWeight,
        unit: defaultUnit,
        mrp: prev.mrp || '',
        price: prev.price || '',
        inventory: '50',
        sku: autoSku,
        isExpanded: true
      };

      return {
        ...prev,
        variants: [...currentVariants.map(v => ({ ...v, isExpanded: false })), newVariant]
      };
    });
  };

  const handleUpdateVariant = (index, key, value) => {
    setProductForm(prev => {
      const updated = [...(prev.variants || [])];
      if (!updated[index]) return prev;
      updated[index] = { ...updated[index], [key]: value };

      if (key === 'weight' || key === 'unit') {
        const w = key === 'weight' ? value : updated[index].weight;
        const u = key === 'unit' ? value : updated[index].unit;
        const cleanName = (prev.name || 'PROD').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        updated[index].sku = `SURY-${cleanName}-${w}${u.toUpperCase()}`;
      }

      const primary = updated[0] || {};
      return {
        ...prev,
        variants: updated,
        price: primary.price || prev.price,
        mrp: primary.mrp || prev.mrp,
        inventory: primary.inventory || prev.inventory,
        weight: primary.weight ? `${primary.weight}${primary.unit || 'g'}` : prev.weight,
        sku: primary.sku || prev.sku
      };
    });
  };

  const handleDuplicateVariant = (index) => {
    setProductForm(prev => {
      const current = [...(prev.variants || [])];
      const source = current[index];
      if (!source) return prev;
      const numWeight = parseFloat(source.weight) || 250;
      const newWeight = (numWeight >= 1000 && source.unit === 'g') ? '1' : `${numWeight * 2}`;
      const newUnit = (numWeight >= 1000 && source.unit === 'g') ? 'kg' : source.unit;
      const cleanName = (prev.name || 'PROD').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

      const duplicated = {
        ...source,
        id: '',
        weight: newWeight,
        unit: newUnit,
        sku: `SURY-${cleanName}-${newWeight}${newUnit.toUpperCase()}`,
        isExpanded: true
      };
      current.splice(index + 1, 0, duplicated);
      return { ...prev, variants: current };
    });
  };

  const handleDeleteVariant = (index) => {
    setProductForm(prev => {
      const current = [...(prev.variants || [])];
      if (current.length <= 1) {
        useFeedbackStore.getState().showToast('A product must have at least 1 variant.', 'warning');
        return prev;
      }
      current.splice(index, 1);
      return { ...prev, variants: current };
    });
  };

  const handleReorderVariant = (index, direction) => {
    setProductForm(prev => {
      const current = [...(prev.variants || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return prev;
      const temp = current[index];
      current[index] = current[targetIndex];
      current[targetIndex] = temp;
      return { ...prev, variants: current };
    });
  };

  const toggleExpandVariant = (index) => {
    setProductForm(prev => {
      const current = [...(prev.variants || [])];
      if (current[index]) {
        current[index] = { ...current[index], isExpanded: !current[index].isExpanded };
      }
      return { ...prev, variants: current };
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 text-left items-start font-sans">
      {/* Left Progress Sidebar */}
      <div className="w-full lg:w-64 bg-stone-50 border border-stone-200/80 rounded-2xl p-4 shrink-0 shadow-2xs">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 mb-2">Publishing Steps</span>
          {[
            { id: 'basic', label: 'Basic Info', step: '1' },
            { id: 'pricing', label: 'Product Variants', step: '2' },
            { id: 'media', label: 'Media & Gallery', step: '3' },
            { id: 'details', label: 'Product Details', step: '4' },
            { id: 'content_builder', label: 'Product Content', step: '5' },
            { id: 'seo', label: 'SEO Settings', step: '6' },
            { id: 'preview', label: 'Preview & Publish', step: '7' }
          ].map((s) => {
            const isActive = productModalTab === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setProductModalTab(s.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#4E641A] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                }`}>
                  {s.step}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="flex-grow w-full min-w-0 space-y-6">
        
        {/* STEP 1: BASIC INFO */}
        {productModalTab === 'basic' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-stone-700">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Premium Moringa Powder"
                value={productForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const autoSku = name ? `SURY-${name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)}-${Math.floor(100 + Math.random() * 900)}` : '';
                  setProductForm({
                    ...productForm,
                    name,
                    sku: productForm.sku || autoSku,
                    seoTitle: productForm.seoTitle || name,
                    seoDescription: productForm.seoDescription || productForm.shortDescription
                  });
                }}
                className="w-full bg-white border border-stone-300 rounded-xl py-3 px-4 text-stone-900 text-sm focus:outline-none focus:border-[#4E641A]"
              />
            </div>

            {/* Searchable Multi-Select Category Picker */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-stone-700">Categories *</label>
              <input
                type="text"
                placeholder="Type to search category (e.g. Leaf Powders, Fruit Powders...)"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
              />
              
              <div className="flex flex-wrap gap-2 mt-1 max-h-36 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                {categories
                  .filter(c => c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                  .map((cat) => {
                    const isSelected = (productForm.categoryIds || []).includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const current = productForm.categoryIds || [];
                          const updated = isSelected ? current.filter(id => id !== cat.id) : [...current, cat.id];
                          setProductForm({
                            ...productForm,
                            categoryId: updated[0] || '',
                            categoryIds: updated
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer select-none border ${
                          isSelected
                            ? 'bg-[#4E641A] text-white border-[#4E641A]'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{cat.name}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-stone-700">Short Description</label>
              <textarea
                placeholder="A brief 1-2 sentence summary of product features..."
                value={productForm.shortDescription || ''}
                onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-xl py-3 px-4 text-stone-900 text-xs h-24 focus:outline-none focus:border-[#4E641A] resize-none"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setProductModalTab('pricing')}
                className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Continue to Variants →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SHOPIFY-STYLE PRODUCT VARIANTS */}
        {productModalTab === 'pricing' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-stone-200">
              <div>
                <h4 className="font-serif text-lg font-bold text-stone-900">Product Variants</h4>
                <p className="text-xs text-stone-500 font-sans">
                  Configure package sizes, pricing, MRP, stock quantities, and unique SKUs.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs border-none"
              >
                <span>+ Add Variant</span>
              </button>
            </div>

            {/* Expandable Variant Cards List */}
            <div className="space-y-4">
              {(!productForm.variants || productForm.variants.length === 0) ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                  <p className="text-xs text-stone-500">No variants added yet. Click below to add the first package size.</p>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-4 py-2 bg-[#4E641A] text-white text-xs font-bold rounded-xl cursor-pointer border-none"
                  >
                    + Add Variant
                  </button>
                </div>
              ) : (
                productForm.variants.map((v, idx) => {
                  const isExpanded = v.isExpanded !== false;
                  const variantTitle = `${v.weight || '0'} ${v.unit || 'g'} ${v.price ? `• ₹${v.price}` : ''}`;
                  
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs transition-all duration-200"
                    >
                      {/* Summary Header */}
                      <div className="bg-stone-50/80 px-4 py-3.5 flex items-center justify-between gap-3 border-b border-stone-150">
                        <div 
                          onClick={() => toggleExpandVariant(idx)}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none"
                        >
                          <span className="text-stone-400 text-xs font-bold w-4">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                          <span className="font-serif text-sm font-bold text-stone-850 truncate">
                            Variant #{idx + 1}: {variantTitle}
                          </span>
                          {v.sku && (
                            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline-block">
                              [{v.sku}]
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleReorderVariant(idx, 'up')}
                            disabled={idx === 0}
                            title="Move Up"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorderVariant(idx, 'down')}
                            disabled={idx === productForm.variants.length - 1}
                            title="Move Down"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateVariant(idx)}
                            title="Duplicate Variant"
                            className="px-2.5 py-1 text-[11px] font-semibold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                          >
                            📋 Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(idx)}
                            title="Delete Variant"
                            className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer bg-transparent border-none"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Expandable Form Body */}
                      {isExpanded && (
                        <div className="p-5 space-y-4 bg-white animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            
                            {/* Weight */}
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-xs font-semibold text-stone-700">Weight *</label>
                              <input
                                type="text"
                                placeholder="e.g. 250"
                                value={v.weight || ''}
                                onChange={(e) => handleUpdateVariant(idx, 'weight', e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                              />
                            </div>

                            {/* Unit */}
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-xs font-semibold text-stone-700">Unit *</label>
                              <select
                                value={v.unit || 'g'}
                                onChange={(e) => handleUpdateVariant(idx, 'unit', e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A] cursor-pointer"
                              >
                                <option value="g">Grams (g)</option>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="ml">Milliliters (ml)</option>
                                <option value="l">Liters (l)</option>
                                <option value="pcs">Pieces (pcs)</option>
                              </select>
                            </div>

                            {/* Selling Price */}
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-xs font-semibold text-stone-700">Selling Price (₹) *</label>
                              <input
                                type="number"
                                placeholder="199"
                                value={v.price || ''}
                                onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                              />
                            </div>

                            {/* MRP */}
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-xs font-semibold text-stone-700">MRP (₹)</label>
                              <input
                                type="number"
                                placeholder="299"
                                value={v.mrp || ''}
                                onChange={(e) => handleUpdateVariant(idx, 'mrp', e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                              />
                            </div>

                            {/* Stock */}
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-xs font-semibold text-stone-700">Stock Quantity *</label>
                              <input
                                type="number"
                                placeholder="50"
                                value={v.inventory || ''}
                                onChange={(e) => handleUpdateVariant(idx, 'inventory', e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                              />
                            </div>

                            {/* SKU */}
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-xs font-semibold text-stone-700">SKU Code</label>
                              <input
                                type="text"
                                placeholder="SURY-PROD-250G"
                                value={v.sku || ''}
                                onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 font-mono focus:outline-none focus:border-[#4E641A]"
                              />
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setProductModalTab('basic')}
                className="border border-stone-300 text-stone-700 px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab('media')}
                className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Continue to Media →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MEDIA & GALLERY */}
        {productModalTab === 'media' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <UnifiedUploader
                value={productForm.images?.[0] || productForm.image || ''}
                onChange={(url) => {
                  const newImgs = [...(productForm.images || ['', '', '', ''])];
                  newImgs[0] = url;
                  setProductForm({ ...productForm, images: newImgs, image: url });
                }}
                label="Primary Product Image *"
                aspectRatio={1}
                folder="products"
              />
              <UnifiedUploader
                value={productForm.images?.[1] || ''}
                onChange={(url) => {
                  const newImgs = [...(productForm.images || ['', '', '', ''])];
                  newImgs[1] = url;
                  setProductForm({ ...productForm, images: newImgs, hoverImage: url });
                }}
                label="Gallery Image 1"
                aspectRatio={1}
                folder="products"
              />
              <UnifiedUploader
                value={productForm.images?.[2] || ''}
                onChange={(url) => {
                  const newImgs = [...(productForm.images || ['', '', '', ''])];
                  newImgs[2] = url;
                  setProductForm({ ...productForm, images: newImgs });
                }}
                label="Gallery Image 2"
                aspectRatio={1}
                folder="products"
              />
              <UnifiedUploader
                value={productForm.images?.[3] || ''}
                onChange={(url) => {
                  const newImgs = [...(productForm.images || ['', '', '', ''])];
                  newImgs[3] = url;
                  setProductForm({ ...productForm, images: newImgs });
                }}
                label="Gallery Image 3"
                aspectRatio={1}
                folder="products"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setProductModalTab('pricing')}
                className="border border-stone-300 text-stone-700 px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab('details')}
                className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Continue to Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PRODUCT DETAILS */}
        {productModalTab === 'details' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">Normal Description / Product Summary</label>
              <textarea
                placeholder="Standard product description summary..."
                value={productForm.description || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setProductForm(prev => ({
                    ...prev,
                    description: val,
                    productContent: { ...(prev.productContent || {}), about: val }
                  }));
                }}
                className="w-full bg-white border border-stone-300 rounded-xl py-3 px-4 text-stone-900 text-xs h-24 focus:outline-none focus:border-[#4E641A] resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-850 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-base">✨</span>
                  <span>Detailed Product Description</span>
                </label>
                <span className="text-[10px] text-stone-400 font-medium">Rich HTML content for product details page</span>
              </div>
              <LazyRichTextEditor
                value={productForm.detailedDescription || ''}
                onChange={(val) => {
                  setProductForm(prev => ({
                    ...prev,
                    detailedDescription: val
                  }));
                }}
                placeholder="Craft a rich, formatted description with headings, lists, tables, images, and FAQs..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">Ingredients</label>
              <input
                type="text"
                placeholder="e.g. 100% Organic Raw Moringa Leaves"
                value={productForm.ingredients || productForm.productContent?.ingredients || ''}
                onChange={(e) => setProductForm(prev => ({
                  ...prev,
                  ingredients: e.target.value,
                  productContent: { ...(prev.productContent || {}), ingredients: e.target.value }
                }))}
                className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">Nutritional Information</label>
                <input
                  type="text"
                  placeholder="Energy: 350kcal, Protein: 25g..."
                  value={productForm.nutrients || productForm.nutrition || ''}
                  onChange={(e) => setProductForm({ ...productForm, nutrients: e.target.value, nutrition: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">Origin / Farm Source</label>
                <input
                  type="text"
                  placeholder="Rajasthan, India"
                  value={productForm.origin || ''}
                  onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">Shelf Life</label>
                <input
                  type="text"
                  placeholder="12 Months"
                  value={productForm.shelfLife || ''}
                  onChange={(e) => setProductForm({ ...productForm, shelfLife: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setProductModalTab('media')}
                className="border border-stone-300 text-stone-700 px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab('content_builder')}
                className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Continue to Product Content →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PRODUCT CONTENT (CMS BUILDER) */}
        {productModalTab === 'content_builder' && (
          <div className="animate-fade-in text-left -mx-6 md:-mx-8 -my-6 md:-my-8 p-3 sm:p-5 bg-[#FAF8F5] overflow-hidden">
            <ProductContentBuilder
              sections={productForm.contentSections || []}
              onChange={(updatedSections) => {
                setProductForm(prev => ({
                  ...prev,
                  contentSections: updatedSections
                }));
              }}
              onProductFieldsGenerated={(mapped) => {
                if (!mapped) return;
                console.log('STEP 6 & 7: Setting Product Form State Fields:');
                console.log('  Setting Product Name:', mapped.productName);
                console.log('  Setting Short Description:', mapped.shortDescription);
                console.log('  Setting Detailed Description:', mapped.detailedDescription);
                console.log('  Setting Ingredients:', mapped.ingredients);
                console.log('  Setting Nutrition:', mapped.nutrition);
                console.log('  Setting Origin:', mapped.origin);
                console.log('  Setting Shelf Life:', mapped.shelfLife);

                setProductForm(prev => {
                  const updatedForm = {
                    ...prev,
                    name: mapped.productName || prev.name,
                    shortDescription: mapped.shortDescription || prev.shortDescription,
                    detailedDescription: mapped.detailedDescription || prev.detailedDescription,
                    description: mapped.detailedDescription || prev.description,
                    ingredients: mapped.ingredients || prev.ingredients,
                    nutrients: mapped.nutrition || prev.nutrients,
                    origin: mapped.origin || prev.origin,
                    shelfLife: mapped.shelfLife || prev.shelfLife,
                    categoryIds: (mapped.categories && mapped.categories.length > 0) ? mapped.categories : prev.categoryIds,
                    categoryId: (mapped.categories && mapped.categories[0]) ? mapped.categories[0] : prev.categoryId,
                    seoTitle: mapped.seo?.seoTitle || prev.seoTitle,
                    seoDescription: mapped.seo?.seoDescription || prev.seoDescription,
                    seoKeywords: mapped.seo?.seoKeywords || prev.seoKeywords
                  };
                  console.log('STEP 7: Log Final Form Object:', updatedForm);
                  return updatedForm;
                });
              }}
              onBack={() => setProductModalTab('details')}
              onSave={() => setProductModalTab('seo')}
            />
            <div className="flex justify-between pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setProductModalTab('details')}
                className="border border-stone-300 text-stone-700 px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                ← Back to Details
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab('seo')}
                className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Continue to SEO →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SEO SETTINGS */}
        {productModalTab === 'seo' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">SEO Meta Title</label>
              <input
                type="text"
                placeholder="Organic Moringa Powder | Suryodaya Farms"
                value={productForm.seoTitle || ''}
                onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">SEO Meta Description</label>
              <textarea
                placeholder="Buy 100% pure organic moringa powder direct from Suryodaya Farms..."
                value={productForm.seoDescription || ''}
                onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 h-20 focus:outline-none focus:border-[#4E641A] resize-none"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setProductModalTab('details')}
                className="border border-stone-300 text-stone-700 px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab('preview')}
                className="bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Preview & Publish →
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: PREVIEW & PUBLISH */}
        {productModalTab === 'preview' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <span className="text-xs font-bold text-stone-700">Storefront Live Preview</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDeviceMode('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${previewDeviceMode === 'desktop' ? 'bg-[#4E641A] text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDeviceMode('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${previewDeviceMode === 'mobile' ? 'bg-[#4E641A] text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Live Card Preview */}
            <div className={`mx-auto bg-white border border-stone-200 rounded-3xl p-6 shadow-xs transition-all ${previewDeviceMode === 'mobile' ? 'max-w-sm' : 'w-full'}`}>
              <div className="flex flex-col gap-4">
                <img
                  src={productForm.images?.[0] || productForm.image || 'https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png'}
                  alt="Product preview"
                  className="w-full h-56 object-cover rounded-2xl border border-stone-100 bg-cream-bg"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#4E641A] font-semibold">Suryodaya Farms Organic</span>
                  <h3 className="font-serif text-xl font-bold text-dark-olive">{productForm.name || 'Untitled Product'}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-serif text-xl font-bold text-dark-olive">₹{productForm.price || '0'}</span>
                    {productForm.mrp && <span className="text-xs text-stone-400 line-through">₹{productForm.mrp}</span>}
                  </div>
                  <p className="text-xs text-stone-600 font-sans mt-2">{productForm.shortDescription || 'No short description provided.'}</p>
                </div>
              </div>
            </div>

            {/* Publish Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setProductModalTab('seo')}
                className="w-full sm:w-auto border border-stone-300 text-stone-700 px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                ← Back to Edit
              </button>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onSaveDraft}
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 px-5 py-3 rounded-xl font-semibold text-xs transition cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial bg-[#4E641A] hover:bg-[#2F3B0C] text-white px-7 py-3 rounded-xl font-bold text-xs transition shadow-md cursor-pointer border-none"
                >
                  {mode === 'edit' ? 'Update Product ✓' : 'Publish Product ✓'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {cropTarget && (
        <ImageCropper
          imageSrc={cropTarget}
          targetAspect={4 / 3}
          onCropComplete={(cropData) => {
            setCropTarget(null);
          }}
          onCancel={() => setCropTarget(null)}
        />
      )}
    </div>
  );
}
