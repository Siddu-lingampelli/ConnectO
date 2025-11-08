import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, MapPin, Clock, TrendingUp,
  Users, Star, ArrowRight, Sparkles, Target
} from 'lucide-react';
import { selectCurrentUser } from '../store/authSlice';
import { demoService } from '../services/demoService';
import type { Job } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdvancedSearchPanel from '../components/search/AdvancedSearchPanel';
import WishlistButton from '../components/wishlist/WishlistButton';
import searchService, { SearchFilter } from '../services/searchService';

const Jobs = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  
  const activeRole = currentUser?.activeRole || currentUser?.role || 'client';
  const isVerified = currentUser?.verification?.status === 'verified';
  const demoStatus = currentUser?.demoVerification?.status;
  const isDemoVerified = demoStatus === 'verified';
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState<string>('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRecommended, setShowRecommended] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    if (activeRole === 'provider') {
      loadRecommendedJobs();
    }
    // Load default search
    handleSearch('', {});
  }, [activeRole]);

  const loadRecommendedJobs = async () => {
    try {
      const response = await searchService.advancedSearch(
        'job',
        '',
        { sortBy: 'relevance' },
        'relevance',
        1,
        6
      );
      setRecommendedJobs(response.results);
    } catch (error) {
      console.log('Recommended jobs not available');
      // Silently fail, recommended is optional
    }
  };

  const handleSearch = async (query: string, filters: SearchFilter, page: number = 1) => {
    try {
      setLoading(true);
      
      // Try advanced search first
      try {
        const result = await searchService.advancedSearch(
          'job',
          query,
          filters,
          filters.sortBy || 'newest',
          page,
          12
        );

        setJobs(result.results);
        setTotalResults(result.total);
        setCurrentPage(result.page);
        setTotalPages(result.pages);
        setSearchId(result.searchId);
      } catch (searchError: any) {
        console.log('Advanced search not available, using fallback');
        // Fallback to simple API
        const response = await fetch('http://localhost:5000/api/jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch jobs');
        
        const data = await response.json();
        setJobs(data);
        setTotalResults(data.length);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = async (jobId: string) => {
    if (searchId) {
      try {
        await searchService.recordSearchClick(searchId, jobId, 'Job');
      } catch (error) {
        console.error('Error recording click:', error);
      }
    }
    navigate(`/jobs/${jobId}`);
  };

  const handleRequestDemo = async () => {
    try {
      await demoService.requestDemo();
      toast.success('Demo request submitted! Admin will assign you a demo project soon.');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Error requesting demo:', error);
      toast.error(error.response?.data?.message || 'Failed to request demo');
    }
  };

  const formatBudget = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white rounded-2xl shadow-soft border border-border p-12 max-w-md"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full mx-auto mb-6 flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Login Required</h2>
            <p className="text-text-secondary mb-6">Please login to browse and apply for jobs</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl font-medium hover:shadow-medium transition-all"
            >
              Login Now
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-text-secondary hover:text-text-primary mb-4 transition-colors group"
            >
              <ArrowRight className="w-5 h-5 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-2xl flex items-center justify-center shadow-soft">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text-primary">
                    {activeRole === 'client' ? 'My Jobs' : 'Find Jobs'}
                  </h1>
                  <p className="text-text-secondary mt-1">
                    {activeRole === 'client' 
                      ? 'Manage your posted jobs and track progress'
                      : 'Discover opportunities matching your skills'}
                  </p>
                </div>
              </div>

              {activeRole === 'client' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/post-job')}
                  className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl font-semibold shadow-soft hover:shadow-medium transition-all flex items-center gap-2"
                >
                  <span className="text-xl">+</span>
                  Post New Job
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Advanced Search Panel for Providers */}
          {activeRole === 'provider' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AdvancedSearchPanel
                searchType="job"
                onSearch={handleSearch}
              />
            </motion.div>
          )}

          {/* Stats Bar */}
          {activeRole === 'provider' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            >
              <div className="bg-white rounded-xl p-4 border border-border shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text-primary">{totalResults}</div>
                    <div className="text-xs text-text-secondary">Total Jobs</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-border shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text-primary">{recommendedJobs.length}</div>
                    <div className="text-xs text-text-secondary">Recommended</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-border shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text-primary">
                      {isVerified ? '✓' : '✗'}
                    </div>
                    <div className="text-xs text-text-secondary">Verified</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-border shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text-primary">
                      {isDemoVerified ? '✓' : '✗'}
                    </div>
                    <div className="text-xs text-text-secondary">Demo Done</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recommended Jobs Section */}
          {activeRole === 'provider' && recommendedJobs.length > 0 && showRecommended && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] rounded-2xl p-6 mb-6 border border-[#6B8F71]/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-[#345635]" />
                  <h2 className="text-2xl font-bold text-text-primary">Recommended For You</h2>
                  <span className="px-3 py-1 bg-[#345635]/10 text-[#345635] rounded-full text-xs font-semibold">
                    AI Matched
                  </span>
                </div>
                <button
                  onClick={() => setShowRecommended(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedJobs.slice(0, 3).map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={() => handleJobClick(job._id)}
                    className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-medium transition-all border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-text-primary line-clamp-2 flex-1">
                        {job.title}
                      </h3>
                      <WishlistButton itemType="job" itemId={job._id} size="sm" />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-[#E3EFD3] text-[#345635] rounded-full text-xs font-medium">
                        {job.category}
                      </span>
                      {job.providerType && (
                        <span className="px-2 py-1 bg-[#AEC3B0] text-[#0D2B1D] rounded-full text-xs font-medium">
                          {job.providerType}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="text-lg font-bold text-[#345635]">
                        {formatBudget(job.budget)}
                      </div>
                      <span className="text-xs text-text-secondary">
                        {formatDate(job.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">
              {totalResults} Job{totalResults !== 1 ? 's' : ''} Available
            </h2>
            
            <div className="flex items-center gap-2 bg-white rounded-lg border border-border p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Grid
              </button>
            </div>
          </div>

          {/* Jobs List/Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
                <p className="text-text-secondary font-medium">Loading jobs...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 text-center shadow-soft border border-border"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-full mx-auto mb-6 flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-[#345635]" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">No Jobs Found</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                {activeRole === 'client'
                  ? 'Start by posting your first job to find service providers'
                  : 'Try adjusting your search filters or check back later'}
              </p>
              {activeRole === 'client' && (
                <button
                  onClick={() => navigate('/post-job')}
                  className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl font-semibold hover:shadow-medium transition-all"
                >
                  Post Your First Job
                </button>
              )}
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              <AnimatePresence>
                {jobs.map((job, index) => {
                  const client = typeof job.client !== 'string' ? job.client : null;
                  const proposalsCount = job.proposals?.length || 0;

                  return (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl shadow-soft border border-border hover:shadow-medium transition-all overflow-hidden"
                    >
                      {/* Wishlist Button */}
                      {activeRole === 'provider' && (
                        <div className="absolute top-4 right-4 z-10">
                          <WishlistButton itemType="job" itemId={job._id} size="md" />
                        </div>
                      )}

                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4 pr-8">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-2">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-3 py-1 bg-[#E3EFD3] text-[#345635] rounded-full text-xs font-semibold">
                                {job.category}
                              </span>
                              {job.providerType && (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  job.providerType === 'Technical'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {job.providerType}
                                </span>
                              )}
                              {job.location?.city && (
                                <span className="flex items-center gap-1 text-xs text-text-secondary">
                                  <MapPin className="w-3 h-3" />
                                  {job.location.city}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#345635]">
                              {formatBudget(job.budget)}
                            </div>
                            <div className="text-xs text-text-secondary">
                              {job.budgetType === 'hourly' ? 'Per Hour' : 'Fixed'}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-text-secondary mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(job.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {proposalsCount} Proposal{proposalsCount !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-border">
                          <button
                            onClick={() => handleJobClick(job._id)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl font-medium hover:shadow-medium transition-all"
                          >
                            View Details
                          </button>

                          {activeRole === 'provider' && (
                            <>
                              {!isVerified ? (
                                <button
                                  onClick={() => {
                                    toast.warning('Complete verification first!');
                                    navigate('/verification');
                                  }}
                                  className="flex-1 px-4 py-2 border-2 border-yellow-500 text-yellow-700 rounded-xl font-medium hover:bg-yellow-50 transition-all"
                                >
                                  Verify First
                                </button>
                              ) : !isDemoVerified ? (
                                <button
                                  onClick={handleRequestDemo}
                                  className="flex-1 px-4 py-2 border-2 border-[#6B8F71] text-[#345635] rounded-xl font-medium hover:bg-[#E3EFD3] transition-all"
                                >
                                  Request Demo
                                </button>
                              ) : (
                                <button
                                  onClick={() => navigate(`/jobs/${job._id}/apply`)}
                                  className="flex-1 px-4 py-2 border-2 border-[#6B8F71] text-[#345635] rounded-xl font-medium hover:bg-[#E3EFD3] transition-all"
                                >
                                  Apply Now
                                </button>
                              )}
                            </>
                          )}

                          {activeRole === 'client' && (
                            <>
                              {proposalsCount > 0 && (
                                <button
                                  onClick={() => navigate(`/jobs/${job._id}/proposals`)}
                                  className="flex-1 px-4 py-2 border-2 border-[#6B8F71] text-[#345635] rounded-xl font-medium hover:bg-[#E3EFD3] transition-all"
                                >
                                  View Proposals
                                </button>
                              )}
                            </>
                          )}
                        </div>

                        {/* Client Info for Providers */}
                        {client && activeRole === 'provider' && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white font-bold">
                                {client.profilePicture ? (
                                  <img src={client.profilePicture} alt={client.fullName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  client.fullName?.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-text-primary">{client.fullName}</p>
                                <p className="text-xs text-text-secondary">{client.city}</p>
                              </div>
                              {client.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-semibold">{client.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 mt-8"
            >
              <button
                onClick={() => handleSearch('', {}, currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-surface text-text-secondary cursor-not-allowed'
                    : 'bg-white border-2 border-[#6B8F71] text-[#345635] hover:bg-[#E3EFD3]'
                }`}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSearch('', {}, pageNum)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white'
                        : 'bg-white border border-border text-text-primary hover:bg-[#E3EFD3]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handleSearch('', {}, currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-surface text-text-secondary cursor-not-allowed'
                    : 'bg-white border-2 border-[#6B8F71] text-[#345635] hover:bg-[#E3EFD3]'
                }`}
              >
                Next
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
