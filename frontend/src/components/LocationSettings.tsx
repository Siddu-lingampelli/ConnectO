import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaSync, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import locationService from '../services/locationService';
import { selectAuthToken, selectCurrentUser } from '../store/authSlice';

const LocationSettings = () => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAuthToken);
  
  const [locationEnabled, setLocationEnabled] = useState(user?.locationEnabled || false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(
    user?.lastLocationUpdate || null
  );

  useEffect(() => {
    if (user?.location?.coordinates && user.location.coordinates[0] !== 0) {
      setCurrentLocation({
        lng: user.location.coordinates[0],
        lat: user.location.coordinates[1]
      });
    }
  }, [user]);

  const handleToggleLocation = async () => {
    if (!token) return;

    try {
      const newStatus = !locationEnabled;
      await locationService.toggleLocationSharing(newStatus, token);
      setLocationEnabled(newStatus);
      toast.success(`Location sharing ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      console.error('Toggle error:', error);
      toast.error('Failed to update location settings');
    }
  };

  const handleUpdateLocation = async () => {
    if (!token) return;

    setUpdating(true);
    try {
      // Get current location
      const location = await locationService.getCurrentLocation();
      
      // Update on server
      await locationService.updateUserLocation(location, token);
      
      setCurrentLocation({
        lat: location.latitude,
        lng: location.longitude
      });
      setLastUpdate(new Date().toISOString());
      
      toast.success('Location updated successfully');
    } catch (error: any) {
      console.error('Update error:', error);
      if (error.code === 1) {
        toast.error('Please enable location permissions in your browser');
      } else {
        toast.error('Failed to update location');
      }
    } finally {
      setUpdating(false);
    }
  };

  const formatLastUpdate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaMapMarkerAlt className="text-2xl text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Location Settings</h2>
          <p className="text-sm text-gray-600">
            Enable location to help clients find you nearby
          </p>
        </div>
      </div>

      {/* Toggle Location Sharing */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Share My Location</h3>
          <p className="text-sm text-gray-600">
            Allow clients to see your location on the map
          </p>
        </div>
        <button
          onClick={handleToggleLocation}
          className={`text-4xl transition ${
            locationEnabled ? 'text-green-500' : 'text-gray-400'
          }`}
        >
          {locationEnabled ? <FaToggleOn /> : <FaToggleOff />}
        </button>
      </div>

      {/* Current Location Info */}
      {currentLocation && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">Current Location</h3>
          <div className="text-sm text-blue-700">
            <p>Latitude: {currentLocation.lat.toFixed(6)}</p>
            <p>Longitude: {currentLocation.lng.toFixed(6)}</p>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Last updated: {formatLastUpdate(lastUpdate)}
          </p>
        </div>
      )}

      {/* Update Location Button */}
      <button
        onClick={handleUpdateLocation}
        disabled={updating}
        className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition ${
          updating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <FaSync className={updating ? 'animate-spin' : ''} />
        {updating ? 'Updating Location...' : 'Update My Location'}
      </button>

      {/* Info */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>📌 Note:</strong> Your exact address is not shared. Only your approximate
          location is visible to clients searching for nearby service providers.
        </p>
      </div>

      {!locationEnabled && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>⚠️ Location sharing is disabled.</strong> Enable it to appear in
            location-based searches and increase your visibility to nearby clients.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSettings;
