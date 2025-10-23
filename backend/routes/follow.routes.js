import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getFollowStats,
  getMutualFollows
} from '../controllers/follow.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Follow/Unfollow routes
router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);

// Get followers and following
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

// Check follow status
router.get('/:userId/status', checkFollowStatus);

// Get follow statistics
router.get('/:userId/stats', getFollowStats);

// Get mutual follows
router.get('/:userId/mutual', getMutualFollows);

export default router;
