import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';
import whatsappService from '../services/whatsapp.service.js';

// Configuration Defaults
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY || '5', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_RESEND_LIMIT = parseInt(process.env.OTP_RESEND_LIMIT || '5', 10);
const RESEND_COOLDOWN_SECONDS = 30;

// Helper to mask mobile number for safe audit logging (e.g. "98****3210")
function maskMobile(mobile) {
  if (!mobile || mobile.length < 10) return '**********';
  return `${mobile.slice(0, 2)}****${mobile.slice(-4)}`;
}

// Helper to validate Indian 10-digit mobile number
function isValidMobile(mobile) {
  if (!mobile) return false;
  const cleaned = String(mobile).replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

// Helper to generate secure random 6-digit numeric OTP
function generateNumericOtp() {
  return String(crypto.randomInt(100000, 999999));
}

// Helper: Generate JWT Token and set HTTP-only cookie
function createAndSendTokenResponse(user, statusCode, req, res, message = 'Authenticated successfully') {
  const token = jwt.sign(
    { id: user.id, role: user.role, mobile: user.mobile || null },
    process.env.JWT_SECRET || 'suryodaya_sacred_secret_key_2026_nature',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user.id,
      name: user.name || `Customer ${user.mobile ? user.mobile.slice(-4) : ''}`,
      email: user.email || null,
      mobile: user.mobile || null,
      role: user.role,
      walletBalance: user.walletBalance || 0
    }
  });
}

/**
 * 1. SEND OTP (Generated & Hashed by Backend, Delivered via Fast2SMS WhatsApp)
 * POST /api/auth/send-otp
 */
export async function sendOtp(req, res, next) {
  const startTime = Date.now();
  const { mobile } = req.body;

  try {
    const cleanedMobile = String(mobile || '').replace(/\D/g, '');

    if (!isValidMobile(cleanedMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number. Please provide a valid 10-digit Indian mobile number.'
      });
    }

    // Check existing OTP record for 30s resend cooldown
    const existingOtp = await prisma.otpVerification.findUnique({
      where: { mobile: cleanedMobile }
    });

    if (existingOtp) {
      const secondsSinceLastUpdate = (Date.now() - existingOtp.updatedAt.getTime()) / 1000;
      if (secondsSinceLastUpdate < RESEND_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastUpdate);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate secure 6-digit OTP & bcrypt hash
    const plainOtp = generateNumericOtp();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(plainOtp, salt);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Upsert OTP record in database
    await prisma.otpVerification.upsert({
      where: { mobile: cleanedMobile },
      create: {
        mobile: cleanedMobile,
        hashedOtp,
        attempts: 0,
        resendCount: 0,
        expiresAt
      },
      update: {
        hashedOtp,
        attempts: 0,
        expiresAt,
        updatedAt: new Date()
      }
    });

    // Send OTP through Fast2SMS WhatsApp Template API
    await whatsappService.sendOtp({
      mobile: cleanedMobile,
      otp: plainOtp
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [WhatsApp OTP Sent] Mobile: ${maskMobile(cleanedMobile)}, Expiry: ${OTP_EXPIRY_MINUTES}m, Time: ${duration}ms`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully via WhatsApp.'
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Send OTP Error] Time: ${duration}ms, Error: ${error.message}`);
    if (error.stack) console.error(error.stack);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to send WhatsApp OTP'
    });
  }
}

/**
 * 2. VERIFY OTP (Bcrypt Hash Comparison, User Auto-Creation, JWT Token Generation)
 * POST /api/auth/verify-otp
 */
export async function verifyOtp(req, res, next) {
  const startTime = Date.now();
  const { mobile, otp } = req.body;

  try {
    const cleanedMobile = String(mobile || '').replace(/\D/g, '');
    const cleanedOtp = String(otp || '').trim();

    if (!isValidMobile(cleanedMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number. Must be a 10-digit Indian mobile number.'
      });
    }

    if (!cleanedOtp || cleanedOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required and must be a 6-digit code.'
      });
    }

    // Find OTP record in database
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { mobile: cleanedMobile }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      });
    }

    // 1. Check Expiry (5 minutes)
    if (Date.now() > otpRecord.expiresAt.getTime()) {
      await prisma.otpVerification.delete({ where: { id: otpRecord.id } }).catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // 2. Check Maximum Verification Attempt Limit (5 attempts)
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.otpVerification.delete({ where: { id: otpRecord.id } }).catch(() => {});
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts reached. Please request a new OTP.'
      });
    }

    // 3. Compare Bcrypt Hash
    const isOtpValid = await bcrypt.compare(cleanedOtp, otpRecord.hashedOtp);

    if (!isOtpValid) {
      // Increment attempt counter
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } }
      });

      console.warn(`❌ [OTP Failed] Invalid OTP attempt (${otpRecord.attempts + 1}/${OTP_MAX_ATTEMPTS}) for ${maskMobile(cleanedMobile)}`);
      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. ${OTP_MAX_ATTEMPTS - (otpRecord.attempts + 1)} attempts remaining.`
      });
    }

    // 4. Delete OTP Record upon successful verification
    await prisma.otpVerification.delete({ where: { id: otpRecord.id } }).catch(() => {});

    console.log(`✅ [OTP Verified] Mobile: ${maskMobile(cleanedMobile)}, ResponseTime: ${Date.now() - startTime}ms`);

    // 5. User Account Authentication & Auto-Creation Logic
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile: cleanedMobile },
          { email: `${cleanedMobile}@suryodayafarms.com` }
        ]
      }
    });

    if (user) {
      // Update mobile number if missing
      if (!user.mobile) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { mobile: cleanedMobile }
        });
      }
      console.log(`🔑 [User Login] Existing customer logged in: ${user.id} (${maskMobile(cleanedMobile)})`);
    } else {
      // Create new customer account with default wallet balance
      user = await prisma.user.create({
        data: {
          mobile: cleanedMobile,
          name: `Customer ${cleanedMobile.slice(-4)}`,
          email: `${cleanedMobile}@suryodayafarms.com`,
          walletBalance: 0,
          role: 'CUSTOMER'
        }
      });

      console.log(`🆕 [User Registered] Created new customer account: ${user.id} (${maskMobile(cleanedMobile)})`);

      // Create welcome notification
      try {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Welcome to Suryodaya Farms!',
            message: 'Explore our catalog and enjoy native unrefined organic harvest.'
          }
        });
      } catch (notifErr) {
        console.error('Failed to create welcome notification:', notifErr.message);
      }

      // Trigger Meta WhatsApp Welcome Notification (welcome_new_user)
      whatsappService.sendWelcome(user).catch(err => console.error('[WhatsApp Service] Welcome error:', err));
    }

    // Generate JWT & send response
    return createAndSendTokenResponse(user, 200, req, res, 'OTP verified successfully');

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Verify OTP Error] Time: ${duration}ms, Error: ${error.message}`);
    if (error.stack) console.error(error.stack);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'OTP verification failed'
    });
  }
}

/**
 * 3. RESEND OTP (Generates New OTP, Replaces Old Hash, Resets Expiry, Delivers via WhatsApp)
 * POST /api/auth/resend-otp
 */
export async function resendOtp(req, res, next) {
  const startTime = Date.now();
  const { mobile } = req.body;

  try {
    const cleanedMobile = String(mobile || '').replace(/\D/g, '');

    if (!isValidMobile(cleanedMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number. Must be a 10-digit Indian mobile number.'
      });
    }

    const existingOtp = await prisma.otpVerification.findUnique({
      where: { mobile: cleanedMobile }
    });

    // Check Resend Attempt Limit (Max 5 resends)
    if (existingOtp && existingOtp.resendCount >= OTP_RESEND_LIMIT) {
      console.warn(`⚠️ [Resend Limit Exceeded] Mobile: ${maskMobile(cleanedMobile)} reached max ${OTP_RESEND_LIMIT} resends`);
      return res.status(429).json({
        success: false,
        message: `Maximum resend limit reached (${OTP_RESEND_LIMIT} attempts). Please try again later.`
      });
    }

    // Check 30-second Cooldown
    if (existingOtp) {
      const secondsSinceLastUpdate = (Date.now() - existingOtp.updatedAt.getTime()) / 1000;
      if (secondsSinceLastUpdate < RESEND_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastUpdate);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate NEW 6-digit OTP & bcrypt hash
    const plainOtp = generateNumericOtp();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(plainOtp, salt);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const newResendCount = (existingOtp?.resendCount || 0) + 1;

    // Upsert updated OTP record
    await prisma.otpVerification.upsert({
      where: { mobile: cleanedMobile },
      create: {
        mobile: cleanedMobile,
        hashedOtp,
        attempts: 0,
        resendCount: 1,
        expiresAt
      },
      update: {
        hashedOtp,
        attempts: 0,
        resendCount: newResendCount,
        expiresAt,
        updatedAt: new Date()
      }
    });

    // Deliver NEW OTP via Fast2SMS WhatsApp Template API
    await fast2smsService.sendWhatsappOtp({
      mobile: cleanedMobile,
      otp: plainOtp
    });

    const duration = Date.now() - startTime;
    console.log(`🔄 [WhatsApp OTP Resent] Mobile: ${maskMobile(cleanedMobile)}, ResendCount: ${newResendCount}/${OTP_RESEND_LIMIT}, Time: ${duration}ms`);

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully via WhatsApp.'
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Resend OTP Error] Time: ${duration}ms, Error: ${error.message}`);
    if (error.stack) console.error(error.stack);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to resend WhatsApp OTP'
    });
  }
}

/**
 * 4. GET WABA DETAILS
 * GET /dev/dlt_manager/whatsapp?type=number or GET /api/auth/waba
 */
export async function getWabaDetails(req, res, next) {
  try {
    const result = await fast2smsService.getWaba();
    return res.status(200).json(result);
  } catch (error) {
    console.error('[WABA Fetch Error]:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch WABA details'
    });
  }
}

/**
 * 5. GET WHATSAPP TEMPLATE DETAILS
 * GET /dev/dlt_manager/whatsapp?type=template or GET /api/auth/templates
 */
export async function getTemplatesList(req, res, next) {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const result = await fast2smsService.getTemplates(forceRefresh);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Templates Fetch Error]:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch WhatsApp templates'
    });
  }
}

/**
 * 6. SEND GENERAL WHATSAPP TEMPLATE MESSAGE
 * GET/POST /dev/whatsapp or POST /api/auth/send-whatsapp
 */
export async function sendWhatsappMessage(req, res, next) {
  try {
    const payload = req.method === 'GET' ? req.query : req.body;
    const { message_id, phone_number_id, numbers, variables_values, media_url, document_filename, udf1, udf2, udf3 } = payload;

    if (!numbers) {
      return res.status(400).json({
        status: false,
        message: 'numbers parameter is required.'
      });
    }

    const result = await fast2smsService.sendWhatsappTemplate({
      message_id,
      phone_number_id,
      numbers,
      variables_values,
      media_url,
      document_filename,
      udf1,
      udf2,
      udf3
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('[WhatsApp Send Error]:', error);
    return res.status(error.statusCode || 500).json({
      status: false,
      message: error.message || 'Failed to send WhatsApp message'
    });
  }
}

export default {
  sendOtp,
  verifyOtp,
  resendOtp,
  getWabaDetails,
  getTemplatesList,
  sendWhatsappMessage
};
