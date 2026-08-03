import prisma from './src/utils/db.js';

async function testPartnerFlow() {
  console.log('--- TESTING PARTNER REQUEST DATABASE & API FLOW ---');

  try {
    // 1. Create sample test record in DB
    const testRequest = await prisma.partnerRequest.create({
      data: {
        name: 'Test Partner Founder',
        companyName: 'Vedic Global Distribution',
        businessType: 'Supermarket Chain & Wholesaler',
        gstNumber: '36AAAAA1234A1Z1',
        email: `testpartner_${Date.now()}@example.com`,
        phone: '+91 9988776655',
        country: 'India',
        state: 'Telangana',
        city: 'Hyderabad',
        website: 'https://vedicglobaldistributors.com',
        partnershipType: 'Distributor',
        yearsInBusiness: '8 Years',
        monthlyRequirement: '1000 Units',
        businessDescription: 'Leading distributor of organic staples in Telangana.',
        message: 'Looking forward to partnering with Suryodaya Farms.',
        status: 'NEW',
        notes: 'Initial test entry'
      }
    });

    console.log('✅ Created Partner Request in Database:', testRequest.id);

    // 2. Query partner requests list & count
    const allRequests = await prisma.partnerRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Total Partner Requests in DB: ${allRequests.length}`);

    // 3. Update status & internal notes
    const updated = await prisma.partnerRequest.update({
      where: { id: testRequest.id },
      data: {
        status: 'CONTACTED',
        notes: 'Contacted via phone call on ' + new Date().toISOString()
      }
    });
    console.log('✅ Updated Status & Notes:', updated.status, '| Notes:', updated.notes);

    // 4. Cleanup test record
    await prisma.partnerRequest.delete({
      where: { id: testRequest.id }
    });
    console.log('✅ Test record cleaned up successfully.');

    console.log('--- ALL PARTNER DATABASE TESTS PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('❌ Partner Test Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testPartnerFlow();
