import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  submitVerification,
  getVerificationStatus,
  approveVerification,
  rejectVerification,
  getPendingVerifications,
  // ID Verification
  submitIdVerification,
  reviewIdVerification,
  getPendingIdVerifications,
  // Background Check
  requestBackgroundCheck,
  updateBackgroundCheck,
  // Skill Certifications
  addSkillCertification,
  verifySkillCertification,
  deleteSkillCertification,
  // Overview
  getVerificationOverview,
  getAllVerifications
} from '../controllers/verification.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==== Basic Verification Routes ====
router.post('/submit', submitVerification);
router.get('/status', getVerificationStatus);

// Admin routes (TODO: Add admin middleware)
router.get('/pending', getPendingVerifications);
router.put('/approve/:userId', approveVerification);
router.put('/reject/:userId', rejectVerification);

// ==== ID Verification Routes ====
router.post('/id', submitIdVerification);
router.put('/id/:userId/review', reviewIdVerification); // Admin
router.get('/id/pending', getPendingIdVerifications); // Admin

// ==== Background Check Routes ====
router.post('/background-check/:userId', requestBackgroundCheck); // Admin
router.put('/background-check/:userId', updateBackgroundCheck); // Admin

// ==== Skill Certifications Routes ====
router.post('/certifications', addSkillCertification);
router.put('/certifications/:userId/:certId/verify', verifySkillCertification); // Admin
router.delete('/certifications/:certId', deleteSkillCertification);

// ==== Overview & Admin Management ====
router.get('/overview', getVerificationOverview);
router.get('/all', getAllVerifications); // Admin

export default router;
