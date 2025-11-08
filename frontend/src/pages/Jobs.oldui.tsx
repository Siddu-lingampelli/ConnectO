import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
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
          toast.success('Location detected! Showing nearby jobs.');
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
    if (days === 0) return 'Posted today';
    if (days === 1) return 'Posted yesterday';
    if (days < 7) return `Posted ${days} days ago`;
    const weeks = Math.floor(days / 7);
    return `Posted ${weeks} week${weeks > 1 ? 's' : ''} ago`;
  };  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-medium">Please login to browse jobs.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button with Animation */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.05, x: -5 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-primary-700 hover:text-primary-800 mb-6 font-medium"
          >
            <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </motion.button>

          {/* Header with Framer Motion */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <div className="flex items-center gap-4 mb-2">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  {activeRole === 'client' ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-4xl font-bold text-gray-900"
                >
                  {activeRole === 'client' ? 'My Jobs' : 'Browse Jobs'}
                </motion.h1>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-gray-600 mt-2 text-lg ml-16"
              >
                {activeRole === 'client' 
                  ? 'Manage your posted jobs and track progress'
                  : 'Find jobs that match your skills and expertise'}
              </motion.p>
            </div>
            
            {activeRole === 'client' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(79, 70, 229, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/post-job')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl flex items-center gap-2"
              >
                <span className="text-2xl">+</span> Post New Job
              </motion.button>
            )}
          </motion.div>

          {/* Search and Filters with Animation */}
          {activeRole === 'provider' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6 hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Voice Search */}
              <div className="mb-4 relative">
                <div className="flex items-center gap-2 mb-3">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-sm font-bold text-gray-900">Voice Search - Multiple Languages</h3>
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-bold text-sm flex items-center gap-2"
                >
                  {showFilters ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Show Filters
                    </>
                  )}
                </motion.button>
              </div>

              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t-2 border-gray-200 pt-4 mt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 font-medium"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        City
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 font-medium"
                      >
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Provider Type
                      </label>
                      {currentUser?.role === 'provider' && currentUser?.providerType ? (
                        <div className="w-full px-4 py-2 border-2 border-blue-600 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-900 flex items-center justify-between font-medium">
                          <span className="flex items-center gap-2">
                            {currentUser.providerType === 'Technical' ? (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Technical
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Non-Technical
                              </>
                            )}
                          </span>
                          <span className="text-xs text-blue-600 font-bold">(Your Type)</span>
                        </div>
                      ) : (
                        <select
                          value={selectedProviderType}
                          onChange={(e) => setSelectedProviderType(e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 font-medium"
                        >
                          <option value="All Types">All Types</option>
                          <option value="Technical">Technical</option>
                          <option value="Non-Technical">Non-Technical</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Budget Type
                      </label>
                      <select
                        value={selectedBudgetType}
                        onChange={(e) => setSelectedBudgetType(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 font-medium"
                      >
                        <option value="All Types">All Types</option>
                        <option value="Fixed">Fixed Price</option>
                        <option value="Hourly">Hourly Rate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Min Budget (₹)
                      </label>
                      <input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        placeholder="Min amount"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Max Budget (₹)
                      </label>
                      <input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        placeholder="Max amount"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearFilters}
                      className="px-6 py-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
                    >
                      Clear Filters
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Near Me Jobs Section with Animation */}
          {activeRole === 'provider' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 mb-6 border border-blue-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <motion.svg 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-6 text-blue-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </motion.svg>
                  <h2 className="text-xl font-bold text-gray-900">Jobs Near You</h2>
                  {userLocation && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1"
                    >
                      <motion.svg 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-3 h-3" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </motion.svg>
                      Live Location Active
                    </motion.span>
                  )}
                </div>
                {nearbyJobs.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNearby(!showNearby)}
                    className="text-gray-500 hover:text-gray-700"
                    title={showNearby ? "Hide nearby jobs" : "Show nearby jobs"}
                  >
                    {showNearby ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </motion.button>
                )}
              </div>

              {!userLocation && locationPermission === 'prompt' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-8"
                >
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center"
                  >
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Enable Location to See Nearby Jobs
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We'll show you jobs within {searchRadius}km of your current location
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={requestLocation}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Enable Location Access
                  </motion.button>
                </motion.div>
              )}

              {locationPermission === 'denied' && (
                <div className="text-center py-6 bg-yellow-50 rounded-lg">
                  <svg className="w-12 h-12 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-gray-700 mb-2">
                    Location access is blocked. Please enable it in your browser settings.
                  </p>
                  <button
                    onClick={requestLocation}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
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
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="px-4 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                    <button
                      onClick={() => {
                        setUserLocation(null);
                        setNearbyJobs([]);
                        setLocationPermission('prompt');
                        toast.info('Location turned off');
                      }}
                      className="px-4 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Turn Off Location
                    </button>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                    </div>
                  </div>

                  {loadingNearby ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : nearbyJobs.length === 0 ? (
                    <div className="text-center py-6">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
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
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer border-l-4 border-blue-500"
                            onClick={() => navigate(`/jobs/${job._id}`)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                                {job.title}
                              </h3>
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {distanceKm.toFixed(1)}km
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {job.category}
                              </span>
                              {job.providerType && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                  job.providerType === 'Technical' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {job.providerType === 'Technical' ? (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  )}
                                  {job.providerType}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {job.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-blue-600">
                                {formatBudget(job.budget)}
                              </div>
                              {job.location?.city && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {job.location.city}
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
            </motion.div>
          )}

          {/* Recommended Jobs Section - Only for Providers */}
          {activeRole === 'provider' && recommendedJobs.length > 0 && showRecommended && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                              job.providerType === 'Technical' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {job.providerType === 'Technical' ? (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                              {job.providerType}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-blue-600">
                            {formatBudget(job.budget)}
                          </div>
                          {job.location?.city && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {job.location.city}
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
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
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
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium ${
                                  job.providerType === 'Technical' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {job.providerType === 'Technical' ? (
                                    <>
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                      </svg>
                                      Technical
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      Non-Technical
                                    </>
                                  )}
                                </span>
                              )}
                              {job.location?.city && (
                                <span className="inline-flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {job.location.city}{job.location.area && `, ${job.location.area}`}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Posted {formatDate(job.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
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
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {proposalsCount} Proposal{proposalsCount !== 1 ? 's' : ''}
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
                                    className="px-6 py-2 border-2 border-yellow-500 text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Verify to Apply
                                  </button>
                                ) : !isDemoVerified ? (
                                  <button
                                    onClick={() => {
                                      toast.warning('Please complete demo project first!');
                                      navigate('/demo-project');
                                    }}
                                    className="px-6 py-2 border-2 border-orange-500 text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Complete Demo
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
                                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
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
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
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
                                    {client.city && (
                                      <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {client.city}
                                      </span>
                                    )}
                                    {client.rating && (
                                      <span className="ml-3 flex items-center gap-1">
                                        <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {client.rating.toFixed(1)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => navigate(`/profile/${client.id || client._id}`)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                View Profile
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
