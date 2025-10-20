import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// Placeholder routes - implement controllers as needed
router.post('/', authorize('provider'), (req, res) => res.json({ message: 'Create proposal' }));
router.get('/my-proposals', authorize('provider'), (req, res) => res.json({ message: 'Get my proposals' }));
router.get('/job/:jobId', (req, res) => res.json({ message: 'Get proposals for job' }));
router.put('/:id', authorize('provider'), (req, res) => res.json({ message: 'Update proposal' }));
router.delete('/:id', authorize('provider'), (req, res) => res.json({ message: 'Delete proposal' }));

export default router;
