import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { messageLimiter } from '../middleware/security.middleware.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  updateOnlineStatus,
  updateTypingStatus,
  getUserStatus,
  uploadAttachment
} from '../controllers/message.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes with rate limiting
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getMessages);
router.post('/send', messageLimiter, sendMessage);
router.put('/read/:conversationId', markAsRead);
router.get('/unread', getUnreadCount);

// Status routes
router.put('/status/online', updateOnlineStatus);
router.put('/status/typing', updateTypingStatus);
router.get('/status/:userId', getUserStatus);

// File upload
router.post('/upload', uploadAttachment);

export default router;
