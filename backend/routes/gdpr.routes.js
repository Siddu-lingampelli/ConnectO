import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as gdprController from '../controllers/gdpr.controller.js';

const router = express.Router();

// ==================== AUDIT LOGS ====================

// @route   GET /api/gdpr/audit-logs
// @desc    Get user's audit logs
// @access  Private
router.get('/audit-logs', authenticate, gdprController.getAuditLogs);

// @route   GET /api/gdpr/audit-logs/stats
// @desc    Get audit log statistics
// @access  Private
router.get('/audit-logs/stats', authenticate, gdprController.getAuditLogStats);

// ==================== DATA EXPORT ====================

// @route   POST /api/gdpr/export-data
// @desc    Request data export
// @access  Private
router.post('/export-data', authenticate, gdprController.requestDataExport);

// @route   GET /api/gdpr/exports
// @desc    Get user's data exports
// @access  Private
router.get('/exports', authenticate, gdprController.getDataExports);

// @route   GET /api/gdpr/download-export/:exportId
// @desc    Download data export
// @access  Private
router.get('/download-export/:exportId', authenticate, gdprController.downloadDataExport);

// ==================== ACCOUNT DELETION ====================

// @route   POST /api/gdpr/delete-account
// @desc    Request account deletion
// @access  Private
router.post('/delete-account', authenticate, gdprController.requestAccountDeletion);

// @route   POST /api/gdpr/cancel-deletion
// @desc    Cancel account deletion request
// @access  Private
router.post('/cancel-deletion', authenticate, gdprController.cancelAccountDeletion);

// @route   GET /api/gdpr/deletion-status
// @desc    Get account deletion status
// @access  Private
router.get('/deletion-status', authenticate, gdprController.getAccountDeletionStatus);

// ==================== GDPR COMPLIANCE ====================

// @route   GET /api/gdpr/compliance
// @desc    Get GDPR compliance status
// @access  Private
router.get('/compliance', authenticate, gdprController.getGDPRCompliance);

// @route   PUT /api/gdpr/consent
// @desc    Update consent preferences
// @access  Private
router.put('/consent', authenticate, gdprController.updateConsent);

export default router;
