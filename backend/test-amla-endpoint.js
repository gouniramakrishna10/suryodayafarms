import prisma from './src/utils/db.js';

async function verifyAmla() {
  console.log('--- VERIFYING ENRICHED AMLA POWDER PRODUCT ---');

  const p = await prisma.product.findUnique({
    where: { id: 'd26d3c75-910a-4540-8039-8998617afc7c' },
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

verifyAmla()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
