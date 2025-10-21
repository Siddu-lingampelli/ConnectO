import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'profile_incomplete',
      'demo_assigned',
      'demo_pending',
      'demo_reviewed',
      'demo_verified',
      'demo_rejected',
      'proposal_received',
      'proposal_accepted',
      'proposal_rejected',
      'message_received',
      'job_posted',
      'job_completed',
      'payment_received',
      'review_received',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  actionUrl: {
    type: String,
    default: null
  },
  metadata: {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
    demoId: { type: mongoose.Schema.Types.ObjectId, ref: 'DemoProject' },
    messageId: { type: mongoose.Schema.Types.ObjectId },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    score: Number
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = await this.create(data);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return await this.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ recipient: userId, read: false });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
