import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import locationService, { Provider } from '../services/locationService';
import { FaStar, FaPhone, FaRoute, FaMapMarkerAlt } from 'react-icons/fa';
import WishlistButton from './wishlist/WishlistButton';

// Fix Leaflet default icon issue with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom blue icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom red icon for providers
const providerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface NearbyProvidersMapProps {
  category?: string;
  providerType?: 'Technical' | 'Non-Technical';
  maxDistance?: number;
}

// Component to update map center when location changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

const NearbyProvidersMapOSM = ({ category, providerType, maxDistance = 10000 }: NearbyProvidersMapProps) => {
  const [userLocation, setUserLocation] = useState<[number, number]>([28.6139, 77.2090]); // Default: Delhi
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);

  // Get user's current location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await locationService.getCurrentLocation();
        setUserLocation([location.latitude, location.longitude]);
        setLocationGranted(true);
      } catch (error: any) {
        console.error('Location error:', error);
        setError('Unable to get your location. Please enable location services.');
        toast.error('Please enable location access to find nearby providers');
        // Keep default location
        setLocationGranted(false);
      }
    };

    getUserLocation();
  }, []);

  // Fetch nearby providers
  useEffect(() => {
    if (!locationGranted) {
      setLoading(false);
      return;
    }

    const fetchProviders = async () => {
      setLoading(true);
      try {
        const response = await locationService.findNearbyProviders(
          userLocation[0],
          userLocation[1],
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
  }, [userLocation, category, providerType, maxDistance, locationGranted]);

  // Open Google Maps for directions
  const openDirections = (provider: Provider) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${provider.location.coordinates[1]},${provider.location.coordinates[0]}`;
    window.open(url, '_blank');
  };

  // Contact provider
  const contactProvider = (provider: Provider) => {
    toast.info(`Contact ${provider.fullName} - Feature coming soon!`);
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
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
            {locationGranted && (
              <p className="text-sm text-blue-700 mt-1">
                Searching within {maxDistance / 1000}km radius
              </p>
            )}
            {!locationGranted && (
              <p className="text-sm text-orange-700 mt-1">
                ⚠️ Location access not granted. Showing default location.
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

      {/* OpenStreetMap with Leaflet */}
      <div className="rounded-lg overflow-hidden shadow-lg" style={{ height: '600px' }}>
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapUpdater center={userLocation} />
          
          {/* OpenStreetMap Tiles - FREE! */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User's location marker (Blue) */}
          {locationGranted && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <FaMapMarkerAlt className="text-blue-600 text-2xl mx-auto mb-2" />
                  <strong>Your Location</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Provider markers (Red) */}
          {providers.map((provider) => (
            <Marker
              key={provider._id}
              position={[provider.location.coordinates[1], provider.location.coordinates[0]]}
              icon={providerIcon}
            >
              <Popup maxWidth={300}>
                <div className="p-2">
                  <div className="flex items-start gap-3">
                    {provider.profilePicture ? (
                      <img
                        src={provider.profilePicture}
                        alt={provider.fullName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {provider.fullName.charAt(0)}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {provider.fullName}
                      </h3>
                      
                      <div className="flex items-center gap-1 mt-1">
                        <FaStar className="text-yellow-500" />
                        <span className="text-sm font-semibold">
                          {provider.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({provider.completedJobs} jobs)
                        </span>
                      </div>

                      {provider.distance && (
                        <p className="text-sm text-blue-600 font-semibold mt-1">
                          📍 {provider.distance} km away
                        </p>
                      )}

                      {provider.services && provider.services.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">Services:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {provider.services.slice(0, 3).map((service, idx) => (
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

                      {provider.hourlyRate && provider.hourlyRate > 0 && (
                        <p className="text-sm text-green-600 font-semibold mt-2">
                          ₹{provider.hourlyRate}/hr
                        </p>
                      )}

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => openDirections(provider)}
                          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                          <FaRoute /> Directions
                        </button>
                        <button
                          onClick={() => contactProvider(provider)}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition"
                        >
                          <FaPhone /> Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

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
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer relative"
              >
                {/* Wishlist Button */}
                <div className="absolute top-2 right-2">
                  <WishlistButton
                    itemType="provider"
                    itemId={provider._id}
                    size="sm"
                  />
                </div>
                
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

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openDirections(provider)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    <FaRoute /> Directions
                  </button>
                  <button
                    onClick={() => contactProvider(provider)}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                  >
                    <FaPhone /> Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyProvidersMapOSM;
