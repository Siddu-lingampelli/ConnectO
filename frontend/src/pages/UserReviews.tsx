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
          <svg
            key={i}
            className={`w-5 h-5 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-text-secondary hover:text-primary mb-6 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <h1 className="text-5xl font-bold text-text-primary mb-4 flex items-center justify-center gap-3">
              <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              Customer Reviews
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              See what our users are saying about ConnectO
            </p>

            {/* Overall Stats */}
            {stats && (
              <div className="flex justify-center gap-6 flex-wrap mb-8">
                <div className="bg-surface rounded-xl px-8 py-6 shadow-soft border border-border">
                  <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                    {stats.averageRating.toFixed(1)}
                    <svg className="w-10 h-10 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="text-sm text-text-secondary">Average Rating</div>
                </div>
                <div className="bg-surface rounded-xl px-8 py-6 shadow-soft border border-border">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.totalReviews}
                  </div>
                  <div className="text-sm text-text-secondary">Total Reviews</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters & Stats */}
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-xl shadow-soft p-6 sticky top-4 border border-border">
                {/* Rating Distribution */}
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Rating Distribution
                </h3>
                <div className="space-y-3 mb-6">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-8 flex items-center gap-1">
                        {rating}
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                      <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full rounded-full transition-all"
                          style={{
                            width: `${maxCount > 0 ? (ratingDistribution[rating - 1] / maxCount) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-text-secondary w-8 text-right">
                        {ratingDistribution[rating - 1] || 0}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Category Filter */}
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Filter by Category
                </h3>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary mb-6"
                >
                  <option value="all">All Categories</option>
                  <option value="overall">Overall Experience</option>
                  <option value="usability">Usability</option>
                  <option value="features">Features</option>
                  <option value="support">Support</option>
                  <option value="other">Other</option>
                </select>

                {/* Sort By */}
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Sort By
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary mb-6"
                >
                  <option value="recent">Most Recent</option>
                  <option value="rating-high">Highest Rating</option>
                  <option value="rating-low">Lowest Rating</option>
                </select>

                {/* Submit Review CTA */}
                <button
                  onClick={() => navigate('/submit-review')}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium shadow-soft flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Write a Review
                </button>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-text-secondary">Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="bg-surface rounded-xl shadow-soft p-12 text-center border border-border">
                  <svg className="w-24 h-24 mx-auto mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-text-primary mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Be the first to share your experience!
                  </p>
                  <button
                    onClick={() => navigate('/submit-review')}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                <>
                  {/* Review Count */}
                  <div className="mb-6 text-text-secondary">
                    Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {filteredReviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-surface rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow border border-border"
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
                              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                                {review.user.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-text-primary text-lg">
                                {review.user.fullName}
                              </div>
                              <div className="text-sm text-text-secondary capitalize">
                                {review.user.role}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-text-secondary mb-1">
                              {formatDate(review.createdAt)}
                            </div>
                            {review.isFeatured && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Featured
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rating */}
                        {renderStars(review.rating)}

                        {/* Category Badge */}
                        <div className="mt-3 mb-3">
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                            {review.category.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-text-primary mb-3">
                          {review.title}
                        </h3>

                        {/* Review Text */}
                        <p className="text-text-primary leading-relaxed">
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
