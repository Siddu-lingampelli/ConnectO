import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    enum: ['provider', 'client', 'job'],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemModel'
  },
  itemModel: {
    type: String,
    required: true,
    enum: ['User', 'Job']
  },
  notes: {
    type: String,
    maxlength: 500
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate wishlist items
wishlistSchema.index({ user: 1, itemId: 1 }, { unique: true });

// Index for faster queries
wishlistSchema.index({ user: 1, itemType: 1 });
wishlistSchema.index({ user: 1, addedAt: -1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
