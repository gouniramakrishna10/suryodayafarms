import prisma from './src/utils/db.js';

async function testContactFlow() {
  console.log('--- TESTING CONTACT MESSAGE DATABASE & API FLOW ---');

  try {
    // 1. Create sample test contact message in DB
    const testMessage = await prisma.contactMessage.create({
      data: {
        name: 'Test Contact Customer',
        email: `testcontact_${Date.now()}@example.com`,
        phone: '+91 9100422140',
        subject: 'Inquiry regarding organic cold pressed oil',
        category: 'Product Information',
        type: 'Product Information',
        message: 'Hello, I would like to know if your cold pressed groundnut oil is unrefined.',
        attachment: 'https://example.com/spec_sheet.pdf',
        status: 'NEW',
        adminNotes: 'Initial contact entry'
      }
    });

    console.log('✅ Created Contact Message in Database:', testMessage.id);

    // 2. Query contact messages list & count
    const allMessages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Total Contact Messages in DB: ${allMessages.length}`);

    // 3. Update status & admin notes
    const updated = await prisma.contactMessage.update({
      where: { id: testMessage.id },
      data: {
        status: 'REPLIED',
        adminNotes: 'Sent product specification email on ' + new Date().toISOString()
      }
    });
    console.log('✅ Updated Status & Admin Notes:', updated.status, '| Notes:', updated.adminNotes);

    // 4. Cleanup test record
    await prisma.contactMessage.delete({
      where: { id: testMessage.id }
    });
    console.log('✅ Test record cleaned up successfully.');

    console.log('--- ALL CONTACT DATABASE TESTS PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('❌ Contact Test Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testContactFlow();
