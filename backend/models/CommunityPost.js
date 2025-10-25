import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  postType: {
    type: String,
    enum: ['discussion', 'tip', 'question', 'showcase'],
    default: 'discussion'
  },
  category: {
    type: String,
    enum: ['General', 'Technical', 'Non-Technical', 'Business Tips', 'Client Advice', 'Success Stories', 'Help & Support'],
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ postType: 1 });
communityPostSchema.index({ category: 1 });
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ isPinned: -1, createdAt: -1 });

// Virtual for like count
communityPostSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
communityPostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Ensure virtuals are included in JSON
communityPostSchema.set('toJSON', { virtuals: true });
communityPostSchema.set('toObject', { virtuals: true });

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

export default CommunityPost;
