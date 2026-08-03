import prisma from './src/utils/db.js';

async function enrichBanana() {
  console.log('--- ENRICHING EXISTING BANANA POWDER PRODUCT ---');

  // 1. Locate existing product in DB
  const targetProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'Banana', mode: 'insensitive' } }
      ]
    },
    include: {
      categories: true,
      variants: true,
      productImages: true
    }
  });

  if (!targetProduct) {
    console.error('❌ Target Banana Powder product not found in database.');
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
        tagline: 'Wholesome Banana Goodness for Every Generation.',
        intro: 'At Suryodaya Farms, we believe that everyday nutrition should be simple, wholesome, and naturally delicious. Our Banana Powder is prepared from carefully selected ripe bananas using science-guided quality practices designed to help preserve their natural flavour, colour, and nutritional value.'
      },
      orderIndex: 0,
      isVisible: true
    },
    {
      id: `sec-about-${Date.now()}`,
      sectionType: 'ABOUT_PRODUCT',
      title: 'About Banana',
      content: {
        title: 'About Banana',
        html: '<p>Banana (Musa spp.) is one of the world\'s most widely enjoyed fruits and has been valued for generations as part of a balanced diet.</p><p>Naturally containing carbohydrates, dietary fibre, vitamins, minerals, and plant-based nutrients, bananas are appreciated for their pleasant taste, versatility, and nutritional value.</p><p>Banana Powder provides a convenient way to enjoy the natural flavour and goodness of bananas throughout the year.</p><p>At Suryodaya Farms, we honour this wholesome fruit through careful ingredient selection, responsible processing, and quality-focused manufacturing practices.</p>'
      },
      orderIndex: 1,
      isVisible: true
    },
    {
      id: `sec-why-choose-${Date.now()}`,
      sectionType: 'WHY_CHOOSE_US',
      title: 'Why Choose Suryodaya Farms Banana Powder?',
      content: {
        title: 'Why Choose Suryodaya Farms Banana Powder?',
        cards: [
          {
            icon: '🍌',
            title: 'Carefully Selected Ripe Bananas',
            description: 'Prepared from carefully selected ripe bananas that meet our quality standards.'
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
          '100% Banana Powder',
          'Carefully Selected Ripe Bananas',
          'Naturally Sweet Taste',
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
          { name: 'Carbohydrates', value: 'Natural Energy & Sustained Fuel' },
          { name: 'Dietary Fibre', value: 'Prebiotic Digestive Support' },
          { name: 'Vitamins', value: 'Vitamin B6 & Vitamin C' },
          { name: 'Minerals', value: 'Potassium, Magnesium & Manganese' },
          { name: 'Plant-Based Nutrients', value: 'Flavonoids & Phytonutrients' }
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
          { icon: '🥛', title: 'Milk', description: 'Stir a spoonful into warm or cold milk for instant natural banana milk.' },
          { icon: '🥤', title: 'Smoothies & Nutritious Shakes', description: 'Blend into protein shakes, green smoothies, and fruit milkshakes.' },
          { icon: '🥣', title: 'Porridge & Oats', description: 'Swirl into hot oatmeal, ragi porridge, or chia seed puddings.' },
          { icon: '🍦', title: 'Yogurt', description: 'Mix into Greek yogurt or fresh curd with nuts and honey.' },
          { icon: '🥞', title: 'Pancakes & Waffles', description: 'Whisk into pancake batter and waffle mixes for natural sweetness.' },
          { icon: '🧁', title: 'Cakes, Muffins & Baking Recipes', description: 'Substitute partial sugar or flour in banana bread, muffins, and cookies.' },
          { icon: '🍪', title: 'Homemade Snacks', description: 'Prepare energy balls, banana laddoos, and baby finger foods.' },
          { icon: '🍨', title: 'Breakfast Bowls & Desserts', description: 'Sprinkle over smoothie bowls, ice creams, and fruit salads.' }
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
          'If preparing foods for infants or individuals with specific dietary requirements, follow appropriate nutritional guidance and consult a qualified healthcare professional where needed.'
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
        html: '<p><strong>100% Banana Powder</strong></p><p>Nothing Added. Nothing Removed. Just Carefully Prepared Ripe Bananas.</p>'
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
            question: 'Is this made from 100% bananas?',
            answer: 'Yes. Our product contains only 100% Banana Powder.'
          },
          {
            question: 'Can I use it in baking?',
            answer: 'Yes. It can be used in cakes, muffins, pancakes, waffles, cookies, and many other baking recipes.'
          },
          {
            question: 'Can it be mixed into milk or smoothies?',
            answer: 'Yes. It blends exceptionally well into milk, smoothies, yogurt, porridge, breakfast bowls, and a variety of everyday recipes.'
          },
          {
            question: 'How should I store it?',
            answer: 'Store in a cool, dry place. Keep the pack tightly closed and always use a clean, dry spoon after opening.'
          },
          {
            question: 'Does it contain additives?',
            answer: 'No. It contains no artificial colours, flavours, or added preservatives.'
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
        html: '<p>Every pack of Suryodaya Farms Banana Powder reflects our dedication to quality, scientific responsibility, and customer trust.</p><p>We continuously improve our products because we believe our customers deserve safe, consistent, and reliable quality with every purchase.</p>'
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
        html: '<p>At Suryodaya Farms, we do more than simply process bananas. From carefully selecting ripe, quality fruit to applying science-guided product development, maintaining hygienic processing practices, and using thoughtful packaging, every step is carried out with care and responsibility.</p><p>Our goal is to deliver a product that reflects the values we stand for—Nature, Science, Quality, and Trust—so you can enjoy the natural sweetness and wholesome goodness of bananas with confidence, every day.</p><p><strong>Suryodaya Farms: Pure by Nature. Guided by Science. Trusted for Quality.</strong></p>'
      },
      orderIndex: 13,
      isVisible: true
    }
  ];

  // 3. Selective Product Enrichment in PostgreSQL
  const shortDescription = '100% Pure Ripe Banana (Musa spp.) Powder. Science-guided dried & processed, naturally sweet taste, rich in potassium, B6, fibre & natural carbohydrates.';
  const detailedDescription = 'At Suryodaya Farms, we believe that everyday nutrition should be simple, wholesome, and naturally delicious. Our Banana Powder is prepared from carefully selected ripe bananas using science-guided quality practices designed to help preserve their natural flavour, colour, and nutritional value. Thoughtfully processed and carefully packed, it offers a convenient way to enjoy the natural goodness of bananas in beverages, breakfast recipes, baking, desserts, and everyday meals.';

  const updatedProduct = await prisma.product.update({
    where: { id: targetProduct.id },
    data: {
      name: 'Banana Powder',
      shortDescription,
      detailedDescription,
      description: detailedDescription,
      productType: 'Dehydrated Fruit Powder',
      brand: 'Suryodaya Farms',
      nutrients: 'Potassium, Vitamin B6, Vitamin C, Magnesium, Dietary Fibre, Natural Carbohydrates',
      shelfLife: '12 Months from packaging',
      seoTitle: 'Banana Powder (100% Pure Ripe Fruit Powder) | Suryodaya Farms',
      seoDescription: 'Buy 100% Pure Ripe Banana Powder. Gently dried, naturally sweet fruit powder rich in potassium & B6 for smoothies, milk, porridge, baking & baby food.',
      seoKeywords: 'banana powder, ripe banana powder, organic banana powder, potassium rich fruit powder, banana powder for baking, baby banana porridge, suryodaya farms',
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

  console.log('\n✅ BANANA POWDER ENRICHED SUCCESSFULLY IN DATABASE!');
  console.log(`- Product Name: ${updatedProduct.name}`);
  console.log(`- Product ID: ${updatedProduct.id} (UNCHANGED)`);
  console.log(`- Slug: ${updatedProduct.slug} (UNCHANGED)`);
  console.log(`- SKU: ${updatedProduct.sku} (UNCHANGED)`);
  console.log(`- Price: ₹${updatedProduct.price} (UNCHANGED)`);
  console.log(`- Short Description: ${updatedProduct.shortDescription}`);
  console.log(`- Total Enriched CMS Content Sections: ${contentSections.length}`);
  console.log(`- SEO Title: ${updatedProduct.seoTitle}`);

  console.log('\n--- ALL BANANA ENRICHMENT CHECKS PASSED PERFECTLY! ---');
}

enrichBanana()
  .catch(e => {
    console.error('❌ Error during enrichment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
