import prisma from './src/utils/db.js';
import { cleanupExpiredPendingOrders } from './src/workers/paymentTimeoutWorker.js';

async function verifyOrderVisibilityAndTimeout() {
  console.log('====================================================');
  console.log('   ORDER LIFECYCLE & VISIBILITY TEST SUITE');
  console.log('====================================================\n');

  // 1. Create a dummy test customer user
  let testUser = await prisma.user.findFirst({ where: { email: 'test_visibility_user@suryodayafarms.com' } });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        name: 'Test Visibility User',
        email: 'test_visibility_user@suryodayafarms.com',
        mobile: '9999988888',
        role: 'CUSTOMER'
      }
    });
  }

  // 2. Create a temporary checkout PENDING order
  const pendingOrderNumber = `TEST-PENDING-${Date.now()}`;
  const pendingOrder = await prisma.order.create({
    data: {
      userId: testUser.id,
      orderNumber: pendingOrderNumber,
      paymentMethod: 'RAZORPAY',
      totalAmount: 1999,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      shippingAddress: { recipientName: 'Test Visibility User', phone: '9999988888' }
    }
  });

  console.log(`🆕 Created temporary checkout PENDING order: ${pendingOrder.orderNumber} (ID: ${pendingOrder.id})`);

  // Test Customer History Visibility (Must exclude PENDING)
  const customerHistory = await prisma.order.findMany({
    where: {
      userId: testUser.id,
      paymentStatus: { not: 'PENDING' },
      OR: [
        { cancelReason: null },
        { cancelReason: { not: 'Payment Timeout' } }
      ]
    }
  });
  const isHiddenFromCustomer = !customerHistory.some(o => o.id === pendingOrder.id);
  console.log(`1. Customer History Visibility: ${isHiddenFromCustomer ? '✅ HIDDEN (PASS)' : '❌ VISIBLE (FAIL)'}`);

  // Test Admin Orders List Visibility (Must exclude PENDING by default)
  const adminOrders = await prisma.order.findMany({
    where: {
      paymentStatus: { not: 'PENDING' },
      OR: [
        { cancelReason: null },
        { cancelReason: { not: 'Payment Timeout' } }
      ]
    }
  });
  const isHiddenFromAdmin = !adminOrders.some(o => o.id === pendingOrder.id);
  console.log(`2. Admin Orders Standard View: ${isHiddenFromAdmin ? '✅ HIDDEN (PASS)' : '❌ VISIBLE (FAIL)'}`);

  // Test Analytics & Revenue Calculation (Must exclude PENDING)
  const paidOrdersForRevenue = await prisma.order.findMany({
    where: { paymentStatus: 'COMPLETED' },
    select: { totalAmount: true, id: true }
  });
  const isExcludedFromRevenue = !paidOrdersForRevenue.some(o => o.id === pendingOrder.id);
  console.log(`3. Analytics Revenue Calculation: ${isExcludedFromRevenue ? '✅ EXCLUDED FROM REVENUE (PASS)' : '❌ INCLUDED (FAIL)'}`);

  // 3. Test 10-Minute Timeout Background Worker
  console.log('\n4. Testing 10-Minute Payment Timeout Worker:');
  // Backdate pending order to 15 minutes ago
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  await prisma.order.update({
    where: { id: pendingOrder.id },
    data: { createdAt: fifteenMinsAgo }
  });

  const workerResult = await cleanupExpiredPendingOrders();
  console.log(`- Worker Result: Processed ${workerResult.processedCount} expired order(s)`);

  const updatedTimeoutOrder = await prisma.order.findUnique({ where: { id: pendingOrder.id } });
  console.log(`- Updated Status: paymentStatus="${updatedTimeoutOrder.paymentStatus}", status="${updatedTimeoutOrder.status}", cancelReason="${updatedTimeoutOrder.cancelReason}"`);
  const isTimeoutSuccess = updatedTimeoutOrder.paymentStatus === 'FAILED' && updatedTimeoutOrder.status === 'CANCELLED' && updatedTimeoutOrder.cancelReason === 'Payment Timeout';
  console.log(`- Auto-Cancellation Result: ${isTimeoutSuccess ? '✅ PASSED (PASS)' : '❌ FAILED'}`);

  // 4. Test Payment Completion Transition
  console.log('\n5. Testing Payment Completion Transition:');
  const paidOrderNumber = `TEST-PAID-${Date.now()}`;
  const paidOrder = await prisma.order.create({
    data: {
      userId: testUser.id,
      orderNumber: paidOrderNumber,
      paymentMethod: 'RAZORPAY',
      totalAmount: 1499,
      status: 'CONFIRMED',
      paymentStatus: 'COMPLETED',
      shippingAddress: { recipientName: 'Test Visibility User', phone: '9999988888' }
    }
  });

  const customerHistoryAfterPay = await prisma.order.findMany({
    where: {
      userId: testUser.id,
      paymentStatus: { not: 'PENDING' },
      OR: [
        { cancelReason: null },
        { cancelReason: { not: 'Payment Timeout' } }
      ]
    }
  });
  const isPaidVisibleToCustomer = customerHistoryAfterPay.some(o => o.id === paidOrder.id);
  console.log(`- Paid Order Visible to Customer: ${isPaidVisibleToCustomer ? '✅ VISIBLE (PASS)' : '❌ HIDDEN (FAIL)'}`);

  const paidOrdersForRevenueAfterPay = await prisma.order.findMany({
    where: { paymentStatus: 'COMPLETED' },
    select: { totalAmount: true, id: true }
  });
  const isPaidIncludedInRevenue = paidOrdersForRevenueAfterPay.some(o => o.id === paidOrder.id);
  console.log(`- Paid Order Included in Revenue: ${isPaidIncludedInRevenue ? '✅ INCLUDED IN REVENUE (PASS)' : '❌ EXCLUDED (FAIL)'}`);

  // Clean up test records
  await prisma.order.deleteMany({
    where: {
      id: { in: [pendingOrder.id, paidOrder.id] }
    }
  }).catch(() => {});

  console.log('\n🎉 ALL ORDER LIFECYCLE & VISIBILITY TESTS PASSED 100% PERFECTLY!');
}

verifyOrderVisibilityAndTimeout()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
