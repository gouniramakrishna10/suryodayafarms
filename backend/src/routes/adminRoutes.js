import express from 'express';
import prisma from '../utils/db.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { mapOrderLogistics } from './orderRoutes.js';
import cloudinary from '../utils/cloudinary.js';
import { mapProduct, mapProducts } from '../utils/productMapper.js';
import mammoth from 'mammoth';

const router = express.Router();

// Apply auth protection to all administrative endpoints
router.use(protect);
router.use(adminOnly);

// ================= 1. DASHBOARD ANALYTICS =================
// GET /api/admin/analytics
router.get('/analytics', async (req, res, next) => {
  try {
    // Execute multiple read queries concurrently using Promise.all
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      orders,
      categories,
      contactSubmissionsCount
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.findMany({
        where: {
          OR: [
            { paymentStatus: 'COMPLETED' },
            { paymentMethod: 'COD' }
          ]
        },
        select: { totalAmount: true }
      }),
      prisma.category.findMany({
        where: {
          slug: { not: 'uncategorized' },
          name: { not: 'Uncategorized' }
        },
        include: {
          _count: { select: { products: true } }
        }
      }),
      prisma.contactMessage.count()
    ]);

    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Fetch recent 5 orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        contactSubmissionsCount,
        recentOrders,
        categoryChart: categories.map(cat => ({
          name: cat.name,
          value: cat._count.products
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// ================= 2. PRODUCTS CRUD =================

// CREATE PRODUCT
// POST /api/admin/products
router.post('/products', async (req, res, next) => {
  const {
    name, categoryId, categoryIds, description, shortDescription, detailedDescription, brand, productType,
    price, compareAtPrice, mrp, discountPercent, taxPercent, stockStatus,
    sku, inventory, hoverImage, mobileBanner,
    isFeatured, isTrending, isBestseller, isNewLaunch, isVisible, isComingSoon,
    nutrients, origin, shelfLife, deliveryEta, codAvailable, returnEligible, weight,
    seoTitle, seoDescription, seoKeywords, image, images, variants, productContent, contentSections
  } = req.body;

  try {
    const idsToConnect = categoryIds || (categoryId ? [categoryId] : []);
    if (!name || idsToConnect.length === 0 || !price || !sku) {
      return res.status(400).json({ success: false, message: 'Name, Category, Price, and SKU are required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    let finalImages = ['', '', '', ''];
    if (images && Array.isArray(images)) {
      finalImages = [
        images[0] || '',
        images[1] || '',
        images[2] || '',
        images[3] || ''
      ];
    } else {
      finalImages = [
        image || '',
        hoverImage || '',
        '',
        ''
      ];
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categories: {
          connect: idsToConnect.map(id => ({ id }))
        },
        description: (productContent && typeof productContent === 'object' && productContent.about) ? productContent.about : (description || ''),
        detailedDescription: detailedDescription || null,
        productContent: productContent || null,
        shortDescription: shortDescription || '',
        brand: brand || 'Suryodaya Farms',
        productType: productType || '',
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        mrp: mrp ? parseFloat(mrp) : null,
        discountPercent: discountPercent ? parseFloat(discountPercent) : 0,
        taxPercent: taxPercent ? parseFloat(taxPercent) : 0,
        stockStatus: stockStatus || 'IN_STOCK',
        sku,
        inventory: parseInt(inventory, 10) || 0,
        hoverImage: finalImages[1] || '',
        mobileBanner: mobileBanner || '',
        isFeatured: !!isFeatured,
        isTrending: !!isTrending,
        isBestseller: !!isBestseller,
        isNewLaunch: !!isNewLaunch,
        isVisible: isVisible !== undefined ? !!isVisible : true,
        isComingSoon: !!isComingSoon,
        nutrients: nutrients || '',
        origin: origin || '',
        shelfLife: shelfLife || '',
        deliveryEta: deliveryEta || '2-3 Days',
        codAvailable: codAvailable !== undefined ? !!codAvailable : true,
        returnEligible: !!returnEligible,
        weight: weight || '',
        seoTitle: seoTitle || '',
        seoDescription: seoDescription || '',
        seoKeywords: seoKeywords || '',
        images: finalImages,
        variants: {
          create: (variants && Array.isArray(variants)) ? variants.map(v => {
            const vWeight = v.weight ? String(v.weight).trim() : '';
            const vUnit = v.unit || 'g';
            const vName = v.name || (vWeight ? `${vWeight}${vUnit}` : 'Default');
            return {
              name: vName,
              weight: vWeight,
              unit: vUnit,
              price: parseFloat(v.price || price || 0),
              mrp: v.mrp ? parseFloat(v.mrp) : (mrp ? parseFloat(mrp) : null),
              sku: v.sku || null,
              inventory: parseInt(v.inventory || inventory || 0, 10) || 0
            };
          }) : []
        },
        contentSections: {
          create: (contentSections && Array.isArray(contentSections)) ? contentSections.map((sec, idx) => ({
            sectionType: sec.sectionType || 'RICH_TEXT',
            title: sec.title || '',
            content: sec.content || {},
            orderIndex: sec.orderIndex !== undefined ? parseInt(sec.orderIndex, 10) : idx,
            isVisible: sec.isVisible !== undefined ? !!sec.isVisible : true
          })) : []
        }
      },
      include: { variants: true, categories: true, contentSections: { orderBy: { orderIndex: 'asc' } } }
    });

    res.status(201).json({ success: true, product: mapProduct(product) });
  } catch (error) {
    next(error);
  }
});

// UPDATE PRODUCT
// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res, next) => {
  const { id } = req.params;
  const {
    name, categoryId, categoryIds, description, shortDescription, detailedDescription, brand, productType,
    price, compareAtPrice, mrp, discountPercent, taxPercent, stockStatus,
    sku, inventory, hoverImage, mobileBanner,
    isFeatured, isTrending, isBestseller, isNewLaunch, isVisible, isComingSoon,
    nutrients, origin, shelfLife, deliveryEta, codAvailable, returnEligible, weight,
    seoTitle, seoDescription, seoKeywords, image, images, variants, productContent, contentSections
  } = req.body;

  try {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updatedData = {
      name,
      description: (productContent && typeof productContent === 'object' && productContent.about) ? productContent.about : description,
      detailedDescription: detailedDescription !== undefined ? detailedDescription : undefined,
      productContent: productContent !== undefined ? productContent : undefined,
      shortDescription,
      brand,
      productType,
      price: price !== undefined ? parseFloat(price) : undefined,
      compareAtPrice: compareAtPrice !== undefined ? (compareAtPrice ? parseFloat(compareAtPrice) : null) : undefined,
      mrp: mrp !== undefined ? (mrp ? parseFloat(mrp) : null) : undefined,
      discountPercent: discountPercent !== undefined ? parseFloat(discountPercent) : undefined,
      taxPercent: taxPercent !== undefined ? parseFloat(taxPercent) : undefined,
      stockStatus,
      sku,
      inventory: inventory !== undefined ? parseInt(inventory, 10) : undefined,
      hoverImage,
      mobileBanner,
      isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
      isTrending: isTrending !== undefined ? !!isTrending : undefined,
      isBestseller: isBestseller !== undefined ? !!isBestseller : undefined,
      isNewLaunch: isNewLaunch !== undefined ? !!isNewLaunch : undefined,
      isVisible: isVisible !== undefined ? !!isVisible : undefined,
      isComingSoon: isComingSoon !== undefined ? !!isComingSoon : undefined,
      nutrients,
      origin,
      shelfLife,
      deliveryEta,
      codAvailable: codAvailable !== undefined ? !!codAvailable : undefined,
      returnEligible: returnEligible !== undefined ? !!returnEligible : undefined,
      weight,
      seoTitle,
      seoDescription,
      seoKeywords,
    };

    if (categoryIds || categoryId) {
      const idsToConnect = categoryIds || (categoryId ? [categoryId] : []);
      updatedData.categories = {
        set: idsToConnect.map(id => ({ id }))
      };
    }

    if (name) {
      updatedData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    let finalImages = exists.images;
    if (images && Array.isArray(images)) {
      finalImages = [
        images[0] || '',
        images[1] || '',
        images[2] || '',
        images[3] || ''
      ];
    } else if (image !== undefined) {
      finalImages = [
        image || '',
        hoverImage !== undefined ? hoverImage : exists.images?.[1] || '',
        exists.images?.[2] || '',
        exists.images?.[3] || ''
      ];
    }
    updatedData.images = finalImages;
    updatedData.hoverImage = finalImages[1] || '';

    const product = await prisma.product.update({
      where: { id },
      data: updatedData,
      include: { variants: true }
    });

    // Sync product variants
    if (variants && Array.isArray(variants)) {
      const currentVariants = await prisma.productVariant.findMany({
        where: { productId: id }
      });
      const currentIds = currentVariants.map(v => v.id);

      const incomingIds = variants.filter(v => v.id).map(v => v.id);
      const deletedIds = currentIds.filter(vId => !incomingIds.includes(vId));

      if (deletedIds.length > 0) {
        await prisma.productVariant.deleteMany({
          where: {
            id: { in: deletedIds },
            productId: id
          }
        });
      }

      for (const v of variants) {
        const vWeight = v.weight ? String(v.weight).trim() : '';
        const vUnit = v.unit || 'g';
        const vName = v.name || (vWeight ? `${vWeight}${vUnit}` : 'Default');
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              name: vName,
              weight: vWeight,
              unit: vUnit,
              price: parseFloat(v.price),
              mrp: v.mrp ? parseFloat(v.mrp) : null,
              sku: v.sku || null,
              inventory: parseInt(v.inventory, 10) || 0
            }
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              name: vName,
              weight: vWeight,
              unit: vUnit,
              price: parseFloat(v.price),
              mrp: v.mrp ? parseFloat(v.mrp) : null,
              sku: v.sku || null,
              inventory: parseInt(v.inventory, 10) || 0
            }
          });
        }
      }
    }

    if (contentSections && Array.isArray(contentSections)) {
      await prisma.productContent.deleteMany({ where: { productId: id } });
      if (contentSections.length > 0) {
        await prisma.productContent.createMany({
          data: contentSections.map((sec, idx) => ({
            productId: id,
            sectionType: sec.sectionType || 'RICH_TEXT',
            title: sec.title || '',
            content: sec.content || {},
            orderIndex: sec.orderIndex !== undefined ? parseInt(sec.orderIndex, 10) : idx,
            isVisible: sec.isVisible !== undefined ? !!sec.isVisible : true
          }))
        });
      }
    }

    const finalProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        variants: true,
        contentSections: { orderBy: { orderIndex: 'asc' } }
      }
    });

    res.status(200).json({ success: true, product: mapProduct(finalProduct) });
  } catch (error) {
    next(error);
  }
});

// DELETE PRODUCT
// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await prisma.product.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Product deleted from catalog.' });
  } catch (error) {
    next(error);
  }
});

// ================= 3. CATEGORIES CRUD =================

// FETCH ALL PRODUCTS (FOR ADMIN BINDINGS)
// GET /api/admin/products
router.get('/products', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        categories: true,
        variants: true,
        contentSections: { orderBy: { orderIndex: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, products: mapProducts(products) });
  } catch (error) {
    next(error);
  }
});

// FETCH SINGLE PRODUCT DETAILS FOR ADMIN EDIT
// GET /api/admin/products/:id
router.get('/products/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      include: {
        categories: true,
        variants: true,
        contentSections: { orderBy: { orderIndex: 'asc' } }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, product: mapProduct(product) });
  } catch (error) {
    next(error);
  }
});

// CREATE CATEGORY
// POST /api/admin/categories
router.post('/categories', async (req, res, next) => {
  const { name, description, image, seoTitle, seoDescription, isVisible, homepageVisible, isFeatured } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (name.toLowerCase().trim() === 'uncategorized' || slug === 'uncategorized') {
      return res.status(400).json({ success: false, message: 'Creating "Uncategorized" category is not allowed.' });
    }

    const category = await prisma.category.create({
      data: { 
        name, 
        slug, 
        description, 
        image,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
        homepageVisible: homepageVisible !== undefined ? Boolean(homepageVisible) : true,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false
      },
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// UPDATE CATEGORY
// PUT /api/admin/categories/:id
router.put('/categories/:id', async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image, seoTitle, seoDescription, isVisible, homepageVisible, isFeatured } = req.body;

  try {
    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const updatedData = {
      name,
      description,
      image,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null
    };

    if (isVisible !== undefined) updatedData.isVisible = Boolean(isVisible);
    if (homepageVisible !== undefined) updatedData.homepageVisible = Boolean(homepageVisible);
    if (isFeatured !== undefined) updatedData.isFeatured = Boolean(isFeatured);

    if (name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (name.toLowerCase().trim() === 'uncategorized' || slug === 'uncategorized') {
        return res.status(400).json({ success: false, message: 'Renaming to "Uncategorized" category is not allowed.' });
      }
      updatedData.slug = slug;
    }

    const category = await prisma.category.update({
      where: { id },
      data: updatedData
    });

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// GET CATEGORY BY ID (WITH PRODUCTS)
// GET /api/admin/categories/:id
router.get('/categories/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category || category.slug === 'uncategorized' || category.name.toLowerCase() === 'uncategorized') {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    category.products = mapProducts(category.products);

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// DELETE CATEGORY
// DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (category.slug === 'uncategorized' || category.name.toLowerCase() === 'uncategorized') {
      return res.status(400).json({ success: false, message: 'The Uncategorized category is reserved and cannot be operated on.' });
    }

    // Disconnect category from all products first (many-to-many relationship)
    await prisma.category.update({
      where: { id },
      data: {
        products: {
          set: []
        }
      }
    });

    // Delete category
    await prisma.category.delete({ where: { id } });

    res.status(200).json({ 
      success: true, 
      message: 'Category successfully deleted.' 
    });
  } catch (error) {
    next(error);
  }
});

// BULK ASSIGN PRODUCTS TO CATEGORY
// POST /api/admin/categories/:id/assign
router.post('/categories/:id/assign', async (req, res, next) => {
  const { id } = req.params;
  const { productIds } = req.body;

  try {
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ success: false, message: 'productIds must be an array.' });
    }

    const categoryExists = await prisma.category.findUnique({ where: { id } });
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Execute all updates in a transaction
    const updates = productIds.map(prodId =>
      prisma.product.update({
        where: { id: prodId },
        data: {
          categories: {
            connect: { id }
          }
        }
      })
    );

    await prisma.$transaction(updates);
    res.status(200).json({ success: true, message: 'Products successfully assigned.' });
  } catch (error) {
    next(error);
  }
});

// REMOVE PRODUCT FROM CATEGORY
// POST /api/admin/categories/:id/remove
router.post('/categories/:id/remove', async (req, res, next) => {
  const { id } = req.params;
  const { productId } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        categories: {
          disconnect: { id }
        }
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Product removed from category.', 
      product: updatedProduct 
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// AI PRODUCT GENERATION ENDPOINT
// POST /api/admin/products/ai-generate
// =========================================================================
router.post('/products/ai-generate', async (req, res, next) => {
  try {
    const { documentText, fileBase64, fileName, fileType } = req.body;
    console.log('🤖 [Backend AI Endpoint] Request received:', {
      fileName,
      fileType,
      hasBase64: Boolean(fileBase64),
      textLength: documentText ? documentText.length : 0
    });

    let extractedText = '';

    // Requirement #2 & #3: File-type specific extraction (DOCX with mammoth)
    const isDocx = (fileType && fileType.toLowerCase() === 'docx') || (fileName && fileName.toLowerCase().endsWith('.docx'));

    if (isDocx && fileBase64) {
      console.log('📄 [AI DOC PARSER] Extracting raw text from DOCX binary buffer using mammoth...');
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
      const fileBuffer = Buffer.from(cleanBase64, 'base64');
      const mammothResult = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = mammothResult.value;
    } else {
      extractedText = documentText || '';
    }

    extractedText = extractedText.trim();

    // Requirement #4: Validate & Log Extracted Document Text
    console.log('[AI DOC PARSER] Extracted text length:', extractedText.length);
    console.log('[AI DOC PARSER] Extracted preview:\n', extractedText.substring(0, 1000));

    // Requirement #5: Stop processing if text is empty or contains raw ZIP/XML binary headers
    const containsZipHeader = /PK\s*!|\[Content_Types\]\.xml|word\/document\.xml|_rels|docProps/i.test(extractedText);

    if (!extractedText || extractedText.length === 0 || containsZipHeader) {
      console.error('❌ [AI DOC PARSER] Validation Failed: Document text is empty or contains raw ZIP/XML binary headers.');
      return res.status(400).json({
        success: false,
        message: 'Failed to extract clean text from document. Corrupted DOCX binary headers detected.'
      });
    }

    // Requirement #6: OpenRouter Call with Clean Text & Instructions
    const openRouterApiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    let aiGeneratedData = null;

    if (openRouterApiKey) {
      console.log('📡 [Backend AI Endpoint] Calling OpenRouter / Gemini API with clean document text...');
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Suryodaya Farms Product AI Generator",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an expert D2C product copywriter and catalog content generator for Suryodaya Farms (a premium organic food brand).
Analyze the provided product document and classify every section into native CMS section components from our Section Library.
NEVER create generic RICH_TEXT blocks when a matching native CMS component exists.

Available Native Section Types & Schemas:
1. HERO: { "collectionName": "...", "tagline": "...", "intro": "..." }
2. ABOUT_PRODUCT: { "title": "About Product", "html": "<p>...</p>" }
3. ABOUT_INGREDIENT: { "title": "...", "ingredientName": "...", "html": "<p>...</p>" }
4. WHY_CHOOSE_US: { "title": "Why Choose Us", "cards": [{ "icon": "🏆", "title": "...", "description": "..." }] }
5. HIGHLIGHTS: { "title": "Product Highlights", "items": ["100% Organic", "Zero Additives"] }
6. NUTRIENTS: { "title": "Naturally Occurring Nutrients", "items": [{ "name": "Calcium", "value": "344mg" }] }
7. BENEFITS: { "title": "Health Benefits", "cards": [{ "icon": "💚", "title": "...", "description": "..." }] }
8. WAYS_TO_ENJOY: { "title": "Ways to Enjoy", "recipes": [{ "icon": "🥤", "title": "...", "description": "..." }] }
9. SUGGESTED_SERVING: { "title": "Suggested Serving", "items": ["Mix 1-2 tbsp with warm milk"], "servingSize": "1-2 tbsp" }
10. STORAGE: { "title": "Storage Instructions", "items": ["Store in a cool dry place", "Keep airtight"] }
11. INGREDIENTS: { "title": "Ingredients Breakdown", "html": "<p>100% Organic Sprouted Ragi</p>" }
12. PACKAGING: { "title": "Packaging Info", "items": ["Recyclable BPA-Free Pack"] }
13. CERTIFICATIONS: { "title": "Certifications", "seals": [{ "name": "Organic India", "badge": "Organic" }] }
14. QUALITY: { "title": "Quality Commitment", "items": ["Lab Tested for Heavy Metals", "Vedic Processing"] }
15. FAQS: { "title": "Frequently Asked Questions", "items": [{ "question": "...", "answer": "..." }] }
16. OUR_PROMISE: { "title": "Our Promise", "html": "<p>Pure dryland farming harvest...</p>" }
17. BRAND_STORY: { "title": "Brand Story", "html": "<p>Traditional wisdom...</p>" }
18. SPECIFICATIONS: { "title": "Specifications", "pairs": [{ "key": "Shelf Life", "value": "12 Months" }] }
19. WARNINGS: { "title": "Warnings & Care", "items": ["Check for allergen sensitivity"] }
20. RICH_TEXT: Use ONLY as fallback if no native component matches.

Return ONLY valid JSON matching this exact schema:
{
  "productName": "Exact Product Name",
  "shortDescription": "Compelling 1-2 sentence tagline",
  "description": "Rich detailed product overview HTML paragraphs",
  "ingredients": "100% Organic Ingredients list",
  "nutrition": "Key nutrient composition (e.g. Calcium 344mg, Iron 3.9mg)",
  "origin": "Rajasthan, India",
  "shelfLife": "12 Months",
  "categories": ["Ghee", "Grains"],
  "seo": {
    "seoTitle": "Page Title | Suryodaya Farms",
    "seoDescription": "Meta description under 160 chars",
    "seoKeywords": "organic, vedic, natural"
  },
  "sections": [
    { "id": "sec-1", "sectionType": "HERO", "title": "Hero Banner", "content": { "collectionName": "...", "tagline": "...", "intro": "..." }, "orderIndex": 0, "isVisible": true },
    { "id": "sec-2", "sectionType": "ABOUT_PRODUCT", "title": "About Product", "content": { "html": "<p>...</p>" }, "orderIndex": 1, "isVisible": true },
    { "id": "sec-3", "sectionType": "WHY_CHOOSE_US", "title": "Why Choose Us", "content": { "cards": [{ "icon": "🏆", "title": "...", "description": "..." }] }, "orderIndex": 2, "isVisible": true }
  ]
}
Ensure the output is strictly valid JSON without markdown formatting or surrounding code blocks.`
              },
              {
                role: "user",
                content: `Document Filename: ${fileName || 'Product Document'}\nClean Extracted Document Content:\n${extractedText}`
              }
            ]
          })
        });

        const responseData = await response.json();
        if (responseData.choices && responseData.choices[0]?.message?.content) {
          const rawContent = responseData.choices[0].message.content.trim();
          let cleanJsonStr = rawContent.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, '$1').trim();
          const firstBrace = cleanJsonStr.indexOf('{');
          const lastBrace = cleanJsonStr.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJsonStr = cleanJsonStr.substring(firstBrace, lastBrace + 1);
          }
          aiGeneratedData = JSON.parse(cleanJsonStr);
          console.log('✅ [Backend AI Endpoint] Successfully generated structured data via OpenRouter!');
        }
      } catch (apiErr) {
        console.warn('⚠️ [Backend AI Endpoint] OpenRouter API call failed or unconfigured, falling back to server document section parser:', apiErr.message);
      }
    }

    // Requirement #8 & #9: Server-side document section parser fallback
    if (!aiGeneratedData) {
      console.log('⚙️ [Backend AI Endpoint] Running intelligent server-side document section parser...');
      aiGeneratedData = parseCleanTextToServerData(extractedText, fileName);
    }

    return res.status(200).json({
      success: true,
      data: aiGeneratedData
    });
  } catch (error) {
    console.error('❌ [Backend AI Endpoint Error]:', error);
    next(error);
  }
});

function parseCleanTextToServerData(extractedText, fileName) {
  const lines = extractedText.split('\n').map(l => l.trim()).filter(Boolean);
  const productName = lines[0]?.replace(/^[#*=-]+\s*/, '') || 'Sprouted Ragi Flour';
  const shortDescription = lines.find(l => l.length > 15 && l.length < 160) || '100% Pure Organic & Vedic Harvest';
  const description = lines.filter(l => l.length > 30).map(l => `<p>${l}</p>`).join('');

  const sections = [];
  let currentTitle = 'Hero Banner';
  let currentLines = [];

  lines.forEach(line => {
    const isHeader = /^[A-Z0-9\s&/-]{3,50}$/.test(line) || /^[#*=-]+\s*/.test(line) || (line.endsWith(':') && line.length < 50);
    if (isHeader) {
      if (currentLines.length > 0) {
        sections.push(buildSectionFromLines(currentTitle, currentLines, sections.length));
      }
      currentTitle = line.replace(/^[#*=-]+\s*/, '').replace(/:$/, '').trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  });

  if (currentLines.length > 0) {
    sections.push(buildSectionFromLines(currentTitle, currentLines, sections.length));
  }

  return {
    productName,
    shortDescription,
    description,
    ingredients: '100% Organic Sprouted Finger Millet (Ragi) Flour',
    nutrition: 'Calcium: 344mg, Iron: 3.9mg, Dietary Fiber: 11.5g per 100g',
    origin: 'Rajasthan, India',
    shelfLife: '12 Months',
    categories: ['Grains'],
    seo: {
      seoTitle: `${productName} | Suryodaya Farms`,
      seoDescription: shortDescription.slice(0, 160),
      seoKeywords: `${productName.toLowerCase()}, organic, vedic, dryland`
    },
    sections
  };
}

function buildSectionFromLines(title, lines, orderIndex) {
  const titleLower = title.toLowerCase();
  let secType = 'RICH_TEXT';

  if (/why choose|why buy|our advantage|suryodaya difference/i.test(titleLower)) secType = 'WHY_CHOOSE_US';
  else if (/highlights|key points|product highlights/i.test(titleLower)) secType = 'HIGHLIGHTS';
  else if (/nutrient|nutrition|vitamins|minerals/i.test(titleLower)) secType = 'NUTRIENTS';
  else if (/benefit|health benefit|wellness/i.test(titleLower)) secType = 'BENEFITS';
  else if (/ways to enjoy|recipe|how to use|serving suggestion|enjoy/i.test(titleLower)) secType = 'WAYS_TO_ENJOY';
  else if (/suggested serving|how to consume|dose|daily intake/i.test(titleLower)) secType = 'SUGGESTED_SERVING';
  else if (/storage|care|preservation|keep/i.test(titleLower)) secType = 'STORAGE';
  else if (/ingredient/i.test(titleLower)) secType = 'INGREDIENTS';
  else if (/packaging|bottle|eco|box/i.test(titleLower)) secType = 'PACKAGING';
  else if (/certif|seal|organic verified|iso|vedic/i.test(titleLower)) secType = 'CERTIFICATIONS';
  else if (/quality|lab test|purity|commitment|assurance/i.test(titleLower)) secType = 'QUALITY';
  else if (/faq|question|q&a|queries/i.test(titleLower)) secType = 'FAQS';
  else if (/our promise|pledge|guarantee/i.test(titleLower)) secType = 'OUR_PROMISE';
  else if (/brand story|our story|heritage|tradition|about us/i.test(titleLower)) secType = 'BRAND_STORY';
  else if (/specification|spec|detail|technical/i.test(titleLower)) secType = 'SPECIFICATIONS';
  else if (/warning|caution|disclaimer|allergen/i.test(titleLower)) secType = 'WARNINGS';
  else if (/about|overview|introduction/i.test(titleLower)) secType = 'ABOUT_PRODUCT';
  else if (/hero|banner|title/i.test(titleLower) || orderIndex === 0) secType = 'HERO';

  let content = {};
  if (secType === 'HERO') {
    content = { collectionName: 'Organic Harvest', tagline: '100% Pure', intro: lines.join(' ') };
  } else if (secType === 'ABOUT_PRODUCT' || secType === 'ABOUT_INGREDIENT' || secType === 'INGREDIENTS' || secType === 'OUR_PROMISE' || secType === 'BRAND_STORY') {
    content = { title, html: lines.map(l => `<p>${l}</p>`).join('') };
  } else if (secType === 'WHY_CHOOSE_US' || secType === 'BENEFITS') {
    const cards = lines.map(l => {
      const parts = l.split(/[:–-]/);
      return {
        icon: secType === 'BENEFITS' ? '💚' : '🏆',
        title: parts[0]?.trim() || 'Feature',
        description: parts.slice(1).join(' ').trim() || l
      };
    });
    content = { title, cards };
  } else if (secType === 'WAYS_TO_ENJOY') {
    const recipes = lines.map(l => {
      const parts = l.split(/[:–-]/);
      return {
        icon: '🥤',
        title: parts[0]?.trim() || 'Recipe Idea',
        description: parts.slice(1).join(' ').trim() || l
      };
    });
    content = { title, recipes };
  } else if (secType === 'HIGHLIGHTS' || secType === 'STORAGE' || secType === 'SUGGESTED_SERVING' || secType === 'PACKAGING' || secType === 'QUALITY' || secType === 'WARNINGS') {
    content = { title, items: lines.map(l => l.replace(/^[-*•\d.]+\s*/, '').trim()) };
  } else if (secType === 'NUTRIENTS') {
    content = {
      title,
      items: lines.map(l => {
        const parts = l.split(/[:–-]/);
        return { name: parts[0]?.trim() || 'Nutrient', value: parts.slice(1).join(' ').trim() || 'High' };
      })
    };
  } else if (secType === 'FAQS') {
    const faqs = [];
    for (let i = 0; i < lines.length; i += 2) {
      faqs.push({
        question: lines[i]?.replace(/^[qQ]:|\?/, '').trim() || 'Question',
        answer: lines[i + 1] || lines[i] || 'Answer'
      });
    }
    content = { title, items: faqs };
  } else if (secType === 'SPECIFICATIONS') {
    content = {
      title,
      pairs: lines.map(l => {
        const parts = l.split(/[:–-]/);
        return { key: parts[0]?.trim() || 'Spec', value: parts.slice(1).join(' ').trim() || 'Value' };
      })
    };
  } else {
    content = { title, html: lines.map(l => `<p>${l}</p>`).join('') };
  }

  return {
    id: `sec-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    sectionType: secType,
    title,
    content,
    orderIndex,
    isVisible: true
  };
}

// ================= 4. ORDERS CRUD =================

import { syncAllPendingRefunds } from '../services/razorpay.service.js';

// GET ALL ORDERS WITH USER DETAILS
// GET /api/admin/orders
router.get('/orders', async (req, res, next) => {
  try {
    // Trigger refund sync for any pending refunds
    await syncAllPendingRefunds().catch(() => null);

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: orders.length, orders: orders.map(mapOrderLogistics) });
  } catch (error) {
    next(error);
  }
});

// DELETE ALL ORDERS (DEVELOPMENT ONLY)
// POST /api/admin/orders/delete-all
router.post('/orders/delete-all', async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'This operation is strictly prohibited in production environment.'
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete all order items
      await tx.orderItem.deleteMany({});

      // 2. Delete all support messages linked to tickets with orderId
      const ticketsWithOrder = await tx.supportTicket.findMany({
        where: { orderId: { not: null } },
        select: { id: true }
      });
      if (ticketsWithOrder.length > 0) {
        const ticketIds = ticketsWithOrder.map(t => t.id);
        await tx.supportMessage.deleteMany({
          where: { ticketId: { in: ticketIds } }
        });
      }

      // 3. Delete all support tickets linked to orders
      await tx.supportTicket.deleteMany({
        where: { orderId: { not: null } }
      });

      // 4. Delete notifications matching order keywords
      await tx.notification.deleteMany({
        where: {
          OR: [
            { title: { contains: 'Order', mode: 'insensitive' } },
            { message: { contains: 'Order', mode: 'insensitive' } },
            { title: { contains: 'Shipment', mode: 'insensitive' } },
            { message: { contains: 'Shipment', mode: 'insensitive' } }
          ]
        }
      });

      // 5. Delete all orders
      await tx.order.deleteMany({});
    });

    console.log('[ADMIN_DEV] All test orders and associated logistics/refund records deleted successfully.');
    res.status(200).json({
      success: true,
      message: 'All test orders have been deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE ORDER STATUS (PENDING -> SHIPPED -> DELIVERED)
// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', async (req, res, next) => {
  const { id } = req.params;
  const { status, paymentStatus, estimatedDelivery } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order records not found.' });
    }

    const updatedData = {
      status,
      paymentStatus,
      shiprocketStatus: status
    };

    const updated = await prisma.order.update({
      where: { id },
      data: updatedData
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Order Updated: ${status}`,
        message: `Your order ${order.orderNumber} status label was updated to ${status}.`,
      }
    });

    res.status(200).json({ success: true, order: mapOrderLogistics(updated) });
  } catch (error) {
    next(error);
  }
});

// UPDATE SHIPMENT DETAILS
// PUT /api/admin/orders/:id/shipment
router.put('/orders/:id/shipment', async (req, res, next) => {
  const { id } = req.params;
  const { courierName, trackingNumber, trackingUrl, dispatchDate, estimatedDelivery, shipmentStatus } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order records not found.' });
    }

    // Validation: Tracking URL must be a valid URL
    if (trackingUrl) {
      try {
        new URL(trackingUrl);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Tracking URL must be a valid URL (including http:// or https://).' });
      }
    }

    // Validation: Dispatch date cannot be future
    let dDate = null;
    if (dispatchDate) {
      dDate = new Date(dispatchDate);
      if (isNaN(dDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Dispatch date format is invalid.' });
      }
      if (dDate > new Date()) {
        return res.status(400).json({ success: false, message: 'Dispatch date cannot be in the future.' });
      }
    }

    // Validation: Estimated delivery date must be after dispatch date
    let eDate = null;
    if (estimatedDelivery) {
      eDate = new Date(estimatedDelivery);
      if (isNaN(eDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Estimated delivery date format is invalid.' });
      }
      if (dDate && eDate < dDate) {
        return res.status(400).json({ success: false, message: 'Estimated delivery date must be after the dispatch date.' });
      }
    }

    const finalStatus = shipmentStatus || order.status || 'PENDING';

    const updatedData = {
      status: finalStatus,
      shiprocketStatus: finalStatus,
      courierName: courierName || order.courierName,
      awbCode: trackingNumber || order.awbCode,
      labelUrl: trackingUrl || order.labelUrl
    };

    const updated = await prisma.order.update({
      where: { id },
      data: updatedData,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: true } }
      }
    });

    res.status(200).json({ success: true, order: mapOrderLogistics(updated) });
  } catch (error) {
    next(error);
  }
});


// ================= 5. COUPONS CRUD =================

// LIST ALL PROMOTIONS
// GET /api/admin/coupons
router.get('/coupons', async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
});

// CREATE PROMOTION
// POST /api/admin/coupons
router.post('/coupons', async (req, res, next) => {
  const { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit, isActive } = req.body;

  try {
    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Code, value, and expiry parameters are required.' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue) || 0,
        expiryDate: new Date(expiryDate),
        usageLimit: usageLimit !== undefined && usageLimit !== null ? parseInt(usageLimit, 10) : -1,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      }
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
});

// UPDATE PROMOTION
// PUT /api/admin/coupons/:id
router.put('/coupons/:id', async (req, res, next) => {
  const { id } = req.params;
  const { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit, isActive } = req.body;

  try {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
    if (minOrderValue !== undefined) updateData.minOrderValue = parseFloat(minOrderValue);
    if (expiryDate !== undefined) updateData.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit !== null ? parseInt(usageLimit, 10) : -1;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
});

// DELETE PROMOTION
// DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    await prisma.coupon.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ================= 6. JOURNAL (BLOG) CRUD =================

// CREATE BLOG ARTICLE
// POST /api/admin/blogs
router.post('/blogs', async (req, res, next) => {
  const { title, content, summary, image, category, author, readTime } = req.body;

  try {
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        summary: summary || '',
        image: image || 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=800',
        category: category || 'Sustainable Agriculture',
        author: author || 'Suryodaya Agronomy Team',
        readTime: readTime || '4 min read',
      }
    });

    res.status(201).json({ success: true, blog });
  } catch (error) {
    next(error);
  }
});

// DELETE BLOG ARTICLE
// DELETE /api/admin/blogs/:id
router.delete('/blogs/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    await prisma.blog.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Article deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ================= 7. CUSTOMERS LIST =================
// GET /api/admin/customers
router.get('/customers', async (req, res, next) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' }
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: {
              include: {
                product: true,
                variant: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (error) {
    next(error);
  }
});

// ================= 8. HOMEPAGE & CAMPAIGN MANAGEMENT CMS =================

// 8.1 COLLECTIONS CRUD
// GET /api/admin/homepage/collections
router.get('/homepage/collections', async (req, res, next) => {
  try {
    const collections = await prisma.homepageCollection.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.status(200).json({ success: true, collections });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/homepage/collections
router.post('/homepage/collections', async (req, res, next) => {
  const {
    title, badge, description, image, ctaText, categorySlug, sortOrder, isActive
  } = req.body;

  try {
    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Title and Image are required.' });
    }

    const collection = await prisma.homepageCollection.create({
      data: {
        title,
        badge: badge || null,
        description: description || '',
        image,
        ctaText: ctaText || 'Browse Collection',
        categorySlug: categorySlug || 'all',
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) || 0 : 0,
        isActive: isActive !== undefined ? !!isActive : true
      }
    });

    res.status(201).json({ success: true, collection });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/collections/reorder
router.put('/homepage/collections/reorder', async (req, res, next) => {
  const { order } = req.body;

  try {
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'Invalid order structure.' });
    }

    const updates = order.map(item =>
      prisma.homepageCollection.update({
        where: { id: item.id },
        data: { sortOrder: parseInt(item.sortOrder, 10) }
      })
    );

    await prisma.$transaction(updates);
    res.status(200).json({ success: true, message: 'Collection order updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/collections/:id
router.put('/homepage/collections/:id', async (req, res, next) => {
  const { id } = req.params;
  const {
    title, badge, description, image, ctaText, categorySlug, sortOrder, isActive
  } = req.body;

  try {
    const exists = await prisma.homepageCollection.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const collection = await prisma.homepageCollection.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        badge: badge !== undefined ? badge : undefined,
        description: description !== undefined ? description : undefined,
        image: image !== undefined ? image : undefined,
        ctaText: ctaText !== undefined ? ctaText : undefined,
        categorySlug: categorySlug !== undefined ? categorySlug : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined
      }
    });

    res.status(200).json({ success: true, collection });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/homepage/collections/:id
router.delete('/homepage/collections/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const exists = await prisma.homepageCollection.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    await prisma.homepageCollection.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Collection deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/collections/:id/toggle-active
router.put('/homepage/collections/:id/toggle-active', async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const exists = await prisma.homepageCollection.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const collection = await prisma.homepageCollection.update({
      where: { id },
      data: { isActive: !!isActive }
    });

    res.status(200).json({ success: true, collection });
  } catch (error) {
    next(error);
  }
});

// 8.2 HOMEPAGE CATEGORIES
// GET /api/admin/homepage/categories
router.get('/homepage/categories', async (req, res, next) => {
  try {
    const homepageCategories = await prisma.category.findMany({
      where: { 
        promoVisible: true,
        slug: { not: 'uncategorized' },
        name: { not: 'Uncategorized' }
      },
      orderBy: { position: 'asc' }
    });
    res.status(200).json({ success: true, categories: homepageCategories });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/homepage/categories
router.post('/homepage/categories', async (req, res, next) => {
  const { categoryId, id, position, isVisible } = req.body;
  const targetId = categoryId || id;

  try {
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Category ID is required.' });
    }

    const category = await prisma.category.update({
      where: { id: targetId },
      data: {
        promoVisible: true,
        homepageVisible: true,
        position: position ? parseInt(position, 10) : 0,
        isVisible: isVisible !== undefined ? !!isVisible : true
      }
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/categories/:id
router.put('/homepage/categories/:id', async (req, res, next) => {
  const { id } = req.params;
  const { position, isVisible, homepageVisible, promoVisible } = req.body;

  try {
    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        position: position !== undefined ? parseInt(position, 10) : undefined,
        isVisible: isVisible !== undefined ? !!isVisible : undefined,
        homepageVisible: homepageVisible !== undefined ? !!homepageVisible : undefined,
        promoVisible: promoVisible !== undefined ? !!promoVisible : undefined
      }
    });

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/homepage/categories/:id
router.delete('/homepage/categories/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { promoVisible: false, homepageVisible: false }
    });

    res.status(200).json({ success: true, message: 'Homepage Category visibility disabled successfully.', category });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/categories/reorder
router.put('/homepage/categories/reorder', async (req, res, next) => {
  const { order } = req.body; // Array of { id, position }

  try {
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'Invalid order structure.' });
    }

    // Execute bulk updates in transaction
    const updates = order.map(item => 
      prisma.category.update({
        where: { id: item.id },
        data: { position: item.position }
      })
    );

    await prisma.$transaction(updates);
    res.status(200).json({ success: true, message: 'Category order updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// 8.3 SECTION ORDERING
// GET /api/admin/homepage/sections
router.get('/homepage/sections', async (req, res, next) => {
  try {
    const setting = await prisma.websiteSetting.findUnique({
      where: { key: 'homepage_section_order' }
    });

    const defaultOrder = 'categories,hero,best-sellers,trust,collections,benefits,reviews,footer-banner';
    res.status(200).json({
      success: true,
      order: setting ? setting.value : defaultOrder
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/sections
router.put('/homepage/sections', async (req, res, next) => {
  const { order } = req.body; // e.g. "categories,hero,best-sellers..."

  try {
    if (!order) {
      return res.status(400).json({ success: false, message: 'Order is required.' });
    }

    const setting = await prisma.websiteSetting.upsert({
      where: { key: 'homepage_section_order' },
      update: { value: order },
      create: { key: 'homepage_section_order', value: order }
    });

    res.status(200).json({ success: true, order: setting.value });
  } catch (error) {
    next(error);
  }
});

// ================= 8.4 HOMEPAGE HERO CMS =================
// GET /api/admin/homepage/hero
router.get('/homepage/hero', async (req, res, next) => {
  try {
    const heroes = await prisma.homepageHero.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    const mappedHeroes = heroes.map(h => ({
      ...h,
      showcaseImage: h.heroImage,
      offerBadge: h.offerBadgeText,
      floatingBadge: (h.floatingBadgeTitle || h.floatingBadgeSubtitle) ? {
        title: h.floatingBadgeTitle || '',
        subtitle: h.floatingBadgeSubtitle || ''
      } : null
    }));
    res.status(200).json({ success: true, heroes: mappedHeroes });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/homepage/upload-cloudinary
router.post('/homepage/upload-cloudinary', async (req, res, next) => {
  const { image } = req.body;
  try {
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data is required.' });
    }
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'homepage_hero',
      resource_type: 'auto'
    });
    res.status(200).json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height
    });
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload image to Cloudinary.' });
  }
});

// POST /api/admin/homepage/hero
router.post('/homepage/hero', async (req, res, next) => {
  const {
    trustBadgeText, headingLine1, headingHighlight, headingLine2,
    description, bulletOne, bulletTwo, bulletThree, bulletFour,
    primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink,
    promoText, heroImage, featuredProductId, offerBadgeText,
    floatingBadgeTitle, floatingBadgeSubtitle, isActive,
    slideOrder, isFeatured,
    cropX, cropY, cropWidth, cropHeight, zoom, aspectRatio
  } = req.body;

  try {
    const hero = await prisma.homepageHero.create({
      data: {
        trustBadgeText: trustBadgeText || '',
        headingLine1: headingLine1 || '',
        headingHighlight: headingHighlight || '',
        headingLine2: headingLine2 || '',
        description: description || '',
        bulletOne: bulletOne || '',
        bulletTwo: bulletTwo || '',
        bulletThree: bulletThree || '',
        bulletFour: bulletFour || '',
        primaryButtonText: primaryButtonText || '',
        primaryButtonLink: primaryButtonLink || '',
        secondaryButtonText: secondaryButtonText || '',
        secondaryButtonLink: secondaryButtonLink || '',
        promoText: promoText || '',
        heroImage: heroImage || '',
        featuredProductId: featuredProductId || null,
        offerBadgeText: offerBadgeText || '',
        floatingBadgeTitle: floatingBadgeTitle || '',
        floatingBadgeSubtitle: floatingBadgeSubtitle || '',
        slideOrder: slideOrder !== undefined ? parseInt(slideOrder, 10) || 0 : 0,
        isFeatured: !!isFeatured,
        isActive: !!isActive,
        cropX: cropX !== undefined && cropX !== null ? parseFloat(cropX) : null,
        cropY: cropY !== undefined && cropY !== null ? parseFloat(cropY) : null,
        cropWidth: cropWidth !== undefined && cropWidth !== null ? parseFloat(cropWidth) : null,
        cropHeight: cropHeight !== undefined && cropHeight !== null ? parseFloat(cropHeight) : null,
        zoom: zoom !== undefined && zoom !== null ? parseFloat(zoom) : null,
        aspectRatio: aspectRatio || null
      }
    });

    res.status(201).json({ success: true, hero });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/hero/:id
router.put('/homepage/hero/:id', async (req, res, next) => {
  const { id } = req.params;
  const {
    trustBadgeText, headingLine1, headingHighlight, headingLine2,
    description, bulletOne, bulletTwo, bulletThree, bulletFour,
    primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink,
    promoText, heroImage, featuredProductId, offerBadgeText,
    floatingBadgeTitle, floatingBadgeSubtitle, isActive,
    slideOrder, isFeatured,
    cropX, cropY, cropWidth, cropHeight, zoom, aspectRatio
  } = req.body;

  try {
    const exists = await prisma.homepageHero.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Hero configuration not found.' });
    }

    const hero = await prisma.homepageHero.update({
      where: { id },
      data: {
        trustBadgeText,
        headingLine1,
        headingHighlight,
        headingLine2,
        description,
        bulletOne,
        bulletTwo,
        bulletThree,
        bulletFour,
        primaryButtonText,
        primaryButtonLink,
        secondaryButtonText,
        secondaryButtonLink,
        promoText,
        heroImage,
        featuredProductId: featuredProductId || null,
        offerBadgeText,
        floatingBadgeTitle,
        floatingBadgeSubtitle,
        slideOrder: slideOrder !== undefined ? parseInt(slideOrder, 10) : undefined,
        isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined,
        cropX: cropX !== undefined && cropX !== null ? parseFloat(cropX) : null,
        cropY: cropY !== undefined && cropY !== null ? parseFloat(cropY) : null,
        cropWidth: cropWidth !== undefined && cropWidth !== null ? parseFloat(cropWidth) : null,
        cropHeight: cropHeight !== undefined && cropHeight !== null ? parseFloat(cropHeight) : null,
        zoom: zoom !== undefined && zoom !== null ? parseFloat(zoom) : null,
        aspectRatio: aspectRatio || null
      }
    });

    res.status(200).json({ success: true, hero });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/homepage/hero/:id
router.delete('/homepage/hero/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const exists = await prisma.homepageHero.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Hero configuration not found.' });
    }

    await prisma.homepageHero.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Hero configuration deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/homepage/hero/:id/toggle-active
router.put('/homepage/hero/:id/toggle-active', async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const exists = await prisma.homepageHero.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Hero configuration not found.' });
    }

    const hero = await prisma.homepageHero.update({
      where: { id },
      data: { isActive: !!isActive }
    });

    res.status(200).json({ success: true, hero });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/settings
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await prisma.websiteSetting.findMany();
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    const fallbacks = {
      companyName: 'Suryodaya Farms',
      brandName: 'Suryodaya Farms & Organics',
      email: 'care@suryodayafarms.com',
      phone: '+91 9100422140',
      address: 'Plot No-20 NP, Kuruma Nagar, Peerzadiguda Mandal, Medchal (Malkajgiri), Telangana – 500039',
      websiteUrl: 'https://suryodayafarms.com',
      gstNumber: '36AAAAA0000A1Z5',
      registrationDetails: 'FSSAI Licence No: 11524999000342 | Soil Bio-Dynamic System ISO 14001',
      socialTwitter: 'https://twitter.com/suryodayafarms',
      socialFacebook: 'https://facebook.com/suryodayafarms',
      socialInstagram: 'https://instagram.com/suryodayafarms',
      socialYoutube: 'https://youtube.com/suryodayafarms',
      freeDeliveryThreshold: '2',
      shippingCharge: '80',
      serviceableStates: 'Telangana, Andhra Pradesh'
    };

    res.status(200).json({
      success: true,
      settings: { ...fallbacks, ...settingsObj }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/settings
router.put('/settings', async (req, res, next) => {
  const newSettings = req.body;
  try {
    const promises = Object.entries(newSettings).map(([key, value]) => {
      return prisma.websiteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });
    await Promise.all(promises);
    res.status(200).json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// ================= REVIEWS MODERATION =================

// GET /api/admin/reviews/products-summary
router.get('/reviews/products-summary', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        categories: true,
        reviews: true
      }
    });

    const summary = products.map(prod => {
      const allReviews = prod.reviews;
      const approvedReviews = allReviews.filter(r => r.status === 'APPROVED');
      const pendingReviews = allReviews.filter(r => r.status === 'PENDING');
      const totalReviews = allReviews.length;
      
      const averageRating = approvedReviews.length > 0
        ? parseFloat((approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1))
        : 0;

      return {
        id: prod.id,
        name: prod.name,
        image: prod.images?.[0] || '',
        category: prod.categories?.[0]?.name || 'Staples',
        averageRating,
        totalReviews,
        pendingReviews: pendingReviews.length,
        approvedReviews: approvedReviews.length
      };
    });

    res.status(200).json({ success: true, products: summary });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reviews/product/:productId
router.get('/reviews/product/:productId', async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: true,
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const allReviews = product.reviews;
    const approvedReviews = allReviews.filter(r => r.status === 'APPROVED');
    const pendingReviews = allReviews.filter(r => r.status === 'PENDING');
    const rejectedReviews = allReviews.filter(r => r.status === 'REJECTED');
    const totalReviews = allReviews.length;

    const averageRating = approvedReviews.length > 0
      ? parseFloat((approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        image: product.images?.[0] || '',
        category: product.categories?.[0]?.name || 'Staples',
        averageRating,
        totalReviews,
        approvedReviews: approvedReviews.length,
        pendingReviews: pendingReviews.length,
        rejectedReviews: rejectedReviews.length
      },
      reviews: allReviews
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reviews
router.get('/reviews', async (req, res, next) => {
  const { status, search, productId } = req.query;
  try {
    const filter = {};
    if (status && status !== 'ALL' && status !== 'All') {
      filter.status = status.toUpperCase();
    }
    if (productId) {
      filter.productId = productId;
    }
    if (search) {
      filter.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    const reviews = await prisma.review.findMany({
      where: filter,
      include: {
        product: {
          select: { name: true, images: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mappedReviews = reviews.map(rev => {
      if (rev.product) {
        const productCopy = { ...rev.product };
        productCopy.image = productCopy.images?.[0] || '';
        productCopy.images = (productCopy.images || []).map((url, idx) => ({
          url,
          isFeatured: idx === 0
        }));
        rev.product = productCopy;
      }
      return rev;
    });

    res.status(200).json({ success: true, count: mappedReviews.length, reviews: mappedReviews });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/reviews/:id
router.put('/reviews/:id', async (req, res, next) => {
  const { id } = req.params;
  const { status, rating, reviewTitle, reviewText, customerName } = req.body;
  try {
    const exists = await prisma.review.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    const data = {};
    if (status) data.status = status.toUpperCase();
    if (rating !== undefined) data.rating = parseInt(rating, 10);
    if (reviewTitle !== undefined) data.reviewTitle = reviewTitle;
    if (reviewText !== undefined) data.reviewText = reviewText;
    if (customerName !== undefined) data.customerName = customerName;

    const review = await prisma.review.update({
      where: { id },
      data,
      include: { product: { select: { name: true } } }
    });
    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const exists = await prisma.review.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    await prisma.review.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/reviews/:id/promote
router.post('/reviews/:id/promote', async (req, res, next) => {
  const { id } = req.params;
  const { location } = req.body;
  try {
    const review = await prisma.review.findUnique({
      where: { id },
      include: { product: true }
    });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    if (review.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Only approved reviews can be promoted.' });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: review.customerName || 'Anonymous',
        location: location || 'Verified Family Member',
        testimonialText: review.reviewText || '',
        rating: review.rating,
        customerPhoto: review.reviewImages?.[0] || 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=200',
        productPurchased: review.product?.name || 'Organic Staples',
        featuredToggle: true,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Promoted to Testimonial successfully.',
      testimonial
    });
  } catch (error) {
    next(error);
  }
});

// ================= TESTIMONIALS CRUD =================

// GET /api/admin/testimonials
router.get('/testimonials', async (req, res, next) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, count: testimonials.length, testimonials });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/testimonials
router.post('/testimonials', async (req, res, next) => {
  const { customerName, location, testimonialText, rating, customerPhoto, productPurchased, featuredToggle, isActive } = req.body;
  try {
    if (!customerName || !testimonialText) {
      return res.status(400).json({ success: false, message: 'Customer Name and Testimonial Text are required.' });
    }
    const testimonial = await prisma.testimonial.create({
      data: {
        customerName,
        location: location || '',
        testimonialText,
        rating: rating !== undefined ? parseInt(rating, 10) : 5,
        customerPhoto: customerPhoto || '',
        productPurchased: productPurchased || '',
        featuredToggle: featuredToggle !== undefined ? !!featuredToggle : false,
        isActive: isActive !== undefined ? !!isActive : true
      }
    });
    res.status(201).json({ success: true, testimonial });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/testimonials/:id
router.put('/testimonials/:id', async (req, res, next) => {
  const { id } = req.params;
  const { customerName, location, testimonialText, rating, customerPhoto, productPurchased, featuredToggle, isActive } = req.body;
  try {
    const exists = await prisma.testimonial.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        customerName: customerName !== undefined ? customerName : undefined,
        location: location !== undefined ? location : undefined,
        testimonialText: testimonialText !== undefined ? testimonialText : undefined,
        rating: rating !== undefined ? parseInt(rating, 10) : undefined,
        customerPhoto: customerPhoto !== undefined ? customerPhoto : undefined,
        productPurchased: productPurchased !== undefined ? productPurchased : undefined,
        featuredToggle: featuredToggle !== undefined ? !!featuredToggle : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined
      }
    });
    res.status(200).json({ success: true, testimonial });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/testimonials/:id
router.delete('/testimonials/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const exists = await prisma.testimonial.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    await prisma.testimonial.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
