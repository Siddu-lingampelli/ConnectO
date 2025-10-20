import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import Proposal from '../models/Proposal.model.js';

// ==================== DASHBOARD & ANALYTICS ====================

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalProviders,
      totalJobs,
      openJobs,
      totalProposals,
      pendingVerifications,
      verifiedUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'provider' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Proposal.countDocuments(),
      User.countDocuments({ 'verification.status': 'pending' }),
      User.countDocuments({ 'verification.status': 'verified' })
    ]);

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get recent jobs (last 30 days)
    const recentJobs = await Job.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Calculate growth rates
    const userGrowthRate = totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(1) : 0;
    const jobGrowthRate = totalJobs > 0 ? ((recentJobs / totalJobs) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          clients: totalClients,
          providers: totalProviders,
          recent: recentUsers,
          growthRate: userGrowthRate
        },
        jobs: {
          total: totalJobs,
          open: openJobs,
          recent: recentJobs,
          growthRate: jobGrowthRate
        },
        proposals: {
          total: totalProposals
        },
        verifications: {
          pending: pendingVerifications,
          verified: verifiedUsers
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User registrations over time
    const userRegistrations = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Jobs posted over time
    const jobsPosted = await Job.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Jobs by category
    const jobsByCategory = await Job.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top cities
    const topCities = await User.aggregate([
      {
        $match: { city: { $exists: true, $ne: '' } }
      },
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userRegistrations,
        jobsPosted,
        jobsByCategory,
        topCities
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      verificationStatus,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (verificationStatus && verificationStatus !== 'all') {
      query['verification.status'] = verificationStatus;
    }

    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's jobs and proposals
    const [jobs, proposals] = await Promise.all([
      Job.find({ client: user._id }).sort({ createdAt: -1 }).limit(10),
      Proposal.find({ provider: user._id }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        jobs,
        proposals
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};

// @desc    Update user status (block/unblock)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive, reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    if (!isActive && reason) {
      // Store block reason (you might want to add this field to schema)
      user.blockReason = reason;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'blocked'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's jobs and proposals
    await Promise.all([
      Job.deleteMany({ client: user._id }),
      Proposal.deleteMany({ provider: user._id })
    ]);

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// ==================== VERIFICATION MANAGEMENT ====================

// @desc    Get all pending verifications
// @route   GET /api/admin/verifications/pending
// @access  Private (Admin only)
export const getPendingVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({
      'verification.status': 'pending'
    })
      .select('-password')
      .sort({ 'verification.submittedAt': 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({
      'verification.status': 'pending'
    });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending verifications',
      error: error.message
    });
  }
};

// @desc    Approve or reject verification
// @route   PUT /api/admin/verifications/:userId
// @access  Private (Admin only)
export const updateVerificationStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "verified" or "rejected"'
      });
    }

    user.verification.status = status;
    user.verification.reviewedAt = new Date();
    user.verification.reviewedBy = req.user._id;

    if (status === 'rejected' && reason) {
      user.verification.rejectionReason = reason;
    }

    await user.save();

    // TODO: Send email notification to user

    res.status(200).json({
      success: true,
      message: `Verification ${status} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update verification',
      error: error.message
    });
  }
};

// ==================== JOB MANAGEMENT ====================

// @desc    Get all jobs with filters
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
export const getAllJobs = async (req, res) => {
  try {
    const {
      status,
      category,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const jobs = await Job.find(query)
      .populate('client', 'fullName email phone')
      .populate('assignedProvider', 'fullName email phone')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// @desc    Update job status
// @route   PUT /api/admin/jobs/:id/status
// @access  Private (Admin only)
export const updateJobStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.status = status;
    if (reason) {
      job.adminNote = reason;
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Delete associated proposals
    await Proposal.deleteMany({ job: job._id });

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job and associated proposals deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
};

// ==================== PROPOSAL MANAGEMENT ====================

// @desc    Get all proposals
// @route   GET /api/admin/proposals
// @access  Private (Admin only)
export const getAllProposals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const proposals = await Proposal.find(query)
      .populate('provider', 'fullName email phone')
      .populate('job', 'title category budget')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Proposal.countDocuments(query);

    res.status(200).json({
      success: true,
      data: proposals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposals',
      error: error.message
    });
  }
};
