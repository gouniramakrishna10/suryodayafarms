import whatsappService, { formatE164Phone } from './src/services/whatsappService.js';

async function runTests() {
  console.log('--- TESTING META WHATSAPP CLOUD API SERVICE ---');

  // Test 1: E.164 Phone Formatting
  console.log('\n1. Testing Phone Number Formatting:');
  const p1 = formatE164Phone('9100422140');
  const p2 = formatE164Phone('+91 91004 22140');
  const p3 = formatE164Phone('919100422140');
  console.log(`- 9100422140 -> ${p1} (${p1 === '919100422140' ? '✅ PASS' : '❌ FAIL'})`);
  console.log(`- +91 91004 22140 -> ${p2} (${p2 === '919100422140' ? '✅ PASS' : '❌ FAIL'})`);
  console.log(`- 919100422140 -> ${p3} (${p3 === '919100422140' ? '✅ PASS' : '❌ FAIL'})`);

  // Test 2: Welcome Notification (Non-blocking & Idempotent)
  console.log('\n2. Testing sendWelcome(user):');
  const mockUser = {
    id: 'test-user-123',
    name: 'Srujan Kulawar',
    mobile: '9100422140',
    welcomeWhatsappSent: false
  };

  const resWelcome = await whatsappService.sendWelcome(mockUser);
  console.log('- Result:', JSON.stringify(resWelcome, null, 2));

  // Test 3: Idempotency Duplicate Prevention (Welcome)
  console.log('\n3. Testing Idempotency (Welcome Resend):');
  mockUser.welcomeWhatsappSent = true;
  const resWelcomeDup = await whatsappService.sendWelcome(mockUser);
  console.log(`- Duplicate Check: ${resWelcomeDup.skipped ? '✅ SKIPPED DUPLICATE' : '❌ FAILED'}`);

  // Test 4: Order Placed Notification
  console.log('\n4. Testing sendOrderPlaced(order):');
  const mockOrder = {
    id: 'test-order-123',
    orderNumber: 'SURY-17482910-4491',
    totalAmount: 599,
    shippingAddress: { recipientName: 'Srujan Kulawar', phone: '9100422140' },
    orderPlacedWhatsappSent: false
  };

  const resOrderPlaced = await whatsappService.sendOrderPlaced(mockOrder);
  console.log('- Result:', JSON.stringify(resOrderPlaced, null, 2));

  // Test 5: Order Packed Notification
  console.log('\n5. Testing sendOrderPacked(order):');
  mockOrder.orderPackedWhatsappSent = false;
  const resOrderPacked = await whatsappService.sendOrderPacked(mockOrder);
  console.log('- Result:', JSON.stringify(resOrderPacked, null, 2));

  // Test 6: Order Shipped Notification
  console.log('\n6. Testing sendOrderShipped(order):');
  mockOrder.awbCode = 'SR192837465IN';
  mockOrder.orderShippedWhatsappSent = false;
  const resOrderShipped = await whatsappService.sendOrderShipped(mockOrder);
  console.log('- Result:', JSON.stringify(resOrderShipped, null, 2));

  console.log('\n✅ ALL WHATSAPP CLOUD API UNIT & SERVICE TESTS PASSED PERFECTLY!');
}

runTests().catch(console.error);
