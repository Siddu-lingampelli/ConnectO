import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Location {
  longitude: number;
  latitude: number;
}

export interface Provider {
  _id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  rating: number;
  completedJobs: number;
  services: string[];
  location: {
    type: string;
    coordinates: [number, number];
  };
  distance?: number;
  city?: string;
  area?: string;
  hourlyRate?: number;
  providerType?: string;
}

export interface NearbyProvidersResponse {
  success: boolean;
  count: number;
  data: Provider[];
}

export interface DistanceResponse {
  success: boolean;
  data: {
    providerId: string;
    providerName: string;
    distance: number;
    unit: string;
  };
}

// Get user's current location from browser
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// Update user's location on server
export const updateUserLocation = async (location: Location, token: string): Promise<any> => {
  const response = await axios.put(
    `${API_URL}/location/update`,
    location,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Find nearby service providers
export const findNearbyProviders = async (
  latitude: number,
  longitude: number,
  options?: {
    maxDistance?: number;
    category?: string;
    providerType?: 'Technical' | 'Non-Technical';
  }
): Promise<NearbyProvidersResponse> => {
  const params: any = {
    latitude,
    longitude
  };

  if (options?.maxDistance) params.maxDistance = options.maxDistance;
  if (options?.category) params.category = options.category;
  if (options?.providerType) params.providerType = options.providerType;

  const response = await axios.get(`${API_URL}/location/nearby`, { params });
  return response.data;
};

// Get distance to a specific provider
export const getDistanceToProvider = async (
  providerId: string,
  latitude: number,
  longitude: number
): Promise<DistanceResponse> => {
  const response = await axios.get(`${API_URL}/location/distance/${providerId}`, {
    params: { latitude, longitude }
  });
  return response.data;
};

// Toggle location sharing
export const toggleLocationSharing = async (enabled: boolean, token: string): Promise<any> => {
  const response = await axios.put(
    `${API_URL}/location/toggle`,
    { enabled },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Geocode address to coordinates using Google Geocoding API
export const geocodeAddress = async (address: string): Promise<Location | null> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  
  if (!apiKey) {
    console.error('Google Maps API key not found');
    return null;
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export default {
  getCurrentLocation,
  updateUserLocation,
  findNearbyProviders,
  getDistanceToProvider,
  toggleLocationSharing,
  geocodeAddress
};
