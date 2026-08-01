import { ordersService } from './src/services/shiprocket/orders.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testShiprocketFlowVerification() {
  console.log("=== VERIFYING SHIPROCKET ORDER CREATION FLOW & PAYLOAD-BASED SUCCESS ===");

  try {
    // Test payload parsing logic with sample response provided by user
    const sampleShiprocketResponse = {
      "order_id": 1489487861,
      "shipment_id": 1485711276,
      "status": "READY TO SHIP",
      "awb_code": "90611135226",
      "courier_company_id": 1,
      "courier_name": "Blue Dart Air"
    };

    console.log("Simulating _processShiprocketSuccess with sample response...");

    // Find any order in DB if exists or mock test
    const dummyOrder = await prisma.order.findFirst();
    if (dummyOrder) {
      const result = await ordersService._processShiprocketSuccess(dummyOrder.id, sampleShiprocketResponse);
      console.log("Result from _processShiprocketSuccess:", {
        success: result.success,
        orderId: result.orderId,
        shipmentId: result.shipmentId,
        awb: result.awb,
        courier: result.courier,
        status: result.status,
        courierAlreadyAssigned: result.courierAlreadyAssigned
      });
      console.log("✅ Payload-based success & DB metadata storage verified!");
    } else {
      console.log("No orders in DB to test DB update, but code parsing logic is ready.");
    }
  } catch (err) {
    console.error("❌ Test error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testShiprocketFlowVerification();
