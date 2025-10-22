import express from 'express';
import { chatWithBot, getSuggestions } from '../controllers/chat.controller.js';

const router = express.Router();

// Public routes - no authentication required
router.post('/', chatWithBot);
router.get('/suggestions', getSuggestions);

export default router;
