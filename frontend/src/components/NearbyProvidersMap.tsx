import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import locationService, { Provider } from '../services/locationService';
import { FaMapMarkerAlt, FaStar, FaPhone, FaEnvelope, FaRoute } from 'react-icons/fa';

interface NearbyProvidersMapProps {
  category?: string;
  providerType?: 'Technical' | 'Non-Technical';
  maxDistance?: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 28.6139, // Default: New Delhi
  lng: 77.2090
};

const NearbyProvidersMap = ({ category, providerType, maxDistance = 10000 }: NearbyProvidersMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's current location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await locationService.getCurrentLocation();
        setUserLocation({
          lat: location.latitude,
          lng: location.longitude
        });
      } catch (error: any) {
        console.error('Location error:', error);
        setError('Unable to get your location. Please enable location services.');
        toast.error('Please enable location access to find nearby providers');
        // Use default location
        setUserLocation(defaultCenter);
      }
    };

    getUserLocation();
  }, []);

  // Fetch nearby providers
  useEffect(() => {
    if (!userLocation) return;

    const fetchProviders = async () => {
      setLoading(true);
      try {
        const response = await locationService.findNearbyProviders(
          userLocation.lat,
          userLocation.lng,
          {
            maxDistance,
            category,
            providerType
          }
        );

        setProviders(response.data);
        
        if (response.data.length === 0) {
          toast.info('No providers found nearby. Try increasing the search radius.');
        }
      } catch (error: any) {
        console.error('Error fetching providers:', error);
        setError('Failed to load nearby providers');
        toast.error('Failed to load nearby providers');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [userLocation, category, providerType, maxDistance]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Open Google Maps for directions
  const openDirections = (provider: Provider) => {
    if (!userLocation) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${provider.location.coordinates[1]},${provider.location.coordinates[0]}`;
    window.open(url, '_blank');
  };

  // Contact provider
  const contactProvider = (provider: Provider) => {
    // Navigate to messages or call directly
    toast.info(`Contact ${provider.fullName} - Feature coming soon!`);
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-semibold">⚠️ Google Maps API key not configured</p>
        <p className="text-sm text-red-500 mt-2">
          Please add VITE_GOOGLE_MAPS_KEY to your .env file
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-gray-700">🔍 Searching for nearby providers...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}

      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-900 font-semibold">
              📍 Found {providers.length} provider{providers.length !== 1 ? 's' : ''} nearby
            </p>
            {userLocation && (
              <p className="text-sm text-blue-700 mt-1">
                Searching within {maxDistance / 1000}km radius
              </p>
            )}
          </div>
          {providerType && (
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              {providerType}
            </span>
          )}
        </div>
      </div>

      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          {/* User's location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
              title="Your Location"
            />
          )}

          {/* Provider markers */}
          {providers.map((provider) => (
            <Marker
              key={provider._id}
              position={{
                lat: provider.location.coordinates[1],
                lng: provider.location.coordinates[0]
              }}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }}
              title={provider.fullName}
              onClick={() => setSelectedProvider(provider)}
            />
          ))}

          {/* Info window for selected provider */}
          {selectedProvider && (
            <InfoWindow
              position={{
                lat: selectedProvider.location.coordinates[1],
                lng: selectedProvider.location.coordinates[0]
              }}
              onCloseClick={() => setSelectedProvider(null)}
            >
              <div className="p-2 max-w-xs">
                <div className="flex items-start gap-3">
                  {selectedProvider.profilePicture ? (
                    <img
                      src={selectedProvider.profilePicture}
                      alt={selectedProvider.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {selectedProvider.fullName.charAt(0)}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {selectedProvider.fullName}
                    </h3>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <FaStar className="text-yellow-500" />
                      <span className="text-sm font-semibold">
                        {selectedProvider.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({selectedProvider.completedJobs} jobs)
                      </span>
                    </div>

                    {selectedProvider.distance && (
                      <p className="text-sm text-blue-600 font-semibold mt-1">
                        📍 {selectedProvider.distance} km away
                      </p>
                    )}

                    {selectedProvider.services && selectedProvider.services.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">Services:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedProvider.services.slice(0, 3).map((service, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 px-2 py-1 rounded"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProvider.hourlyRate && selectedProvider.hourlyRate > 0 && (
                      <p className="text-sm text-green-600 font-semibold mt-2">
                        ₹{selectedProvider.hourlyRate}/hr
                      </p>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => openDirections(selectedProvider)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        <FaRoute /> Directions
                      </button>
                      <button
                        onClick={() => contactProvider(selectedProvider)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition"
                      >
                        <FaPhone /> Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Providers list below map */}
      {providers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Available Providers ({providers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <div
                key={provider._id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="flex items-center gap-3">
                  {provider.profilePicture ? (
                    <img
                      src={provider.profilePicture}
                      alt={provider.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {provider.fullName.charAt(0)}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {provider.fullName}
                    </h4>
                    <div className="flex items-center gap-1 text-sm">
                      <FaStar className="text-yellow-500" />
                      <span>{provider.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {provider.distance && (
                  <p className="text-sm text-blue-600 font-semibold mt-2">
                    📍 {provider.distance} km away
                  </p>
                )}
                
                {provider.city && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {provider.area}, {provider.city}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyProvidersMap;
