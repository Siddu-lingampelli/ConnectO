import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/authSlice';
import { recommendationService } from '../../services/recommendationService';

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: string;
  location: {
    city: string;
    area: string;
  };
  client: {
    fullName: string;
    city?: string;
    rating?: number;
  };
  deadline: string;
  matchScore?: number;
  matchReason?: any;
}

interface Provider {
  _id: string;
  fullName: string;
  city?: string;
  rating?: number;
  completedJobs?: number;
  skills?: string[];
  services?: string[];
  bio?: string;
  hourlyRate?: number;
  providerType?: string;
  verification?: {
    status: string;
  };
  demoVerification?: {
    status: string;
    score?: number;
  };
  matchScore?: number;
  matchReason?: any;
}

const RecommendationsCard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [recommendations, setRecommendations] = useState<(Job | Provider)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecommendations();
  }, [currentUser]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await recommendationService.getPersonalizedRecommendations();
      setRecommendations(response.data || []);
    } catch (error: any) {
      console.error('Error loading recommendations:', error);
      setError(error.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <span className="text-4xl mb-3 block">⚠️</span>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {currentUser.role === 'provider' ? '🎯 Recommended Jobs for You' : '🎯 Recommended Providers'}
        </h3>
        <div className="text-center py-8">
          <span className="text-4xl mb-3 block">💡</span>
          <p className="text-gray-600 mb-4">
            {currentUser.role === 'provider' 
              ? 'Complete your profile with skills to get job recommendations'
              : 'Post a job to get provider recommendations'}
          </p>
          <button
            onClick={() => navigate(currentUser.role === 'provider' ? '/settings' : '/post-job')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentUser.role === 'provider' ? 'Complete Profile' : 'Post a Job'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>🎯</span>
          {currentUser.role === 'provider' ? 'Recommended Jobs for You' : 'Recommended Providers'}
        </h3>
        <button
          onClick={() => navigate(currentUser.role === 'provider' ? '/jobs' : '/browse-providers')}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          View All →
        </button>
      </div>

      <div className="space-y-3">
        {currentUser.role === 'provider' ? (
          // Render Job Recommendations for Providers
          recommendations.slice(0, 5).map((item) => {
            const job = item as Job;
            return (
              <div
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}/apply`)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {job.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {job.description}
                    </p>
                  </div>
                  {job.matchScore && (
                    <div className="ml-3 flex-shrink-0">
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {job.matchScore}% Match
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {job.category}
                  </span>
                  <span>💰 ₹{job.budget}</span>
                  <span>📍 {job.location.city}</span>
                  {job.client?.rating && (
                    <span>⭐ {job.client.rating.toFixed(1)}</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          // Render Provider Recommendations for Clients
          recommendations.slice(0, 5).map((item) => {
            const provider = item as Provider;
            return (
              <div
                key={provider._id}
                onClick={() => navigate(`/profile/${provider._id}`)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {provider.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {provider.fullName}
                        {provider.verification?.status === 'verified' && (
                          <span className="text-blue-500" title="Verified">✓</span>
                        )}
                      </h4>
                      {provider.bio && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {provider.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  {provider.matchScore && (
                    <div className="ml-3 flex-shrink-0">
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {provider.matchScore}% Match
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                  {provider.rating && (
                    <span>⭐ {provider.rating.toFixed(1)}</span>
                  )}
                  {provider.completedJobs !== undefined && (
                    <span>• {provider.completedJobs} jobs</span>
                  )}
                  {provider.city && (
                    <span>• 📍 {provider.city}</span>
                  )}
                  {provider.hourlyRate && (
                    <span>• ₹{provider.hourlyRate}/hr</span>
                  )}
                </div>
                {provider.skills && provider.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {provider.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {provider.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{provider.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {recommendations.length > 5 && (
        <button
          onClick={() => navigate(currentUser.role === 'provider' ? '/jobs' : '/browse-providers')}
          className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
        >
          View All {recommendations.length} Recommendations →
        </button>
      )}
    </div>
  );
};

export default RecommendationsCard;
