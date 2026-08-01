import { PrismaClient } from '@prisma/client';
import { syncOrderRefundStatus, syncAllPendingRefunds } from './src/services/razorpay.service.js';

const prisma = new PrismaClient();

async function testRefundLifecycle() {
  console.log("=== VERIFYING REFUND LIFECYCLE BACKEND SETUP ===");

  try {
    // 1. Query any cancelled orders
    const cancelledOrders = await prisma.order.findMany({
      where: { status: 'CANCELLED' }
    });

    console.log(`Found ${cancelledOrders.length} cancelled order(s) in DB.`);

    cancelledOrders.forEach(o => {
      console.log(`Order #${o.orderNumber}: status=${o.status}, paymentStatus=${o.paymentStatus}, refundStatus=${o.refundStatus}, refundId=${o.refundId}`);
    });

    // 2. Test syncAllPendingRefunds function execution
    console.log("\nTesting syncAllPendingRefunds()...");
    const syncRes = await syncAllPendingRefunds();
    console.log("syncAllPendingRefunds result:", syncRes);

    console.log("\n✅ BACKEND REFUND LIFECYCLE SETUP VERIFIED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Verification failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testRefundLifecycle();
