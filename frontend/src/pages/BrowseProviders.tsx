import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import api from '../lib/api';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import VoiceSearch from '../components/search/VoiceSearch';
import WishlistButton from '../components/wishlist/WishlistButton';
import FollowButton from '../components/follow/FollowButton';

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

const BrowseProviders = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedProviderType, setSelectedProviderType] = useState('All Types');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProviders();
  }, [selectedCategory, selectedCity, selectedProviderType]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        role: 'provider'
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedCity !== 'All Cities') {
        params.city = selectedCity;
      }

      if (selectedProviderType !== 'All Types') {
        params.providerType = selectedProviderType;
      }

      // Build query string
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/users?${queryString}`);
      
      let providersData = response.data.data || response.data || [];
      
      // Filter by category if selected
      if (selectedCategory !== 'All Categories') {
        providersData = providersData.filter((provider: Provider) => 
          provider.skills?.some(skill => 
            skill.toLowerCase().includes(selectedCategory.toLowerCase())
          ) ||
          provider.services?.some(service => 
            service.toLowerCase().includes(selectedCategory.toLowerCase())
          )
        );
      }

      setProviders(providersData);
    } catch (error: any) {
      console.error('Error loading providers:', error);
      toast.error('Failed to load service providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProviders();
  };

  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedCity('All Cities');
    setSelectedProviderType('All Types');
    setSearchQuery('');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-[#6B8F71] font-medium">Please login to browse service providers.</p>
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
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-[#345635] hover:text-[#0D2B1D] mb-6 transition-all duration-300 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Header */}
          <div className="mb-6 flex items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-3xl">👥</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#0D2B1D]">
                Browse Service Providers
              </h1>
              <p className="text-[#6B8F71] mt-1">
                Find verified professionals for your service needs
              </p>
            </div>
          </div>

          {/* Voice Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6 mb-6">
            {/* Voice Search */}
            <div className="mb-4 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎤</span>
                <h3 className="text-sm font-semibold text-[#345635]">Voice Search - Multiple Languages</h3>
              </div>
              <VoiceSearch
                value={searchQuery}
                onSearch={(text) => {
                  setSearchQuery(text);
                  handleSearch();
                }}
                placeholder="Search providers by name, skills, or services..."
              />
            </div>

            {/* Filters Toggle */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-2 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] transition-all font-medium text-sm hover:scale-105"
              >
                {showFilters ? '✕ Hide Filters' : '⚙️ Show Filters'}
              </button>
            </div>

            {showFilters && (
              <div className="border-t-2 border-[#AEC3B0] pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#345635] mb-2">
                      Category/Skill
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#345635] mb-2">
                      City
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#345635] mb-2">
                      Provider Type
                    </label>
                    <select
                      value={selectedProviderType}
                      onChange={(e) => setSelectedProviderType(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    >
                      <option value="All Types">All Types</option>
                      <option value="Technical">💻 Technical</option>
                      <option value="Non-Technical">🔧 Non-Technical</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-[#6B8F71] hover:text-[#0D2B1D] font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Providers List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#AEC3B0] border-t-[#345635] mx-auto mb-4"></div>
                <p className="text-[#6B8F71] font-medium">Loading providers...</p>
              </div>
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-[#0D2B1D] mb-2">
                No Providers Found
              </h3>
              <p className="text-[#6B8F71] mb-6">
                Try adjusting your filters or search criteria
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0D2B1D]">
                  {providers.length} Provider{providers.length !== 1 ? 's' : ''} Available
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <div 
                    key={provider._id} 
                    className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] hover:shadow-xl transition-all overflow-hidden relative hover:scale-105"
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
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
                      onClick={() => navigate(`/profile/${provider._id}`)}
                    >
                      {/* Profile Picture and Name */}
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#345635] to-[#6B8F71] rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                          {provider.profilePicture ? (
                            <img 
                              src={provider.profilePicture} 
                              alt={provider.fullName}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            provider.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[#0D2B1D] flex items-center gap-2">
                            {provider.fullName}
                            {provider.isVerified && (
                              <span className="text-[#345635]" title="Verified">✓</span>
                            )}
                          </h3>
                          {provider.providerType && (
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              provider.providerType === 'Technical' 
                                ? 'bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-[#345635]' 
                                : 'bg-gradient-to-r from-[#6B8F71] to-[#AEC3B0] text-white'
                            }`}>
                              {provider.providerType === 'Technical' ? '💻 Technical' : '🔧 Non-Technical'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {provider.bio && (
                        <p className="text-sm text-[#6B8F71] mb-4 line-clamp-2">
                          {provider.bio}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        {provider.rating !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold text-[#0D2B1D]">{provider.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {provider.completedJobs !== undefined && (
                          <div className="text-[#6B8F71]">
                            {provider.completedJobs} jobs completed
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {provider.skills && provider.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {provider.skills.slice(0, 3).map((skill, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-[#345635] rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {provider.skills.length > 3 && (
                              <span className="px-2 py-1 bg-[#E3EFD3] text-[#6B8F71] rounded-full text-xs font-medium">
                                +{provider.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location and Rate */}
                      <div className="flex items-center justify-between text-sm border-t-2 border-[#AEC3B0] pt-4">
                        {provider.city && (
                          <span className="text-[#6B8F71]">
                            📍 {provider.city}
                          </span>
                        )}
                        {provider.hourlyRate && (
                          <span className="text-[#345635] font-semibold">
                            ₹{provider.hourlyRate}/hr
                          </span>
                        )}
                      </div>

                      {/* Demo Score */}
                      {provider.demoVerification?.status === 'verified' && provider.demoVerification?.score && (
                        <div className="mt-3 p-2 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] rounded-xl text-center">
                          <span className="text-xs text-[#345635] font-medium">
                            ✅ Demo Score: {provider.demoVerification.score}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrowseProviders;
