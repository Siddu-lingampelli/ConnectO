import mongoose from 'mongoose';

const websiteReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  review: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['usability', 'features', 'support', 'overall', 'other'],
    default: 'overall'
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve reviews (change to false if manual approval needed)
  },
  isFeatured: {
    type: Boolean,
    default: false // Featured reviews shown prominently on homepage
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
websiteReviewSchema.index({ isApproved: 1, rating: -1 });
websiteReviewSchema.index({ isFeatured: 1 });
websiteReviewSchema.index({ user: 1 });

const WebsiteReview = mongoose.model('WebsiteReview', websiteReviewSchema);

export default WebsiteReview;
