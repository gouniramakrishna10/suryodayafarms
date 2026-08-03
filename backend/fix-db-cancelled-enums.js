import prisma from './src/utils/db.js';

async function sanitizeDatabaseEnums() {
  console.log('🧹 Sanitizing existing database records with invalid paymentStatus="CANCELLED"...');

  try {
    // Execute raw SQL update to update any paymentStatus='CANCELLED' to 'FAILED'
    const result = await prisma.$executeRawUnsafe(`
      UPDATE "Order" 
      SET "paymentStatus" = 'FAILED', "status" = 'CANCELLED' 
      WHERE "paymentStatus" = 'CANCELLED';
    `);

    console.log(`✅ Raw SQL update completed. Updated ${result} record(s).`);
  } catch (err) {
    console.warn('⚠️ Raw SQL update notice (may already be clean):', err.message);
  }
}

sanitizeDatabaseEnums()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
