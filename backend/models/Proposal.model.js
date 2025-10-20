import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    trim: true,
    minlength: [50, 'Cover letter must be at least 50 characters']
  },
  proposedBudget: {
    type: Number,
    required: [true, 'Proposed budget is required'],
    min: [0, 'Budget must be positive']
  },
  estimatedDuration: {
    type: String,
    required: [true, 'Estimated duration is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for better query performance
proposalSchema.index({ job: 1, provider: 1 });
proposalSchema.index({ provider: 1, status: 1 });
proposalSchema.index({ job: 1, status: 1 });

const Proposal = mongoose.model('Proposal', proposalSchema);

export default Proposal;
