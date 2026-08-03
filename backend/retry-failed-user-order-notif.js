import prisma from './src/utils/db.js';
import whatsappService from './src/services/whatsapp.service.js';

async function retryFailedUserOrderNotif() {
  console.log('====================================================');
  console.log('  RETRYING FAILING WHATSAPP NOTIFICATION FOR ORDER');
  console.log('====================================================\n');

  const order = await prisma.order.findFirst({
    where: { orderNumber: 'SURY-1785755329755-3268' },
    include: { user: true, orderItems: { include: { product: true } } }
  });

  if (!order) {
    console.error('Order SURY-1785755329755-3268 not found!');
    return;
  }

  console.log(`Sending WhatsApp notification for Order: ${order.orderNumber}`);
  console.log(`Original Shipping Phone: ${order.shippingAddress?.phone}`);

  // Reset flag to force send
  order.orderPlacedWhatsappSent = false;

  const result = await whatsappService.sendOrderPlaced(order);
  console.log('\nResult:', JSON.stringify(result, null, 2));
}

retryFailedUserOrderNotif()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
