import { useNavigate } from 'react-router-dom';
import type { User } from '../../types';

interface PublicProfileProps {
  user: User;
  currentUser: User;
}

const PublicProfile = ({ user, currentUser }: PublicProfileProps) => {
  const navigate = useNavigate();

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

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          ⭐ Reviews
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600">No reviews yet</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
