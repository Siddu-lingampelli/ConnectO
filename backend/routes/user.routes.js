import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getProfile,
  updateProfile,
  getUserById,
  searchProviders,
  searchClients
} from '../controllers/user.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/search-providers', searchProviders);
router.get('/search-clients', searchClients);
router.get('/:id', getUserById);

export default router;
