import express from 'express';
import {
  getDashboardStats,
  getAnalytics,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getPendingVerifications,
  updateVerificationStatus,
  getAllJobs,
  updateJobStatus,
  deleteJob,
  getAllProposals
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(isAdmin);

// Dashboard & Analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Verification Management
router.get('/verifications/pending', getPendingVerifications);
router.put('/verifications/:userId', updateVerificationStatus);

// Job Management
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

// Proposal Management
router.get('/proposals', getAllProposals);

export default router;
