import express from 'express';
import { 
  addXP, 
  addBadge, 
  getGamificationStats, 
  awardXP, 
  getAvailableBadges,
  updateLastActive 
} from '../controllers/gamification.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/badges', getAvailableBadges);

// Protected routes
router.use(authenticate);

// Get user's gamification stats
router.get('/stats/:userId', getGamificationStats);

// Add XP to user (manual)
router.post('/add-xp/:userId', addXP);

// Award XP for specific action
router.post('/award-xp/:userId', awardXP);

// Add badge to user
router.post('/add-badge/:userId', addBadge);

// Update last active (daily login bonus)
router.post('/update-active', updateLastActive);

export default router;
