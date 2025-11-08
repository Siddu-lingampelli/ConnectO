import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updatePassword,
  refreshToken
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  validateRegistration,
  validateLogin,
  handleValidationErrors
} from '../middleware/security.middleware.js';

const router = express.Router();

// Routes with rate limiting and validation
router.post('/register',
  registerLimiter,
  validateRegistration,
  handleValidationErrors,
  register
);

router.post('/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  login
);

router.get('/me', authenticate, getMe);

router.put('/password',
  authenticate,
  passwordResetLimiter,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  handleValidationErrors,
  updatePassword
);

router.post('/refresh-token', authLimiter, refreshToken);

export default router;
