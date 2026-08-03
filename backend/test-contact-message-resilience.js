import prisma from './src/utils/db.js';

async function testContactMessageResilience() {
  console.log('====================================================');
  console.log('   CONTACT MESSAGE TABLE & ANATLYICS RESILIENCE TEST');
  console.log('====================================================\n');

  try {
    const count = await prisma.contactMessage.count();
    console.log(`✅ ContactMessage table exists and returned count: ${count}`);
  } catch (err) {
    console.warn(`⚠️ ContactMessage table query warning: ${err.message}`);
  }

  // Test Analytics endpoint query bundle
  try {
    const [totalOrders, totalCustomers, totalProducts, orders, contactCount] = await Promise.all([
      prisma.order.count({ where: { paymentStatus: 'COMPLETED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.findMany({ where: { paymentStatus: 'COMPLETED' }, select: { totalAmount: true } }),
      prisma.contactMessage.count().catch(() => 0)
    ]);

    const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

    console.log('\nAnalytics Execution Summary:');
    console.log(`- Total Revenue (COMPLETED orders only): ₹${totalRevenue}`);
    console.log(`- Total Orders (COMPLETED orders only): ${totalOrders}`);
    console.log(`- Total Customers: ${totalCustomers}`);
    console.log(`- Total Products: ${totalProducts}`);
    console.log(`- Contact Submissions Count (Resilient): ${contactCount}`);
    console.log('\n✅ Dashboard Analytics queries executed with ZERO ERRORS!');
  } catch (analyticsErr) {
    console.error('❌ Analytics Execution Failed:', analyticsErr);
  }
}

testContactMessageResilience()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
