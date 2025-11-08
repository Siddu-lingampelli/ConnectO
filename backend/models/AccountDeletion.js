import mongoose from 'mongoose';

const accountDeletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  scheduledDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days grace period
    }
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'processing', 'completed', 'cancelled', 'failed'],
    default: 'pending',
    index: true
  },
  deletionType: {
    type: String,
    enum: ['soft', 'hard'],
    default: 'soft'
  },
  reason: {
    type: String,
    enum: [
      'no_longer_needed',
      'privacy_concerns',
      'found_alternative',
      'too_expensive',
      'technical_issues',
      'poor_service',
      'other'
    ],
    required: true
  },
  reasonDetails: {
    type: String,
    maxlength: 1000
  },
  feedback: {
    type: String,
    maxlength: 2000
  },
  dataBackupRequested: {
    type: Boolean,
    default: false
  },
  dataBackupUrl: {
    type: String
  },
  cancelledDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    hasActiveOrders: Boolean,
    hasPendingPayments: Boolean,
    lastLoginDate: Date,
    accountAge: Number // in days
  },
  warningsSent: {
    type: Number,
    default: 0
  },
  lastWarningDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for scheduled deletions
accountDeletionSchema.index({ scheduledDate: 1, status: 1 });

const AccountDeletion = mongoose.model('AccountDeletion', accountDeletionSchema);

export default AccountDeletion;
