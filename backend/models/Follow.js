import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    notificationEnabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure unique follow relationships and improve query performance
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for getting followers list
followSchema.index({ following: 1, createdAt: -1 });

// Index for getting following list
followSchema.index({ follower: 1, createdAt: -1 });

// Prevent self-following
followSchema.pre('save', function(next) {
  if (this.follower.equals(this.following)) {
    next(new Error('Users cannot follow themselves'));
  } else {
    next();
  }
});

const Follow = mongoose.model('Follow', followSchema);

export default Follow;
