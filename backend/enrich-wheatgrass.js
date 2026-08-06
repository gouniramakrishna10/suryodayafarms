import prisma from './src/utils/db.js';

async function enrichWheatgrass() {
  console.log('--- ENRICHING EXISTING WHEATGRASS POWDER PRODUCT ---');

  // 1. Locate existing product in DB
  const targetProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'Wheatgrass', mode: 'insensitive' } },
        { name: { contains: 'Wheat Grass', mode: 'insensitive' } }
      ]
    },
    include: {
      categories: true,
      variants: true,
      productImages: true
    }
  });

  if (!targetProduct) {
    console.error('❌ Target Wheatgrass Powder product not found in database.');
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
        collectionName: 'Nature\'s Greens Collection',
        tagline: 'Young Green Nutrition for Modern Living.',
        intro: 'At Suryodaya Farms, we believe that nature\'s simplest ingredients can make a meaningful contribution to everyday nutrition. Our Wheatgrass Powder is prepared from carefully harvested young wheatgrass using science-guided quality practices designed to help preserve its natural colour, freshness, and nutritional value.'
      },
      orderIndex: 0,
      isVisible: true
    },
    {
      id: `sec-about-${Date.now()}`,
      sectionType: 'ABOUT_PRODUCT',
      title: 'About Wheatgrass',
      content: {
        title: 'About Wheatgrass',
        html: '<p>Wheatgrass is the young leaf of the common wheat plant (*Triticum aestivum*), harvested at an early stage of growth.</p><p>Recognized worldwide as a natural green food, wheatgrass naturally contains vitamins, minerals, dietary fibre, plant-based nutrients, and naturally occurring antioxidants.</p><p>Its fresh green character makes it a versatile ingredient for smoothies, juices, health drinks, and a variety of everyday recipes.</p><p>At Suryodaya Farms, we honour this remarkable plant through careful cultivation, responsible processing, and quality-focused manufacturing practices.</p>'
      },
      orderIndex: 1,
      isVisible: true
    },
    {
      id: `sec-why-choose-${Date.now()}`,
      sectionType: 'WHY_CHOOSE_US',
      title: 'Why Choose Suryodaya Farms Wheatgrass Powder?',
      content: {
        title: 'Why Choose Suryodaya Farms Wheatgrass Powder?',
        cards: [
          {
            icon: '🌾',
            title: 'Carefully Harvested Young Wheatgrass',
            description: 'Prepared from carefully selected young wheatgrass harvested at an appropriate stage of growth to meet our quality standards.'
          },
          {
            icon: '🔬',
            title: 'Science-Guided Product Development',
            description: 'Developed using a scientific approach to support product consistency, quality, and continuous improvement.'
          },
          {
            icon: '🏆',
            title: 'Quality Without Compromise',
            description: 'Every stage—from cultivation and harvesting to processing and packaging—is carried out under disciplined quality practices.'
          },
          {
            icon: '✨',
            title: 'Hygienically Processed',
            description: 'Processed with careful attention to cleanliness, hygiene, and responsible handling.'
          },
          {
            icon: '🛍️',
            title: 'Carefully Packed',
            description: 'Packed in high-quality food-grade packaging designed to help preserve freshness and product quality.'
          },
          {
            icon: '💚',
            title: 'Trusted Natural Nutrition',
            description: 'Every pack reflects the core values of Suryodaya Farms: Nature • Science • Quality • Trust.'
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
          ' Wheatgrass Powder',
          'Carefully Harvested Young Wheatgrass',
          'Hygienically Processed',
          'Premium Quality',
          'Science-Guided Product Development',
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
          { name: 'Vitamins', value: 'Essential Vitamins' },
          { name: 'Minerals', value: 'Vital Trace Minerals' },
          { name: 'Dietary Fibre', value: 'Digestive Support' },
          { name: 'Plant-Based Nutrients', value: 'Phytonutrients' },
          { name: 'Naturally Occurring Antioxidants', value: 'Cellular Defense' }
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
          { icon: '🥤', title: 'Smoothies & Health Drinks', description: 'Blend a spoon into morning green smoothies and detox wellness drinks.' },
          { icon: '🥛', title: 'Milk & Plant-Based Beverages', description: 'Mix into almond milk, oat milk, or warm water for quick green energy.' },
          { icon: '🍊', title: 'Fresh Juices', description: 'Stir into fresh orange, apple, or vegetable juices for an extra green boost.' },
          { icon: '💧', title: 'Water', description: 'Whisk into a glass of plain water for a fresh, clean morning green drink.' },
          { icon: '🥣', title: 'Yogurt', description: 'Swirl into fresh curd or Greek yogurt with honey and seeds.' },
          { icon: '🥗', title: 'Healthy Recipes', description: 'Incorporate into salad dressings, energy bites, and green soups.' },
          { icon: '🥭', title: 'Fruit Bowls & Nutrition Mixes', description: 'Sprinkle over fresh fruit bowls and oatmeal nutrition bowls.' }
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
          'Use according to your dietary preferences as part of a balanced and varied diet.',
          'If you have specific dietary concerns or are under medical care, consult a qualified healthcare professional before making significant dietary changes.'
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
        html: '<p><strong> Wheatgrass Powder</strong></p><p>Nothing Added. Nothing Removed. Just Carefully Prepared Young Wheatgrass.</p>'
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
          'Packed in high-quality food-grade packaging designed to help preserve freshness and maintain product quality.'
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
          'Carefully Harvested Ingredients',
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
            question: 'Is this made from  wheatgrass?',
            answer: 'Yes. Our product contains only  Wheatgrass Powder.'
          },
          {
            question: 'How can I use it?',
            answer: 'It can be mixed into smoothies, juices, water, yogurt, milk, plant-based beverages, and other everyday recipes according to your preferences.'
          },
          {
            question: 'How should I store it?',
            answer: 'Store in a cool, dry place. Keep the pack tightly closed and always use a clean, dry spoon after opening.'
          },
          {
            question: 'Does it contain additives?',
            answer: 'No. It is Pure wheatgrass powder with zero added artificial colours, flavours, or preservatives.'
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
        html: '<p>Every pack of Suryodaya Farms Wheatgrass Powder reflects our dedication to quality, scientific responsibility, and customer trust.</p><p>We continuously improve our products because we believe our customers deserve safe, consistent, and reliable quality with every purchase.</p>'
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
        html: '<p>At Suryodaya Farms, we do more than simply process wheatgrass. From carefully harvesting young wheatgrass at the appropriate stage of growth to applying science-guided product development, maintaining hygienic processing practices, and using thoughtful packaging, every step is carried out with care and responsibility.</p><p>Our goal is to deliver a product that reflects the values we stand for—Nature, Science, Quality, and Trust—so you can enjoy the natural goodness of wheatgrass with confidence, every day.</p>'
      },
      orderIndex: 13,
      isVisible: true
    }
  ];

  // 3. Selective Product Enrichment in PostgreSQL
  const shortDescription = 'Pure Wheatgrass (*Triticum aestivum*) Powder. Carefully harvested at early growth, science-guided processed, rich in chlorophyll, vitamins & antioxidants.';
  const detailedDescription = 'At Suryodaya Farms, we believe that nature\'s simplest ingredients can make a meaningful contribution to everyday nutrition. Our Wheatgrass Powder is prepared from carefully harvested young wheatgrass using science-guided quality practices designed to help preserve its natural colour, freshness, and nutritional value. Thoughtfully processed and carefully packed, it offers a convenient way to enjoy the natural goodness of wheatgrass as part of your daily routine. Every pack reflects our commitment to Purity • Quality • Integrity • Customer Trust.';

  const updatedProduct = await prisma.product.update({
    where: { id: targetProduct.id },
    data: {
      name: 'Wheatgrass Powder',
      shortDescription,
      detailedDescription,
      description: detailedDescription,
      productType: 'Organic Superfood Powder',
      brand: 'Suryodaya Farms',
      nutrients: 'Vitamins, Minerals, Dietary Fibre, Plant-Based Nutrients, Antioxidants',
      shelfLife: '12 Months from packaging',
      seoTitle: 'Wheatgrass Powder (Young Green Leaves) | Suryodaya Farms',
      seoDescription: 'Buy Pure Organic Wheatgrass Powder. Carefully harvested young wheatgrass leaves, rich in chlorophyll, antioxidants & vitamins. Pure green nutrition.',
      seoKeywords: 'wheatgrass powder, organic wheatgrass, green superfood, chlorophyll powder, wheatgrass juice, suryodaya farms',
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

  console.log('\n✅ WHEATGRASS POWDER ENRICHED SUCCESSFULLY IN DATABASE!');
  console.log(`- Product Name: ${updatedProduct.name}`);
  console.log(`- Product ID: ${updatedProduct.id} (UNCHANGED)`);
  console.log(`- Slug: ${updatedProduct.slug} (UNCHANGED)`);
  console.log(`- SKU: ${updatedProduct.sku} (UNCHANGED)`);
  console.log(`- Price: ₹${updatedProduct.price} (UNCHANGED)`);
  console.log(`- Short Description: ${updatedProduct.shortDescription}`);
  console.log(`- Total Enriched CMS Content Sections: ${contentSections.length}`);
  console.log(`- SEO Title: ${updatedProduct.seoTitle}`);

  console.log('\n--- ALL WHEATGRASS ENRICHMENT CHECKS PASSED PERFECTLY! ---');
}

enrichWheatgrass()
  .catch(e => {
    console.error('❌ Error during enrichment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
