import Job from '../models/Job.model.js';
import User from '../models/User.model.js';

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Client only)
export const createJob = async (req, res) => {
  try {
    const { title, description, category, budget, deadline, location } = req.body;

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
    const { category, status, city, search, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (status) query.status = status;
    if (city) query['location.city'] = new RegExp(city, 'i');
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
      .populate('client', 'fullName email phone city area')
      .populate('assignedProvider', 'fullName email phone rating')
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
      .populate('client', 'fullName email phone city area')
      .populate('assignedProvider', 'fullName email phone rating');

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
