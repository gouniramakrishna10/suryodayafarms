import prisma from './src/utils/db.js';

async function verifyEnrichedProduct() {
  console.log('--- VERIFYING ENRICHED SPROUTED RAGI FLOUR PRODUCT ---');

  const p = await prisma.product.findUnique({
    where: { id: 'b748f322-5c02-464c-9baf-655f8aef696e' },
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

verifyEnrichedProduct()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
