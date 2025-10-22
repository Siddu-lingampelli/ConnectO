import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import { FaStar, FaPhone, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';

// Fix Leaflet default icon issue
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

// Custom green icon for client
const clientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom orange icon for provider
const providerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface User {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  rating?: number;
  completedJobs?: number;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  city?: string;
  area?: string;
  address?: string;
}

interface OrderLocationMapProps {
  client: User;
  provider: User;
  currentUserRole: 'client' | 'provider';
}

// Component to fit bounds to show both markers
function MapBoundsSetter({ clientPos, providerPos }: { clientPos: [number, number]; providerPos: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    const bounds = L.latLngBounds([clientPos, providerPos]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [clientPos, providerPos, map]);
  
  return null;
}

const OrderLocationMap = ({ client, provider, currentUserRole }: OrderLocationMapProps) => {
  const [distance, setDistance] = useState<number | null>(null);

  // Calculate distance between client and provider
  useEffect(() => {
    if (client.location?.coordinates && provider.location?.coordinates) {
      const dist = calculateDistance(
        client.location.coordinates[1],
        client.location.coordinates[0],
        provider.location.coordinates[1],
        provider.location.coordinates[0]
      );
      setDistance(dist);
    }
  }, [client, provider]);

  // Get directions
  const getDirections = () => {
    if (!client.location?.coordinates || !provider.location?.coordinates) {
      toast.error('Location data not available');
      return;
    }

    const from = currentUserRole === 'client' 
      ? client.location.coordinates 
      : provider.location.coordinates;
    const to = currentUserRole === 'client' 
      ? provider.location.coordinates 
      : client.location.coordinates;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${from[1]},${from[0]}&destination=${to[1]},${to[0]}`;
    window.open(url, '_blank');
  };

  // Check if both have valid locations
  const hasClientLocation = client.location?.coordinates && 
    client.location.coordinates[0] !== 0 && 
    client.location.coordinates[1] !== 0;
  
  const hasProviderLocation = provider.location?.coordinates && 
    provider.location.coordinates[0] !== 0 && 
    provider.location.coordinates[1] !== 0;

  if (!hasClientLocation && !hasProviderLocation) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <FaMapMarkerAlt className="text-yellow-500 text-4xl mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Location Sharing Not Enabled
        </h3>
        <p className="text-yellow-700">
          Both client and provider need to enable location sharing to see each other on the map.
        </p>
      </div>
    );
  }

  if (!hasClientLocation) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">
          <strong>Client</strong> has not shared their location yet.
        </p>
      </div>
    );
  }

  if (!hasProviderLocation) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">
          <strong>Service Provider</strong> has not shared their location yet.
        </p>
      </div>
    );
  }

  const clientPos: [number, number] = [
    client.location!.coordinates[1],
    client.location!.coordinates[0]
  ];
  
  const providerPos: [number, number] = [
    provider.location!.coordinates[1],
    provider.location!.coordinates[0]
  ];

  return (
    <div className="space-y-4">
      {/* Info Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">📍 Location Sharing Active</h3>
            <p className="text-sm text-blue-700 mt-1">
              {currentUserRole === 'client' ? 'View your provider\'s location' : 'View your client\'s location'}
            </p>
          </div>
          {distance && (
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{distance.toFixed(1)} km</p>
              <p className="text-xs text-blue-700">Distance apart</p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden shadow-lg" style={{ height: '500px' }}>
        <MapContainer
          center={clientPos}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapBoundsSetter clientPos={clientPos} providerPos={providerPos} />
          
          {/* OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Client Marker (Green) */}
          <Marker position={clientPos} icon={clientIcon}>
            <Popup maxWidth={300}>
              <div className="p-2">
                <div className="flex items-start gap-3">
                  {client.profilePicture ? (
                    <img
                      src={client.profilePicture}
                      alt={client.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                      {client.fullName.charAt(0)}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{client.fullName}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Client</span>
                    </div>
                    
                    {client.city && (
                      <p className="text-sm text-gray-600 mt-1">
                        📍 {client.area}, {client.city}
                      </p>
                    )}

                    {client.phone && (
                      <p className="text-sm text-gray-600 mt-1">
                        📞 {client.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Provider Marker (Orange) */}
          <Marker position={providerPos} icon={providerIcon}>
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
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
                      {provider.fullName.charAt(0)}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{provider.fullName}</h3>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Provider</span>
                    </div>
                    
                    {provider.rating !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        <FaStar className="text-yellow-500" />
                        <span className="text-sm font-semibold">{provider.rating.toFixed(1)}</span>
                        {provider.completedJobs !== undefined && (
                          <span className="text-xs text-gray-500">({provider.completedJobs} jobs)</span>
                        )}
                      </div>
                    )}

                    {provider.city && (
                      <p className="text-sm text-gray-600 mt-1">
                        📍 {provider.area}, {provider.city}
                      </p>
                    )}

                    {provider.phone && (
                      <p className="text-sm text-gray-600 mt-1">
                        📞 {provider.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={getDirections}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <FaRoute />
          Get Directions
        </button>
        
        {currentUserRole === 'client' && provider.phone && (
          <a
            href={`tel:${provider.phone}`}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            <FaPhone />
            Call Provider
          </a>
        )}
        
        {currentUserRole === 'provider' && client.phone && (
          <a
            href={`tel:${client.phone}`}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            <FaPhone />
            Call Client
          </a>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Map Legend:</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Client Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Provider Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: Calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default OrderLocationMap;
