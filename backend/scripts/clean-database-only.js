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
    .replace(/100%\s*bananas\b/gi, 'pure bananas')
    .replace(/100%\s*banana\b/gi, 'pure banana')
    .replace(/100%\s*moringa\b/gi, 'pure moringa')
    .replace(/100%\s*amla\b/gi, 'pure amla')
    .replace(/100%\s*wheatgrass\b/gi, 'pure wheatgrass')
    .replace(/100%\s*sprouted\s*ragi\b/gi, 'pure sprouted ragi')
    .replace(/100%\s*coriander\b/gi, 'pure coriander')
    .replace(/100%\s*curry\b/gi, 'pure curry')
    .replace(/100%\s*mint\b/gi, 'pure mint')
    .replace(/100%\s*spinach\b/gi, 'pure spinach')
    .replace(/100%\s*beetroot\b/gi, 'pure beetroot')
    .replace(/100%\s*carrot\b/gi, 'pure carrot')
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

  // Also clean ProductContent table records directly
  if (prisma.productContent) {
    const pcRecords = await prisma.productContent.findMany();
    for (const pc of pcRecords) {
      if (pc.content) {
        const cleanedContent = cleanObject(pc.content);
        await prisma.productContent.update({
          where: { id: pc.id },
          data: { content: cleanedContent }
        });
      }
    }
    console.log(`  ✅ Cleaned ${pcRecords.length} ProductContent section records in DB`);
  }

  console.log('🎉 Database cleanup complete!');
}

main().finally(() => prisma.$disconnect());
