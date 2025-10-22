import User from '../models/User.model.js';

// Update user location
export const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    const userId = req.user._id;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    // Validate coordinates
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        locationEnabled: true,
        lastLocationUpdate: new Date()
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// Find nearby service providers
export const findNearbyProviders = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance, category, providerType } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    // Build query
    const query = {
      role: 'provider',
      isActive: true,
      locationEnabled: true,
      'location.coordinates': { $ne: [0, 0] } // Exclude users without valid location
    };

    // Filter by provider type (Technical/Non-Technical)
    if (providerType) {
      query.providerType = providerType;
    }

    // Filter by category/services
    if (category) {
      query.$or = [
        { services: { $regex: category, $options: 'i' } },
        { preferredCategories: { $regex: category, $options: 'i' } }
      ];
    }

    // Default max distance: 10km (10000 meters)
    const distance = maxDistance ? parseInt(maxDistance) : 10000;

    const providers = await User.find({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: distance
        }
      }
    })
      .select('-password')
      .limit(50); // Limit results

    // Calculate distance for each provider
    const providersWithDistance = providers.map(provider => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        provider.location.coordinates[1],
        provider.location.coordinates[0]
      );

      return {
        ...provider.toObject(),
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal
      };
    });

    res.status(200).json({
      success: true,
      count: providersWithDistance.length,
      data: providersWithDistance
    });
  } catch (error) {
    console.error('Find nearby providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby providers',
      error: error.message
    });
  }
};

// Get distance between user and provider
export const getDistance = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const provider = await User.findById(providerId).select('location fullName');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (!provider.location || !provider.location.coordinates || provider.location.coordinates[0] === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provider location not available'
      });
    }

    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      provider.location.coordinates[1],
      provider.location.coordinates[0]
    );

    res.status(200).json({
      success: true,
      data: {
        providerId: provider._id,
        providerName: provider.fullName,
        distance: Math.round(distance * 10) / 10,
        unit: 'km'
      }
    });
  } catch (error) {
    console.error('Get distance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate distance',
      error: error.message
    });
  }
};

// Toggle location sharing
export const toggleLocationSharing = async (req, res) => {
  try {
    const userId = req.user._id;
    const { enabled } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { locationEnabled: enabled },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: `Location sharing ${enabled ? 'enabled' : 'disabled'}`,
      data: user
    });
  } catch (error) {
    console.error('Toggle location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle location sharing',
      error: error.message
    });
  }
};

// Helper function: Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
