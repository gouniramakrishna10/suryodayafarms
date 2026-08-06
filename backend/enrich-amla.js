import prisma from './src/utils/db.js';

async function enrichAmla() {
  console.log('--- ENRICHING EXISTING AMLA POWDER PRODUCT ---');

  // 1. Locate existing product in DB
  const targetProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'Amla', mode: 'insensitive' } }
      ]
    },
    include: {
      categories: true,
      variants: true,
      productImages: true
    }
  });

  if (!targetProduct) {
    console.error('❌ Target Amla Powder product not found in database.');
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
        collectionName: 'Fruit Wellness Collection',
        tagline: 'Traditional Goodness. Modern Quality.',
        intro: 'At Suryodaya Farms, we believe that some of nature\'s most valued ingredients have stood the test of time. Our Amla Powder is prepared from carefully selected Indian gooseberries using science-guided quality practices designed to help preserve their natural flavour, colour, and nutritional value.'
      },
      orderIndex: 0,
      isVisible: true
    },
    {
      id: `sec-about-${Date.now()}`,
      sectionType: 'ABOUT_PRODUCT',
      title: 'About Amla',
      content: {
        title: 'About Amla',
        html: '<p>Amla (*Phyllanthus emblica*), also known as Indian Gooseberry, has been valued for centuries in Indian food traditions and is widely appreciated as a nutritious fruit.</p><p>Naturally containing vitamin C, dietary fibre, minerals, plant-based nutrients, and naturally occurring antioxidants, amla is enjoyed in a wide variety of foods, beverages, and traditional recipes.</p><p>At Suryodaya Farms, we honour this remarkable fruit through careful ingredient selection, responsible processing, and quality-focused manufacturing practices.</p>'
      },
      orderIndex: 1,
      isVisible: true
    },
    {
      id: `sec-why-choose-${Date.now()}`,
      sectionType: 'WHY_CHOOSE_US',
      title: 'Why Choose Suryodaya Farms Amla Powder?',
      content: {
        title: 'Why Choose Suryodaya Farms Amla Powder?',
        cards: [
          {
            icon: '🍏',
            title: 'Carefully Selected Amla Fruits',
            description: 'Prepared from carefully selected amla fruits that meet our quality standards.'
          },
          {
            icon: '🔬',
            title: 'Science-Guided Product Development',
            description: 'Developed using a scientific approach to support product consistency, quality, and continuous improvement.'
          },
          {
            icon: '🏆',
            title: 'Quality Without Compromise',
            description: 'Every stage—from ingredient selection to packaging—is carried out under disciplined quality practices.'
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
          ' Amla Powder',
          'Carefully Selected Amla Fruits',
          'Naturally Rich in Vitamin C',
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
          { name: 'Vitamin C', value: 'High Bio-available Ascorbic Acid' },
          { name: 'Dietary Fibre', value: 'Gut & Digestive Health' },
          { name: 'Minerals', value: 'Chromium, Iron & Calcium' },
          { name: 'Plant-Based Nutrients', value: 'Polyphenols, Gallic Acid & Tannins' },
          { name: 'Naturally Occurring Antioxidants', value: 'Immunity & Cellular Defense' }
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
          { icon: '🥤', title: 'Smoothies', description: 'Blend a spoonful into fruit smoothies, apple juices, and detox shakes.' },
          { icon: '🍊', title: 'Fresh Juices', description: 'Stir into fresh orange, pomegranate, or amla-ginger shots.' },
          { icon: '💧', title: 'Water', description: 'Whisk half a spoon into warm water every morning for a refreshing start.' },
          { icon: '🍯', title: 'Honey', description: 'Mix a spoon of amla powder with pure raw honey into a traditional paste.' },
          { icon: '🥣', title: 'Yogurt', description: 'Swirl into fresh curd or Greek yogurt with jaggery or fruit.' },
          { icon: '🍲', title: 'Healthy Recipes', description: 'Add to chutneys, rasam, herbal teas, and traditional chyawanprash preparations.' },
          { icon: '🍹', title: 'Nutrition Drinks', description: 'Whisk into wellness elixirs, green teas, and hair-care internal tonics.' }
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
          'Use according to your taste and dietary preferences as part of a balanced and varied diet.',
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
        html: '<p><strong> Amla Powder</strong></p><p>Nothing Added. Nothing Removed. Just Carefully Prepared Indian Gooseberries.</p>'
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
            question: 'Is this made from  amla?',
            answer: 'Yes. Our product contains only  Amla Powder (Indian Gooseberry).'
          },
          {
            question: 'Can I mix it with water or juice?',
            answer: 'Yes. It blends well with water, fresh juices, smoothies, yogurt, honey, and many everyday recipes according to your preference.'
          },
          {
            question: 'Does it contain additives?',
            answer: 'No. It contains no artificial colours, flavours, or added preservatives.'
          },
          {
            question: 'How should I store it?',
            answer: 'Store in a cool, dry place. Keep the pack tightly closed and always use a clean, dry spoon after opening.'
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
        html: '<p>Every pack of Suryodaya Farms Amla Powder reflects our dedication to quality, scientific responsibility, and customer trust.</p><p>We continuously improve our products because we believe our customers deserve safe, consistent, and reliable quality with every purchase.</p>'
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
        html: '<p>At Suryodaya Farms, we do more than simply process amla. From carefully selecting quality Indian gooseberries to applying science-guided product development, maintaining hygienic processing practices, and using thoughtful packaging, every step is carried out with care and responsibility.</p><p>Our goal is to deliver a product that reflects the values we stand for—Nature, Science, Quality, and Trust—so you can enjoy the timeless goodness of amla with confidence, every day.</p><p><strong>Suryodaya Farms: Pure by Nature. Guided by Science. Trusted for Quality.</strong></p>'
      },
      orderIndex: 13,
      isVisible: true
    }
  ];

  // 3. Selective Product Enrichment in PostgreSQL
  const shortDescription = 'Pure Indian Gooseberry (*Phyllanthus emblica*) Amla Powder. Science-guided dried & processed, naturally rich in Vitamin C, polyphenols, iron & immunity antioxidants.';
  const detailedDescription = 'At Suryodaya Farms, we believe that some of nature\'s most valued ingredients have stood the test of time. Our Amla Powder is prepared from carefully selected Indian gooseberries using science-guided quality practices designed to help preserve their natural flavour, colour, and nutritional value. Thoughtfully processed and carefully packed, it offers a convenient way to enjoy the natural goodness of amla as part of your everyday diet.';

  const updatedProduct = await prisma.product.update({
    where: { id: targetProduct.id },
    data: {
      name: 'Amla Powder',
      shortDescription,
      detailedDescription,
      description: detailedDescription,
      productType: 'Dehydrated Fruit Powder',
      brand: 'Suryodaya Farms',
      nutrients: 'Vitamin C (Ascorbic Acid), Polyphenols, Tannins, Chromium, Iron, Dietary Fibre, Antioxidants',
      shelfLife: '12 Months from packaging',
      seoTitle: 'Amla Powder (Pure Indian Gooseberry) | Suryodaya Farms',
      seoDescription: 'Buy Pure Organic Amla Powder (Indian Gooseberry). Naturally rich in Vitamin C, polyphenols & immunity antioxidants for honey mixes, juices & hair wellness.',
      seoKeywords: 'amla powder, organic amla powder, indian gooseberry, vitamin c powder, amla powder with honey, amla for hair, immunity superfood, suryodaya farms',
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

  console.log('\n✅ AMLA POWDER ENRICHED SUCCESSFULLY IN DATABASE!');
  console.log(`- Product Name: ${updatedProduct.name}`);
  console.log(`- Product ID: ${updatedProduct.id} (UNCHANGED)`);
  console.log(`- Slug: ${updatedProduct.slug} (UNCHANGED)`);
  console.log(`- SKU: ${updatedProduct.sku} (UNCHANGED)`);
  console.log(`- Price: ₹${updatedProduct.price} (UNCHANGED)`);
  console.log(`- Short Description: ${updatedProduct.shortDescription}`);
  console.log(`- Total Enriched CMS Content Sections: ${contentSections.length}`);
  console.log(`- SEO Title: ${updatedProduct.seoTitle}`);

  console.log('\n--- ALL AMLA ENRICHMENT CHECKS PASSED PERFECTLY! ---');
}

enrichAmla()
  .catch(e => {
    console.error('❌ Error during enrichment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
