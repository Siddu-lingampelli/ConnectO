import WebsiteReview from '../models/WebsiteReview.model.js';
import User from '../models/User.model.js';

// Submit a website review
export const submitReview = async (req, res) => {
  try {
    const { rating, title, review, category } = req.body;
    const userId = req.user._id || req.user.id;

    // Validate input
    if (!rating || !title || !review) {
      return res.status(400).json({ message: 'Rating, title, and review are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user already submitted a review
    const existingReview = await WebsiteReview.findOne({ user: userId });
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.title = title;
      existingReview.review = review;
      existingReview.category = category || 'overall';
      existingReview.isApproved = false; // Reset approval status
      
      await existingReview.save();
      
      return res.status(200).json({
        message: 'Review updated successfully!',
        review: existingReview
      });
    }

    // Create new review
    const newReview = new WebsiteReview({
      user: userId,
      rating,
      title,
      review,
      category: category || 'overall'
    });

    await newReview.save();

    res.status(201).json({
      message: 'Review submitted successfully! Thank you for your feedback.',
      review: newReview
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
};

// Get all approved reviews (for homepage)
export const getApprovedReviews = async (req, res) => {
  try {
    const { limit = 10, featured = false } = req.query;

    const query = { isApproved: true };
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const reviews = await WebsiteReview.find(query)
      .populate('user', 'fullName profilePicture role')
      .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Get user's own review
export const getMyReview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const review = await WebsiteReview.findOne({ user: userId })
      .populate('user', 'fullName profilePicture role');

    res.status(200).json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Error fetching review', error: error.message });
  }
};

// Get all reviews (admin only)
export const getAllReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status === 'approved') {
      query.isApproved = true;
    } else if (status === 'pending') {
      query.isApproved = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await WebsiteReview.find(query)
      .populate('user', 'fullName email profilePicture role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WebsiteReview.countDocuments(query);

    res.status(200).json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Approve/reject review (admin only)
export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isApproved, isFeatured } = req.body;

    const review = await WebsiteReview.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (isApproved !== undefined) {
      review.isApproved = isApproved;
    }
    
    if (isFeatured !== undefined) {
      review.isFeatured = isFeatured;
    }

    await review.save();

    res.status(200).json({
      message: 'Review status updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    const review = await WebsiteReview.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only allow user to delete their own review or admin to delete any review
    if (review.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await WebsiteReview.findByIdAndDelete(reviewId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

// Get review statistics
export const getReviewStats = async (req, res) => {
  try {
    const totalReviews = await WebsiteReview.countDocuments({ isApproved: true });
    const pendingReviews = await WebsiteReview.countDocuments({ isApproved: false });

    const avgRating = await WebsiteReview.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const ratingDistribution = await WebsiteReview.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      totalReviews,
      pendingReviews,
      averageRating: avgRating[0]?.avgRating || 0,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};
