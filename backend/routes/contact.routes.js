import express from 'express';
import {
  submitContactForm,
  getContactSubmissions,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
} from '../controllers/contactController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route
router.post('/', submitContactForm);

// Admin routes
router.get('/', authenticate, authorize('admin'), getContactSubmissions);
router.get('/stats', authenticate, authorize('admin'), getContactStats);
router.get('/:id', authenticate, authorize('admin'), getContactById);
router.put('/:id', authenticate, authorize('admin'), updateContactStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteContact);

export default router;
