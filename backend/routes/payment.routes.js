import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { paymentLimiter } from '../middleware/security.middleware.js';
import paymentController from '../controllers/payment.controller.js';

const router = express.Router();

// Public webhook route (no authentication)
router.post('/webhook', paymentController.handleWebhook);

// Protected routes
router.use(authenticate);

// Payment operations with rate limiting
router.post('/create-order', paymentLimiter, paymentController.createPaymentOrder);
router.post('/verify', paymentLimiter, paymentController.verifyPayment);
router.get('/:id', paymentController.getPayment);
router.get('/order/:orderId', paymentController.getOrderPaymentStatus);

// Escrow operations
router.get('/escrow/:orderId', paymentController.getEscrow);
router.post('/release/:orderId', paymentLimiter, paymentController.releasePayment);

// Refund operations
router.post('/refund/request', paymentLimiter, paymentController.requestRefund);
router.get('/refunds', paymentController.getRefunds);

export default router;
