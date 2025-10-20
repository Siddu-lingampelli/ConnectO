import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  createProposal,
  getMyProposals,
  getJobProposals,
  getProposal,
  updateProposal,
  withdrawProposal,
  updateProposalStatus
} from '../controllers/proposal.controller.js';

const router = express.Router();
router.use(authenticate);

// Provider routes
router.post('/', authorize('provider'), createProposal);
router.get('/my-proposals', authorize('provider'), getMyProposals);
router.get('/:id', getProposal);
router.put('/:id', authorize('provider'), updateProposal);
router.delete('/:id', authorize('provider'), withdrawProposal);

// Client routes
router.get('/job/:jobId', getJobProposals);
router.put('/:id/status', authorize('client'), updateProposalStatus);

export default router;
