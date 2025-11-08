import express from 'express';
import {
  getProviderEarnings,
  getProviderPerformance,
  getRevenueReports,
  getRealTimeStats,
  getComprehensiveAnalytics
} from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// ==================== PROVIDER ANALYTICS ====================
// @route   GET /api/analytics/provider/earnings
// @desc    Get provider earnings analytics
// @access  Private (Provider only)
router.get('/provider/earnings', authenticate, getProviderEarnings);

// @route   GET /api/analytics/provider/performance
// @desc    Get provider performance metrics
// @access  Private (Provider only)
router.get('/provider/performance', authenticate, getProviderPerformance);

// ==================== ADMIN ANALYTICS ====================
// @route   GET /api/admin/revenue-reports
// @desc    Get platform revenue reports
// @access  Private (Admin only)
router.get('/admin/revenue-reports', authenticate, isAdmin, getRevenueReports);

// @route   GET /api/analytics/real-time
// @desc    Get real-time platform statistics
// @access  Private (Admin only)
router.get('/real-time', authenticate, isAdmin, getRealTimeStats);

// @route   GET /api/admin/analytics/comprehensive
// @desc    Get comprehensive admin analytics
// @access  Private (Admin only)
router.get('/admin/comprehensive', authenticate, isAdmin, getComprehensiveAnalytics);

export default router;
