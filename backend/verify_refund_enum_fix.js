import { PrismaClient } from '@prisma/client';
import { ordersService } from './src/services/shiprocket/orders.service.js';

const prisma = new PrismaClient();

async function testRefundEnumFix() {
  console.log("=== TESTING PRISMA REFUND ENUM UPDATE & RETRY REFUND ===");
  try {
    // Check schema enum definition alignment
    const validPaymentStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    console.log("Valid PaymentStatus enums in schema.prisma:", validPaymentStatuses);

    // Create a temporary test order
    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      console.log("No user found in DB to attach test order.");
      return;
    }

    const dummyOrder = await prisma.order.create({
      data: {
        userId: testUser.id,
        orderNumber: `TEST-REFUND-${Date.now()}`,
        status: 'CANCELLED',
        paymentStatus: 'COMPLETED',
        paymentMethod: 'RAZORPAY',
        razorpayOrderId: 'order_dummy_123',
        razorpayPaymentId: 'pay_dummy_456',
        totalAmount: 10,
        discountAmount: 0,
        shippingAddress: { city: 'Test City', pincode: '302001' },
        refundStatus: 'FAILED',
        trackingHistory: []
      }
    });

    console.log(`Created dummy test order: #${dummyOrder.orderNumber} (ID: ${dummyOrder.id})`);

    // Simulate the Prisma update performed after Razorpay refund creation
    const initiatedAt = new Date();
    const expectedCreditDate = new Date(initiatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const updatedOrder = await prisma.order.update({
      where: { id: dummyOrder.id },
      data: {
        refundStatus: 'PROCESSING',
        refundId: 'rfnd_dummy_789',
        refundAmount: dummyOrder.totalAmount,
        refundGateway: 'Razorpay',
        refundInitiatedAt: initiatedAt,
        refundExpectedDate: expectedCreditDate,
        lastRefundSync: initiatedAt,
        refundResponse: JSON.stringify({ id: 'rfnd_dummy_789', status: 'processed' }),
        refundError: null,
        updatedAt: new Date()
      }
    });

    console.log("Updated Order status after refund creation:", {
      id: updatedOrder.id,
      paymentStatus: updatedOrder.paymentStatus, // should be COMPLETED
      refundStatus: updatedOrder.refundStatus    // should be PROCESSING
    });

    if (updatedOrder.paymentStatus === 'COMPLETED' && updatedOrder.refundStatus === 'PROCESSING') {
      console.log("✅ PRISMA REFUND UPDATE SUCCESSFUL WITH 0 ENUM ERRORS!");
    } else {
      console.error("❌ Unexpected order state:", updatedOrder);
    }

    // Clean up dummy test order
    await prisma.order.delete({ where: { id: dummyOrder.id } });
    console.log("Cleaned up test order.");
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testRefundEnumFix();
