import express from 'express';
import {
  saveSearchPreference,
  getSearchPreferences,
  updateSearchPreference,
  deleteSearchPreference,
  recordSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  getSearchSuggestions,
  recordSearchClick,
  advancedSearch
} from '../controllers/search.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Search Preferences
router.post('/preferences', authenticate, saveSearchPreference);
router.get('/preferences', authenticate, getSearchPreferences);
router.put('/preferences/:id', authenticate, updateSearchPreference);
router.delete('/preferences/:id', authenticate, deleteSearchPreference);

// Search History
router.post('/history', authenticate, recordSearchHistory);
router.get('/history', authenticate, getSearchHistory);
router.delete('/history', authenticate, clearSearchHistory);
router.post('/history/:id/click', authenticate, recordSearchClick);

// Search Suggestions
router.get('/suggestions', authenticate, getSearchSuggestions);

// Advanced Search
router.post('/advanced', authenticate, advancedSearch);

export default router;
