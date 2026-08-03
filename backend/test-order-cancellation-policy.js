import prisma from './src/utils/db.js';
import { ordersService } from './src/services/shiprocket/orders.service.js';

async function testOrderCancellationPolicy() {
  console.log('====================================================');
  console.log('  ORDER CANCELLATION POLICY FULL TEST SUITE');
  console.log('====================================================\n');

  // Fetch or create a test customer
  let testUser = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        name: 'Policy Test Customer',
        email: 'policy_test@suryodayafarms.com',
        mobile: '9199998888',
        role: 'CUSTOMER'
      }
    });
  }

  // Define status test cases
  const testCases = [
    { status: 'PENDING', shiprocketStatus: 'PLACED', expectAllowed: true },
    { status: 'CONFIRMED', shiprocketStatus: 'CONFIRMED', expectAllowed: true },
    { status: 'PROCESSING', shiprocketStatus: 'PREPARED', expectAllowed: true },
    { status: 'PACKED', shiprocketStatus: 'PACKED', expectAllowed: true },
    { status: 'CONFIRMED', shiprocketStatus: 'READY_FOR_DISPATCH', expectAllowed: true },
    { status: 'SHIPPED', shiprocketStatus: 'SHIPPED', expectAllowed: false },
    { status: 'IN_TRANSIT', shiprocketStatus: 'IN_TRANSIT', expectAllowed: false },
    { status: 'OUT_FOR_DELIVERY', shiprocketStatus: 'OUT_FOR_DELIVERY', expectAllowed: false },
    { status: 'DELIVERED', shiprocketStatus: 'DELIVERED', expectAllowed: false }
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    // Create temp order for this status
    const orderNumber = `POLICY-TEST-${tc.status}-${Date.now()}`;
    const testOrder = await prisma.order.create({
      data: {
        userId: testUser.id,
        orderNumber,
        status: tc.status,
        shiprocketStatus: tc.shiprocketStatus,
        paymentStatus: 'COMPLETED',
        paymentMethod: 'RAZORPAY',
        totalAmount: 1499,
        shippingAddress: {
          recipientName: testUser.name,
          phone: testUser.mobile,
          street: 'Test Street',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500039'
        }
      }
    });

    try {
      const res = await ordersService.cancelShiprocketOrder(testOrder.id, 'CUSTOMER');
      if (tc.expectAllowed) {
        console.log(`✅ [ALLOWED MATCH] Status: ${tc.status.padEnd(18)} -> Cancelled Successfully! (Status: ${res.order.status}, RefundStatus: ${res.refundStatus})`);
        passedCount++;
      } else {
        console.error(`❌ [EXPECTED DENY FAILED] Status: ${tc.status.padEnd(18)} -> Unexpectedly allowed cancellation!`);
      }
    } catch (err) {
      if (!tc.expectAllowed) {
        console.log(`✅ [DENIED MATCH]  Status: ${tc.status.padEnd(18)} -> Correctly Denied! Message: "${err.message}"`);
        passedCount++;
      } else {
        console.error(`❌ [EXPECTED ALLOW FAILED] Status: ${tc.status.padEnd(18)} -> Unexpectedly rejected! Error: "${err.message}"`);
      }
    } finally {
      // Clean up test order
      await prisma.order.delete({ where: { id: testOrder.id } }).catch(() => {});
    }
  }

  console.log('\n====================================================');
  console.log(`📊 POLICY VERIFICATION RESULT: ${passedCount}/${testCases.length} TESTS PASSED!`);
  console.log('====================================================\n');
}

testOrderCancellationPolicy()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
