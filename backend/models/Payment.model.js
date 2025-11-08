import mongoose from 'mongoose';

// Main Payment Schema - tracks all payment transactions
const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'wallet', 'combined'],
    required: true
  },
  // Razorpay specific fields
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String
  },
  // Wallet payment
  walletAmount: {
    type: Number,
    default: 0
  },
  razorpayAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Payment gateway response
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  failureReason: {
    type: String
  },
  paidAt: {
    type: Date
  },
  // Metadata
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Escrow Schema - holds money until work is completed
const escrowSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  providerAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['held', 'released', 'refunded', 'disputed'],
    default: 'held'
  },
  heldAt: {
    type: Date,
    default: Date.now
  },
  releaseScheduledAt: {
    type: Date
  },
  releasedAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  // Auto-release settings
  autoRelease: {
    enabled: {
      type: Boolean,
      default: true
    },
    daysAfterCompletion: {
      type: Number,
      default: 3 // Auto-release after 3 days of completion
    },
    scheduledFor: {
      type: Date
    }
  },
  // Dispute information
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    disputedAt: Date,
    reason: String,
    resolvedAt: Date,
    resolution: String
  },
  notes: String
}, {
  timestamps: true
});

// Refund Schema - tracks refund requests and processing
const refundSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  escrow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escrow'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refundTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['full', 'partial'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  // Razorpay refund details
  razorpayRefundId: String,
  // Wallet refund tracking
  walletTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  processedAt: Date,
  completedAt: Date,
  rejectionReason: String,
  adminNotes: String
}, {
  timestamps: true
});

// Payout Schema - tracks payouts to service providers
const payoutSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  escrow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escrow',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    enum: ['wallet', 'bank_transfer', 'upi'],
    default: 'wallet'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  // Bank details (if applicable)
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String
  },
  // UPI details (if applicable)
  upiId: String,
  // Razorpay payout details
  razorpayPayoutId: String,
  // Wallet transaction
  walletTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  processedAt: Date,
  completedAt: Date,
  failureReason: String,
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ 'razorpay.orderId': 1 });
paymentSchema.index({ 'razorpay.paymentId': 1 });
// transactionId index already created by unique: true option

escrowSchema.index({ order: 1 });
escrowSchema.index({ payment: 1 });
escrowSchema.index({ client: 1, status: 1 });
escrowSchema.index({ provider: 1, status: 1 });
escrowSchema.index({ status: 1, 'autoRelease.scheduledFor': 1 });

refundSchema.index({ payment: 1 });
refundSchema.index({ order: 1 });
refundSchema.index({ requestedBy: 1, status: 1 });
refundSchema.index({ status: 1 });

payoutSchema.index({ provider: 1, status: 1 });
payoutSchema.index({ escrow: 1 });
payoutSchema.index({ order: 1 });
payoutSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
const Escrow = mongoose.model('Escrow', escrowSchema);
const Refund = mongoose.model('Refund', refundSchema);
const Payout = mongoose.model('Payout', payoutSchema);

export { Payment, Escrow, Refund, Payout };
