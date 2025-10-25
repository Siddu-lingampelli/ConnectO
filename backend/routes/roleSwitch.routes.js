import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  switchRole,
  enableRole,
  getRoleStatus,
  disableRole
} from '../controllers/roleSwitch.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   PATCH /api/role/switch
 * @desc    Switch between client and provider roles
 * @access  Private
 */
router.patch('/switch', switchRole);

/**
 * @route   POST /api/role/enable
 * @desc    Enable a new role (e.g., enable provider capability)
 * @access  Private
 */
router.post('/enable', enableRole);

/**
 * @route   GET /api/role/status
 * @desc    Get current role status and capabilities
 * @access  Private
 */
router.get('/status', getRoleStatus);

/**
 * @route   DELETE /api/role/disable/:role
 * @desc    Disable a role (cannot disable active role)
 * @access  Private
 */
router.delete('/disable/:role', disableRole);

export default router;
