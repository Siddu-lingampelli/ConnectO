import express from 'express';
import {
  getCommunityPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getMyPosts,
  getTrendingPosts
} from '../controllers/communityController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes with auth
router.get('/', authenticate, getCommunityPosts);
router.get('/trending', authenticate, getTrendingPosts);
router.get('/my-posts', authenticate, getMyPosts);
router.get('/:id', authenticate, getPostById);

// Post management
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

// Interactions
router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/comment', authenticate, addComment);
router.delete('/:id/comment/:commentId', authenticate, deleteComment);

export default router;
