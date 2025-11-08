import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'profile_update',
      'password_change',
      'email_change',
      'data_export_request',
      'data_export_download',
      'account_deletion_request',
      'account_deleted',
      'gdpr_consent_update',
      'privacy_settings_update',
      'file_upload',
      'file_delete',
      'message_sent',
      'message_deleted',
      'job_posted',
      'job_deleted',
      'proposal_submitted',
      'order_created',
      'payment_made',
      'review_posted',
      'verification_request',
      'admin_access',
      'suspicious_activity',
      'security_alert'
    ]
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// Auto-delete logs older than 2 years (GDPR requirement)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
