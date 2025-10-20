import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getMyOrders,
  getOrder,
  updateOrderStatus,
  acceptDelivery,
  cancelOrder,
  addMilestone,
  completeMilestone,
  getOrderStats
} from '../controllers/order.controller.js';

const router = express.Router();
router.use(authenticate);

// Order routes
router.get('/my-orders', getMyOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrder);

// Provider routes
router.put('/:id/status', authorize('provider'), updateOrderStatus);
router.post('/:id/milestones', authorize('provider'), addMilestone);
router.put('/:id/milestones/:milestoneId', authorize('provider'), completeMilestone);

// Client routes
router.put('/:id/accept-delivery', authorize('client'), acceptDelivery);

// Both can cancel
router.put('/:id/cancel', cancelOrder);

export default router;
