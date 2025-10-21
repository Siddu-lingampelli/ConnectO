import User from '../models/User.model.js';

// @desc    Get users with filters
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const { role, city, search, providerType, category } = req.query;
    
    console.log('🔍 Getting users with params:', { role, city, search, providerType, category });
    
    const query = { isActive: true };

    // Role filter
    if (role) {
      query.role = role;
    }

    // Provider type filter
    if (providerType) {
      query.providerType = providerType;
    }

    // City filter
    if (city) {
      query.city = new RegExp(city, 'i');
    }

    // Category filter (for providers)
    if (category) {
      query.$or = [
        { skills: { $regex: category, $options: 'i' } },
        { services: { $regex: category, $options: 'i' } },
        { preferredCategories: { $regex: category, $options: 'i' } }
      ];
    }

    // Search filter
    if (search) {
      const searchConditions = [
        { fullName: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { skills: { $regex: search, $options: 'i' } },
        { services: { $regex: search, $options: 'i' } },
        { city: new RegExp(search, 'i') },
        { area: new RegExp(search, 'i') }
      ];
      
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    console.log('📋 MongoDB query:', JSON.stringify(query, null, 2));

    const users = await User.find(query)
      .select('-password')
      .sort({ rating: -1, completedJobs: -1, createdAt: -1 })
      .limit(100);

    console.log(`✅ Found ${users.length} users`);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      // Basic info
      'fullName', 'phone', 'city', 'area', 'profilePicture', 'bio',
      
      // Provider fields
      'providerType', 'skills', 'experience', 'education', 'languages',
      'availability', 'preferredCategories', 'hourlyRate', 'serviceRadius',
      
      // Client preferences
      'preferences',
      
      // Documents
      'documents',
      
      // Location
      'address', 'landmark', 'pincode',
      
      // Services (provider)
      'services',
      
      // Portfolio (provider)
      'portfolio',
      
      // Notifications
      'notifications',
      
      // Completion flag
      'profileCompleted'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Sanitize availability field - flatten nested arrays and remove empty strings
    if (updates.availability && Array.isArray(updates.availability)) {
      updates.availability = updates.availability
        .flat(Infinity) // Flatten nested arrays
        .filter(item => item && item.trim() !== ''); // Remove empty strings
    }

    // Auto-mark profile as completed if sent explicitly
    if (req.body.profileCompleted === true) {
      updates.profileCompleted = true;
    }

    console.log('📥 Saving profile to MongoDB:', {
      userId: req.user._id,
      updates: Object.keys(updates)
    });

    // ✅ SAVE TO MONGODB
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    console.log('✅ Profile saved to MongoDB successfully');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully in MongoDB',
      data: { user }
    });
  } catch (error) {
    console.error('❌ MongoDB save error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search providers
// @route   GET /api/users/search-providers
// @access  Private
export const searchProviders = async (req, res) => {
  try {
    const { category, city, search, minRating } = req.query;
    
    console.log('🔍 Searching providers with params:', { category, city, search, minRating });
    
    const query = { role: 'provider', isActive: true };

    // Search in services or preferredCategories
    if (category) {
      query.$or = [
        { services: { $regex: category, $options: 'i' } },
        { preferredCategories: { $regex: category, $options: 'i' } }
      ];
    }

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (search) {
      // If there's a search term, add it to $or conditions
      const searchConditions = [
        { fullName: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { skills: { $regex: search, $options: 'i' } },
        { services: { $regex: search, $options: 'i' } },
        { city: new RegExp(search, 'i') },
        { area: new RegExp(search, 'i') }
      ];
      
      // Merge with category search if exists
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    console.log('📋 MongoDB query:', JSON.stringify(query, null, 2));

    const providers = await User.find(query)
      .select('-password')
      .sort({ rating: -1, completedJobs: -1 })
      .limit(50);

    console.log(`✅ Found ${providers.length} providers`);

    res.status(200).json({
      success: true,
      count: providers.length,
      data: { providers }
    });
  } catch (error) {
    console.error('❌ Search providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search clients
// @route   GET /api/users/search-clients
// @access  Private
export const searchClients = async (req, res) => {
  try {
    const { city, search, budgetRange } = req.query;
    
    console.log('🔍 Searching clients with params:', { city, search, budgetRange });
    
    const query = { role: 'client', isActive: true };

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { area: new RegExp(search, 'i') },
        { 'preferences.categories': { $regex: search, $options: 'i' } }
      ];
    }

    if (budgetRange) {
      query['preferences.budget'] = new RegExp(budgetRange.split('-')[0], 'i');
    }

    console.log('📋 MongoDB query:', JSON.stringify(query, null, 2));

    const clients = await User.find(query)
      .select('-password')
      .sort({ completedJobs: -1, createdAt: -1 })
      .limit(50);

    console.log(`✅ Found ${clients.length} clients`);

    res.status(200).json({
      success: true,
      count: clients.length,
      data: { clients }
    });
  } catch (error) {
    console.error('❌ Search clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
