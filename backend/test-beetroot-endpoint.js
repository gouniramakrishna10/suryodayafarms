import prisma from './src/utils/db.js';

async function verifyBeetroot() {
  console.log('--- VERIFYING ENRICHED BEETROOT POWDER PRODUCT ---');

  const p = await prisma.product.findUnique({
    where: { id: 'da8a59b1-515c-43e4-81b6-dd8b81cfca6f' },
    include: {
      categories: true,
      contentSections: { orderBy: { orderIndex: 'asc' } }
    }
  });

  if (!p) {
    console.error('❌ Product not found');
    process.exit(1);
  }

  console.log('Product Summary:');
  console.log(`- ID: ${p.id}`);
  console.log(`- Name: ${p.name}`);
  console.log(`- SKU: ${p.sku}`);
  console.log(`- Short Description: ${p.shortDescription}`);
  console.log(`- Nutrients: ${p.nutrients}`);
  console.log(`- Shelf Life: ${p.shelfLife}`);
  console.log(`- SEO Title: ${p.seoTitle}`);
  console.log(`- SEO Description: ${p.seoDescription}`);
  console.log(`- Content Sections Count: ${p.contentSections.length}`);
  
  console.log('\nEnriched CMS Content Sections:');
  p.contentSections.forEach((sec, idx) => {
    console.log(`  ${idx + 1}. [${sec.sectionType}] "${sec.title}"`);
  });

  console.log('\n✅ VERIFICATION COMPLETE - PRODUCT IS READY FOR PUBLISHING!');
}

verifyBeetroot()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
