import express from 'express';
import {
  generateUserReferralCode,
  validateReferralCode,
  getReferralStats,
  getReferralLeaderboard,
  redeemReferralCredits
} from '../controllers/referral.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Generate referral code for user
router.post('/generate/:userId', authenticate, generateUserReferralCode);

// Validate referral code (public route for signup)
router.get('/validate/:referralCode', validateReferralCode);

// Get referral stats for user
router.get('/stats/:userId', authenticate, getReferralStats);

// Get referral leaderboard (public)
router.get('/leaderboard', getReferralLeaderboard);

// Redeem referral credits
router.post('/redeem/:userId', authenticate, redeemReferralCredits);

export default router;
