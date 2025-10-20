import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// Placeholder routes
router.post('/', (req, res) => res.json({ message: 'Create review' }));
router.get('/provider/:providerId', (req, res) => res.json({ message: 'Get provider reviews' }));
router.get('/order/:orderId', (req, res) => res.json({ message: 'Get order review' }));

export default router;
