import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';
import { createServer } from 'http';
import { initializeSocket } from './socket/socketHandler.js';

// Import security middleware
import {
  apiLimiter,
  helmetConfig,
  sanitizeData,
  xssProtection,
  hppProtection,
  ipBlocker,
  corsOptions,
  securityLogger,
  setSecurityHeaders,
  securityErrorHandler
} from './middleware/security.middleware.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import jobRoutes from './routes/job.routes.js';
import proposalRoutes from './routes/proposal.routes.js';
import orderRoutes from './routes/order.routes.js';
import messageRoutes from './routes/message.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import demoRoutes from './routes/demo.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import referralRoutes from './routes/referral.routes.js';
import chatRoutes from './routes/chat.routes.js';
import locationRoutes from './routes/location.routes.js';
import websiteReviewRoutes from './routes/websiteReview.routes.js';
import wishlistRoutes from './routes/wishlist.js';
import followRoutes from './routes/follow.routes.js';
import collaborationRoutes from './routes/collaboration.routes.js';
import roleSwitchRoutes from './routes/roleSwitch.routes.js';
import communityRoutes from './routes/community.routes.js';
import contactRoutes from './routes/contact.routes.js';
import emailRoutes from './routes/email.routes.js';
import communicationRoutes from './routes/communication.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import searchRoutes from './routes/search.routes.js';
import gdprRoutes from './routes/gdpr.routes.js';
import securityRoutes from './routes/security.routes.js';
import cronService from './services/cron.service.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ==================== SECURITY MIDDLEWARE ====================

// 1. Helmet - Set security HTTP headers
app.use(helmetConfig);

// 2. Additional security headers
app.use(setSecurityHeaders);

// 3. CORS with strict configuration
app.use(cors(corsOptions));

// 4. Rate limiting for all API routes
app.use('/api/', apiLimiter);

// 5. IP blocking
app.use(ipBlocker);

// 6. Security logging
app.use(securityLogger);

// 7. Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 8. Data sanitization against NoSQL query injection
app.use(sanitizeData);

// 9. XSS protection
app.use(xssProtection);

// 10. HTTP Parameter Pollution protection
app.use(hppProtection);

// 11. File upload middleware with security
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully to VSConnectO Database');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Connect to Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommend', recommendationRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/website-reviews', websiteReviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/role', roleSwitchRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/security', securityRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'VSConnectO Backend API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 VSConnectO API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      proposals: '/api/proposals',
      orders: '/api/orders',
      messages: '/api/messages',
      wallet: '/api/wallet',
      reviews: '/api/reviews'
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Security error handler
app.use(securityErrorHandler);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
const server = createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Export io for use in controllers
export { io };

server.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔌 Socket.io: Enabled`);
  
  // Initialize cron jobs
  cronService.setupPaymentCrons();
  console.log('⏰ Cron jobs initialized');
});

export default app;
