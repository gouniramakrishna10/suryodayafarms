import prisma from './src/utils/db.js';

async function testSupportFlow() {
  console.log('--- TESTING SUPPORT REQUEST DATABASE & API FLOW ---');

  try {
    // 1. Create sample test support request in DB
    const testRequest = await prisma.supportRequest.create({
      data: {
        name: 'Test Customer Support',
        email: `testsupport_${Date.now()}@example.com`,
        phone: '+91 9100422140',
        subject: 'How should I store the Vedic Bilona Ghee?',
        category: 'Storage',
        message: 'I received the ghee container. Should it be stored in the refrigerator or at room temperature?',
        orderNumber: 'SUR-100299',
        attachment: 'https://example.com/ghee_box.jpg',
        status: 'NEW',
        adminNotes: 'Awaiting customer response'
      }
    });

    console.log('✅ Created Support Request in Database:', testRequest.id);

    // 2. Query support requests list & count
    const allRequests = await prisma.supportRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Total Support Requests in DB: ${allRequests.length}`);

    // 3. Update status & admin notes
    const updated = await prisma.supportRequest.update({
      where: { id: testRequest.id },
      data: {
        status: 'RESOLVED',
        adminNotes: 'Advised customer to store at room temperature away from direct sunlight.'
      }
    });
    console.log('✅ Updated Status & Admin Notes:', updated.status, '| Notes:', updated.adminNotes);

    // 4. Cleanup test record
    await prisma.supportRequest.delete({
      where: { id: testRequest.id }
    });
    console.log('✅ Test record cleaned up successfully.');

    console.log('--- ALL SUPPORT DATABASE TESTS PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('❌ Support Test Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testSupportFlow();
