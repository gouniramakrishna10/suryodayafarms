import app from './app.js';
import prisma from './utils/db.js';

const PORT = process.env.PORT || 3000;

// Start server only after database connects
async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    // Initialize Shiprocket Background Sync Cron Job (Every 5 minutes)
    try {
      const { initShiprocketSyncCron } = await import('./cron/shiprocketSyncCron.js');
      initShiprocketSyncCron();
    } catch (cronErr) {
      console.warn('Failed to initialize Shiprocket sync cron:', cronErr.message);
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

// Server start script - Last updated for Razorpay Live Gateway
startServer();

// Prevent app crash on unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

