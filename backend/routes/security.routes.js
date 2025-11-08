import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  blockIP,
  unblockIP,
  getBlockedIPs,
  getSuspiciousIPs
} from '../middleware/security.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Get blocked IPs
router.get('/blocked-ips', (req, res) => {
  try {
    const blockedIPs = getBlockedIPs();
    res.json({
      success: true,
      count: blockedIPs.length,
      blockedIPs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blocked IPs'
    });
  }
});

// Get suspicious IPs
router.get('/suspicious-ips', (req, res) => {
  try {
    const suspiciousIPs = getSuspiciousIPs();
    res.json({
      success: true,
      count: suspiciousIPs.length,
      suspiciousIPs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching suspicious IPs'
    });
  }
});

// Block an IP
router.post('/block-ip', (req, res) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required'
      });
    }
    
    blockIP(ip);
    
    res.json({
      success: true,
      message: `IP ${ip} has been blocked`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error blocking IP'
    });
  }
});

// Unblock an IP
router.post('/unblock-ip', (req, res) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required'
      });
    }
    
    unblockIP(ip);
    
    res.json({
      success: true,
      message: `IP ${ip} has been unblocked`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unblocking IP'
    });
  }
});

export default router;
