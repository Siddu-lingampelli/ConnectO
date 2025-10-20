import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  submitVerification,
  getVerificationStatus,
  approveVerification,
  rejectVerification,
  getPendingVerifications
} from '../controllers/verification.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/submit', submitVerification);
router.get('/status', getVerificationStatus);

// Admin routes (TODO: Add admin middleware)
router.get('/pending', getPendingVerifications);
router.put('/approve/:userId', approveVerification);
router.put('/reject/:userId', rejectVerification);

export default router;
