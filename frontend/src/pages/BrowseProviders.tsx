import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import api from '../lib/api';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import VoiceSearch from '../components/search/VoiceSearch';

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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Please login to browse service providers.</p>
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
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ← Back to Dashboard
          </button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Browse Service Providers
            </h1>
            <p className="text-gray-600 mt-2">
              Find verified professionals for your service needs
            </p>
          </div>

          {/* Voice Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Voice Search */}
            <div className="mb-4 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎤</span>
                <h3 className="text-sm font-semibold text-gray-700">Voice Search - Multiple Languages</h3>
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
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                {showFilters ? '✕ Hide Filters' : '⚙️ Show Filters'}
              </button>
            </div>

            {showFilters && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category/Skill
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider Type
                    </label>
                    <select
                      value={selectedProviderType}
                      onChange={(e) => setSelectedProviderType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading providers...</p>
              </div>
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Providers Found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search criteria
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {providers.length} Provider{providers.length !== 1 ? 's' : ''} Available
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <div 
                    key={provider._id} 
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/profile/${provider._id}`)}
                  >
                    <div className="p-6">
                      {/* Profile Picture and Name */}
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
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
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {provider.fullName}
                            {provider.isVerified && (
                              <span className="text-blue-500" title="Verified">✓</span>
                            )}
                          </h3>
                          {provider.providerType && (
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              provider.providerType === 'Technical' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {provider.providerType === 'Technical' ? '💻 Technical' : '🔧 Non-Technical'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {provider.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {provider.bio}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        {provider.rating !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {provider.completedJobs !== undefined && (
                          <div className="text-gray-600">
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
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {provider.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{provider.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location and Rate */}
                      <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-4">
                        {provider.city && (
                          <span className="text-gray-600">
                            📍 {provider.city}
                          </span>
                        )}
                        {provider.hourlyRate && (
                          <span className="text-green-600 font-semibold">
                            ₹{provider.hourlyRate}/hr
                          </span>
                        )}
                      </div>

                      {/* Demo Score */}
                      {provider.demoVerification?.status === 'verified' && provider.demoVerification?.score && (
                        <div className="mt-3 p-2 bg-green-50 rounded text-center">
                          <span className="text-xs text-green-700 font-medium">
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
