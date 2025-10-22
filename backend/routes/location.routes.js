import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  updateLocation,
  findNearbyProviders,
  getDistance,
  toggleLocationSharing
} from '../controllers/location.controller.js';

const router = express.Router();

// Update user's location (requires authentication)
router.put('/update', authenticate, updateLocation);

// Find nearby service providers (public or authenticated)
router.get('/nearby', findNearbyProviders);

// Get distance between user and provider
router.get('/distance/:providerId', getDistance);

// Toggle location sharing on/off
router.put('/toggle', authenticate, toggleLocationSharing);

export default router;
