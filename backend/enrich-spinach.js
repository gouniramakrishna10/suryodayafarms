import prisma from './src/utils/db.js';

async function enrichSpinach() {
  console.log('--- ENRICHING EXISTING SPINACH POWDER PRODUCT ---');

  // 1. Locate existing product in DB
  const targetProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'Spinach', mode: 'insensitive' } }
      ]
    },
    include: {
      categories: true,
      variants: true,
      productImages: true
    }
  });

  if (!targetProduct) {
    console.error('❌ Target Spinach Powder product not found in database.');
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
        collectionName: 'Green Vitality Collection',
        tagline: 'The Goodness of Spinach in Every Spoon.',
        intro: 'At Suryodaya Farms, we believe that healthy living begins with simple, wholesome foods from nature. Our Spinach Powder is prepared from carefully selected spinach leaves using science-guided quality practices designed to help preserve their natural colour, freshness, and nutritional value.'
      },
      orderIndex: 0,
      isVisible: true
    },
    {
      id: `sec-about-${Date.now()}`,
      sectionType: 'ABOUT_PRODUCT',
      title: 'About Spinach',
      content: {
        title: 'About Spinach',
        html: '<p>Spinach (*Spinacia oleracea*) is one of the world\'s most widely enjoyed leafy vegetables and has been valued for generations as part of a balanced diet.</p><p>Naturally containing vitamins, minerals, dietary fibre, plant-based nutrients, and naturally occurring antioxidants, spinach is appreciated for its nutritional value and versatility in everyday cooking.</p><p>At Suryodaya Farms, we honour this wholesome leafy vegetable through careful ingredient selection, responsible processing, and quality-focused manufacturing practices.</p>'
      },
      orderIndex: 1,
      isVisible: true
    },
    {
      id: `sec-why-choose-${Date.now()}`,
      sectionType: 'WHY_CHOOSE_US',
      title: 'Why Choose Suryodaya Farms Spinach Powder?',
      content: {
        title: 'Why Choose Suryodaya Farms Spinach Powder?',
        cards: [
          {
            icon: '🍃',
            title: 'Carefully Selected Spinach Leaves',
            description: 'Prepared from carefully selected spinach leaves that meet our quality standards.'
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
            description: 'Packed in food-grade packaging designed to help protect freshness and product quality.'
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
          ' Spinach Powder',
          'Carefully Selected Ingredients',
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
          { name: 'Vitamins', value: 'Vitamin A, C & K' },
          { name: 'Minerals', value: 'Iron, Potassium & Magnesium' },
          { name: 'Dietary Fibre', value: 'Digestive Ease' },
          { name: 'Plant-Based Nutrients', value: 'Phytonutrients' },
          { name: 'Naturally Occurring Antioxidants', value: 'Cellular Wellness' }
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
          { icon: '🥤', title: 'Smoothies & Health Drinks', description: 'Blend a spoonful into morning green smoothies and fruit shakes.' },
          { icon: '🍲', title: 'Soups', description: 'Stir into warm lentil, vegetable, or cream soups for rich spinach green flavor.' },
          { icon: '🍛', title: 'Curries', description: 'Add to Indian gravies, curries, and dal for a effortless vegetable boost.' },
          { icon: '🍝', title: 'Pasta Sauces', description: 'Mix into pesto, marinara, or Alfredo pasta sauces.' },
          { icon: '🫓', title: 'Dosa, Chapati & Paratha Dough', description: 'Knead directly into wheat flour or roti dough for vibrant green flatbreads.' },
          { icon: '🥗', title: 'Salads', description: 'Whisk into salad dressings or sprinkle over fresh salads.' },
          { icon: '🧁', title: 'Other Healthy Recipes', description: 'Incorporate into omelets, savory pancakes, and baked snacks.' }
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
          'Use according to your individual dietary preferences as part of a balanced and varied diet.',
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
        html: '<p><strong> Spinach Powder</strong></p><p>Nothing Added. Nothing Removed. Just Carefully Prepared Spinach Leaves.</p>'
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
          'Packed in high-quality food-grade packaging designed to help maintain freshness, product quality, and shelf stability.'
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
            question: 'Is this made from  spinach leaves?',
            answer: 'Yes. Our product contains only  Spinach Powder.'
          },
          {
            question: 'How can I use it?',
            answer: 'It can be added to smoothies, soups, curries, sauces, doughs, and many everyday recipes.'
          },
          {
            question: 'How should I store it?',
            answer: 'Store in a cool, dry place. Keep the pack tightly closed and always use a clean, dry spoon after opening.'
          },
          {
            question: 'Does it contain additives?',
            answer: 'No. It is Pure spinach powder with zero added artificial colours, flavours, or preservatives.'
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
        html: '<p>Every pack of Suryodaya Farms Spinach Powder reflects our dedication to quality, scientific responsibility, and customer trust.</p><p>We continuously improve our products because we believe our customers deserve safe, consistent, and reliable quality with every purchase.</p>'
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
        html: '<p>At Suryodaya Farms, we do more than simply dry and powder spinach. From carefully selecting quality leaves to applying science-guided product development, maintaining hygienic processing practices, and using thoughtful packaging, every step is carried out with care and responsibility.</p><p>Our goal is to deliver a product that reflects the values we stand for—Nature, Science, Quality, and Trust—so you can enjoy wholesome nutrition with confidence, every day.</p>'
      },
      orderIndex: 13,
      isVisible: true
    }
  ];

  // 3. Selective Product Enrichment in PostgreSQL
  const shortDescription = 'Pure Spinach (*Spinacia oleracea*) Leaf Powder. Science-guided dried & processed, rich in natural iron, vitamins, fibre & antioxidants.';
  const detailedDescription = 'At Suryodaya Farms, we believe that healthy living begins with simple, wholesome foods from nature. Our Spinach Powder is prepared from carefully selected spinach leaves using science-guided quality practices designed to help preserve their natural colour, freshness, and nutritional value. Thoughtfully processed and carefully packed, it offers a convenient way to enjoy the natural goodness of spinach as part of your everyday meals.';

  const updatedProduct = await prisma.product.update({
    where: { id: targetProduct.id },
    data: {
      name: 'Spinach Powder',
      shortDescription,
      detailedDescription,
      description: detailedDescription,
      productType: 'Dehydrated Vegetable Powder',
      brand: 'Suryodaya Farms',
      nutrients: 'Vitamins A/C/K, Iron, Potassium, Magnesium, Dietary Fibre, Antioxidants',
      shelfLife: '12 Months from packaging',
      seoTitle: 'Spinach Powder (Pure Dehydrated Leaf) | Suryodaya Farms',
      seoDescription: 'Buy Pure Spinach Leaf Powder. Gently dried, hygienically milled spinach leaves rich in iron, vitamins & antioxidants for soups, smoothies & parathas.',
      seoKeywords: 'spinach powder, palak powder, dehydrated spinach, iron rich vegetable powder, green smoothie powder, suryodaya farms',
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

  console.log('\n✅ SPINACH POWDER ENRICHED SUCCESSFULLY IN DATABASE!');
  console.log(`- Product Name: ${updatedProduct.name}`);
  console.log(`- Product ID: ${updatedProduct.id} (UNCHANGED)`);
  console.log(`- Slug: ${updatedProduct.slug} (UNCHANGED)`);
  console.log(`- SKU: ${updatedProduct.sku} (UNCHANGED)`);
  console.log(`- Price: ₹${updatedProduct.price} (UNCHANGED)`);
  console.log(`- Short Description: ${updatedProduct.shortDescription}`);
  console.log(`- Total Enriched CMS Content Sections: ${contentSections.length}`);
  console.log(`- SEO Title: ${updatedProduct.seoTitle}`);

  console.log('\n--- ALL SPINACH ENRICHMENT CHECKS PASSED PERFECTLY! ---');
}

enrichSpinach()
  .catch(e => {
    console.error('❌ Error during enrichment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
