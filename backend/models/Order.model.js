import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
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
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  startDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  deadline: {
    type: Date,
    required: true
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'released', 'refunded'],
      default: 'pending'
    },
    paidAt: {
      type: Date
    },
    releasedAt: {
      type: Date
    },
    escrowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Escrow'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  },
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    completedAt: Date
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
orderSchema.index({ client: 1, status: 1 });
orderSchema.index({ provider: 1, status: 1 });
orderSchema.index({ job: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
