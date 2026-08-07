import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const EXACT_WHY_CHOOSE_DATA = [
  {
    keywords: ['amla'],
    title: 'Why Choose Our Amla Powder?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Expert-led processing designed to preserve the natural goodness of premium amla.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made from carefully selected amla with no added colours, flavours, preservatives, or fillers.'
      },
      {
        icon: '✨',
        title: 'Naturally Nutrient-Rich',
        description: 'A naturally rich source of Vitamin C and beneficial plant compounds.'
      }
    ]
  },
  {
    keywords: ['moringa'],
    title: 'Why Choose Our Moringa Leaf Powder?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Expert-led processing designed to preserve the natural goodness of premium moringa leaves.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made from carefully selected moringa leaves with no unnecessary additives.'
      },
      {
        icon: '✨',
        title: 'Naturally Nutrient-Dense',
        description: 'Rich in vitamins, minerals, antioxidants, and plant-based nutrients.'
      }
    ]
  },
  {
    keywords: ['banana'],
    title: 'Why Choose Our Banana Powder?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Carefully processed to help maintain the natural quality of ripe bananas.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made only from premium bananas without artificial additives.'
      },
      {
        icon: '⚡',
        title: 'Naturally Energy-Rich',
        description: 'Provides natural carbohydrates, potassium, and essential nutrients.'
      }
    ]
  },
  {
    keywords: ['beetroot', 'beet root'],
    title: 'Why Choose Our Beetroot Powder?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Expert-led processing to help preserve the natural goodness of beetroot.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made from carefully selected beetroot with no artificial additives.'
      },
      {
        icon: '✨',
        title: 'Naturally Rich in Plant Nutrients',
        description: 'Contains naturally occurring nitrates, antioxidants, vitamins, and minerals.'
      }
    ]
  },
  {
    keywords: ['carrot'],
    title: 'Why Choose Our Carrot Powder?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Carefully processed to maintain the natural quality of fresh carrots.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made from premium carrots with no unnecessary additives.'
      },
      {
        icon: '✨',
        title: 'Naturally Rich in Beta-Carotene',
        description: 'A natural source of beta-carotene and other beneficial nutrients.'
      }
    ]
  },
  {
    keywords: ['curry'],
    title: 'Why Choose Our Curry Leaf Powder?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Expert-led processing to preserve the natural aroma and quality of curry leaves.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made from carefully selected curry leaves with no artificial additives.'
      },
      {
        icon: '✨',
        title: 'Naturally Rich in Plant Nutrients',
        description: 'Provides naturally occurring vitamins, minerals, and antioxidants.'
      }
    ]
  },
  {
    keywords: ['spinach'],
    title: 'Why Choose Our Spinach Powder?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Processed with care to preserve the natural goodness of spinach leaves.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made from premium spinach leaves without unnecessary additives.'
      },
      {
        icon: '✨',
        title: 'Naturally Rich in Essential Nutrients',
        description: 'A natural source of vitamins, minerals, and antioxidants.'
      }
    ]
  },
  {
    keywords: ['ragi', 'raagi'],
    title: 'Why Choose Our Sprouted Ragi Flour?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Prepared using carefully controlled sprouting and processing methods.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made from premium sprouted finger millet without artificial additives.'
      },
      {
        icon: '✨',
        title: 'Naturally Rich in Calcium & Fibre',
        description: 'A wholesome source of calcium, dietary fibre, and essential nutrients.'
      }
    ]
  },
  {
    keywords: ['wheatgrass', 'wheat grass'],
    title: 'Why Choose Our Wheatgrass Powder?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Expert-led processing to preserve the natural quality of young wheatgrass.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made from freshly harvested wheatgrass with no unnecessary additives.'
      },
      {
        icon: '✨',
        title: 'Naturally Rich in Chlorophyll',
        description: 'A natural source of chlorophyll, vitamins, minerals, and antioxidants.'
      }
    ]
  },
  {
    keywords: ['coriander'],
    title: 'Why Choose Our Coriander Leaf Powder?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Carefully processed to maintain the natural freshness of coriander leaves.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made from premium coriander leaves without artificial additives.'
      },
      {
        icon: '✨',
        title: 'Naturally Rich in Plant Nutrients',
        description: 'Provides naturally occurring vitamins, minerals, and beneficial phytonutrients.'
      }
    ]
  },
  {
    keywords: ['mint'],
    title: 'Why Choose Our Mint Leaf Powder?',
    cards: [
      {
        icon: '🔬',
        title: 'Scientifically Guided Quality',
        description: 'Expert-led processing designed to preserve the natural freshness of mint leaves.'
      },
      {
        icon: '🌿',
        title: 'Pure & Natural',
        description: 'Made from carefully selected mint leaves with no unnecessary additives.'
      },
      {
        icon: '🍃',
        title: 'Naturally Refreshing & Aromatic',
        description: 'Retains the characteristic freshness, aroma, and plant-based nutrients of mint.'
      }
    ]
  }
];

async function updateWhyChooseSections() {
  console.log('🏆 Updating Why Choose section with EXACT user text for all products in DB...');

  const products = await prisma.product.findMany({
    include: { contentSections: true }
  });

  for (const product of products) {
    const pName = product.name.toLowerCase();
    const matchData = EXACT_WHY_CHOOSE_DATA.find(item => item.keywords.some(kw => pName.includes(kw)));

    if (!matchData) {
      console.log(`⚠️ Skipping product "${product.name}" (no matching keyword rule)`);
      continue;
    }

    console.log(`\n📦 Updating product "${product.name}" (${product.id})...`);

    // 1. Delete existing WHY_CHOOSE_US section records for this product
    await prisma.productContent.deleteMany({
      where: {
        productId: product.id,
        sectionType: 'WHY_CHOOSE_US'
      }
    });

    // 2. Create updated WHY_CHOOSE_US section with EXACT user cards
    const newSection = await prisma.productContent.create({
      data: {
        productId: product.id,
        sectionType: 'WHY_CHOOSE_US',
        title: matchData.title,
        content: {
          title: matchData.title,
          cards: matchData.cards
        },
        orderIndex: 2,
        isVisible: true
      }
    });

    console.log(`  ✅ Successfully updated WHY_CHOOSE_US section: "${newSection.title}" with exactly 3 cards.`);
  }

  console.log('\n🎉 ALL PRODUCTS UPDATED WITH EXACT SUPPLIED TEXT IN DATABASE!');
}

updateWhyChooseSections()
  .catch(e => {
    console.error('❌ Error updating DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
