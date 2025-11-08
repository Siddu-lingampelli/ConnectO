import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import NearbyProvidersMapOSM from '../components/NearbyProvidersMapOSM';
import { FaMapMarkedAlt, FaSlidersH } from 'react-icons/fa';

// Non-Technical Service Categories
const nonTechnicalCategories = [
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
  'Cooking & Catering',
  'Tutoring & Education',
  'Other Services'
];

// Technical Service Categories
const technicalCategories = [
  '',
  'Web Development',
  'Mobile App Development',
  'UI/UX Design',
  'Graphic Design',
  'Software Development',
  'Database Management',
  'DevOps & Cloud',
  'Cybersecurity',
  'Data Science & AI',
  'Quality Assurance',
  'Technical Writing',
  'IT Consulting',
  'Network Administration',
  'System Architecture',
  'Other Technical Services'
];

const FindNearbyProviders = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProviderType, setSelectedProviderType] = useState<'Technical' | 'Non-Technical'>('Non-Technical');
  const [maxDistance, setMaxDistance] = useState(10000); // 10km in meters
  const [showFilters, setShowFilters] = useState(true);

  // Get categories based on provider type
  const categories = selectedProviderType === 'Technical' ? technicalCategories : nonTechnicalCategories;

  // Reset category when provider type changes
  const handleProviderTypeChange = (type: 'Technical' | 'Non-Technical') => {
    setSelectedProviderType(type);
    setSelectedCategory(''); // Reset category when switching provider type
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-24 mt-20">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in-up">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
              <FaMapMarkedAlt className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-4xl font-semibold text-text-primary tracking-tighter mb-2">
            Find Nearby Service Providers
          </h1>
          <p className="text-text-secondary text-lg">
            Discover skilled {selectedProviderType === 'Technical' ? 'technical' : 'non-technical'} professionals near your location
          </p>
        </div>
        
        {/* Service Banner */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-soft mb-8 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-lg mb-2">
                Location-Based Search for {selectedProviderType} Services
              </h3>
              <p className="text-text-secondary">
                {selectedProviderType === 'Technical' 
                  ? 'Find expert developers, designers, and IT professionals for your technical projects.'
                  : 'Perfect for local services like plumbing, repairs, cleaning, cooking, gardening, and more. Find trusted professionals in your neighborhood!'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-soft border border-border p-6 mb-6 animate-fade-in-up hover:shadow-medium transition-all duration-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-text-primary font-medium mb-4 hover:text-primary transition-colors duration-200"
          >
            <FaSlidersH />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Provider Type Filter */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Provider Type
                </label>
                <select
                  value={selectedProviderType}
                  onChange={(e) => handleProviderTypeChange(e.target.value as 'Technical' | 'Non-Technical')}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white text-text-primary"
                >
                  <option value="Non-Technical">Non-Technical Only</option>
                  <option value="Technical">Technical Only</option>
                </select>
                <p className="text-xs text-text-secondary mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Map search is available for both service types
                </p>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Service Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white text-text-primary"
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
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Search Radius: {maxDistance / 1000}km
                </label>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white text-text-primary"
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
        <div className="bg-white rounded-2xl shadow-soft border border-border p-6 animate-fade-in-up">
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
