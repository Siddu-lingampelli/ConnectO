import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
} from '../controllers/message.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getMessages);
router.post('/send', sendMessage);
router.put('/read/:conversationId', markAsRead);
router.get('/unread', getUnreadCount);

export default router;
