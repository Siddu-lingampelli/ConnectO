import Job from '../models/Job.model.js';
import User from '../models/User.model.js';
import Proposal from '../models/Proposal.model.js';

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Client only)
export const createJob = async (req, res) => {
  try {
    const { title, description, category, providerType, budget, deadline, location } = req.body;

    // ✅ VERIFICATION CHECK: User must be verified to post jobs
    const user = await User.findById(req.user._id);
    
    if (user.verification.status !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'You must be verified to post a job. Please complete verification with PAN card and Aadhar card.',
        verificationStatus: user.verification.status,
        requiresVerification: true
      });
    }

    const job = await Job.create({
      title,
      description,
      category,
      providerType,
      budget,
      deadline,
      location,
      client: req.user._id
    });

    const populatedJob = await Job.findById(job._id).populate('client', 'fullName email phone');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: populatedJob  // Return job directly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all jobs (with filters)
// @route   GET /api/jobs
// @access  Private
export const getAllJobs = async (req, res) => {
  try {
    const { 
      category, 
      status, 
      city, 
      area,
      providerType,
      budgetMin,
      budgetMax,
      budgetType,
      search, 
      page = 1, 
      limit = 20 
    } = req.query;

    const query = { isActive: true };

    // Category filter
    if (category) query.category = category;
    
    // Status filter
    if (status) query.status = status;
    
    // Location filters
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (area) query['location.area'] = new RegExp(area, 'i');
    
    // Provider type filter (Technical/Non-Technical)
    if (providerType) query.providerType = providerType;
    
    // Budget range filter
    if (budgetMin || budgetMax) {
      query.budget = {};
      if (budgetMin) query.budget.$gte = parseInt(budgetMin);
      if (budgetMax) query.budget.$lte = parseInt(budgetMax);
    }
    
    // Budget type filter (fixed/hourly)
    if (budgetType) query.budgetType = budgetType;
    
    // Search filter
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // For providers, show only open jobs
    if (req.user.role === 'provider') {
      query.status = 'open';
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('client', 'fullName email phone city area rating profilePicture')
      .populate('assignedProvider', 'fullName email phone rating')
      .populate('proposals')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,  // Return jobs directly, not nested in object
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'fullName email phone city area rating profilePicture')
      .populate('assignedProvider', 'fullName email phone rating')
      .populate('proposals');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job  // Return job directly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my jobs
// @route   GET /api/jobs/my-jobs
// @access  Private
export const getMyJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    // For clients, show their posted jobs
    if (req.user.role === 'client') {
      query.client = req.user._id;
    }
    // For providers, show jobs assigned to them
    else if (req.user.role === 'provider') {
      query.assignedProvider = req.user._id;
    }

    if (status) query.status = status;

    const jobs = await Job.find(query)
      .populate('client', 'fullName email phone')
      .populate('assignedProvider', 'fullName email phone rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs  // Return jobs directly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Client only - own jobs)
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const allowedFields = ['title', 'description', 'budget', 'deadline', 'location', 'status'];
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('client', 'fullName email phone');

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job  // Return job directly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recommended jobs based on provider's skills and preferences
// @route   GET /api/jobs/recommendations
// @access  Private (Provider only)
export const getRecommendedJobs = async (req, res) => {
  try {
    // Only providers can get recommendations
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Only providers can access job recommendations'
      });
    }

    const provider = await User.findById(req.user._id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build recommendation query
    const query = { 
      isActive: true, 
      status: 'open'
    };

    // Match by provider type (Technical/Non-Technical)
    if (provider.providerType) {
      query.providerType = provider.providerType;
    }

    // Match by preferred categories or skills
    if (provider.preferredCategories && provider.preferredCategories.length > 0) {
      query.category = { $in: provider.preferredCategories };
    } else if (provider.skills && provider.skills.length > 0) {
      // If no preferred categories, use skills to match with job category
      const skillsRegex = provider.skills.map(skill => new RegExp(skill, 'i'));
      query.$or = [
        { category: { $in: provider.skills } },
        { title: { $in: skillsRegex } },
        { description: { $in: skillsRegex } }
      ];
    }

    // Match by location if service radius is defined
    if (provider.city) {
      query['location.city'] = new RegExp(provider.city, 'i');
    }

    // Get recommended jobs
    let recommendedJobs = await Job.find(query)
      .populate('client', 'fullName email phone city area rating profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    // If no recommended jobs found, get recent open jobs
    if (recommendedJobs.length === 0) {
      recommendedJobs = await Job.find({ 
        isActive: true, 
        status: 'open' 
      })
        .populate('client', 'fullName email phone city area rating profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    res.status(200).json({
      success: true,
      count: recommendedJobs.length,
      data: recommendedJobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      },
      message: total > 0 ? 'Jobs matched based on your profile' : 'Showing recent jobs'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get nearby jobs based on GPS location
// @route   GET /api/jobs/nearby
// @access  Private (Provider only)
export const getNearbyJobs = async (req, res) => {
  try {
    // Only providers can get nearby jobs
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Only providers can access nearby jobs'
      });
    }

    const { latitude, longitude, radius = 10, page = 1, limit = 20 } = req.query;

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const maxDistance = parseInt(radius) * 1000; // Convert km to meters

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }

    const skip = (page - 1) * limit;

    // Find jobs near the location using MongoDB geospatial query
    const jobs = await Job.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat] // [longitude, latitude]
          },
          distanceField: 'distance',
          maxDistance: maxDistance,
          spherical: true,
          key: 'location.coordinates', // Specify which field to use
          query: { 
            isActive: true, 
            status: 'open'
          }
        }
      },
      {
        $addFields: {
          distanceInKm: { $divide: ['$distance', 1000] } // Convert to km
        }
      },
      { $sort: { distance: 1 } }, // Sort by nearest first
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    // Populate client details
    await Job.populate(jobs, {
      path: 'client',
      select: 'fullName email phone city area rating profilePicture'
    });

    // Use jobs.length as total since geospatial queries are complex
    const total = jobs.length;

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      },
      searchLocation: {
        latitude: lat,
        longitude: lng,
        radius: parseInt(radius)
      },
      message: jobs.length > 0 
        ? `Found ${jobs.length} jobs within ${radius}km` 
        : 'No jobs found nearby. Try increasing the search radius.'
    });
  } catch (error) {
    console.error('Nearby jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Client only - own jobs)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Soft delete - mark as inactive
    job.isActive = false;
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
