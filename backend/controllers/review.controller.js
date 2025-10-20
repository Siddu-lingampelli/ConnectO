import Review from '../models/Review.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';

// @desc    Create a review for a provider
// @route   POST /api/reviews
// @access  Private (Client only)
export const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment, categories } = req.body;

    // Validate required fields
    if (!orderId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, rating, and comment are required'
      });
    }

    // Check if order exists and is completed
    const order = await Order.findById(orderId)
      .populate('job')
      .populate('provider');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify the user is the client of this order
    if (order.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own completed orders'
      });
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed orders'
      });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order'
      });
    }

    // Create review
    const review = await Review.create({
      order: orderId,
      job: order.job._id,
      reviewer: req.user._id,
      reviewee: order.provider._id,
      rating,
      comment,
      categories: categories || {}
    });

    // Update provider's rating
    await updateProviderRating(order.provider._id);

    // Populate review before sending response
    await review.populate([
      { path: 'reviewer', select: 'fullName profilePicture avatar city' },
      { path: 'reviewee', select: 'fullName profilePicture avatar' },
      { path: 'job', select: 'title category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
export const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      reviewee: providerId,
      isVisible: true
    })
      .populate('reviewer', 'fullName profilePicture avatar city')
      .populate('job', 'title category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({
      reviewee: providerId,
      isVisible: true
    });

    // Calculate rating statistics
    const stats = await Review.aggregate([
      { $match: { reviewee: providerId, isVisible: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats: stats.length > 0 ? stats[0] : null,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message
    });
  }
};

// @desc    Get review for a specific order
// @route   GET /api/reviews/order/:orderId
// @access  Private
export const getOrderReview = async (req, res) => {
  try {
    const { orderId } = req.params;

    const review = await Review.findOne({ order: orderId })
      .populate('reviewer', 'fullName profilePicture avatar city')
      .populate('reviewee', 'fullName profilePicture avatar')
      .populate('job', 'title category');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'No review found for this order'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get order review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get review',
      error: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Reviewer only)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, categories } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify the user is the reviewer
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (categories) review.categories = { ...review.categories, ...categories };

    await review.save();

    // Update provider's rating
    await updateProviderRating(review.reviewee);

    await review.populate([
      { path: 'reviewer', select: 'fullName profilePicture avatar city' },
      { path: 'reviewee', select: 'fullName profilePicture avatar' },
      { path: 'job', select: 'title category' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Reviewer only)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify the user is the reviewer
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    const providerId = review.reviewee;
    await review.deleteOne();

    // Update provider's rating
    await updateProviderRating(providerId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

// @desc    Add response to review (Provider only)
// @route   POST /api/reviews/:id/response
// @access  Private (Provider only)
export const addReviewResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Response comment is required'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify the user is the reviewee (provider)
    if (review.reviewee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to reviews about you'
      });
    }

    review.response = {
      comment,
      createdAt: new Date()
    };

    await review.save();

    await review.populate([
      { path: 'reviewer', select: 'fullName profilePicture avatar city' },
      { path: 'reviewee', select: 'fullName profilePicture avatar' },
      { path: 'job', select: 'title category' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    console.error('Add review response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
};

// Helper function to update provider's overall rating
async function updateProviderRating(providerId) {
  try {
    const stats = await Review.aggregate([
      { $match: { reviewee: providerId, isVisible: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(providerId, {
        rating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: stats[0].totalReviews
      });
    } else {
      await User.findByIdAndUpdate(providerId, {
        rating: 0,
        totalReviews: 0
      });
    }
  } catch (error) {
    console.error('Update provider rating error:', error);
  }
}
