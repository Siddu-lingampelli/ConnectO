import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { body, validationResult } from 'express-validator';

// ==================== RATE LIMITING ====================

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again after 15 minutes.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Registration limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: 'Too many accounts created from this IP, please try again after an hour.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: 'Too many password reset requests, please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again after 1 hour.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// File upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Too many file uploads, please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many file upload attempts. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Payment limiter
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 payment attempts per 15 minutes
  message: 'Too many payment attempts, please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many payment attempts. Please contact support if you need assistance.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Message sending limiter
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: 'Too many messages sent, please slow down.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'You are sending messages too quickly. Please slow down.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// ==================== HELMET CONFIGURATION ====================

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://maps.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://maps.googleapis.com', 'wss:', 'ws:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'blob:'],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// ==================== MONGO SANITIZATION ====================

export const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized request on key: ${key}`);
  }
});

// ==================== XSS PROTECTION ====================

// Custom XSS cleaning middleware (since xss-clean is deprecated)
export const xssProtection = (req, res, next) => {
  // Clean request body
  if (req.body) {
    req.body = cleanObject(req.body);
  }
  
  // Clean query parameters
  if (req.query) {
    req.query = cleanObject(req.query);
  }
  
  // Clean URL parameters
  if (req.params) {
    req.params = cleanObject(req.params);
  }
  
  next();
};

function cleanObject(obj) {
  if (typeof obj === 'string') {
    return cleanString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanObject(value);
    }
    return cleaned;
  }
  
  return obj;
}

function cleanString(str) {
  // Remove potentially dangerous characters and patterns
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>/g, ''); // Remove all HTML tags
}

// ==================== HPP PROTECTION ====================

// HTTP Parameter Pollution protection
export const hppProtection = (req, res, next) => {
  // Whitelist parameters that can be duplicated
  const whitelist = ['sort', 'fields', 'tags', 'skills'];
  
  // Clean query parameters
  if (req.query) {
    for (const key in req.query) {
      if (!whitelist.includes(key) && Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }
  
  next();
};

// ==================== IP BLOCKING ====================

const blockedIPs = new Set();
const suspiciousIPs = new Map(); // IP -> { count, timestamp }

export const ipBlocker = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Check if IP is blocked
  if (blockedIPs.has(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Your IP has been blocked due to suspicious activity.'
    });
  }
  
  next();
};

// Track suspicious activity
export const trackSuspiciousActivity = (ip, reason) => {
  const now = Date.now();
  const record = suspiciousIPs.get(ip) || { count: 0, timestamp: now, reasons: [] };
  
  record.count += 1;
  record.reasons.push({ reason, timestamp: now });
  
  // Block IP if too many suspicious activities
  if (record.count >= 10) {
    blockedIPs.add(ip);
    console.warn(`🚫 IP blocked: ${ip} - Reason: Multiple suspicious activities`);
    
    // Auto-unblock after 24 hours
    setTimeout(() => {
      blockedIPs.delete(ip);
      suspiciousIPs.delete(ip);
      console.log(`✅ IP unblocked: ${ip}`);
    }, 24 * 60 * 60 * 1000);
  }
  
  // Reset count after 1 hour
  if (now - record.timestamp > 60 * 60 * 1000) {
    record.count = 1;
    record.timestamp = now;
    record.reasons = [{ reason, timestamp: now }];
  }
  
  suspiciousIPs.set(ip, record);
};

// Manually block IP
export const blockIP = (ip) => {
  blockedIPs.add(ip);
  console.warn(`🚫 IP manually blocked: ${ip}`);
};

// Manually unblock IP
export const unblockIP = (ip) => {
  blockedIPs.delete(ip);
  suspiciousIPs.delete(ip);
  console.log(`✅ IP manually unblocked: ${ip}`);
};

// Get blocked IPs list
export const getBlockedIPs = () => Array.from(blockedIPs);

// Get suspicious IPs list
export const getSuspiciousIPs = () => {
  const result = [];
  suspiciousIPs.forEach((value, key) => {
    result.push({ ip: key, ...value });
  });
  return result;
};

// ==================== INPUT VALIDATION ====================

export const validateRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('role').isIn(['client', 'provider', 'both']).withMessage('Invalid role'),
  body('phone').optional().matches(/^\+?[\d\s\-()]+$/).withMessage('Invalid phone number'),
];

export const validateLogin = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateJobCreation = [
  body('title').trim().notEmpty().withMessage('Job title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('budget').isNumeric().withMessage('Budget must be a number')
    .isFloat({ min: 0 }).withMessage('Budget must be positive'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('type').isIn(['one-time', 'contract', 'full-time']).withMessage('Invalid job type'),
];

export const validateMessage = [
  body('content').trim().notEmpty().withMessage('Message content is required')
    .isLength({ max: 5000 }).withMessage('Message is too long'),
  body('receiverId').notEmpty().withMessage('Receiver ID is required')
    .isMongoId().withMessage('Invalid receiver ID'),
];

export const validatePayment = [
  body('amount').isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('orderId').notEmpty().withMessage('Order ID is required')
    .isMongoId().withMessage('Invalid order ID'),
  body('method').isIn(['card', 'upi', 'netbanking', 'wallet']).withMessage('Invalid payment method'),
];

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Track suspicious activity for repeated validation failures
    const clientIP = req.ip || req.connection.remoteAddress;
    trackSuspiciousActivity(clientIP, 'validation_failure');
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ==================== CORS CONFIGURATION ====================

export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3011',
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// ==================== REQUEST LOGGING ====================

export const securityLogger = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const userAgent = req.get('user-agent');
  
  // Only log security-relevant requests in production or if explicitly enabled
  const shouldLog = process.env.NODE_ENV === 'production' || process.env.ENABLE_SECURITY_LOGS === 'true';
  
  if (shouldLog && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
    console.log(`🔒 [${timestamp}] ${method} ${path} - IP: ${clientIP} - UA: ${userAgent}`);
  }
  
  // Always detect and log suspicious patterns (important for security)
  if (path.includes('..') || path.includes('<script>') || path.includes('admin') && !req.user?.role?.includes('admin')) {
    trackSuspiciousActivity(clientIP, `suspicious_path: ${path}`);
    console.warn(`⚠️ Suspicious request detected from ${clientIP}: ${path}`);
  }
  
  next();
};

// ==================== SECURITY HEADERS ====================

export const setSecurityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(self), camera=(self)');
  
  next();
};

// ==================== ERROR HANDLING ====================

export const securityErrorHandler = (err, req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Log security errors
  console.error(`🚨 Security Error from ${clientIP}:`, err.message);
  
  // Track suspicious activity for security errors
  if (err.name === 'UnauthorizedError' || err.message.includes('CORS')) {
    trackSuspiciousActivity(clientIP, err.message);
  }
  
  // Don't expose internal errors
  res.status(err.status || 500).json({
    success: false,
    message: err.status === 500 ? 'Internal server error' : err.message
  });
};

export default {
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  uploadLimiter,
  paymentLimiter,
  messageLimiter,
  helmetConfig,
  sanitizeData,
  xssProtection,
  hppProtection,
  ipBlocker,
  trackSuspiciousActivity,
  blockIP,
  unblockIP,
  getBlockedIPs,
  getSuspiciousIPs,
  validateRegistration,
  validateLogin,
  validateJobCreation,
  validateMessage,
  validatePayment,
  handleValidationErrors,
  corsOptions,
  securityLogger,
  setSecurityHeaders,
  securityErrorHandler
};
