import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cleanText(str) {
  if (!str || typeof str !== 'string') return str;

  let cleaned = str;

  // 1. Replace 100% occurrences with Pure or appropriate grammar
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

  // Clean double "Pure Pure" -> "Pure"
  cleaned = cleaned.replace(/\bPure\s+Pure\b/gi, 'Pure');

  // 2. Botanical / Scientific names in brackets MUST BE italicized:
  // e.g., (Musa spp.) -> (*Musa spp.*)
  // e.g., (Moringa oleifera) -> (*Moringa oleifera*)
  // e.g., (Phyllanthus emblica) -> (*Phyllanthus emblica*)
  // e.g., (Triticum aestivum) -> (*Triticum aestivum*)
  // e.g., (Eleusine coracana) -> (*Eleusine coracana*)
  cleaned = cleaned.replace(/\(([A-Z][a-z]+(?:\s+(?:[a-z]+|spp\.|sp\.))?)\)/g, (match, p1) => {
    if (p1.startsWith('*') && p1.endsWith('*')) return match;
    return `(*${p1}*)`;
  });

  return cleaned;
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
  console.log('🔄 Executing Global DB Cleanup: Removing "100%" and italicizing Botanical Scientific Names...');

  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const p of products) {
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
      console.log(`✅ Updated product: "${p.name}" -> "${newName}" (${p.id})`);
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

  console.log(`🎉 Global Database Cleanup Complete! Updated ${updatedCount} products.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during DB cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
