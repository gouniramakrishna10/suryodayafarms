import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      productImages: true,
      categories: true
    }
  });

  console.log("=== TOTAL PRODUCTS IN DB:", products.length, "===");
  products.forEach((p, idx) => {
    console.log(`\n[${idx + 1}] Product Name: "${p.name}" (ID: ${p.id})`);
    console.log(`  - Direct 'image' field:`, JSON.stringify(p.image));
    console.log(`  - ProductImage relations count:`, p.productImages.length);
    p.productImages.forEach((img, i) => {
      console.log(`    Image [${i}]: url="${img.url}", isMain=${img.isMain}`);
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
