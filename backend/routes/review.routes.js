import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createReview,
  getProviderReviews,
  getOrderReview,
  updateReview,
  deleteReview,
  addReviewResponse
} from '../controllers/review.controller.js';

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getProviderReviews);

// Protected routes
router.use(authenticate);

router.post('/', createReview);
router.get('/order/:orderId', getOrderReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/response', addReviewResponse);

export default router;
