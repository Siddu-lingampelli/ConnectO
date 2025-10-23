import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { websiteReviewService, type WebsiteReview } from '../services/websiteReviewService';

interface WebsiteReviewFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const WebsiteReviewForm = ({ onSuccess, onCancel }: WebsiteReviewFormProps) => {
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<WebsiteReview | null>(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    review: '',
    category: 'overall'
  });

  useEffect(() => {
    loadExistingReview();
  }, []);

  const loadExistingReview = async () => {
    try {
      const review = await websiteReviewService.getMyReview();
      if (review) {
        setExistingReview(review);
        setFormData({
          rating: review.rating,
          title: review.title,
          review: review.review,
          category: review.category
        });
      }
    } catch (error) {
      console.error('Error loading review:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.review.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.review.length < 20) {
      toast.error('Review must be at least 20 characters long');
      return;
    }

    try {
      setLoading(true);
      const result = await websiteReviewService.submitReview(formData);
      toast.success(result.message);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange && onChange(star)}
            className={`text-3xl transition-all ${
              star <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            } ${!onChange ? 'cursor-default' : 'cursor-pointer'}`}
            disabled={!onChange}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        {existingReview ? '✏️ Update Your Review' : '📝 Share Your Experience'}
      </h2>
      <p className="text-gray-600 mb-6">
        Help us improve! Your feedback will be shown on our homepage after approval.
      </p>

      {existingReview && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            ℹ️ You have already submitted a review. Any changes will need admin approval again.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          {renderStars(formData.rating, (rating) =>
            setFormData((prev) => ({ ...prev, rating }))
          )}
          <p className="text-sm text-gray-500 mt-2">
            {formData.rating === 5 && '🌟 Excellent!'}
            {formData.rating === 4 && '👍 Very Good'}
            {formData.rating === 3 && '😊 Good'}
            {formData.rating === 2 && '😐 Fair'}
            {formData.rating === 1 && '😞 Needs Improvement'}
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="overall">Overall Experience</option>
            <option value="usability">Ease of Use</option>
            <option value="features">Features & Functionality</option>
            <option value="support">Customer Support</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Sum up your experience in one line"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Review */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={formData.review}
            onChange={(e) => setFormData((prev) => ({ ...prev, review: e.target.value }))}
            placeholder="Share your detailed experience with ConnectO. What did you like? What can be improved?"
            rows={6}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.review.length}/500 characters (minimum 20)
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || formData.review.length < 20}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Submitting...' : existingReview ? '💾 Update Review' : '🚀 Submit Review'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          📌 <strong>Note:</strong> All reviews are moderated by our team. Once approved, your review will appear on our homepage to help others.
        </p>
      </div>
    </div>
  );
};

export default WebsiteReviewForm;
