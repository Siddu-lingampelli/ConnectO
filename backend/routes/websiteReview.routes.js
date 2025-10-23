import express from 'express';
import {
  submitReview,
  getApprovedReviews,
  getMyReview,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getReviewStats
} from '../controllers/websiteReview.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/approved', getApprovedReviews); // Get approved reviews for homepage
router.get('/stats', getReviewStats); // Get review statistics

// Protected routes (authenticated users)
router.post('/submit', authenticateToken, submitReview); // Submit or update review
router.get('/my-review', authenticateToken, getMyReview); // Get user's own review
router.delete('/:reviewId', authenticateToken, deleteReview); // Delete own review

// Admin routes
router.get('/all', authenticateToken, authorizeRole('admin'), getAllReviews); // Get all reviews
router.put('/:reviewId/status', authenticateToken, authorizeRole('admin'), updateReviewStatus); // Approve/reject review

export default router;
