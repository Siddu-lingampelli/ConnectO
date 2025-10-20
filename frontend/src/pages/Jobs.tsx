import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { jobService } from '../services/jobService';
import type { Job } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const categories = [
  'All Categories',
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Gardening',
  'AC Repair',
  'Appliance Repair',
  'Pest Control',
  'Moving & Packing',
  'Home Renovation',
  'Interior Design',
  'Beauty & Wellness',
  'IT & Tech Support',
  'Other Services'
];

const cities = [
  'All Cities',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow'
];

const Jobs = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [selectedCategory, selectedCity]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        status: 'open'
      };

      if (selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }

      if (selectedCity !== 'All Cities') {
        params.city = selectedCity;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await jobService.getJobs(params);
      
      // Debug: Log the response structure
      console.log('Full API Response:', response);
      
      // The response is PaginatedResponse<Job> which has { success, data: Job[], pagination }
      const jobsData = response?.data || [];
      
      if (!Array.isArray(jobsData)) {
        console.error('Jobs data is not an array:', jobsData);
        setJobs([]);
      } else {
        setJobs(jobsData);
      }
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadJobs();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatBudget = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const getJobAge = (createdAt: string) => {
    const days = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return '🔥 Posted today';
    if (days === 1) return '⚡ Posted yesterday';
    if (days < 7) return `📅 Posted ${days} days ago`;
    const weeks = Math.floor(days / 7);
    return `📅 Posted ${weeks} week${weeks > 1 ? 's' : ''} ago`;
  };  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Please login to browse jobs.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentUser.role === 'client' ? 'My Jobs' : 'Browse Jobs'}
              </h1>
              <p className="text-gray-600 mt-2">
                {currentUser.role === 'client' 
                  ? 'Manage your posted jobs and track progress'
                  : 'Find jobs that match your skills and expertise'}
              </p>
            </div>
            
            {currentUser.role === 'client' && (
              <button
                onClick={() => navigate('/post-job')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Post New Job
              </button>
            )}
          </div>

          {/* Search and Filters */}
          {currentUser.role === 'provider' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search jobs by title or description..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Search
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {showFilters ? '✕ Hide' : '⚙️ Filters'}
                </button>
              </div>

              {showFilters && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => {
                        setSelectedCategory('All Categories');
                        setSelectedCity('All Cities');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Jobs List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentUser.role === 'client' ? 'No Jobs Posted Yet' : 'No Jobs Found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {currentUser.role === 'client' 
                  ? 'Start by posting your first job to find service providers'
                  : 'Try adjusting your filters or check back later for new opportunities'}
              </p>
              {currentUser.role === 'client' && (
                <button
                  onClick={() => navigate('/post-job')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Post Your First Job
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {jobs.length} Job{jobs.length !== 1 ? 's' : ''} Available
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {jobs.map((job) => {
                  // Type guard for client - could be User object or string (ID)
                  const client = typeof job.client !== 'string' ? job.client : null;
                  const proposalsCount = job.proposals?.length || 0;
                  
                  return (
                    <div 
                      key={job._id} 
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                {job.category}
                              </span>
                              <span className="inline-flex items-center">
                                📍 {job.location.city}, {job.location.area}
                              </span>
                              <span className="inline-flex items-center">
                                📅 Posted {formatDate(job.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {formatBudget(job.budget)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.budgetType === 'hourly' ? 'Per Hour' : 'Fixed'}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {job.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <p className="text-sm text-gray-500 flex items-center gap-3">
                              {getJobAge(job.createdAt)}
                            </p>
                            <p className="text-sm text-gray-500">
                              💼 {proposalsCount} Proposal{proposalsCount !== 1 ? 's' : ''}
                            </p>
                          </div>

                          <div className="flex space-x-3">
                            <button
                              onClick={() => navigate(`/jobs/${job._id}`)}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              View Details
                            </button>
                            {currentUser.role === 'provider' && (
                              <button
                                onClick={() => navigate(`/jobs/${job._id}/apply`)}
                                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                              >
                                Apply Now
                              </button>
                            )}
                            {currentUser.role === 'client' && proposalsCount > 0 && (
                              <button
                                onClick={() => navigate(`/jobs/${job._id}/proposals`)}
                                className="px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                              >
                                View Proposals ({proposalsCount})
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Client Info */}
                        {client && currentUser.role === 'provider' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {client.profilePicture ? (
                                    <img 
                                      src={client.profilePicture} 
                                      alt={client.fullName}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    client.fullName?.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{client.fullName}</p>
                                  <div className="flex items-center text-sm text-gray-600">
                                    {client.city && <span>📍 {client.city}</span>}
                                    {client.rating && (
                                      <span className="ml-3">⭐ {client.rating.toFixed(1)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => navigate(`/profile/${client.id || client._id}`)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                              >
                                👤 View Profile
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Jobs;
