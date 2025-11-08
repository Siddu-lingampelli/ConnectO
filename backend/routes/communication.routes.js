import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  // Video Call
  initiateVideoCall,
  joinVideoCall,
  endVideoCall,
  // Voice Call
  initiateVoiceCall,
  joinVoiceCall,
  endVoiceCall,
  // Screen Share
  initiateScreenShare,
  endScreenShare,
  // Call Management
  getCallHistory,
  declineCall
} from '../controllers/communication.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==== Video Call Routes ====
router.post('/video-call/initiate', initiateVideoCall);
router.put('/video-call/:messageId/join', joinVideoCall);
router.put('/video-call/:messageId/end', endVideoCall);

// ==== Voice Call Routes ====
router.post('/voice-call/initiate', initiateVoiceCall);
router.put('/voice-call/:messageId/join', joinVoiceCall);
router.put('/voice-call/:messageId/end', endVoiceCall);

// ==== Screen Share Routes ====
router.post('/screen-share/initiate', initiateScreenShare);
router.put('/screen-share/:messageId/end', endScreenShare);

// ==== Call Management Routes ====
router.get('/call-history', getCallHistory);
router.put('/call/:messageId/decline', declineCall);

export default router;
