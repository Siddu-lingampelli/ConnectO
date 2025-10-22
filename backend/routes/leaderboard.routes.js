import express from 'express';
import { 
  getLeaderboard, 
  getUserRank, 
  getTopPerformers,
  getLeaderboardStats 
} from '../controllers/leaderboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getLeaderboard);
router.get('/stats', getLeaderboardStats);
router.get('/top-performers', getTopPerformers);

// Protected routes
router.use(authenticate);
router.get('/my-rank/:userId', getUserRank);

export default router;
