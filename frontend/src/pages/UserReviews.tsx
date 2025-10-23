import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { websiteReviewService, type WebsiteReview } from '../services/websiteReviewService';

const UserReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  useEffect(() => {
    loadReviews();
    loadStats();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await websiteReviewService.getApprovedReviews(100);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await websiteReviewService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getFilteredReviews = () => {
    let filtered = [...reviews];

    // Filter by category
    if (filter !== 'all') {
      filtered = filtered.filter(review => review.category === filter);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'rating-high') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'rating-low') {
      filtered.sort((a, b) => a.rating - b.rating);
    }

    return filtered;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-xl ${
              i < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    if (!stats?.ratingDistribution) return [];
    const distribution = [0, 0, 0, 0, 0];
    stats.ratingDistribution.forEach((item: any) => {
      distribution[item._id - 1] = item.count;
    });
    return distribution;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredReviews = getFilteredReviews();
  const ratingDistribution = getRatingDistribution();
  const maxCount = Math.max(...ratingDistribution);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              💙 Customer Reviews
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              See what our users are saying about ConnectO
            </p>

            {/* Overall Stats */}
            {stats && (
              <div className="flex justify-center gap-6 flex-wrap mb-8">
                <div className="bg-white rounded-xl px-8 py-6 shadow-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stats.averageRating.toFixed(1)} ⭐
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="bg-white rounded-xl px-8 py-6 shadow-lg">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">
                    {stats.totalReviews}
                  </div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters & Stats */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                {/* Rating Distribution */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Rating Distribution
                </h3>
                <div className="space-y-3 mb-6">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-8">{rating} ⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full rounded-full transition-all"
                          style={{
                            width: `${maxCount > 0 ? (ratingDistribution[rating - 1] / maxCount) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">
                        {ratingDistribution[rating - 1] || 0}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Category Filter */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Filter by Category
                </h3>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                >
                  <option value="all">All Categories</option>
                  <option value="overall">Overall Experience</option>
                  <option value="usability">Usability</option>
                  <option value="features">Features</option>
                  <option value="support">Support</option>
                  <option value="other">Other</option>
                </select>

                {/* Sort By */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sort By
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                >
                  <option value="recent">Most Recent</option>
                  <option value="rating-high">Highest Rating</option>
                  <option value="rating-low">Lowest Rating</option>
                </select>

                {/* Submit Review CTA */}
                <button
                  onClick={() => navigate('/submit-review')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md"
                >
                  📝 Write a Review
                </button>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to share your experience!
                  </p>
                  <button
                    onClick={() => navigate('/submit-review')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                <>
                  {/* Review Count */}
                  <div className="mb-6 text-gray-600">
                    Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {filteredReviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            {review.user.profilePicture ? (
                              <img
                                src={review.user.profilePicture}
                                alt={review.user.fullName}
                                className="w-14 h-14 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                                {review.user.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">
                                {review.user.fullName}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {review.user.role}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">
                              {formatDate(review.createdAt)}
                            </div>
                            {review.isFeatured && (
                              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rating */}
                        {renderStars(review.rating)}

                        {/* Category Badge */}
                        <div className="mt-3 mb-3">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                            {review.category.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {review.title}
                        </h3>

                        {/* Review Text */}
                        <p className="text-gray-700 leading-relaxed">
                          "{review.review}"
                        </p>

                        {/* Response (if any) */}
                        {review.response && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <div className="text-sm font-semibold text-gray-900 mb-2">
                              💬 ConnectO Team Response:
                            </div>
                            <p className="text-sm text-gray-700">{review.response.text}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserReviews;
