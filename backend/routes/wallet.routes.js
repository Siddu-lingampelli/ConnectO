import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// Placeholder routes
router.get('/', (req, res) => res.json({ message: 'Get wallet' }));
router.get('/transactions', (req, res) => res.json({ message: 'Get transactions' }));
router.post('/add-money', (req, res) => res.json({ message: 'Add money' }));
router.post('/withdraw', (req, res) => res.json({ message: 'Withdraw money' }));

export default router;
