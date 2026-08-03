import express from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../utils/db.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { sendApplicantConfirmationEmail, sendAdminPartnerNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// Rate limiting for public partner request submissions: max 5 requests per 15 minutes
const partnerSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many partnership requests from this IP address. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper for input sanitization
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

// Simple email format validator
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Simple phone format validator
const isValidPhone = (phone) => {
  const phoneRegex = /^[+\d\s-]{7,20}$/;
  return phoneRegex.test(phone);
};

// =========================================================================
// PUBLIC ENDPOINT: SUBMIT PARTNER REQUEST
// POST /api/public/partner-request
// =========================================================================
router.post('/public/partner-request', partnerSubmissionLimiter, async (req, res, next) => {
  try {
    const {
      name,
      companyName,
      businessType,
      gstNumber,
      email,
      phone,
      country,
      state,
      city,
      website,
      partnershipType,
      yearsInBusiness,
      monthlyRequirement,
      businessDescription,
      message,
      agreeToContact
    } = req.body;

    // 1. Required fields validation
    const cleanName = sanitizeString(name);
    const cleanCompanyName = sanitizeString(companyName);
    const cleanBusinessType = sanitizeString(businessType);
    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanPhone = sanitizeString(phone);
    const cleanCountry = sanitizeString(country);
    const cleanState = sanitizeString(state);
    const cleanCity = sanitizeString(city);
    const cleanPartnershipType = sanitizeString(partnershipType);

    if (!cleanName || !cleanCompanyName || !cleanBusinessType || !cleanEmail || !cleanPhone || !cleanCountry || !cleanState || !cleanCity || !cleanPartnershipType) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Name, Company Name, Business Type, Email, Phone, Country, State, City, Partnership Type).'
      });
    }

    // 2. Email & Phone syntax validation
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number (digits, optional + and spaces).'
      });
    }

    // 3. Prevent duplicate submissions within configurable cooldown period (15 minutes)
    const cooldownThreshold = new Date(Date.now() - 15 * 60 * 1000);
    const existingRecentRequest = await prisma.partnerRequest.findFirst({
      where: {
        email: cleanEmail,
        createdAt: { gte: cooldownThreshold }
      }
    });

    if (existingRecentRequest) {
      return res.status(429).json({
        success: false,
        message: 'A partnership request with this email was submitted recently. Please wait 15 minutes before submitting another request.'
      });
    }

    // 4. Create database record
    const partnerRequest = await prisma.partnerRequest.create({
      data: {
        name: cleanName,
        companyName: cleanCompanyName,
        businessType: cleanBusinessType,
        gstNumber: sanitizeString(gstNumber) || null,
        email: cleanEmail,
        phone: cleanPhone,
        country: cleanCountry,
        state: cleanState,
        city: cleanCity,
        website: sanitizeString(website) || null,
        partnershipType: cleanPartnershipType,
        yearsInBusiness: sanitizeString(yearsInBusiness) || null,
        monthlyRequirement: sanitizeString(monthlyRequirement) || null,
        businessDescription: sanitizeString(businessDescription) || null,
        message: sanitizeString(message) || null,
        status: 'NEW',
        notes: null
      }
    });

    // 5. Send emails asynchronously
    Promise.all([
      sendApplicantConfirmationEmail(partnerRequest),
      sendAdminPartnerNotificationEmail(partnerRequest)
    ]).catch(err => {
      console.error('Async email notification error on partner request:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Partnership request submitted successfully. Our team will contact you soon.',
      partnerRequest
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// ADMIN ENDPOINTS (PROTECTED)
// =========================================================================

// 1. GET ALL PARTNER REQUESTS WITH STATS, SEARCH & FILTERS
// GET /api/admin/partner-requests
router.get('/admin/partner-requests', protect, adminOnly, async (req, res, next) => {
  try {
    const {
      search,
      status,
      partnershipType,
      sortBy = 'newest',
      page = 1,
      limit = 15
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    // Build filter criteria
    const where = {};

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (partnershipType && partnershipType !== 'ALL') {
      where.partnershipType = {
        equals: partnershipType,
        mode: 'insensitive'
      };
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { companyName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { state: { contains: query, mode: 'insensitive' } },
        { businessType: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Determine sort order
    const orderBy = sortBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    // Concurrently fetch requests list, count, and overall stats breakdown
    const [partnerRequests, totalFiltered, totalAll, newCount, contactedCount, approvedCount, rejectedCount, archivedCount] = await Promise.all([
      prisma.partnerRequest.findMany({
        where,
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.partnerRequest.count({ where }),
      prisma.partnerRequest.count(),
      prisma.partnerRequest.count({ where: { status: 'NEW' } }),
      prisma.partnerRequest.count({ where: { status: 'CONTACTED' } }),
      prisma.partnerRequest.count({ where: { status: 'APPROVED' } }),
      prisma.partnerRequest.count({ where: { status: 'REJECTED' } }),
      prisma.partnerRequest.count({ where: { status: 'ARCHIVED' } })
    ]);

    const stats = {
      total: totalAll,
      newRequests: newCount,
      contacted: contactedCount,
      approved: approvedCount,
      rejected: rejectedCount,
      archived: archivedCount
    };

    const totalPages = Math.ceil(totalFiltered / limitNum) || 1;

    return res.status(200).json({
      success: true,
      partnerRequests,
      stats,
      pagination: {
        totalItems: totalFiltered,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET SINGLE PARTNER REQUEST DETAILS
// GET /api/admin/partner-requests/:id
router.get('/admin/partner-requests/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    const partnerRequest = await prisma.partnerRequest.findUnique({
      where: { id }
    });

    if (!partnerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Partner request not found.'
      });
    }

    return res.status(200).json({
      success: true,
      partnerRequest
    });
  } catch (error) {
    next(error);
  }
});

// 3. UPDATE PARTNER REQUEST STATUS & INTERNAL NOTES
// PATCH /api/admin/partner-requests/:id
router.patch('/admin/partner-requests/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const existing = await prisma.partnerRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Partner request not found.'
      });
    }

    const updateData = {};
    if (status) {
      const validStatuses = ['NEW', 'CONTACTED', 'APPROVED', 'REJECTED', 'ARCHIVED'];
      const upperStatus = status.toUpperCase();
      if (!validStatuses.includes(upperStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      updateData.status = upperStatus;
    }

    if (notes !== undefined) {
      updateData.notes = notes ? sanitizeString(notes) : null;
    }

    const updated = await prisma.partnerRequest.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Partner request updated successfully.',
      partnerRequest: updated
    });
  } catch (error) {
    next(error);
  }
});

// 4. DELETE PARTNER REQUEST
// DELETE /api/admin/partner-requests/:id
router.delete('/admin/partner-requests/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.partnerRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Partner request not found.'
      });
    }

    await prisma.partnerRequest.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Partner request deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
