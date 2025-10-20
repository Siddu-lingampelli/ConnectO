import { useState } from 'react';
import { toast } from 'react-toastify';
import { reviewService, CreateReviewData } from '../services/reviewService';

interface ReviewModalProps {
  orderId: string;
  providerName: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewModal = ({
  orderId,
  providerName,
  jobTitle,
  onClose,
  onSuccess
}: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({
    quality: 5,
    communication: 5,
    timeliness: 5,
    professionalism: 5
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review');
      return;
    }

    try {
      setLoading(true);

      const reviewData: CreateReviewData = {
        orderId,
        rating,
        comment: comment.trim(),
        categories
      };

      await reviewService.createReview(reviewData);
      toast.success('Review submitted successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Submit review error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (currentRating: number, onChange: (rating: number) => void, hover?: boolean) => {
    const displayRating = hover ? hoverRating : currentRating;
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => hover && setHoverRating(star)}
            onMouseLeave={() => hover && setHoverRating(0)}
            className="text-3xl focus:outline-none transition-transform hover:scale-110"
          >
            {star <= displayRating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Leave a Review</h2>
            <p className="text-sm text-gray-600 mt-1">
              Share your experience with {providerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Job Completed</p>
            <p className="font-semibold text-gray-900">{jobTitle}</p>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            {renderStars(rating, setRating, true)}
            <p className="text-sm text-gray-500 mt-2">
              {rating === 5 && 'Excellent! 🎉'}
              {rating === 4 && 'Very Good! 👍'}
              {rating === 3 && 'Good 👌'}
              {rating === 2 && 'Could be better 😐'}
              {rating === 1 && 'Needs improvement 😞'}
            </p>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Rate Specific Categories</h3>
            
            {/* Quality of Work */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Quality of Work</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCategories({ ...categories, quality: star })}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= categories.quality ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Communication */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Communication</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCategories({ ...categories, communication: star })}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= categories.communication ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeliness */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Timeliness</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCategories({ ...categories, timeliness: star })}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= categories.timeliness ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Professionalism */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Professionalism</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCategories({ ...categories, professionalism: star })}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= categories.professionalism ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="Share your experience working with this provider. What did they do well? How was the quality of their work?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={10}
            />
            <p className="text-sm text-gray-500 mt-1">
              {comment.length}/1000 characters (minimum 10)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || comment.length < 10}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
