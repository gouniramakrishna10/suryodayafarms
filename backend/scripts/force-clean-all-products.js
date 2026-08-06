import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cleanText(str) {
  if (!str || typeof str !== 'string') return str;

  let cleaned = str;

  // 1. Replace 100% with Pure or appropriate text
  cleaned = cleaned
    .replace(/100%\s*Pure\s*&\s*Natural/gi, 'Pure & Natural')
    .replace(/100%\s*Pure\s*Natural/gi, 'Pure & Natural')
    .replace(/100%\s*Pure/gi, 'Pure')
    .replace(/100%\s*Natural/gi, 'Pure Natural')
    .replace(/100%\s*Organic/gi, 'Pure Organic')
    .replace(/100%\s*Chemical\s*Free/gi, 'Chemical Free')
    .replace(/100%\s*Fresh/gi, 'Fresh')
    .replace(/100%\s*Quality/gi, 'Quality')
    .replace(/100%\s*Heirloom/gi, 'Heirloom')
    .replace(/100%\s*bananas\b/gi, 'Pure Banana Powder')
    .replace(/100%\s*banana\b/gi, 'Pure Banana')
    .replace(/100%\s*moringa\b/gi, 'Pure Moringa')
    .replace(/100%\s*amla\b/gi, 'Pure Amla')
    .replace(/100%\s*wheatgrass\b/gi, 'Pure Wheatgrass')
    .replace(/100%\s*sprouted\s*ragi\b/gi, 'Pure Sprouted Ragi')
    .replace(/100%\s*/gi, 'Pure ');

  cleaned = cleaned.replace(/\bPure\s+Pure\b/gi, 'Pure');

  // 2. Botanical / Scientific names in brackets MUST BE italicized:
  cleaned = cleaned.replace(/\(([A-Z][a-z]+(?:\s+(?:[a-z]+|spp\.|sp\.))?)\)/g, (match, p1) => {
    if (p1.startsWith('*') && p1.endsWith('*')) return match;
    return `(*${p1}*)`;
  });

  return cleaned;
}

function cleanObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return cleanText(obj);
  if (Array.isArray(obj)) return obj.map(item => cleanObject(item));
  if (typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = cleanObject(v);
    }
    return res;
  }
  return obj;
}

async function main() {
  console.log('🔄 FORCE CLEANING ALL DB PRODUCTS & CMS RECORDS...');

  const products = await prisma.product.findMany();
  let count = 0;

  for (const p of products) {
    const newName = cleanText(p.name);
    const newShortDesc = cleanText(p.shortDescription);
    const newDesc = cleanText(p.description);
    const newIngredients = cleanText(p.ingredients);
    const newSeoTitle = cleanText(p.seoTitle);
    const newSeoDesc = cleanText(p.seoDescription);
    const newProductContent = p.productContent ? cleanObject(p.productContent) : p.productContent;

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
    console.log(`✅ Cleaned & updated DB product: ${p.name} (${p.id})`);
    count++;
  }

  console.log(`🎉 Finished force cleaning ${count} products!`);
}

main().finally(() => prisma.$disconnect());
