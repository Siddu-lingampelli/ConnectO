import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import Wishlist from '../models/Wishlist.js';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { itemType, itemId, notes } = req.body;

    // Validate itemType
    if (!['provider', 'client', 'job'].includes(itemType)) {
      return res.status(400).json({ message: 'Invalid item type' });
    }

    // Determine the model to reference
    let itemModel = 'User';
    if (itemType === 'job') {
      itemModel = 'Job';
    }

    // Check if item exists
    if (itemType === 'job') {
      const job = await Job.findById(itemId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
    } else {
      const user = await User.findById(itemId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Validate user roles
      if (itemType === 'provider' && user.role !== 'provider') {
        return res.status(400).json({ message: 'User is not a provider' });
      }
      if (itemType === 'client' && user.role !== 'client') {
        return res.status(400).json({ message: 'User is not a client' });
      }
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: req.user._id,
      itemId: itemId
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    // Create wishlist item
    const wishlistItem = await Wishlist.create({
      user: req.user._id,
      itemType,
      itemId,
      itemModel,
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Added to wishlist',
      data: wishlistItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { itemType } = req.query;

    const filter = { user: req.user._id };
    if (itemType) {
      filter.itemType = itemType;
    }

    const wishlistItems = await Wishlist.find(filter)
      .populate({
        path: 'itemId',
        select: '-password'
      })
      .sort({ addedAt: -1 });

    // Get counts by type
    const counts = await Wishlist.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$itemType', count: { $sum: 1 } } }
    ]);

    const countMap = {
      provider: 0,
      client: 0,
      job: 0
    };
    counts.forEach(item => {
      countMap[item._id] = item.count;
    });

    res.json({
      data: wishlistItems,
      counts: countMap,
      total: wishlistItems.length
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Check if item is in wishlist
// @route   GET /api/wishlist/check/:itemId
// @access  Private
router.get('/check/:itemId', async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      user: req.user._id,
      itemId: req.params.itemId
    });

    res.json({
      inWishlist: !!wishlistItem,
      item: wishlistItem
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:itemId
// @access  Private
router.delete('/:itemId', async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOneAndDelete({
      user: req.user._id,
      itemId: req.params.itemId
    });

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update wishlist item notes
// @route   PUT /api/wishlist/:itemId
// @access  Private
router.put('/:itemId', async (req, res) => {
  try {
    const { notes } = req.body;

    const wishlistItem = await Wishlist.findOneAndUpdate(
      {
        user: req.user._id,
        itemId: req.params.itemId
      },
      { notes },
      { new: true }
    );

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.json({
      message: 'Wishlist item updated',
      data: wishlistItem
    });
  } catch (error) {
    console.error('Update wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Note: This route must be defined AFTER specific DELETE routes to avoid conflicts
// @desc    Clear entire wishlist or by type
// @route   DELETE /api/wishlist
// @access  Private
router.delete('/clear', async (req, res) => {
  try {
    const { itemType } = req.query;

    const filter = { user: req.user._id };
    if (itemType) {
      filter.itemType = itemType;
    }

    const result = await Wishlist.deleteMany(filter);

    res.json({
      message: `Removed ${result.deletedCount} item(s) from wishlist`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
