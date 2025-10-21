import Notification from '../models/Notification.model.js';

// Helper function to create notifications
export const notificationHelper = {
  // Profile incomplete notification
  profileIncomplete: async (userId) => {
    await Notification.createNotification({
      recipient: userId,
      type: 'profile_incomplete',
      title: '📝 Complete Your Profile',
      message: 'Complete your profile to unlock all features and get better opportunities.',
      actionUrl: '/profile',
      priority: 'high'
    });
  },

  // Demo project assigned
  demoAssigned: async (userId, demoTitle) => {
    await Notification.createNotification({
      recipient: userId,
      type: 'demo_assigned',
      title: '🎯 Demo Project Assigned!',
      message: `You have been assigned a demo project: "${demoTitle}". Complete it to get verified.`,
      actionUrl: '/dashboard',
      priority: 'high'
    });
  },

  // Demo pending submission
  demoPending: async (userId, daysLeft) => {
    await Notification.createNotification({
      recipient: userId,
      type: 'demo_pending',
      title: '⏰ Demo Project Pending',
      message: `Your demo project is still pending. ${daysLeft ? `${daysLeft} days left to submit.` : 'Please submit soon.'}`,
      actionUrl: '/dashboard',
      priority: 'urgent'
    });
  },

  // Demo reviewed
  demoReviewed: async (userId, score, status, demoId) => {
    const isPass = status === 'verified';
    await Notification.createNotification({
      recipient: userId,
      type: isPass ? 'demo_verified' : 'demo_rejected',
      title: isPass ? '✅ Demo Verified!' : '❌ Demo Needs Improvement',
      message: isPass 
        ? `Congratulations! Your demo scored ${score}/100 and is verified. You can now apply for jobs!`
        : `Your demo scored ${score}/100. Please improve and resubmit.`,
      actionUrl: '/dashboard',
      priority: 'high',
      metadata: { score, demoId }
    });
  },

  // Proposal received (for clients)
  proposalReceived: async (clientId, jobTitle, providerName, proposalId, jobId) => {
    await Notification.createNotification({
      recipient: clientId,
      type: 'proposal_received',
      title: '📨 New Proposal Received',
      message: `${providerName} sent a proposal for "${jobTitle}"`,
      actionUrl: `/jobs/${jobId}/proposals`,
      priority: 'normal',
      metadata: { proposalId, jobId }
    });
  },

  // Proposal accepted (for providers)
  proposalAccepted: async (providerId, jobTitle, proposalId, jobId) => {
    await Notification.createNotification({
      recipient: providerId,
      type: 'proposal_accepted',
      title: '🎉 Proposal Accepted!',
      message: `Your proposal for "${jobTitle}" has been accepted! Contact the client to get started.`,
      actionUrl: `/my-orders`,
      priority: 'high',
      metadata: { proposalId, jobId }
    });
  },

  // Proposal rejected (for providers)
  proposalRejected: async (providerId, jobTitle, proposalId) => {
    await Notification.createNotification({
      recipient: providerId,
      type: 'proposal_rejected',
      title: 'Proposal Not Selected',
      message: `Your proposal for "${jobTitle}" was not selected. Keep trying!`,
      actionUrl: '/my-proposals',
      priority: 'low',
      metadata: { proposalId }
    });
  },

  // Message received
  messageReceived: async (recipientId, senderName, senderId, conversationId) => {
    await Notification.createNotification({
      recipient: recipientId,
      type: 'message_received',
      title: '💬 New Message',
      message: `${senderName} sent you a message`,
      actionUrl: `/messages?userId=${senderId}`,
      priority: 'normal',
      metadata: { senderId, messageId: conversationId }
    });
  },

  // Job completed
  jobCompleted: async (clientId, jobTitle, providerName, jobId) => {
    await Notification.createNotification({
      recipient: clientId,
      type: 'job_completed',
      title: '✅ Job Completed',
      message: `${providerName} marked "${jobTitle}" as completed. Please review and confirm.`,
      actionUrl: `/job/${jobId}`,
      priority: 'high',
      metadata: { jobId }
    });
  },

  // Review received
  reviewReceived: async (providerId, rating, clientName, jobTitle) => {
    await Notification.createNotification({
      recipient: providerId,
      type: 'review_received',
      title: '⭐ New Review Received',
      message: `${clientName} rated you ${rating}/5 for "${jobTitle}"`,
      actionUrl: '/profile',
      priority: 'normal'
    });
  },

  // Payment received (for providers)
  paymentReceived: async (providerId, amount, jobTitle) => {
    await Notification.createNotification({
      recipient: providerId,
      type: 'payment_received',
      title: '💰 Payment Received',
      message: `You received ₹${amount} for "${jobTitle}"`,
      actionUrl: '/earnings',
      priority: 'high',
      metadata: { amount }
    });
  },

  // System notification
  systemNotification: async (userId, title, message, actionUrl = null) => {
    await Notification.createNotification({
      recipient: userId,
      type: 'system',
      title,
      message,
      actionUrl,
      priority: 'normal'
    });
  }
};

export default notificationHelper;
