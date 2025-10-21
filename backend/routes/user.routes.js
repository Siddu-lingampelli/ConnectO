import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getUsers,
  getProfile,
  updateProfile,
  getUserById,
  searchProviders,
  searchClients
} from '../controllers/user.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes - Order matters! Specific routes before dynamic :id route
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/search-providers', searchProviders);
router.get('/search-clients', searchClients);

// General users list route (must be before /:id)
router.get('/', getUsers);

// Dynamic ID route (must be last)
router.get('/:id', getUserById);

export default router;
