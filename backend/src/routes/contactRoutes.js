import express from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../utils/db.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { sendContactAcknowledgementEmail, sendAdminContactNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// Rate limiting for public contact submissions: max 5 requests per 15 minutes per IP
const contactSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many contact messages from this IP address. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

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
// PUBLIC ENDPOINT: SUBMIT CONTACT FORM
// POST /api/public/contact
// =========================================================================
router.post('/public/contact', contactSubmissionLimiter, async (req, res, next) => {
  try {
    const { name, email, phone, subject, category, message, attachment } = req.body;

    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanPhone = sanitizeString(phone);
    const cleanSubject = sanitizeString(subject) || 'General Enquiry';
    const cleanCategory = sanitizeString(category) || 'General Enquiry';
    const cleanMessage = sanitizeString(message);

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory fields (Name, Email, Phone, Message).'
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

    // Save database record
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        category: cleanCategory,
        type: cleanCategory,
        message: cleanMessage,
        attachment: sanitizeString(attachment) || null,
        status: 'NEW',
        adminNotes: null
      }
    });

    // Send emails asynchronously
    Promise.all([
      sendContactAcknowledgementEmail(contactMessage),
      sendAdminContactNotificationEmail(contactMessage)
    ]).catch(err => {
      console.error('Async email error on contact submission:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry successfully received. We will contact you soon.',
      contactMessage
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// ADMIN ENDPOINTS (PROTECTED)
// =========================================================================

// 1. GET ALL CONTACT MESSAGES WITH STATS, SEARCH & FILTERS
// GET /api/admin/contact
router.get('/admin/contact', protect, adminOnly, async (req, res, next) => {
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
        { message: { contains: query, mode: 'insensitive' } }
      ];
    }

    const orderBy = sortBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [contactMessages, totalFiltered, totalAll, newCount, repliedCount, resolvedCount, archivedCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: 'NEW' } }),
      prisma.contactMessage.count({ where: { status: 'REPLIED' } }),
      prisma.contactMessage.count({ where: { status: 'RESOLVED' } }),
      prisma.contactMessage.count({ where: { status: 'ARCHIVED' } })
    ]);

    const stats = {
      total: totalAll,
      newMessages: newCount,
      replied: repliedCount,
      resolved: resolvedCount,
      archived: archivedCount
    };

    const totalPages = Math.ceil(totalFiltered / limitNum) || 1;

    return res.status(200).json({
      success: true,
      contactMessages,
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

// 2. GET SINGLE CONTACT MESSAGE DETAILS
// GET /api/admin/contact/:id
router.get('/admin/contact/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id }
    });

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }

    return res.status(200).json({
      success: true,
      contactMessage
    });
  } catch (error) {
    next(error);
  }
});

// 3. UPDATE CONTACT MESSAGE STATUS & ADMIN NOTES
// PATCH /api/admin/contact/:id
router.patch('/admin/contact/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }

    const updateData = {};
    if (status) {
      const validStatuses = ['NEW', 'REPLIED', 'RESOLVED', 'ARCHIVED'];
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

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Contact message updated successfully.',
      contactMessage: updated
    });
  } catch (error) {
    next(error);
  }
});

// 4. DELETE CONTACT MESSAGE
// DELETE /api/admin/contact/:id
router.delete('/admin/contact/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }

    await prisma.contactMessage.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
