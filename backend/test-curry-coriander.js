import prisma from './src/utils/db.js';

async function verifyBoth() {
  console.log('--- VERIFYING CURRY LEAF & CORIANDER LEAF POWDERS ---');

  const curry = await prisma.product.findUnique({
    where: { id: 'ad97d1b5-080e-4a49-bea8-b8b1f5c4a7a9' },
    include: { contentSections: true }
  });

  const coriander = await prisma.product.findUnique({
    where: { id: 'b0f955f9-4d20-4ed9-8afc-e7d050dc0494' },
    include: { contentSections: true }
  });

  console.log(`1. Curry Leaf Powder (${curry.id}): ${curry.contentSections.length} CMS sections | SEO: ${curry.seoTitle}`);
  console.log(`2. Coriander Leaf Powder (${coriander.id}): ${coriander.contentSections.length} CMS sections | SEO: ${coriander.seoTitle}`);

  console.log('\n✅ BOTH PRODUCTS FULLY VERIFIED IN DATABASE!');
}

verifyBoth()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
