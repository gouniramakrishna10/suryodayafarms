import dotenv from 'dotenv';
import app from './app.js';
import prisma from './utils/db.js';
import { initShiprocketSyncCron } from './cron/shiprocketSyncCron.js';
import { startPaymentTimeoutWorker } from './workers/paymentTimeoutWorker.js';

// 1. MUST BE VERY FIRST EXECUTABLE STATEMENT BEFORE ANY OTHER CODE
dotenv.config();

// 2. VERIFY & PRINT FAST2SMS CONFIGURATION AT STARTUP
const apiKey = process.env.FAST2SMS_API_KEY;
const messageId = process.env.FAST2SMS_MESSAGE_ID || process.env.FAST2SMS_OTP_TEMPLATE_ID;
const phoneId = process.env.FAST2SMS_PHONE_NUMBER_ID;

console.log("Node:", process.version);
console.log("Prisma:", prisma._clientVersion);
console.log("Platform:", process.platform, process.arch);
console.log("OpenSSL:", process.versions.openssl || "N/A");

console.log("FAST2SMS CONFIG");
console.log({
  apiKeyLoaded: !!apiKey,
  phoneNumberId: phoneId,
  messageId: messageId,
  otpTemplateId: process.env.FAST2SMS_OTP_TEMPLATE_ID
});

// 3. FAIL FAST IF REQUIRED ENV VARS ARE MISSING
if (!apiKey || apiKey.trim() === '') {
  console.error('❌ CRITICAL ERROR: Missing FAST2SMS_API_KEY in .env file!');
}
if (!messageId || messageId.trim() === '') {
  console.error('❌ CRITICAL ERROR: Missing FAST2SMS_MESSAGE_ID in .env file!');
}
if (!phoneId || phoneId.trim() === '') {
  console.error('❌ CRITICAL ERROR: Missing FAST2SMS_PHONE_NUMBER_ID in .env file!');
}

const PORT = process.env.PORT || 3000;

// 4. ASYNC STARTUP FUNCTION - ZERO TOP-LEVEL AWAIT (Hostinger LSNode Compatible)
async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    // Initialize Shiprocket & Razorpay Background Sync Cron Jobs
    try {
      initShiprocketSyncCron();
    } catch (cronErr) {
      console.warn('Failed to initialize Shiprocket sync cron:', cronErr.message);
    }

    // Initialize 10-Minute Payment Timeout Worker
    try {
      startPaymentTimeoutWorker(60000); // Scans every 60 seconds
    } catch (timeoutErr) {
      console.warn('Failed to initialize Payment Timeout Worker:', timeoutErr.message);
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log('\n====================================================');
      console.log('🚀 BACKEND SERVER RUNTIME DETAILS');
      console.log(`PID: ${process.pid}`);
      console.log(`Working Directory: ${process.cwd()}`);
      console.log(`Server File: ${import.meta.url}`);
      console.log(`Node Version: ${process.version}`);
      console.log('====================================================\n');

      console.log('📌 REGISTERED EXPRESS ROUTES:');
      function printRoutes(stack, parentPath = '') {
        (stack || []).forEach(r => {
          if (r.route) {
            const methods = Object.keys(r.route.methods).map(m => m.toUpperCase()).join(', ');
            console.log(`  ${methods} ${parentPath}${r.route.path}`);
          } else if (r.name === 'router' && r.handle.stack) {
            let path = r.regexp.source
              .replace('^\\', '')
              .replace('\\/?(?=\\/|$)', '')
              .replace('(?=\\/|$)', '')
              .replace(/\\\//g, '/');
            if (path.startsWith('/')) path = path.slice(1);
            printRoutes(r.handle.stack, '/' + path);
          }
        });
      }
      if (app._router && app._router.stack) {
        printRoutes(app._router.stack);
      }
    });

  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

// Execute startup function asynchronously with catch block
startServer().catch(console.error);

// Prevent app crash on unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
