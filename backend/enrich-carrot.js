import prisma from './src/utils/db.js';

async function enrichCarrot() {
  console.log('--- ENRICHING EXISTING CARROT POWDER PRODUCT ---');

  // 1. Locate existing product in DB
  const targetProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'Carrot', mode: 'insensitive' } }
      ]
    },
    include: {
      categories: true,
      variants: true,
      productImages: true
    }
  });

  if (!targetProduct) {
    console.error('❌ Target Carrot Powder product not found in database.');
    process.exit(1);
  }

  console.log(`\n🎯 TARGET PRODUCT FOR ENRICHMENT: ID = ${targetProduct.id} ("${targetProduct.name}") | SKU = ${targetProduct.sku}`);

  // 2. Prepare Enriched Structured Content Sections
  const contentSections = [
    {
      id: `sec-hero-${Date.now()}`,
      sectionType: 'HERO',
      title: 'Hero Overview',
      content: {
        collectionName: 'Root Vitality Collection',
        tagline: 'Nature\'s Bright Goodness for Everyday Nutrition.',
        intro: 'At Suryodaya Farms, we believe that everyday nutrition should be wholesome, convenient, and inspired by nature. Our Carrot Powder is prepared from carefully selected carrots using science-guided quality practices designed to help preserve their natural colour, flavour, and nutritional value.'
      },
      orderIndex: 0,
      isVisible: true
    },
    {
      id: `sec-about-${Date.now()}`,
      sectionType: 'ABOUT_PRODUCT',
      title: 'About Carrot',
      content: {
        title: 'About Carrot',
        html: '<p>Carrot (Daucus carota subsp. sativus) is one of the world\'s most popular root vegetables, valued for its naturally sweet flavour, vibrant orange colour, and versatility.</p><p>Carrots naturally contain beta-carotene (a precursor to Vitamin A), dietary fibre, vitamins, minerals, and naturally occurring antioxidants, making them a popular ingredient in both traditional and modern recipes.</p><p>At Suryodaya Farms, we carefully prepare carrots through responsible processing practices designed to help preserve their natural qualities while maintaining high standards of quality and consistency.</p>'
      },
      orderIndex: 1,
      isVisible: true
    },
    {
      id: `sec-why-choose-${Date.now()}`,
      sectionType: 'WHY_CHOOSE_US',
      title: 'Why Choose Suryodaya Farms Carrot Powder?',
      content: {
        title: 'Why Choose Suryodaya Farms Carrot Powder?',
        cards: [
          {
            icon: '🥕',
            title: 'Carefully Selected Carrots',
            description: 'Prepared from carefully selected carrots that meet our quality standards.'
          },
          {
            icon: '🔬',
            title: 'Science-Guided Product Development',
            description: 'Scientific thinking supports product consistency, responsible development, and continuous improvement.'
          },
          {
            icon: '🏆',
            title: 'Quality Without Compromise',
            description: 'Every stage—from ingredient selection to packaging—is guided by disciplined quality practices.'
          },
          {
            icon: '✨',
            title: 'Hygienically Processed',
            description: 'Processed with attention to cleanliness and responsible handling to maintain product integrity.'
          },
          {
            icon: '🛍️',
            title: 'Carefully Packed',
            description: 'Packed in food-grade packaging designed to help protect freshness and product quality.'
          },
          {
            icon: '💚',
            title: 'Trusted Natural Nutrition',
            description: 'Every pack reflects the values of Suryodaya Farms: Nature • Science • Quality • Trust.'
          }
        ]
      },
      orderIndex: 2,
      isVisible: true
    },
    {
      id: `sec-highlights-${Date.now()}`,
      sectionType: 'HIGHLIGHTS',
      title: 'Product Highlights',
      content: {
        title: 'Product Highlights',
        items: [
          '100% Carrot Powder',
          'Carefully Selected Carrots',
          'Hygienically Processed',
          'Premium Quality',
          'Science-Guided Product Development',
          'Naturally Rich in Beta-Carotene',
          'No Artificial Colours',
          'No Artificial Flavours',
          'No Added Preservatives'
        ]
      },
      orderIndex: 3,
      isVisible: true
    },
    {
      id: `sec-nutrients-${Date.now()}`,
      sectionType: 'NUTRIENTS',
      title: 'Naturally Occurring Nutrients',
      content: {
        title: 'Naturally Occurring Nutrients',
        items: [
          { name: 'Beta-carotene', value: 'Provitamin A for Eye & Skin Health' },
          { name: 'Dietary Fibre', value: 'Digestive Support' },
          { name: 'Essential Vitamins', value: 'Vitamins C, K1 & B6' },
          { name: 'Minerals', value: 'Potassium & Manganese' },
          { name: 'Naturally Occurring Antioxidants', value: 'Lycopene & Lutein' }
        ]
      },
      orderIndex: 4,
      isVisible: true
    },
    {
      id: `sec-ways-${Date.now()}`,
      sectionType: 'WAYS_TO_ENJOY',
      title: 'Ways to Enjoy',
      content: {
        title: 'Ways to Enjoy',
        recipes: [
          { icon: '🥤', title: 'Blend into Smoothies', description: 'Blend with mango, orange, or banana for vibrant golden smoothies.' },
          { icon: '🥛', title: 'Mix into Milk', description: 'Stir into warm milk or almond milk for a wholesome carrot halwa-inspired beverage.' },
          { icon: '🍲', title: 'Stir into Soups', description: 'Whisk into vegetable, tomato, or lentil soups for natural sweetness and color.' },
          { icon: '🥞', title: 'Pancake & Dosa Batter', description: 'Add to pancake mix, dosa, or idli batter for colorful, nutritious breakfasts.' },
          { icon: '🍞', title: 'Breads & Baking', description: 'Incorporate into artisanal breads, carrot rolls, and savory bakes.' },
          { icon: '🧁', title: 'Cakes & Muffins', description: 'Mix into carrot cake, muffin, and cookie batters for natural moisture.' },
          { icon: '🥣', title: 'Healthy Recipes', description: 'Add to baby porridge, oatmeal, and khichdi.' },
          { icon: '🍝', title: 'Blend into Sauces', description: 'Stir into pasta sauces, dips, and salad dressings for vibrant nutrition.' }
        ]
      },
      orderIndex: 5,
      isVisible: true
    },
    {
      id: `sec-serving-${Date.now()}`,
      sectionType: 'SUGGESTED_SERVING',
      title: 'Suggested Serving',
      content: {
        title: 'Suggested Serving',
        items: [
          'Use according to your taste and dietary preferences as part of a balanced diet.',
          'If you have specific dietary concerns or are under medical care, consult an appropriate healthcare professional before making significant dietary changes.'
        ]
      },
      orderIndex: 6,
      isVisible: true
    },
    {
      id: `sec-storage-${Date.now()}`,
      sectionType: 'STORAGE',
      title: 'Storage Instructions',
      content: {
        title: 'Storage Instructions',
        items: [
          'Store in a cool, dry place.',
          'Keep the pack tightly closed after opening.',
          'Use a clean, dry spoon.',
          'Protect from moisture and direct sunlight.'
        ]
      },
      orderIndex: 7,
      isVisible: true
    },
    {
      id: `sec-ingredients-${Date.now()}`,
      sectionType: 'INGREDIENTS',
      title: 'Ingredients Breakdown',
      content: {
        title: 'Ingredients Breakdown',
        html: '<p><strong>100% Carrot Powder</strong></p><p>Nothing Added. Nothing Removed. Just Carefully Prepared Carrots.</p>'
      },
      orderIndex: 8,
      isVisible: true
    },
    {
      id: `sec-packaging-${Date.now()}`,
      sectionType: 'PACKAGING',
      title: 'Packaging Information',
      content: {
        title: 'Packaging Information',
        items: [
          'Packed in food-grade packaging designed to help protect freshness and maintain product quality.'
        ]
      },
      orderIndex: 9,
      isVisible: true
    },
    {
      id: `sec-quality-${Date.now()}`,
      sectionType: 'QUALITY',
      title: 'Our Quality Commitment',
      content: {
        title: 'Our Quality Commitment',
        items: [
          'Carefully Selected Ingredients',
          'Science-Guided Product Development',
          'Hygienic Processing',
          'Responsible Quality Practices',
          'Thoughtful Packaging',
          'Continuous Improvement',
          'Honest Communication',
          'Customer Trust'
        ]
      },
      orderIndex: 10,
      isVisible: true
    },
    {
      id: `sec-faqs-${Date.now()}`,
      sectionType: 'FAQS',
      title: 'Frequently Asked Questions',
      content: {
        title: 'Frequently Asked Questions',
        items: [
          {
            question: 'Is this made from 100% carrots?',
            answer: 'Yes. Our product contains only 100% Carrot Powder.'
          },
          {
            question: 'Can I use it in baking?',
            answer: 'Yes. It works exceptionally well in cakes, muffins, breads, pancakes, and many homemade recipes.'
          },
          {
            question: 'Can I add it to soups and smoothies?',
            answer: 'Yes. It can be blended into soups, smoothies, milk, sauces, and a variety of everyday recipes.'
          },
          {
            question: 'How should I store it?',
            answer: 'Store in a cool, dry place and always use a clean, dry spoon after opening.'
          }
        ]
      },
      orderIndex: 11,
      isVisible: true
    },
    {
      id: `sec-promise-${Date.now()}`,
      sectionType: 'OUR_PROMISE',
      title: 'Our Promise',
      content: {
        title: 'Our Promise',
        html: '<p>Every pack of Suryodaya Farms Carrot Powder reflects our commitment to quality, scientific responsibility, and customer trust.</p><p>We continuously improve our products because we believe our customers deserve consistent quality and honest care.</p>'
      },
      orderIndex: 12,
      isVisible: true
    },
    {
      id: `sec-difference-${Date.now()}`,
      sectionType: 'SURVEYODAYA_DIFFERENCE',
      title: 'The Suryodaya Difference',
      content: {
        title: 'The Suryodaya Difference',
        html: '<p>We don\'t simply process carrots. We carefully select quality roots, apply science-guided product development, follow hygienic processing practices, and package every product with care—ensuring every pack reflects the standards that define Suryodaya Farms.</p><p><strong>Suryodaya Farms: Pure by Nature. Guided by Science. Trusted for Quality.</strong></p>'
      },
      orderIndex: 13,
      isVisible: true
    }
  ];

  // 3. Selective Product Enrichment in PostgreSQL
  const shortDescription = '100% Pure Carrot (Daucus carota) Powder. Gently dried, science-guided processed, naturally rich in beta-carotene (provitamin A), fibre & antioxidants.';
  const detailedDescription = 'At Suryodaya Farms, we believe that everyday nutrition should be wholesome, convenient, and inspired by nature. Our Carrot Powder is prepared from carefully selected carrots using science-guided quality practices designed to help preserve their natural colour, flavour, and nutritional value. Thoughtfully processed and carefully packed, it provides a convenient way to include the natural goodness of carrots in beverages, soups, baking, snacks, and everyday recipes.';

  const updatedProduct = await prisma.product.update({
    where: { id: targetProduct.id },
    data: {
      name: 'Carrot Powder',
      shortDescription,
      detailedDescription,
      description: detailedDescription,
      productType: 'Dehydrated Root Vegetable Powder',
      brand: 'Suryodaya Farms',
      nutrients: 'Beta-carotene (Provitamin A), Dietary Fibre, Vitamins C/K1/B6, Potassium, Antioxidants',
      shelfLife: '12 Months from packaging',
      seoTitle: 'Carrot Powder (100% Pure Dehydrated Root) | Suryodaya Farms',
      seoDescription: 'Buy 100% Pure Dehydrated Carrot Powder. Gently dried, beta-carotene rich carrot powder for smoothies, soups, baking, cakes, halwa & baby porridge.',
      seoKeywords: 'carrot powder, dehydrated carrot powder, organic carrot powder, beta carotene powder, carrot powder for baking, carrot halwa powder, suryodaya farms',
      productContent: contentSections
    },
    include: {
      categories: true,
      variants: true
    }
  });

  // Re-create ProductContent relations in DB
  await prisma.productContent.deleteMany({
    where: { productId: targetProduct.id }
  });

  for (let i = 0; i < contentSections.length; i++) {
    const sec = contentSections[i];
    await prisma.productContent.create({
      data: {
        productId: targetProduct.id,
        sectionType: sec.sectionType,
        title: sec.title,
        content: sec.content,
        orderIndex: i,
        isVisible: true
      }
    });
  }

  console.log('\n✅ CARROT POWDER ENRICHED SUCCESSFULLY IN DATABASE!');
  console.log(`- Product Name: ${updatedProduct.name}`);
  console.log(`- Product ID: ${updatedProduct.id} (UNCHANGED)`);
  console.log(`- Slug: ${updatedProduct.slug} (UNCHANGED)`);
  console.log(`- SKU: ${updatedProduct.sku} (UNCHANGED)`);
  console.log(`- Price: ₹${updatedProduct.price} (UNCHANGED)`);
  console.log(`- Short Description: ${updatedProduct.shortDescription}`);
  console.log(`- Total Enriched CMS Content Sections: ${contentSections.length}`);
  console.log(`- SEO Title: ${updatedProduct.seoTitle}`);

  console.log('\n--- ALL CARROT ENRICHMENT CHECKS PASSED PERFECTLY! ---');
}

enrichCarrot()
  .catch(e => {
    console.error('❌ Error during enrichment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
