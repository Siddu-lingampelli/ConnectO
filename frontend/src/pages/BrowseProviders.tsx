import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  Users, MapPin, Star, Award, Briefcase,
  ArrowLeft, Sparkles, CheckCircle, Target
} from 'lucide-react';
import { selectCurrentUser } from '../store/authSlice';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdvancedSearchPanel from '../components/search/AdvancedSearchPanel';
import WishlistButton from '../components/wishlist/WishlistButton';
import FollowButton from '../components/follow/FollowButton';
import searchService, { SearchFilter } from '../services/searchService';

interface Provider {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  area?: string;
  providerType?: 'Technical' | 'Non-Technical';
  skills?: string[];
  services?: string[];
  rating?: number;
  completedJobs?: number;
  profilePicture?: string;
  bio?: string;
  hourlyRate?: number;
  experience?: string;
  isVerified?: boolean;
  demoVerification?: {
    status?: string;
    score?: number;
  };
}

const BrowseProviders = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState<string>('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Load default search on mount
    loadProviders('', {});
  }, []);

  const loadProviders = async (query: string, filters: SearchFilter, page: number = 1) => {
    try {
      setLoading(true);
      
      const result = await searchService.advancedSearch(
        'provider',
        query,
        filters,
        filters.sortBy || 'relevance',
        page,
        20
      );

      setProviders(result.results);
      setTotalResults(result.total);
      setCurrentPage(result.page);
      setTotalPages(result.pages);
      setSearchId(result.searchId);
    } catch (error: any) {
      console.error('Error loading providers:', error);
      toast.error('Failed to load service providers');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string, filters: SearchFilter) => {
    setCurrentPage(1);
    loadProviders(query, filters, 1);
  };

  const handleProviderClick = async (providerId: string) => {
    // Record the click in search history
    if (searchId) {
      try {
        await searchService.recordSearchClick(searchId, providerId, 'User');
      } catch (error) {
        console.error('Error recording click:', error);
      }
    }
    navigate(`/profile/${providerId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Re-run search with new page
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 flex items-center justify-center">
          <p className="text-text-secondary font-medium">Please login to browse service providers.</p>
        </div></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-text-secondary hover:text-text-primary mb-4 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-2xl flex items-center justify-center shadow-soft">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-text-primary">Browse Service Providers</h1>
                <p className="text-text-secondary mt-1">Find verified professionals for your service needs</p>
              </div>
            </div>
          </motion.div>

          {/* Advanced Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AdvancedSearchPanel
              searchType="provider"
              onSearch={handleSearch}
            />
          </motion.div>

          {/* Providers List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
                <p className="text-text-secondary font-medium">Loading providers...</p>
              </div>
            </div>
          ) : providers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-soft border border-border p-12 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="w-12 h-12 text-[#345635]" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">No Providers Found</h3>
              <p className="text-text-secondary mb-6">Try adjusting your filters or search criteria</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between"
              >
                <h3 className="text-xl font-semibold text-text-primary">
                  {totalResults} Provider{totalResults !== 1 ? 's' : ''} Found
                </h3>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider, index) => (
                  <motion.div
                    key={provider._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-soft border border-border hover:shadow-medium transition-all overflow-hidden relative group"
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FollowButton
                        userId={provider._id}
                        size="sm"
                        showLabel={false}
                      />
                      <WishlistButton
                        itemType="provider"
                        itemId={provider._id}
                        size="md"
                      />
                    </div>

                    <div 
                      className="p-6 cursor-pointer"
                      onClick={() => handleProviderClick(provider._id)}
                    >
                      {/* Profile Header */}
                      <div className="flex items-start mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-soft">
                            {provider.profilePicture ? (
                              <img 
                                src={provider.profilePicture} 
                                alt={provider.fullName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              provider.fullName.charAt(0).toUpperCase()
                            )}
                          </div>
                          {provider.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-bold text-text-primary mb-1">
                            {provider.fullName}
                          </h3>
                          {provider.providerType && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                              provider.providerType === 'Technical' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {provider.providerType === 'Technical' ? (
                                <><Target className="w-3 h-3" /> Technical</>
                              ) : (
                                <><Award className="w-3 h-3" /> Non-Technical</>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {provider.bio && (
                        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                          {provider.bio}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4">
                        {provider.rating !== undefined && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-text-primary">{provider.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {provider.completedJobs !== undefined && (
                          <div className="flex items-center gap-1 text-text-secondary text-sm">
                            <Briefcase className="w-4 h-4" />
                            <span>{provider.completedJobs} jobs</span>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {provider.skills && provider.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {provider.skills.slice(0, 3).map((skill, skillIndex) => (
                              <span 
                                key={skillIndex}
                                className="px-2 py-1 bg-[#E3EFD3] text-[#345635] rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {provider.skills.length > 3 && (
                              <span className="px-2 py-1 bg-surface text-text-secondary rounded-full text-xs font-medium">
                                +{provider.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        {provider.city && (
                          <div className="flex items-center gap-1 text-sm text-text-secondary">
                            <MapPin className="w-4 h-4" />
                            <span>{provider.city}</span>
                          </div>
                        )}
                        {provider.hourlyRate && (
                          <div className="text-lg font-bold text-[#345635]">
                            ₹{provider.hourlyRate}/hr
                          </div>
                        )}
                      </div>

                      {/* Demo Score */}
                      {provider.demoVerification?.status === 'verified' && provider.demoVerification?.score && (
                        <div className="mt-3 p-2 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] rounded-lg text-center border-l-4 border-[#345635]">
                          <div className="flex items-center justify-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#345635]" />
                            <span className="text-xs text-text-primary font-semibold">
                              Demo Score: {provider.demoVerification.score}/100
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-2 mt-8"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
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
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-12 h-12 rounded-xl font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-soft'
                            : 'bg-white border border-border text-text-primary hover:bg-[#E3EFD3]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrowseProviders;
