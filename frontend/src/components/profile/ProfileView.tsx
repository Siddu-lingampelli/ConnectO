import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';
import { reviewService, Review, ReviewStats } from '../../services/reviewService';
import { updateUser } from '../../store/authSlice';
import type { User } from '../../types';
import ProfileCompletion from './ProfileCompletion';

interface ProfileViewProps {
  user: User;
}

const ProfileView = ({ user: initialUser }: ProfileViewProps) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState<User>(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch fresh profile data from MongoDB on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const freshUser = await userService.getProfile();
        setUser(freshUser);
        // Update Redux store with fresh data
        dispatch(updateUser(freshUser));
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch]);

  // Load reviews if user is a provider
  useEffect(() => {
    if (user.role === 'provider') {
      loadReviews();
    }
  }, [user.id, currentPage, user.role]);

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

  const handleEditComplete = async () => {
    // Refetch profile after edit
    try {
      const freshUser = await userService.getProfile();
      setUser(freshUser);
      dispatch(updateUser(freshUser));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error refreshing profile:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If editing or profile not completed, show the completion form
  if (isEditing || !user.profileCompleted) {
    return (
      <ProfileCompletion 
        initialData={user}
        onComplete={handleEditComplete}
        isEditing={isEditing}
      />
    );
  }

  // Show completed profile view (like Upwork/Freelancer)
  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700"></div>
          
          {/* Profile Picture & Basic Info */}
          <div className="px-8 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-5xl font-bold text-blue-600">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.fullName?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                {user.profileCompleted && (
                  <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1 border-2 border-white">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="ml-6 flex-1 mb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
                    <p className="text-gray-600 capitalize mt-1">{user.role}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mt-4">
                <p className="text-gray-700 text-lg">{user.bio}</p>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex gap-6 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.rating?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.completedJobs || 0}</p>
                <p className="text-sm text-gray-600">Jobs Completed</p>
              </div>
              {user.hourlyRate && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">₹{user.hourlyRate}/hr</p>
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Services */}
          {user.services && user.services.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🔧</span> Services Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.services.map((service, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>⚡</span> Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience & Education */}
          {(user.experience || user.education) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📚</span> Experience & Education
              </h2>
              <div className="space-y-4">
                {user.experience && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Experience</p>
                    <p className="text-gray-900 mt-1">{user.experience}</p>
                  </div>
                )}
                {user.education && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Education</p>
                    <p className="text-gray-900 mt-1">{user.education}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences (for clients) */}
          {user.preferences && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>⚙️</span> Preferences
              </h2>
              <div className="space-y-3">
                {user.preferences.categories && user.preferences.categories.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Preferred Categories</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.preferences.categories.map((cat, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.preferences.budget && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Budget Range</p>
                    <p className="text-gray-900 mt-1">{user.preferences.budget}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Contact & Details */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📧</span> Contact
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-gray-900 text-sm mt-1">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="text-gray-900 text-sm mt-1">{user.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {(user.city || user.area || user.address) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📍</span> Location
              </h2>
              <div className="space-y-2 text-sm text-gray-700">
                {user.address && <p>{user.address}</p>}
                {user.landmark && <p className="text-gray-600">Near: {user.landmark}</p>}
                {(user.area || user.city) && (
                  <p className="font-medium">{[user.area, user.city].filter(Boolean).join(', ')}</p>
                )}
                {user.pincode && <p>PIN: {user.pincode}</p>}
              </div>
            </div>
          )}

          {/* Availability */}
          {user.availability && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🕒</span> Availability
              </h2>
              <p className="text-gray-700 capitalize">{user.availability}</p>
            </div>
          )}

          {/* Languages */}
          {user.languages && user.languages.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🌐</span> Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.languages.map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section - Only for providers */}
        {user.role === 'provider' && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                ⭐ My Reviews & Ratings
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
                      <div className="mt-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-blue-600">Your Response</span>
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
                  Complete more jobs to receive reviews from clients
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
