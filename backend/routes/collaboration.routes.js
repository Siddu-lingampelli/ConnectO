import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  inviteCollaborator,
  inviteCollaboratorByEmail,
  respondToInvitation,
  updatePaymentSplits,
  getCollaborators,
  removeCollaborator,
  getMyInvitations
} from '../controllers/collaboration.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get my pending collaboration invitations
router.get('/my-invitations', getMyInvitations);

// Invite a collaborator to a project (by ID)
router.post('/projects/:id/inviteCollaborator', inviteCollaborator);

// Invite a collaborator to a project (by email)
router.post('/projects/:id/inviteCollaboratorByEmail', inviteCollaboratorByEmail);

// Respond to a collaboration invitation (accept/decline)
router.patch('/projects/:id/collaborator/:cid/respond', respondToInvitation);

// Update payment splits for a project
router.patch('/projects/:id/paymentSplits', updatePaymentSplits);

// Get all collaborators for a project
router.get('/projects/:id/collaborators', getCollaborators);

// Remove a collaborator from a project
router.delete('/projects/:id/collaborator/:cid', removeCollaborator);

export default router;
