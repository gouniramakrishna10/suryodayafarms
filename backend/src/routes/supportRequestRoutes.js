import express from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../utils/db.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { sendCustomerSupportConfirmationEmail, sendAdminSupportNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// Rate limiting for public support request submissions: max 5 requests per 15 minutes per IP
const supportSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many support requests from this IP address. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper for input sanitization
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[+\d\s-]{7,20}$/;
  return phoneRegex.test(phone);
};

// =========================================================================
// PUBLIC ENDPOINT: SUBMIT CUSTOMER SUPPORT REQUEST
// POST /api/public/support-request
// =========================================================================
router.post('/public/support-request', supportSubmissionLimiter, async (req, res, next) => {
  try {
    const { name, email, phone, subject, category, message, orderNumber, attachment } = req.body;

    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanPhone = sanitizeString(phone);
    const cleanSubject = sanitizeString(subject);
    const cleanCategory = sanitizeString(category);
    const cleanMessage = sanitizeString(message);

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanSubject || !cleanCategory || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory fields (Name, Email, Phone, Subject, Category, Message).'
      });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number.'
      });
    }

    // Create record
    const supportRequest = await prisma.supportRequest.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        category: cleanCategory,
        message: cleanMessage,
        orderNumber: sanitizeString(orderNumber) || null,
        attachment: sanitizeString(attachment) || null,
        status: 'NEW',
        adminNotes: null
      }
    });

    // Send emails asynchronously
    Promise.all([
      sendCustomerSupportConfirmationEmail(supportRequest),
      sendAdminSupportNotificationEmail(supportRequest)
    ]).catch(err => {
      console.error('Async email error on support request:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Support request received successfully. Our team will contact you shortly.',
      supportRequest
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// ADMIN ENDPOINTS (PROTECTED)
// =========================================================================

// 1. GET ALL SUPPORT REQUESTS WITH STATS, SEARCH & FILTERS
// GET /api/admin/support-requests
router.get('/admin/support-requests', protect, adminOnly, async (req, res, next) => {
  try {
    const {
      search,
      status,
      category,
      sortBy = 'newest',
      page = 1,
      limit = 15
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (category && category !== 'ALL') {
      where.category = {
        equals: category,
        mode: 'insensitive'
      };
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { subject: { contains: query, mode: 'insensitive' } },
        { orderNumber: { contains: query, mode: 'insensitive' } },
        { message: { contains: query, mode: 'insensitive' } }
      ];
    }

    const orderBy = sortBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [supportRequests, totalFiltered, totalAll, newCount, inProgressCount, resolvedCount, closedCount] = await Promise.all([
      prisma.supportRequest.findMany({
        where,
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.supportRequest.count({ where }),
      prisma.supportRequest.count(),
      prisma.supportRequest.count({ where: { status: 'NEW' } }),
      prisma.supportRequest.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportRequest.count({ where: { status: 'RESOLVED' } }),
      prisma.supportRequest.count({ where: { status: 'CLOSED' } })
    ]);

    const stats = {
      total: totalAll,
      newRequests: newCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      closed: closedCount
    };

    const totalPages = Math.ceil(totalFiltered / limitNum) || 1;

    return res.status(200).json({
      success: true,
      supportRequests,
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

// 2. GET SINGLE SUPPORT REQUEST DETAILS
// GET /api/admin/support-requests/:id
router.get('/admin/support-requests/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    const supportRequest = await prisma.supportRequest.findUnique({
      where: { id }
    });

    if (!supportRequest) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found.'
      });
    }

    return res.status(200).json({
      success: true,
      supportRequest
    });
  } catch (error) {
    next(error);
  }
});

// 3. UPDATE SUPPORT REQUEST STATUS & INTERNAL ADMIN NOTES
// PATCH /api/admin/support-requests/:id
router.patch('/admin/support-requests/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const existing = await prisma.supportRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found.'
      });
    }

    const updateData = {};
    if (status) {
      const validStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
      const upperStatus = status.toUpperCase();
      if (!validStatuses.includes(upperStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      updateData.status = upperStatus;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes ? sanitizeString(adminNotes) : null;
    }

    const updated = await prisma.supportRequest.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Support request updated successfully.',
      supportRequest: updated
    });
  } catch (error) {
    next(error);
  }
});

// 4. DELETE SUPPORT REQUEST
// DELETE /api/admin/support-requests/:id
router.delete('/api/admin/support-requests/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.supportRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found.'
      });
    }

    await prisma.supportRequest.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Support request deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
