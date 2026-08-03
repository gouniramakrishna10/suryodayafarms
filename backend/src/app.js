import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

dotenv.config();

const app = express();

// 0. HTTP Compression (Brotli + Gzip)
app.use(compression({
  threshold: 512,
  level: 6
}));

// Caching headers middleware for public read routes
app.use((req, res, next) => {
  if (req.method === 'GET') {
    if (req.path.startsWith('/api/public') || req.path.startsWith('/api/products') || req.path.startsWith('/api/categories')) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    }
  }
  next();
});

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.get("/products", (req, res) => {
  res.json([{ name: "Test Product" }]);
});

// 1. Security Headers Configuration
app.use(helmet());

// 2. Cross-Origin Resource Sharing with Cookie Credentials
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

// Ensure production domains are always allowed
if (!allowedOrigins.includes('https://suryodayafarms.com')) {
  allowedOrigins.push('https://suryodayafarms.com');
}
if (!allowedOrigins.includes('https://www.suryodayafarms.com')) {
  allowedOrigins.push('https://www.suryodayafarms.com');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or REST client requests with no origin
    if (!origin) return callback(null, true);
    
    const isNgrok = origin.match(/^https?:\/\/[a-zA-Z0-9.-]+\.ngrok-free\.(dev|app)$/) ||
                    origin.match(/^https?:\/\/[a-zA-Z0-9.-]+\.ngrok\.io$/);
    const isLocalhost = origin.match(/^https?:\/\/localhost:\d+$/) ||
                        origin.match(/^https?:\/\/127\.0\.0\.1:\d+$/);

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*') || isNgrok || isLocalhost) {
      return callback(null, true);
    } else {
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Built-in Parsing Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// 4. Rate Limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 5000, // Relax limits in development/production testing
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// 5. System Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV, timestamp: new Date() });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV, timestamp: new Date() });
});

// --- REST Route Integrations ---
import authRoutes from './routes/authRoutes.js';
import fast2smsAuthRoutes from './routes/auth.routes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import shiprocketRoutes from './routes/shiprocketRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import supportRequestRoutes from './routes/supportRequestRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

app.use('/api/auth', authRoutes);            // Sign-in, Register, Profile, Saved Addresses
app.use('/api/auth', fast2smsAuthRoutes);     // Fast2SMS OTP Auth & WhatsApp endpoints (/api/auth/send-otp, /api/auth/verify-otp, etc.)
app.use('/', fast2smsAuthRoutes);            // Fast2SMS Direct Endpoints (/dev/otp/send, /dev/otp/verify, /dev/otp/resend, /dev/whatsapp, etc.)
app.use('/api/products', productRoutes);     // Products catalog, reviews, category lists
app.use('/api/categories', productRoutes);   // Double-bind categories fetching
app.use('/api/cart', orderRoutes);           // Cart item CRUD
app.use('/api/wishlist', orderRoutes);       // Wishlist toggles
app.use('/api/coupons', orderRoutes);        // Coupon validate actions
app.use('/api/orders', orderRoutes);         // Order checkouts, payments, and histories
app.use('/api/admin', adminRoutes);          // Dashboard metrics and administrative edits
app.use('/api/public', publicRoutes);        // Blog chronicle lists, testimonials, contact submit
app.use('/api/support', supportRoutes);      // Order support and customer help tickets
app.use('/api/shiprocket', shiprocketRoutes); // Shiprocket Logistics APIs & Webhooks
app.use('/api', partnerRoutes);              // Become a Partner public submission and admin management routes
app.use('/api', supportRequestRoutes);       // FAQ & Customer Support module routes
app.use('/api', contactRoutes);              // Contact Us module routes




// 6. Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[Error Handler] ${req.method} ${req.url} - Status: ${statusCode} - Error: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
