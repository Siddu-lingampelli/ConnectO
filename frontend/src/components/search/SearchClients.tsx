import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';
import type { User } from '../../types';

const SearchClients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];

  const budgetRanges = [
    { label: 'Under ₹5,000', value: '0-5000' },
    { label: '₹5,000 - ₹10,000', value: '5000-10000' },
    { label: '₹10,000 - ₹25,000', value: '10000-25000' },
    { label: '₹25,000+', value: '25000+' },
  ];

  const handleSearch = async () => {
    try {
      setLoading(true);
      // Use the dedicated searchClients endpoint
      const results = await userService.searchClients({
        search: searchQuery,
        city: selectedCity || undefined,
        budgetRange: budgetRange || undefined,
      });
      setClients(results);
      
      if (results.length === 0) {
        toast.info('No clients found matching your criteria');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to search clients');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setBudgetRange('');
    setClients([]);
  };

  return (
    <div>
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Find Potential Clients</h2>
        
        {/* Main Search Bar */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by client name, location, or project type..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Budget Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Budget</option>
                  {budgetRanges.map((range) => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
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

      {/* Search Results */}
      {clients.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {clients.length} Client{clients.length !== 1 ? 's' : ''} Found
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div key={client.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Client Card Header */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-600 text-2xl font-bold">
                      {client.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{client.fullName}</h3>
                      <p className="text-green-100 text-sm">{client.city || 'Location not set'}</p>
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="p-4">
                  {/* Stats */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{client.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {client.completedJobs || 0} jobs posted
                    </div>
                  </div>

                  {/* Preferences */}
                  {client.preferences && (
                    <div className="mb-3">
                      {client.preferences.budget && (
                        <div className="mb-2">
                          <span className="text-gray-600 text-sm">Budget: </span>
                          <span className="text-green-600 font-semibold">{client.preferences.budget}</span>
                        </div>
                      )}
                      
                      {client.preferences.categories && client.preferences.categories.length > 0 && (
                        <div className="mb-2">
                          <p className="text-gray-600 text-sm mb-1">Interested in:</p>
                          <div className="flex flex-wrap gap-2">
                            {client.preferences.categories.slice(0, 2).map((cat, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full"
                              >
                                {cat}
                              </span>
                            ))}
                            {client.preferences.categories.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{client.preferences.categories.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {client.preferences.communicationPreference && (
                        <div className="text-gray-600 text-sm">
                          <span>Prefers: {client.preferences.communicationPreference}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  {client.bio && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {client.bio}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 mt-4">
                    <button 
                      onClick={() => navigate(`/profile/${client.id}`)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => navigate(`/messages?userId=${client.id}`)}
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

      {/* No Results / Initial State */}
      {!loading && clients.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-5xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Search for Potential Clients
          </h3>
          <p className="text-gray-600 mb-6">
            Find clients who are looking for services that match your skills
          </p>
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              {cities.slice(0, 5).map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setSearchQuery(city);
                    handleSearch();
                  }}
                  className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                >
                  📍 {city}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              💡 Tip: Complete your profile to get discovered by more clients
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchClients;
