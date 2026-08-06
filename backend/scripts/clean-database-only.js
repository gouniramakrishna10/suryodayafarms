import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function sanitizeText(str) {
  if (!str || typeof str !== 'string') return str;
  let s = str;

  s = s
    .replace(/100%\s*Pure\s*&\s*Natural/gi, 'Pure & Natural')
    .replace(/100%\s*Pure\s*Natural/gi, 'Pure & Natural')
    .replace(/100%\s*Pure/gi, 'Pure')
    .replace(/100%\s*Natural/gi, 'Pure Natural')
    .replace(/100%\s*Organic/gi, 'Pure Organic')
    .replace(/100%\s*Chemical\s*Free/gi, 'Chemical Free')
    .replace(/100%\s*Fresh/gi, 'Fresh')
    .replace(/100%\s*Quality/gi, 'Quality')
    .replace(/100%\s*Heirloom/gi, 'Heirloom')
    .replace(/100%\s*/gi, 'Pure ')
    .replace(/\b100%\b/g, 'Pure');

  s = s
    .replace(/contains only\s+Pure\s+/gi, 'contains only Pure ')
    .replace(/contains only\s+/gi, 'contains only Pure ')
    .replace(/made from\s+pure/gi, 'made from pure')
    .replace(/<strong>\s*/gi, '<strong>')
    .replace(/\s*<\/strong>/gi, '</strong>')
    .replace(/Pure\s+Pure/gi, 'Pure')
    .replace(/\s{2,}/g, ' ');

  // Italics for scientific names inside brackets: (Musa spp.) -> (*Musa spp.*)
  s = s.replace(/\(([A-Z][a-z]+(?:\s+(?:[a-z\.]+|spp\.|sp\.))?)\)/g, (match, p1) => {
    if (p1.startsWith('*') && p1.endsWith('*')) return match;
    return `(*${p1}*)`;
  });

  return s;
}

function cleanObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeText(obj);
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
  console.log('🔄 Cleaning DB records...');
  const products = await prisma.product.findMany();
  for (const p of products) {
    const newName = sanitizeText(p.name);
    const newShortDesc = sanitizeText(p.shortDescription);
    const newDesc = sanitizeText(p.description);
    const newIngredients = sanitizeText(p.ingredients);
    const newSeoTitle = sanitizeText(p.seoTitle);
    const newSeoDesc = sanitizeText(p.seoDescription);
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
    console.log(`  ✅ Cleaned DB product: ${newName} (${p.id})`);
  }
  console.log('🎉 Database cleanup complete!');
}

main().finally(() => prisma.$disconnect());
