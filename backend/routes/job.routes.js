import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  getRecommendedJobs,
  getNearbyJobs
} from '../controllers/job.controller.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('client'), createJob);
router.get('/', getAllJobs);
router.get('/recommendations', authorize('provider'), getRecommendedJobs);
router.get('/nearby', authorize('provider'), getNearbyJobs);
router.get('/my-jobs', getMyJobs);
router.get('/:id', getJobById);
router.put('/:id', authorize('client'), updateJob);
router.delete('/:id', authorize('client'), deleteJob);

export default router;
