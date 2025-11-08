import mongoose from 'mongoose';

const dataExportSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending',
    index: true
  },
  exportType: {
    type: String,
    enum: ['full', 'partial', 'profile', 'messages', 'jobs', 'orders'],
    default: 'full'
  },
  format: {
    type: String,
    enum: ['json', 'csv', 'pdf'],
    default: 'json'
  },
  fileUrl: {
    type: String
  },
  filename: {
    type: String
  },
  fileSize: {
    type: Number // in bytes
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadDate: {
    type: Date
  },
  expiryDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  },
  completedDate: {
    type: Date
  },
  errorMessage: {
    type: String
  },
  includeData: {
    profile: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    jobs: { type: Boolean, default: true },
    proposals: { type: Boolean, default: true },
    orders: { type: Boolean, default: true },
    payments: { type: Boolean, default: true },
    reviews: { type: Boolean, default: true },
    auditLogs: { type: Boolean, default: true },
    files: { type: Boolean, default: true }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    reason: String
  }
}, {
  timestamps: true
});

// Auto-delete expired exports
dataExportSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

const DataExport = mongoose.model('DataExport', dataExportSchema);

export default DataExport;
