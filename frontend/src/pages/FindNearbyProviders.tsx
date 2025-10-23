import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import NearbyProvidersMapOSM from '../components/NearbyProvidersMapOSM';
import { FaMapMarkedAlt, FaSlidersH } from 'react-icons/fa';

const categories = [
  '',
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

const FindNearbyProviders = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProviderType, setSelectedProviderType] = useState<'Technical' | 'Non-Technical' | undefined>('Non-Technical');
  const [maxDistance, setMaxDistance] = useState(10000); // 10km in meters
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center shadow-lg">
              <FaMapMarkedAlt className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#0D2B1D]">
                Find Nearby Service Providers
              </h1>
              <p className="text-[#6B8F71] mt-1">
                Discover skilled non-technical professionals near your location
              </p>
            </div>
          </div>
          
          {/* Non-Technical Service Banner */}
          <div className="bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-2xl p-4 shadow-lg border-2 border-[#AEC3B0]">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🗺️</div>
              <div>
                <h3 className="font-bold text-lg">Location-Based Search for Non-Technical Services</h3>
                <p className="text-[#E3EFD3] mt-1">
                  Perfect for local services like plumbing, repairs, cleaning, cooking, gardening, and more. 
                  Find trusted professionals in your neighborhood!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[#345635] font-semibold mb-4 hover:text-[#0D2B1D] transition-colors"
          >
            <FaSlidersH />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Provider Type Filter - Locked to Non-Technical */}
              <div>
                <label className="block text-sm font-semibold text-[#345635] mb-2">
                  Provider Type
                </label>
                <select
                  value={selectedProviderType || 'Non-Technical'}
                  onChange={(e) => setSelectedProviderType(e.target.value as any)}
                  className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] bg-[#E3EFD3]"
                  disabled
                >
                  <option value="Non-Technical">Non-Technical Only</option>
                </select>
                <p className="text-xs text-[#6B8F71] mt-1">
                  ℹ️ Map search is available only for non-technical services
                </p>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#345635] mb-2">
                  Service Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat || 'All Categories'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#345635] mb-2">
                  Search Radius: {maxDistance / 1000}km
                </label>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-[#AEC3B0] rounded-xl focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]"
                >
                  <option value="1000">1 km</option>
                  <option value="2000">2 km</option>
                  <option value="5000">5 km</option>
                  <option value="10000">10 km</option>
                  <option value="20000">20 km</option>
                  <option value="50000">50 km</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Map Component - FREE OpenStreetMap! */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6">
          <NearbyProvidersMapOSM
            category={selectedCategory}
            providerType={selectedProviderType}
            maxDistance={maxDistance}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FindNearbyProviders;
