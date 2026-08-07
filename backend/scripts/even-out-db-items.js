import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function evenOutDbItems() {
  console.log('✂️ Trimming uneven last boxes across all product sections in DB...');

  const sections = await prisma.productContent.findMany();
  let updatedCount = 0;

  for (const sec of sections) {
    if (!sec.content || typeof sec.content !== 'object') continue;

    let content = sec.content;
    let modified = false;

    // Check content.items array
    if (Array.isArray(content.items) && content.items.length % 2 !== 0 && content.items.length > 1) {
      console.log(`  - Trimming sec "${sec.title}" (${sec.sectionType}) for product ${sec.productId}: ${content.items.length} -> ${content.items.length - 1} items`);
      content = {
        ...content,
        items: content.items.slice(0, content.items.length - 1)
      };
      modified = true;
    }

    // Check content.instructions array
    if (Array.isArray(content.instructions) && content.instructions.length % 2 !== 0 && content.instructions.length > 1) {
      console.log(`  - Trimming instructions in sec "${sec.title}" (${sec.sectionType}): ${content.instructions.length} -> ${content.instructions.length - 1}`);
      content = {
        ...content,
        instructions: content.instructions.slice(0, content.instructions.length - 1)
      };
      modified = true;
    }

    if (modified) {
      await prisma.productContent.update({
        where: { id: sec.id },
        data: { content }
      });
      updatedCount++;
    }
  }

  console.log(`\n🎉 Successfully evened out ${updatedCount} section records in PostgreSQL database!`);
}

evenOutDbItems()
  .catch(e => {
    console.error('❌ Error during DB even-out:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
