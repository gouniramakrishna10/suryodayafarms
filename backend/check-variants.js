import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking products and variants in the database...");
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true
      }
    });

    console.log(`Total products: ${products.length}`);
    let totalVariants = 0;

    products.forEach(p => {
      console.log(`Product: ${p.name} (ID: ${p.id})`);
      if (p.variants && p.variants.length > 0) {
        console.log(`  Variants (${p.variants.length}):`);
        p.variants.forEach(v => {
          console.log(`    - ${v.name}: Price: ${v.price}, MRP: ${v.mrp}, SKU: ${v.sku}, Inventory: ${v.inventory} (ID: ${v.id})`);
          totalVariants++;
        });
      } else {
        console.log(`  No variants.`);
      }
    });

    console.log(`\nTotal variants found: ${totalVariants}`);
  } catch (err) {
    console.error("Error querying database:", err);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
