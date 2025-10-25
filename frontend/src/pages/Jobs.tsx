import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { jobService } from '../services/jobService';
import type { Job } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import VoiceSearch from '../components/search/VoiceSearch';
import WishlistButton from '../components/wishlist/WishlistButton';

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
  
  // Get active role for dual role system
  const activeRole = currentUser?.activeRole || currentUser?.role || 'client';
  
  // Check verification and demo status for providers
  const isVerified = currentUser?.verification?.status === 'verified';
  const demoStatus = currentUser?.demoVerification?.status;
  const isDemoVerified = demoStatus === 'verified';
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [nearbyJobs, setNearbyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedProviderType, setSelectedProviderType] = useState('All Types');
  const [selectedBudgetType, setSelectedBudgetType] = useState('All Types');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showRecommended, setShowRecommended] = useState(true);
  const [showNearby, setShowNearby] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchRadius, setSearchRadius] = useState(10); // Default 10km
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    loadJobs();
    if (activeRole === 'provider') {
      loadRecommendedJobs();
      // Don't auto-request location on page load
      // User must click "Enable Location" button
    }
  }, [selectedCategory, selectedCity, selectedProviderType, selectedBudgetType, budgetMin, budgetMax]);

  useEffect(() => {
    // Load nearby jobs when location changes
    if (userLocation && activeRole === 'provider') {
      loadNearbyJobs();
    }
  }, [userLocation, searchRadius]);

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
          toast.success('📍 Location detected! Showing nearby jobs.');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationPermission('denied');
          
          if (error.code === error.PERMISSION_DENIED) {
            toast.info('Enable location access to see nearby jobs');
          } else {
            toast.error('Could not detect your location');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setLocationPermission('denied');
    }
  };

  const loadNearbyJobs = async () => {
    if (!userLocation) return;
    
    try {
      setLoadingNearby(true);
      const response = await jobService.getNearbyJobs(
        userLocation.lat,
        userLocation.lng,
        searchRadius,
        1,
        10
      );
      const jobsData = response?.data || [];
      
      if (Array.isArray(jobsData)) {
        setNearbyJobs(jobsData);
      }
    } catch (error: any) {
      console.error('Error loading nearby jobs:', error);
      // Don't show error toast if no jobs found
      if (error.response?.status !== 404) {
        console.log('Could not load nearby jobs');
      }
    } finally {
      setLoadingNearby(false);
    }
  };

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

      // Auto-filter by provider type if user is a provider
      if (currentUser?.role === 'provider' && currentUser?.providerType) {
        // Always filter by user's provider type for providers
        params.providerType = currentUser.providerType;
      } else if (selectedProviderType !== 'All Types') {
        // For clients or when manually filtering
        params.providerType = selectedProviderType;
      }

      if (selectedBudgetType !== 'All Types') {
        params.budgetType = selectedBudgetType === 'Fixed' ? 'fixed' : 'hourly';
      }

      if (budgetMin) {
        params.budgetMin = parseInt(budgetMin);
      }

      if (budgetMax) {
        params.budgetMax = parseInt(budgetMax);
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

  const loadRecommendedJobs = async () => {
    try {
      setLoadingRecommended(true);
      const response = await jobService.getRecommendedJobs(1, 5);
      const jobsData = response?.data || [];
      
      if (Array.isArray(jobsData)) {
        setRecommendedJobs(jobsData);
      }
    } catch (error: any) {
      console.error('Error loading recommended jobs:', error);
    } finally {
      setLoadingRecommended(false);
    }
  };

  const handleSearch = () => {
    loadJobs();
  };

  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedCity('All Cities');
    setSelectedProviderType('All Types');
    setSelectedBudgetType('All Types');
    setBudgetMin('');
    setBudgetMax('');
    setSearchQuery('');
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border-2 border-[#E3EFD3]">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🔒</span>
            </div>
            <p className="text-[#6B8F71] text-lg font-medium">Please login to browse jobs.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button - Emerald Theme */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#345635] hover:text-[#0D2B1D] mb-6 transition-all hover:scale-105 group font-medium"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>

          {/* Header - Emerald Theme */}
          <div className="flex items-center justify-between mb-6 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0D2B1D] to-[#345635] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">{activeRole === 'client' ? '📋' : '🔍'}</span>
                </div>
                <h1 className="text-4xl font-bold text-[#0D2B1D]">
                  {activeRole === 'client' ? 'My Jobs' : 'Browse Jobs'}
                </h1>
              </div>
              <p className="text-[#6B8F71] mt-2 text-lg ml-16">
                {activeRole === 'client' 
                  ? 'Manage your posted jobs and track progress'
                  : 'Find jobs that match your skills and expertise'}
              </p>
            </div>
            
            {activeRole === 'client' && (
              <button
                onClick={() => navigate('/post-job')}
                className="px-8 py-4 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-2xl hover:scale-105 transition-all font-bold shadow-xl flex items-center gap-2"
              >
                <span className="text-2xl">+</span> Post New Job
              </button>
            )}
          </div>

          {/* Search and Filters - Emerald Theme */}
          {activeRole === 'provider' && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-[#E3EFD3] p-6 mb-6 animate-fade-in-up hover:shadow-2xl transition-all">
              {/* Voice Search */}
              <div className="mb-4 relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-lg flex items-center justify-center">
                    <span className="text-lg">🎤</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0D2B1D]">Voice Search - Multiple Languages</h3>
                </div>
                <VoiceSearch
                  value={searchQuery}
                  onSearch={(text) => {
                    setSearchQuery(text);
                    handleSearch();
                  }}
                  placeholder="Search jobs by title, description, or category..."
                />
              </div>

              {/* Filters Toggle */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-2 border-2 border-[#AEC3B0] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-bold text-sm hover:scale-105"
                >
                  {showFilters ? '✕ Hide Filters' : '⚙️ Show Filters'}
                </button>
              </div>

              {showFilters && (
                <div className="border-t-2 border-[#E3EFD3] pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-[#345635] mb-2">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#345635] bg-white text-[#0D2B1D] font-medium"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#345635] mb-2">
                        City
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#345635] bg-white text-[#0D2B1D] font-medium"
                      >
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#345635] mb-2">
                        Provider Type
                      </label>
                      {currentUser?.role === 'provider' && currentUser?.providerType ? (
                        <div className="w-full px-4 py-2 border-2 border-[#6B8F71] rounded-xl bg-gradient-to-r from-[#E3EFD3] to-[#F8FBF9] text-[#0D2B1D] flex items-center justify-between font-medium">
                          <span>
                            {currentUser.providerType === 'Technical' ? '💻 Technical' : '🔧 Non-Technical'}
                          </span>
                          <span className="text-xs text-[#6B8F71] font-bold">(Your Type)</span>
                        </div>
                      ) : (
                        <select
                          value={selectedProviderType}
                          onChange={(e) => setSelectedProviderType(e.target.value)}
                          className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#345635] bg-white text-[#0D2B1D] font-medium"
                        >
                          <option value="All Types">All Types</option>
                          <option value="Technical">💻 Technical</option>
                          <option value="Non-Technical">🔧 Non-Technical</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#345635] mb-2">
                        Budget Type
                      </label>
                      <select
                        value={selectedBudgetType}
                        onChange={(e) => setSelectedBudgetType(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#345635] bg-white text-[#0D2B1D] font-medium"
                      >
                        <option value="All Types">All Types</option>
                        <option value="Fixed">Fixed Price</option>
                        <option value="Hourly">Hourly Rate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#345635] mb-2">
                        Min Budget (₹)
                      </label>
                      <input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        placeholder="Min amount"
                        className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#345635] bg-white text-[#0D2B1D]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#345635] mb-2">
                        Max Budget (₹)
                      </label>
                      <input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        placeholder="Max amount"
                        className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#345635] bg-white text-[#0D2B1D]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={clearFilters}
                      className="px-6 py-2 text-[#6B8F71] hover:text-[#0D2B1D] font-bold hover:scale-105 transition-all"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Near Me Jobs Section - GPS-based - Only for Providers */}
          {activeRole === 'provider' && (
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  <h2 className="text-xl font-bold text-gray-900">Jobs Near You</h2>
                  {userLocation && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      📡 Live Location Active
                    </span>
                  )}
                </div>
                {nearbyJobs.length > 0 && (
                  <button
                    onClick={() => setShowNearby(!showNearby)}
                    className="text-gray-500 hover:text-gray-700"
                    title={showNearby ? "Hide nearby jobs" : "Show nearby jobs"}
                  >
                    {showNearby ? '✕' : '👁️'}
                  </button>
                )}
              </div>

              {!userLocation && locationPermission === 'prompt' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">📍</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Enable Location to See Nearby Jobs
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We'll show you jobs within {searchRadius}km of your current location
                  </p>
                  <button
                    onClick={requestLocation}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    📍 Enable Location Access
                  </button>
                </div>
              )}

              {locationPermission === 'denied' && (
                <div className="text-center py-6 bg-yellow-50 rounded-lg">
                  <span className="text-3xl mb-2 block">⚠️</span>
                  <p className="text-gray-700 mb-2">
                    Location access is blocked. Please enable it in your browser settings.
                  </p>
                  <button
                    onClick={requestLocation}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {userLocation && showNearby && (
                <>
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Search Radius:
                      </label>
                      <select
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value={5}>5 km</option>
                        <option value={10}>10 km</option>
                        <option value={20}>20 km</option>
                        <option value={50}>50 km</option>
                        <option value={100}>100 km</option>
                      </select>
                    </div>
                    <button
                      onClick={loadNearbyJobs}
                      className="px-4 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      🔄 Refresh
                    </button>
                    <button
                      onClick={() => {
                        setUserLocation(null);
                        setNearbyJobs([]);
                        setLocationPermission('prompt');
                        toast.info('Location turned off');
                      }}
                      className="px-4 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      📍 Turn Off Location
                    </button>
                    <div className="text-xs text-gray-500">
                      📌 Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                    </div>
                  </div>

                  {loadingNearby ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : nearbyJobs.length === 0 ? (
                    <div className="text-center py-6">
                      <span className="text-3xl mb-2 block">🔍</span>
                      <p className="text-gray-600">
                        No jobs found within {searchRadius}km. Try increasing the search radius.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {nearbyJobs.map((job) => {
                        const distanceKm = job.distanceInKm || 0;
                        
                        return (
                          <div 
                            key={job._id} 
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer border-l-4 border-green-500"
                            onClick={() => navigate(`/jobs/${job._id}`)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                                {job.title}
                              </h3>
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold whitespace-nowrap">
                                📍 {distanceKm.toFixed(1)}km
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {job.category}
                              </span>
                              {job.providerType && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  job.providerType === 'Technical' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {job.providerType === 'Technical' ? '💻' : '🔧'}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {job.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-green-600">
                                {formatBudget(job.budget)}
                              </div>
                              {job.location?.city && (
                                <span className="text-xs text-gray-500">
                                  📍 {job.location.city}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Recommended Jobs Section - Only for Providers */}
          {activeRole === 'provider' && recommendedJobs.length > 0 && showRecommended && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <h2 className="text-xl font-bold text-gray-900">Recommended For You</h2>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    Based on your profile
                  </span>
                </div>
                <button
                  onClick={() => setShowRecommended(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Hide recommendations"
                >
                  ✕
                </button>
              </div>

              {loadingRecommended ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedJobs.slice(0, 3).map((job) => {
                    return (
                      <div 
                        key={job._id} 
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {job.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {job.category}
                          </span>
                          {job.providerType && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              job.providerType === 'Technical' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {job.providerType === 'Technical' ? '💻' : '🔧'}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-green-600">
                            {formatBudget(job.budget)}
                          </div>
                          {job.location?.city && (
                            <span className="text-xs text-gray-500">
                              📍 {job.location.city}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {recommendedJobs.length > 3 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    + {recommendedJobs.length - 3} more recommended jobs below
                  </p>
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
                {activeRole === 'client' ? 'No Jobs Posted Yet' : 'No Jobs Found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeRole === 'client' 
                  ? 'Start by posting your first job to find service providers'
                  : 'Try adjusting your filters or check back later for new opportunities'}
              </p>
              {activeRole === 'client' && (
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
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative"
                    >
                      {/* Wishlist Button - Only for Providers */}
                      {activeRole === 'provider' && (
                        <div className="absolute top-4 right-4 z-10">
                          <WishlistButton
                            itemType="job"
                            itemId={job._id}
                            size="sm"
                          />
                        </div>
                      )}
                      
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 pr-12">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                {job.category}
                              </span>
                              {job.providerType && (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${
                                  job.providerType === 'Technical' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {job.providerType === 'Technical' ? '💻 Technical' : '🔧 Non-Technical'}
                                </span>
                              )}
                              {job.location?.city && (
                                <span className="inline-flex items-center">
                                  📍 {job.location.city}{job.location.area && `, ${job.location.area}`}
                                </span>
                              )}
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
                            {activeRole === 'provider' && (
                              <>
                                {!isVerified ? (
                                  <button
                                    onClick={() => {
                                      toast.warning('Please complete verification first!');
                                      navigate('/verification');
                                    }}
                                    className="px-6 py-2 border-2 border-yellow-500 text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
                                  >
                                    🔒 Verify to Apply
                                  </button>
                                ) : !isDemoVerified ? (
                                  <button
                                    onClick={() => {
                                      toast.warning('Please complete demo project first!');
                                      navigate('/demo-project');
                                    }}
                                    className="px-6 py-2 border-2 border-orange-500 text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                                  >
                                    🎯 Complete Demo
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => navigate(`/jobs/${job._id}/apply`)}
                                    className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                  >
                                    Apply Now
                                  </button>
                                )}
                              </>
                            )}
                            {activeRole === 'client' && (typeof job.client === 'object' ? job.client._id === currentUser._id : job.client === currentUser._id) && (
                              <button
                                onClick={() => navigate(`/jobs/${job._id}/edit`)}
                                className="px-6 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                              >
                                Edit Job
                              </button>
                            )}
                            {activeRole === 'client' && proposalsCount > 0 && (
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
                        {client && activeRole === 'provider' && (
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
