import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService, Review, ReviewStats } from '../../services/reviewService';
import type { User } from '../../types';

interface PublicProfileProps {
  user: User;
  currentUser?: User;
}

const PublicProfile = ({ user }: PublicProfileProps) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load reviews when component mounts or user changes
  useEffect(() => {
    if (user.role === 'provider') {
      loadReviews();
    }
  }, [user.id, currentPage]);

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const userId = user._id || user.id;
      const data = await reviewService.getProviderReviews(userId, currentPage, 5);
      setReviews(data.reviews);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-xl">
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        ← Back to Search
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="relative">
          {/* Cover Image */}
          <div className={`h-32 ${
            user.role === 'provider' 
              ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700'
              : 'bg-gradient-to-r from-green-600 via-green-700 to-teal-700'
          }`}></div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-full ${
                user.role === 'provider'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  : 'bg-gradient-to-r from-green-600 to-teal-600'
              } flex items-center justify-center text-white text-3xl font-bold border-4 border-white`}>
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
              
              {/* Actions */}
              <div className="ml-auto flex gap-3">
                <button
                  onClick={() => navigate(`/messages?userId=${user.id}`)}
                  className={`px-6 py-2 ${
                    user.role === 'provider'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white rounded-lg transition-colors font-medium`}
                >
                  💬 Send Message
                </button>
              </div>
            </div>

            {/* Name and Role */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {user.fullName}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="text-xl">
                  {user.role === 'provider' ? '🔧' : '👤'}
                </span>
                {user.role === 'provider' ? 'Service Provider' : 'Client'}
                {user.city && ` • ${user.city}, ${user.area || ''}`}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {user.rating ? user.rating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {user.completedJobs || 0}
                </p>
                <p className="text-sm text-gray-600">
                  {user.role === 'provider' ? 'Jobs Completed' : 'Jobs Posted'}
                </p>
              </div>
              {user.role === 'provider' && user.hourlyRate && (
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{user.hourlyRate}
                  </p>
                  <p className="text-sm text-gray-600">Per Hour</p>
                </div>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mb-4">
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Provider-specific Information */}
      {user.role === 'provider' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Services */}
          {user.services && user.services.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🛠️ Services Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.services.map((service, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                ⚡ Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {user.experience && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                💼 Experience
              </h2>
              <p className="text-gray-700">{user.experience}</p>
            </div>
          )}

          {/* Availability */}
          {user.availability && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                📅 Availability
              </h2>
              <p className="text-gray-700">{user.availability}</p>
            </div>
          )}
        </div>
      )}

      {/* Client-specific Information */}
      {user.role === 'client' && user.preferences && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Interested Categories */}
          {user.preferences.categories && user.preferences.categories.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🎯 Interested In
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.preferences.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Budget */}
          {user.preferences.budget && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                💰 Budget Range
              </h2>
              <p className="text-gray-700 text-lg font-semibold text-green-600">
                {user.preferences.budget}
              </p>
            </div>
          )}

          {/* Communication Preference */}
          {user.preferences.communicationPreference && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                💬 Preferred Communication
              </h2>
              <p className="text-gray-700">{user.preferences.communicationPreference}</p>
            </div>
          )}
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          📞 Contact Information
        </h2>
        <div className="space-y-3">
          {user.phone && (
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium w-24">Phone:</span>
              <span className="text-gray-900">{user.phone}</span>
            </div>
          )}
          {user.email && (
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium w-24">Email:</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
          )}
          {user.city && (
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium w-24">Location:</span>
              <span className="text-gray-900">
                {user.city}{user.area && `, ${user.area}`}
              </span>
            </div>
          )}
          {user.address && (
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium w-24">Address:</span>
              <span className="text-gray-900">{user.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Section - Only for providers */}
      {user.role === 'provider' && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            💼 Portfolio
          </h2>
          
          {user.portfolio && user.portfolio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.portfolio.map((item, index) => {
              const typeInfo = {
                image: { icon: '🖼️', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
                video: { icon: '🎥', color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
                link: { icon: '🔗', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-600' },
                github: { icon: '💻', color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-600' }
              }[item.type];

              return (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Preview Image */}
                  {item.type === 'image' ? (
                    <div className="h-48 bg-gray-100">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 text-6xl">${typeInfo.icon}</div>`;
                        }}
                      />
                    </div>
                  ) : item.thumbnail ? (
                    <div className="h-48 bg-gray-100">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 text-6xl">${typeInfo.icon}</div>`;
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`h-48 ${typeInfo.bgColor} flex items-center justify-center`}>
                      <span className="text-6xl">{typeInfo.icon}</span>
                    </div>
                  )}

                  <div className="p-4">
                    {/* Type Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 ${typeInfo.bgColor} ${typeInfo.textColor} text-xs rounded-full flex items-center gap-1`}>
                        <span>{typeInfo.icon}</span>
                        <span className="capitalize">{item.type}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">
                      {item.title}
                    </h3>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View Button */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full text-center px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${
                        item.type === 'image' ? 'bg-blue-600 hover:bg-blue-700' :
                        item.type === 'video' ? 'bg-purple-600 hover:bg-purple-700' :
                        item.type === 'link' ? 'bg-green-600 hover:bg-green-700' :
                        'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      View {item.type === 'github' ? 'Repository' : item.type === 'link' ? 'Website' : 'Project'}
                    </a>
                  </div>
                </div>
              );
            })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">💼</span>
              </div>
              <p className="text-gray-600 font-medium text-lg mb-2">No Portfolio Items Yet</p>
              <p className="text-sm text-gray-500">
                This provider hasn't added any portfolio items to showcase their work
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reviews Section - Only for providers */}
      {user.role === 'provider' && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ⭐ Reviews & Ratings
            </h2>
            {stats && (
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">{stats.totalReviews} reviews</p>
              </div>
            )}
          </div>

          {/* Rating Statistics */}
          {stats && stats.totalReviews > 0 && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats[`${['fiveStars', 'fourStars', 'threeStars', 'twoStars', 'oneStar'][5 - star]}` as keyof ReviewStats] as number;
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-12">{star} ⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Client Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                        {review.reviewer.profilePicture ? (
                          <img
                            src={review.reviewer.profilePicture}
                            alt={review.reviewer.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          review.reviewer.fullName?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{review.reviewer.fullName}</p>
                        <p className="text-sm text-gray-500">
                          {review.reviewer.city && `${review.reviewer.city} • `}
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    {/* Rating */}
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <p className="text-sm text-gray-600 mt-1">{review.rating}/5</p>
                    </div>
                  </div>

                  {/* Job Info */}
                  {review.job && (
                    <div className="mb-3 bg-blue-50 rounded-lg px-3 py-2 inline-block">
                      <p className="text-sm text-blue-700">
                        📋 {review.job.title} • {review.job.category}
                      </p>
                    </div>
                  )}

                  {/* Review Comment */}
                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {/* Category Ratings */}
                  {review.categories && Object.keys(review.categories).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {review.categories.quality && (
                        <div className="text-sm">
                          <span className="text-gray-600">Quality:</span>
                          <span className="ml-1 font-semibold">{review.categories.quality}/5</span>
                        </div>
                      )}
                      {review.categories.communication && (
                        <div className="text-sm">
                          <span className="text-gray-600">Communication:</span>
                          <span className="ml-1 font-semibold">{review.categories.communication}/5</span>
                        </div>
                      )}
                      {review.categories.timeliness && (
                        <div className="text-sm">
                          <span className="text-gray-600">Timeliness:</span>
                          <span className="ml-1 font-semibold">{review.categories.timeliness}/5</span>
                        </div>
                      )}
                      {review.categories.professionalism && (
                        <div className="text-sm">
                          <span className="text-gray-600">Professionalism:</span>
                          <span className="ml-1 font-semibold">{review.categories.professionalism}/5</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Provider Response */}
                  {review.response && review.response.comment && (
                    <div className="mt-4 ml-8 bg-gray-50 rounded-lg p-4 border-l-4 border-blue-600">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-blue-600">Response from {user.fullName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.response.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.response.comment}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">⭐</span>
              </div>
              <p className="text-gray-600 font-medium">No reviews yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Reviews from clients will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
