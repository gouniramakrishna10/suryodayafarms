import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cleanText(str) {
  if (!str || typeof str !== 'string') return str;
  // Replace 100% pure/natural/chemical free/etc. with clean versions
  return str
    .replace(/100%\s*Pure\s*&\s*Natural/gi, 'Pure & Natural')
    .replace(/100%\s*Pure/gi, 'Pure')
    .replace(/100%\s*Natural/gi, 'Natural')
    .replace(/100%\s*Chemical\s*Free/gi, 'Chemical Free')
    .replace(/100%\s*Fresh/gi, 'Fresh')
    .replace(/100%\s*Quality/gi, 'Quality')
    .replace(/100%\s*Organic/gi, 'Organic')
    .replace(/100%\s*Heirloom/gi, 'Heirloom')
    .replace(/100%/g, '');
}

function cleanObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanObject);
  
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      res[k] = cleanText(v);
    } else if (typeof v === 'object' && v !== null) {
      res[k] = cleanObject(v);
    } else {
      res[k] = v;
    }
  }
  return res;
}

async function main() {
  console.log('🔄 Cleaning "100%" from PostgreSQL database records...');

  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const p of products) {
    let needsUpdate = false;

    const newName = cleanText(p.name);
    const newShortDesc = cleanText(p.shortDescription);
    const newDesc = cleanText(p.description);
    const newIngredients = cleanText(p.ingredients);
    const newSeoTitle = cleanText(p.seoTitle);
    const newSeoDesc = cleanText(p.seoDescription);
    const newProductContent = p.productContent ? cleanObject(p.productContent) : p.productContent;

    if (
      newName !== p.name ||
      newShortDesc !== p.shortDescription ||
      newDesc !== p.description ||
      newIngredients !== p.ingredients ||
      newSeoTitle !== p.seoTitle ||
      newSeoDesc !== p.seoDescription ||
      JSON.stringify(newProductContent) !== JSON.stringify(p.productContent)
    ) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          name: newName,
          shortDescription: newShortDesc,
          description: newDesc,
          ingredients: newIngredients,
          seoTitle: newSeoTitle,
          seoDescription: newSeoDesc,
          productContent: newProductContent
        }
      });
      console.log(`✅ Cleaned product: ${p.name} (${p.id})`);
      updatedCount++;
    }
  }

  // Clean CmsContent
  if (prisma.cmsContent) {
    const cmsRecords = await prisma.cmsContent.findMany();
    for (const c of cmsRecords) {
      if (c.content) {
        const cleaned = cleanObject(c.content);
        if (JSON.stringify(cleaned) !== JSON.stringify(c.content)) {
          await prisma.cmsContent.update({
            where: { id: c.id },
            data: { content: cleaned }
          });
          console.log(`✅ Cleaned CMS content: ${c.key}`);
        }
      }
    }
  }

  console.log(`🎉 Database cleanup finished! Updated ${updatedCount} products.`);
}

main()
  .catch(err => {
    console.error('Error cleaning database:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
