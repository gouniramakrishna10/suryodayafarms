import dotenv from 'dotenv';
import app from './app.js';
import prisma from './utils/db.js';
import { initShiprocketSyncCron } from './cron/shiprocketSyncCron.js';

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

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
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
