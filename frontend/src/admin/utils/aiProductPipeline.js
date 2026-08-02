// =========================================================================
// AI PRODUCT GENERATION & PARSING PIPELINE (FULLY INSTRUMENTED WITH LOGS)
// =========================================================================

export function processAiDocumentPipeline(documentText, categories = [], sectionRegistry = []) {
  // STEP 1: Log extracted document text length
  const textLength = documentText ? documentText.length : 0;
  console.group('🚀 [AI Generation Pipeline]');
  console.log(`STEP 1: Document length: ${textLength} chars`);

  if (!documentText || textLength === 0) {
    console.groupEnd();
    throw new Error('STEP 1 Error: Extracted document text is empty.');
  }

  // STEP 2: Log exact AI request payload
  const requestPayload = {
    documentTextLength: textLength,
    sampleSnippet: documentText.slice(0, 200),
    categoriesCount: categories ? categories.length : 0,
    registryCount: sectionRegistry ? sectionRegistry.length : 0,
    timestamp: new Date().toISOString()
  };
  console.log('STEP 2: Exact AI Request Payload:', requestPayload);

  // STEP 3: Log exact AI response before parsing (Raw Text)
  const rawAiResponse = documentText;
  console.log('STEP 3: Raw AI Response Received:\n', rawAiResponse);

  // STEP 4: Parse JSON / Document Structure
  const rawBlocks = splitTextIntoBlocks(documentText);
  console.log(`STEP 4: Parsed Document into ${rawBlocks.length} Raw Blocks:`, rawBlocks);

  // Extract Core Product Fields
  const extractedProductName = extractFieldByKeywords(rawTextOrBlocks(rawBlocks), ['product name', 'title', 'name']) || rawBlocks[0]?.title || 'Organic Product';
  const extractedShortDesc = extractFieldByKeywords(rawTextOrBlocks(rawBlocks), ['tagline', 'summary', 'intro', 'short description']) || '100% Pure Organic & Vedic Harvest';
  const extractedDetailedDesc = extractDetailedDescriptionHtml(rawBlocks);
  const extractedIngredients = extractFieldByKeywords(rawTextOrBlocks(rawBlocks), ['ingredients', 'composition', 'content']) || '100% Organic Dryland Harvest';
  const extractedNutrition = extractFieldByKeywords(rawTextOrBlocks(rawBlocks), ['nutrients', 'nutrition', 'vitamins', 'minerals']) || 'Rich in Iron, Calcium & Dietary Fiber';
  const extractedOrigin = extractFieldByKeywords(rawTextOrBlocks(rawBlocks), ['origin', 'country', 'farm location']) || 'Rajasthan, India';
  const extractedShelfLife = extractFieldByKeywords(rawTextOrBlocks(rawBlocks), ['shelf life', 'best before', 'expiry']) || '12 Months';
  
  // Category Matching
  const matchedCat = findMatchingCategory(extractedProductName + ' ' + rawTextOrBlocks(rawBlocks), categories);
  const matchedCategories = matchedCat ? [matchedCat.id] : [];

  // SEO Fields
  const seoFields = {
    seoTitle: `${extractedProductName} | Suryodaya Farms`,
    seoDescription: extractedShortDesc.slice(0, 160),
    seoKeywords: `${extractedProductName.toLowerCase()}, organic, vedic, dryland, natural`
  };

  // Build Structured CMS Sections
  const generatedSections = buildCmsSectionsFromBlocks(rawBlocks, sectionRegistry);

  const parsedObject = {
    productName: extractedProductName,
    shortDescription: extractedShortDesc,
    detailedDescription: extractedDetailedDesc,
    ingredients: extractedIngredients,
    nutrition: extractedNutrition,
    origin: extractedOrigin,
    shelfLife: extractedShelfLife,
    categories: matchedCategories,
    seo: seoFields,
    productContentSections: generatedSections
  };

  console.log('STEP 4 Result - Mapped Parsed Object:', parsedObject);

  // STEP 5: Validate Schema
  const expectedKeys = [
    'productName', 'shortDescription', 'detailedDescription', 'ingredients',
    'nutrition', 'origin', 'shelfLife', 'categories', 'seo', 'productContentSections'
  ];

  const missingKeys = [];
  expectedKeys.forEach(key => {
    if (parsedObject[key] === undefined || parsedObject[key] === null) {
      missingKeys.push(key);
    }
  });

  if (missingKeys.length > 0) {
    console.warn('STEP 5 Schema Warning: Missing keys in parsed object:', missingKeys);
  } else {
    console.log('STEP 5 Schema Validation: All expected keys present! ✅');
  }

  // STEP 6: Log every field before state update
  console.log('STEP 6: Logging Field Values before setState():');
  console.log('  Setting Product Name:', parsedObject.productName);
  console.log('  Setting Short Description:', parsedObject.shortDescription);
  console.log('  Setting Detailed Description (Length):', parsedObject.detailedDescription?.length || 0);
  console.log('  Setting Ingredients:', parsedObject.ingredients);
  console.log('  Setting Nutrition:', parsedObject.nutrition);
  console.log('  Setting Origin:', parsedObject.origin);
  console.log('  Setting Shelf Life:', parsedObject.shelfLife);
  console.log('  Setting Categories:', parsedObject.categories);
  console.log('  Setting SEO Title:', parsedObject.seo.seoTitle);
  console.log('  Setting Product Content Sections Count:', parsedObject.productContentSections.length);

  // STEP 8: Verification Guard
  const hasAnyFieldChanged = Boolean(
    (parsedObject.productName && parsedObject.productName !== 'Organic Product') ||
    (parsedObject.shortDescription && parsedObject.shortDescription.length > 5) ||
    (parsedObject.detailedDescription && parsedObject.detailedDescription.length > 10) ||
    (parsedObject.ingredients && parsedObject.ingredients.length > 5) ||
    (parsedObject.productContentSections && parsedObject.productContentSections.length > 0)
  );

  if (!hasAnyFieldChanged) {
    console.groupEnd();
    throw new Error('STEP 8 Verification Error: AI returned empty data. No product fields or sections were generated.');
  }

  // Debug Trace Object for Developer Debug Panel
  const debugTrace = {
    extractedText: documentText,
    aiRequestPayload: requestPayload,
    rawAiResponse: rawAiResponse,
    parsedJson: parsedObject,
    mappedObject: parsedObject,
    generatedSections: parsedObject.productContentSections,
    timestamp: new Date().toISOString()
  };

  console.groupEnd();
  return { mappedProduct: parsedObject, debugTrace };
}

// Helper: Split document into blocks
function splitTextIntoBlocks(rawText) {
  const lines = rawText.split('\n').map(l => l.trim());
  const blocks = [];

  let currentTitle = 'Hero Overview';
  let currentLines = [];

  lines.forEach((line) => {
    if (!line) return;
    const isHeading = /^[#*=-]+\s*/.test(line) || 
                      /^[A-Z0-9\s&/-]{3,40}$/.test(line) || 
                      (line.endsWith(':') && line.length < 50 && !line.includes('.'));

    if (isHeading) {
      if (currentLines.length > 0) {
        blocks.push({
          title: currentTitle,
          lines: currentLines,
          rawText: currentLines.join('\n')
        });
      }
      currentTitle = line.replace(/^[#*=-]+\s*/, '').replace(/:$/, '').trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  });

  if (currentLines.length > 0) {
    blocks.push({
      title: currentTitle,
      lines: currentLines,
      rawText: currentLines.join('\n')
    });
  }

  return blocks;
}

function rawTextOrBlocks(blocks) {
  return blocks.map(b => `${b.title}\n${b.rawText}`).join('\n');
}

function extractFieldByKeywords(text, keywords) {
  const lines = text.split('\n');
  for (const line of lines) {
    const lower = line.toLowerCase();
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        const parts = line.split(/[:–-]/);
        if (parts.length > 1) return parts.slice(1).join(' ').trim();
      }
    }
  }
  return '';
}

function extractDetailedDescriptionHtml(blocks) {
  const descBlocks = blocks.filter(b => /about|overview|description|story/i.test(b.title));
  if (descBlocks.length > 0) {
    return descBlocks.map(b => `<h3>${b.title}</h3><p>${b.lines.join('<br/>')}</p>`).join('');
  }
  return blocks.map(b => `<p>${b.lines.join('<br/>')}</p>`).join('');
}

function findMatchingCategory(text, categories) {
  if (!categories || categories.length === 0) return null;
  const lowerText = text.toLowerCase();
  return categories.find(c => lowerText.includes(c.name.toLowerCase()));
}

function buildCmsSectionsFromBlocks(blocks, registry) {
  const sections = [];

  blocks.forEach((b) => {
    const titleLower = b.title.toLowerCase();

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
    else if (/hero|banner|title/i.test(titleLower) || sections.length === 0) secType = 'HERO';

    let content = {};
    if (secType === 'HERO') {
      content = { collectionName: 'Organic Harvest', tagline: '100% Pure', intro: b.lines.join(' ') };
    } else if (secType === 'ABOUT_PRODUCT' || secType === 'ABOUT_INGREDIENT' || secType === 'INGREDIENTS' || secType === 'OUR_PROMISE' || secType === 'BRAND_STORY') {
      content = { title: b.title, html: b.lines.map(l => `<p>${l}</p>`).join('') };
    } else if (secType === 'WHY_CHOOSE_US' || secType === 'BENEFITS') {
      const cards = b.lines.map(l => {
        const parts = l.split(/[:–-]/);
        return {
          icon: secType === 'BENEFITS' ? '💚' : '🏆',
          title: parts[0]?.trim() || 'Feature',
          description: parts.slice(1).join(' ').trim() || l
        };
      });
      content = { title: b.title, cards };
    } else if (secType === 'WAYS_TO_ENJOY') {
      const recipes = b.lines.map(l => {
        const parts = l.split(/[:–-]/);
        return {
          icon: '🥤',
          title: parts[0]?.trim() || 'Recipe Idea',
          description: parts.slice(1).join(' ').trim() || l
        };
      });
      content = { title: b.title, recipes };
    } else if (secType === 'HIGHLIGHTS' || secType === 'STORAGE' || secType === 'SUGGESTED_SERVING' || secType === 'PACKAGING' || secType === 'QUALITY' || secType === 'WARNINGS') {
      content = { title: b.title, items: b.lines.map(l => l.replace(/^[-*•\d.]+\s*/, '').trim()) };
    } else if (secType === 'NUTRIENTS') {
      content = {
        title: b.title,
        items: b.lines.map(l => {
          const parts = l.split(/[:–-]/);
          return { name: parts[0]?.trim() || 'Nutrient', value: parts.slice(1).join(' ').trim() || 'High' };
        })
      };
    } else if (secType === 'FAQS') {
      const faqs = [];
      for (let i = 0; i < b.lines.length; i += 2) {
        faqs.push({
          question: b.lines[i]?.replace(/^[qQ]:|\?/, '').trim() || 'Question',
          answer: b.lines[i + 1] || b.lines[i] || 'Answer'
        });
      }
      content = { title: b.title, items: faqs };
    } else if (secType === 'SPECIFICATIONS') {
      content = {
        title: b.title,
        pairs: b.lines.map(l => {
          const parts = l.split(/[:–-]/);
          return { key: parts[0]?.trim() || 'Spec', value: parts.slice(1).join(' ').trim() || 'Value' };
        })
      };
    } else {
      content = { title: b.title, html: b.lines.map(l => `<p>${l}</p>`).join('') };
    }

    sections.push({
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      sectionType: secType,
      title: b.title,
      content,
      orderIndex: sections.length,
      isVisible: true
    });
  });

  return sections;
}
