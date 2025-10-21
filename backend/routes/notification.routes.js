import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications
} from '../controllers/notification.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.put('/mark-all-read', markAllAsRead);

// Clear read notifications
router.delete('/clear-read', clearReadNotifications);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Delete single notification
router.delete('/:id', deleteNotification);

export default router;
