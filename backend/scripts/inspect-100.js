import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function find100(obj, path = '') {
  if (typeof obj === 'string') {
    if (obj.includes('100%')) {
      console.log(`  Path [${path}]: "${obj}"`);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => find100(item, `${path}[${index}]`));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [k, v] of Object.entries(obj)) {
      find100(v, path ? `${path}.${k}` : k);
    }
  }
}

async function main() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    const str = JSON.stringify(p);
    if (str.includes('100%')) {
      console.log(`\nProduct: "${p.name}" (${p.id}):`);
      find100(p);
    }
  }
}

main().finally(() => prisma.$disconnect());
