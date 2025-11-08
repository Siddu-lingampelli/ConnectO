import express from 'express';
import { sendTestEmail } from '../controllers/email.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Allow authenticated admins/devs to send test emails; update as needed
router.post('/test', authenticate, sendTestEmail);

export default router;
