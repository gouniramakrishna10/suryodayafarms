import prisma from './src/utils/db.js';

async function inspectUserOrder() {
  console.log('====================================================');
  console.log('  INSPECT REAL USER ORDER & WHATSAPP LOGS');
  console.log('====================================================\n');

  // Search for the recent order created in screenshot
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { razorpayPaymentId: 'pay_TLH7Wr468JatSI' },
        { orderNumber: { contains: '1785755329755' } }
      ]
    },
    include: {
      user: true,
      orderItems: { include: { product: true } }
    }
  });

  if (!order) {
    console.log('❌ Order with payment ID "pay_TLH7Wr468JatSI" not found in database yet.');
  } else {
    console.log('📦 FOUND ORDER DETAILS:');
    console.log(`- Order Number: ${order.orderNumber}`);
    console.log(`- Order ID: ${order.id}`);
    console.log(`- Status: ${order.status}`);
    console.log(`- Payment Status: ${order.paymentStatus}`);
    console.log(`- Payment ID: ${order.razorpayPaymentId}`);
    console.log(`- Total Amount: ₹${order.totalAmount}`);
    console.log(`- Shipping Address:`, JSON.stringify(order.shippingAddress, null, 2));
    console.log(`- User ID: ${order.userId}`);
    console.log(`- User Name: ${order.user?.name || 'N/A'}`);
    console.log(`- User Mobile: ${order.user?.mobile || 'N/A'}`);
    console.log(`- User Email: ${order.user?.email || 'N/A'}`);
    console.log(`- orderPlacedWhatsappSent: ${order.orderPlacedWhatsappSent}`);
    console.log(`- adminOrderWhatsappSent: ${order.adminOrderWhatsappSent}`);
  }

  // Fetch recent WhatsAppLog entries
  const logs = await prisma.whatsAppLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n📱 RECENT WHATSAPP LOGS IN DB:');
  console.table(logs.map(l => ({
    id: l.id,
    templateId: l.templateId,
    templateName: l.templateName,
    recipient: l.recipient,
    customerName: l.customerName,
    status: l.status,
    errorMessage: l.errorMessage,
    time: l.createdAt
  })));
}

inspectUserOrder()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
