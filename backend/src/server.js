import dotenv from 'dotenv';

// 1. MUST BE VERY FIRST EXECUTABLE STATEMENT BEFORE ANY OTHER IMPORTS
dotenv.config();

// 2. VERIFY & PRINT FAST2SMS CONFIGURATION AT STARTUP
const apiKey = process.env.FAST2SMS_API_KEY;
const messageId = process.env.FAST2SMS_MESSAGE_ID || process.env.FAST2SMS_OTP_TEMPLATE_ID;
const phoneId = process.env.FAST2SMS_PHONE_NUMBER_ID;

console.log("FAST2SMS CONFIG");
console.log({
  apiKeyLoaded: !!process.env.FAST2SMS_API_KEY,
  phoneNumberId: process.env.FAST2SMS_PHONE_NUMBER_ID,
  messageId: process.env.FAST2SMS_MESSAGE_ID,
  otpTemplateId: process.env.FAST2SMS_OTP_TEMPLATE_ID
});

// 3. FAIL FAST IF REQUIRED ENV VARS ARE MISSING
if (!apiKey || apiKey.trim() === '') {
  console.error('❌ CRITICAL ERROR: Missing FAST2SMS_API_KEY in .env file!');
  throw new Error('Missing FAST2SMS_API_KEY. Server startup aborted.');
}

if (!messageId || messageId.trim() === '') {
  console.error('❌ CRITICAL ERROR: Missing FAST2SMS_MESSAGE_ID in .env file!');
  throw new Error('Missing FAST2SMS_MESSAGE_ID / FAST2SMS_OTP_TEMPLATE_ID. Server startup aborted.');
}

if (!phoneId || phoneId.trim() === '') {
  console.error('❌ CRITICAL ERROR: Missing FAST2SMS_PHONE_NUMBER_ID in .env file!');
  throw new Error('Missing FAST2SMS_PHONE_NUMBER_ID. Server startup aborted.');
}

// 4. DYNAMICALLY IMPORT APP & PRISMA AFTER DOTENV INITIALIZATION
const { default: app } = await import('./app.js');
const { default: prisma } = await import('./utils/db.js');

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

startServer();

// Prevent app crash on unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
