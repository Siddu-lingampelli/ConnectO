import express from 'express';
import {
  getMyDemo,
  submitDemo,
  getAllDemos,
  assignDemo,
  reviewDemo,
  updateDemoStatus,
  deleteDemo,
  getDemoStats
} from '../controllers/demo.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Freelancer routes (authenticated providers)
router.get('/my-demo', authenticate, getMyDemo);
router.post('/submit', authenticate, submitDemo);

// Admin routes
router.get('/all', authenticate, isAdmin, getAllDemos);
router.get('/stats', authenticate, isAdmin, getDemoStats);
router.post('/assign', authenticate, isAdmin, assignDemo);
router.put('/review/:id', authenticate, isAdmin, reviewDemo);
router.put('/status/:id', authenticate, isAdmin, updateDemoStatus);
router.delete('/:id', authenticate, isAdmin, deleteDemo);

export default router;
