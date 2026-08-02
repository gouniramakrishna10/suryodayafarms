import express from 'express';
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  getWabaDetails,
  getTemplatesList,
  sendWhatsappMessage
} from '../controllers/auth.controller.js';

const router = express.Router();

// 1. SEND OTP ENDPOINTS
router.post('/send-otp', sendOtp);
router.post('/otp/send', sendOtp);
router.post('/dev/otp/send', sendOtp);

// 2. VERIFY OTP ENDPOINTS
router.post('/verify-otp', verifyOtp);
router.post('/otp/verify', verifyOtp);
router.post('/dev/otp/verify', verifyOtp);

// 3. RESEND OTP ENDPOINTS
router.post('/resend-otp', resendOtp);
router.post('/otp/resend', resendOtp);
router.post('/dev/otp/resend', resendOtp);

// 4. GET WABA & TEMPLATES ENDPOINTS (Handles Fast2SMS query parameter type=number or type=template)
router.get('/dev/dlt_manager/whatsapp', (req, res, next) => {
  if (req.query.type === 'template') {
    return getTemplatesList(req, res, next);
  }
  return getWabaDetails(req, res, next);
});

router.get('/waba', getWabaDetails);
router.get('/templates', getTemplatesList);

// 5. SEND WHATSAPP TEMPLATE MESSAGE
router.get('/dev/whatsapp', sendWhatsappMessage);
router.post('/dev/whatsapp', sendWhatsappMessage);
router.post('/send-whatsapp', sendWhatsappMessage);

export default router;
