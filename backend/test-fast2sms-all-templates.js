import whatsappService, { APPROVED_MESSAGE_IDS } from './src/services/whatsapp.service.js';
import prisma from './src/utils/db.js';

async function runFast2SmsTestSuite() {
  console.log('====================================================');
  console.log('   FAST2SMS WHATSAPP PRODUCTION TEST SUITE');
  console.log('====================================================\n');

  console.log('Approved Message IDs Configured:');
  console.table(APPROVED_MESSAGE_IDS);

  const testMobile = '919100422140';
  const adminMobile = process.env.ADMIN_WHATSAPP_NUMBER || '9177900821';

  console.log(`\nCustomer Test Mobile: ${testMobile}`);
  console.log(`Admin New Order Recipient: ${adminMobile}\n`);

  // 1. Test OTP Authentication (Message ID: 27533)
  console.log('1. Testing sendOtp (27533):');
  const otpRes = await whatsappService.sendOtp({
    mobile: testMobile,
    otp: '482193',
    purpose: 'Registration',
    expiry: '10 Minutes',
    supportNumber: '1800123456'
  });
  console.log('Result:', JSON.stringify(otpRes, null, 2));

  // 2. Test Welcome User (Message ID: 27507)
  console.log('\n2. Testing sendWelcome (27507):');
  const welcomeRes = await whatsappService.sendWelcome({
    id: `test-user-${Date.now()}`,
    mobile: testMobile,
    name: 'Suryodaya Customer'
  });
  console.log('Result:', JSON.stringify(welcomeRes, null, 2));

  // Create mock order object for testing
  const mockOrder = {
    id: `test-order-${Date.now()}`,
    orderNumber: `SURY-TEST-${Date.now()}`,
    totalAmount: 1499,
    paymentMethod: 'ONLINE',
    paymentStatus: 'COMPLETED',
    status: 'CONFIRMED',
    awbCode: 'SR-AWB-998201',
    courierName: 'BlueDart Express',
    refundId: 'rfnd_PK991024',
    shippingAddress: {
      recipientName: 'Suryodaya Customer',
      phone: testMobile
    },
    orderItems: [
      { name: 'Moringa Powder', quantity: 2 },
      { name: 'Carrot Powder', quantity: 1 }
    ]
  };

  // 3. Test Order Placed (Message ID: 27509)
  console.log('\n3. Testing sendOrderPlaced (27509):');
  const orderPlacedRes = await whatsappService.sendOrderPlaced(mockOrder);
  console.log('Result:', JSON.stringify(orderPlacedRes, null, 2));

  // 4. Test Order Packed (Message ID: 27510)
  console.log('\n4. Testing sendOrderPacked (27510):');
  const orderPackedRes = await whatsappService.sendOrderPacked(mockOrder);
  console.log('Result:', JSON.stringify(orderPackedRes, null, 2));

  // 5. Test Order Shipped (Message ID: 27511)
  console.log('\n5. Testing sendOrderShipped (27511):');
  const orderShippedRes = await whatsappService.sendOrderShipped(mockOrder);
  console.log('Result:', JSON.stringify(orderShippedRes, null, 2));

  // 6. Test Order Delivered (Message ID: 27513)
  console.log('\n6. Testing sendOrderDelivered (27513):');
  const orderDeliveredRes = await whatsappService.sendOrderDelivered(mockOrder);
  console.log('Result:', JSON.stringify(orderDeliveredRes, null, 2));

  // 7. Test Order Cancelled (Message ID: 27514)
  console.log('\n7. Testing sendOrderCancelled (27514):');
  const orderCancelledRes = await whatsappService.sendOrderCancelled(mockOrder);
  console.log('Result:', JSON.stringify(orderCancelledRes, null, 2));

  // 8. Test Refund Initiated (Message ID: 27515)
  console.log('\n8. Testing sendRefundInitiated (27515):');
  const refundInitRes = await whatsappService.sendRefundInitiated(mockOrder, 1499);
  console.log('Result:', JSON.stringify(refundInitRes, null, 2));

  // 9. Test Refund Completed (Message ID: 27516)
  console.log('\n9. Testing sendRefundCompleted (27516):');
  const refundCompRes = await whatsappService.sendRefundCompleted(mockOrder, 1499, 'rfnd_PK991024');
  console.log('Result:', JSON.stringify(refundCompRes, null, 2));

  // 10. Test ADMIN NEW ORDER (Message ID: 27618 - ALWAYS TO 9177900821)
  console.log(`\n10. Testing sendAdminNewOrder (27618 - Target: ${adminMobile}):`);
  const adminNewOrderRes = await whatsappService.sendAdminNewOrder(mockOrder);
  console.log('Result:', JSON.stringify(adminNewOrderRes, null, 2));

  // Verify Admin Recipient Rule
  const isAdminCorrect = adminNewOrderRes.recipient === '9177900821' || adminNewOrderRes.recipient === `91${adminMobile.slice(-10)}`;
  console.log(`\n- Admin Recipient Verification (9177900821): ${isAdminCorrect ? '✅ CORRECT (PASS)' : '❌ WRONG RECIPIENT'}`);

  // 11. Verify Database Audit Logs in WhatsAppLog table
  console.log('\n11. Verifying Database Audit Logs in WhatsAppLog table:');
  const dbLogsCount = await prisma.whatsAppLog.count();
  const recentLogs = await prisma.whatsAppLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Total WhatsAppLog entries in DB: ${dbLogsCount}`);
  console.table(recentLogs.map(l => ({
    id: l.id.slice(0, 8),
    templateId: l.templateId,
    templateName: l.templateName,
    recipient: l.recipient,
    status: l.status,
    attempts: l.attempts,
    time: l.createdAt.toISOString()
  })));

  console.log('\n🎉 ALL 10 FAST2SMS WHATSAPP TEMPLATE TESTS COMPLETED!');
}

runFast2SmsTestSuite()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
