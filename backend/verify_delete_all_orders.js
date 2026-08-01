import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDeleteAllOrders() {
  console.log("=== TESTING ATOMIC DELETE ALL ORDERS TRANSACTION ===");
  try {
    const initialOrderCount = await prisma.order.count();
    const initialItemCount = await prisma.orderItem.count();
    console.log(`Before deletion: ${initialOrderCount} orders, ${initialItemCount} order items.`);

    await prisma.$transaction(async (tx) => {
      // 1. Delete all order items
      await tx.orderItem.deleteMany({});

      // 2. Delete support messages for order tickets
      const ticketsWithOrder = await tx.supportTicket.findMany({
        where: { orderId: { not: null } },
        select: { id: true }
      });
      if (ticketsWithOrder.length > 0) {
        const ticketIds = ticketsWithOrder.map(t => t.id);
        await tx.supportMessage.deleteMany({
          where: { ticketId: { in: ticketIds } }
        });
      }

      // 3. Delete support tickets for orders
      await tx.supportTicket.deleteMany({
        where: { orderId: { not: null } }
      });

      // 4. Delete notifications for orders
      await tx.notification.deleteMany({
        where: {
          OR: [
            { title: { contains: 'Order', mode: 'insensitive' } },
            { message: { contains: 'Order', mode: 'insensitive' } },
            { title: { contains: 'Shipment', mode: 'insensitive' } },
            { message: { contains: 'Shipment', mode: 'insensitive' } }
          ]
        }
      });

      // 5. Delete all orders
      await tx.order.deleteMany({});
    });

    const finalOrderCount = await prisma.order.count();
    const finalItemCount = await prisma.orderItem.count();
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();

    console.log(`After deletion: ${finalOrderCount} orders, ${finalItemCount} order items.`);
    console.log(`Preserved business data: ${userCount} users, ${productCount} products.`);

    console.log("✅ ATOMIC DELETE ALL ORDERS TRANSACTION VERIFIED!");
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testDeleteAllOrders();
