import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';
import { jobService } from '../../services/jobService';
import type { User, Job } from '../../types';

const SearchProviders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'providers' | 'jobs'>('providers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [providers, setProviders] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
    'AC Repair', 'Appliance Repair', 'Pest Control', 'Gardening',
    'Home Renovation', 'Interior Design', 'Moving & Packing'
  ];

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'providers') {
        // Search for service providers
        const results = await userService.searchProviders({
          search: searchQuery,
          category: selectedCategory,
          city: selectedCity,
          minRating: minRating > 0 ? minRating : undefined,
        });
        
        setProviders(results);
        
        if (results.length === 0) {
          toast.info('No providers found matching your criteria');
        } else {
          toast.success(`Found ${results.length} provider${results.length !== 1 ? 's' : ''}`);
        }
      } else {
        // Search for jobs
        const response = await jobService.getJobs({
          search: searchQuery,
          category: selectedCategory !== '' ? selectedCategory : undefined,
          city: selectedCity !== '' ? selectedCity : undefined,
          status: 'open'
        });
        
        setJobs(response.data);
        
        if (response.data.length === 0) {
          toast.info('No jobs found matching your criteria');
        } else {
          toast.success(`Found ${response.data.length} job${response.data.length !== 1 ? 's' : ''}`);
        }
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.response?.data?.message || 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setMinRating(0);
    setProviders([]);
    setJobs([]);
  };

  const handleTabSwitch = (tab: 'providers' | 'jobs') => {
    setActiveTab(tab);
    setProviders([]);
    setJobs([]);
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('');
  };

  const formatBudget = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      {/* Tab Switcher */}
      <div className="bg-white rounded-lg shadow-md p-2 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabSwitch('providers')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'providers'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            👥 Search Providers
          </button>
          <button
            onClick={() => handleTabSwitch('jobs')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'jobs'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            💼 Search Jobs
          </button>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {activeTab === 'providers' ? '🔍 Find Service Providers' : '💼 Find Jobs'}
        </h2>
        
        {/* Main Search Bar */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={
              activeTab === 'providers' 
                ? "Search by name, skills, or service..." 
                : "Search jobs by title or description..."
            }
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {showFilters ? '✕ Hide Filters' : '⚙️ Filters'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Results - Providers */}
      {activeTab === 'providers' && providers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {providers.length} Provider{providers.length !== 1 ? 's' : ''} Found
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div key={provider.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Provider Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                      {provider.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{provider.fullName}</h3>
                      <p className="text-blue-100 text-sm">{provider.city || 'Location not set'}</p>
                    </div>
                  </div>
                </div>

                {/* Provider Info */}
                <div className="p-4">
                  {/* Rating */}
                  {provider.rating && (
                    <div className="flex items-center space-x-1 mb-3">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                      <span className="text-gray-600 text-sm">({provider.completedJobs || 0} jobs)</span>
                    </div>
                  )}

                  {/* Bio */}
                  {provider.bio && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {provider.bio}
                    </p>
                  )}

                  {/* Services */}
                  {provider.services && provider.services.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.services.slice(0, 3).map((service, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium"
                          >
                            {service}
                          </span>
                        ))}
                        {provider.services.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{provider.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {provider.skills && provider.skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {provider.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{provider.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hourly Rate */}
                  {provider.hourlyRate && (
                    <div className="mb-3">
                      <span className="text-gray-600 text-sm">Starting from </span>
                      <span className="text-green-600 font-semibold">₹{provider.hourlyRate}/hr</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 mt-4">
                    <button 
                      onClick={() => navigate(`/profile/${provider.id}`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => navigate(`/messages?userId=${provider.id}`)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Send Message"
                    >
                      💬
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results - Jobs */}
      {activeTab === 'jobs' && jobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {jobs.length} Job{jobs.length !== 1 ? 's' : ''} Found
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => {
              const client = typeof job.client !== 'string' ? job.client : null;
              const proposalsCount = job.proposals?.length || 0;
              
              return (
                <div key={job._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
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
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>💼 {proposalsCount} Proposal{proposalsCount !== 1 ? 's' : ''}</span>
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          {job.status}
                        </span>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>

                    {/* Client Info */}
                    {client && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
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
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results / Initial State */}
      {!loading && activeTab === 'providers' && providers.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-5xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Search for Service Providers
          </h3>
          <p className="text-gray-600 mb-6">
            Use the search bar above to find skilled professionals for your needs
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery(cat);
                  handleSearch();
                }}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Jobs Found */}
      {!loading && activeTab === 'jobs' && jobs.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-5xl">💼</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Search for Jobs
          </h3>
          <p className="text-gray-600 mb-6">
            Find jobs that match your skills and interests
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery(cat);
                  handleSearch();
                }}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchProviders;
