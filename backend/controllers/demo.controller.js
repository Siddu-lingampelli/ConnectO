import DemoProject from '../models/DemoProject.model.js';
import User from '../models/User.model.js';
import notificationHelper from '../utils/notificationHelper.js';

// @desc    Get demo project for current freelancer
// @route   GET /api/demo/my-demo
// @access  Private (Provider only)
export const getMyDemo = async (req, res) => {
  try {
    const demo = await DemoProject.findOne({ freelancer: req.user._id })
      .populate('admin', 'fullName email')
      .sort('-dateAssigned');

    if (!demo) {
      return res.status(404).json({
        success: false,
        message: 'No demo project assigned yet'
      });
    }

    res.status(200).json({
      success: true,
      data: demo
    });
  } catch (error) {
    console.error('Error fetching demo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit demo project
// @route   POST /api/demo/submit
// @access  Private (Provider only)
export const submitDemo = async (req, res) => {
  try {
    const { submissionLink, submissionFile } = req.body;

    const demo = await DemoProject.findOne({ 
      freelancer: req.user._id,
      status: { $in: ['Pending', 'Rejected'] }
    });

    if (!demo) {
      return res.status(404).json({
        success: false,
        message: 'No pending demo project found'
      });
    }

    if (!submissionLink && !submissionFile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide submission link or file'
      });
    }

    demo.submissionLink = submissionLink;
    demo.submissionFile = submissionFile;
    demo.status = 'Under Review';
    demo.dateSubmitted = new Date();
    demo.activityLog.push({
      action: 'Submitted',
      by: req.user._id,
      details: 'Demo project submitted for review'
    });

    await demo.save();

    // Update user demo status
    await User.findByIdAndUpdate(req.user._id, {
      'demoVerification.status': 'under_review',
      'demoVerification.lastUpdated': new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Demo project submitted successfully',
      data: demo
    });
  } catch (error) {
    console.error('Error submitting demo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all demo projects (Admin)
// @route   GET /api/demo/all
// @access  Private (Admin only)
export const getAllDemos = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (type && type !== 'all') {
      query.freelancerType = type;
    }

    const demos = await DemoProject.find(query)
      .populate('freelancer', 'fullName email phone city profilePicture')
      .populate('admin', 'fullName email')
      .sort('-dateAssigned')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await DemoProject.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        data: demos,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching demos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Assign demo project to freelancer (Admin)
// @route   POST /api/demo/assign
// @access  Private (Admin only)
export const assignDemo = async (req, res) => {
  try {
    const { freelancerId, freelancerEmail, freelancerType, demoTitle, description } = req.body;

    if ((!freelancerId && !freelancerEmail) || !freelancerType || !demoTitle || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (freelancer ID/email, type, title, description)'
      });
    }

    // Find freelancer by ID or email
    let freelancer;
    if (freelancerId) {
      freelancer = await User.findById(freelancerId);
    } else if (freelancerEmail) {
      freelancer = await User.findOne({ email: freelancerEmail.toLowerCase().trim() });
    }

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer not found'
      });
    }

    if (freelancer.role !== 'provider') {
      return res.status(400).json({
        success: false,
        message: 'User is not a service provider'
      });
    }

    // Validate provider type matches (if provider has set their type)
    if (freelancer.providerType && freelancer.providerType !== freelancerType) {
      return res.status(400).json({
        success: false,
        message: `Provider type mismatch. This provider is registered as ${freelancer.providerType}, but you're assigning a ${freelancerType} demo.`
      });
    }

    // Check if demo already assigned
    const existingDemo = await DemoProject.findOne({
      freelancer: freelancer._id,
      status: { $in: ['Pending', 'Under Review'] }
    });

    if (existingDemo) {
      return res.status(400).json({
        success: false,
        message: 'Demo project already assigned to this freelancer'
      });
    }

    const demo = await DemoProject.create({
      freelancer: freelancer._id,
      freelancerType,
      demoTitle,
      description,
      status: 'Pending',
      activityLog: [{
        action: 'Assigned',
        by: req.user._id,
        details: `Demo project assigned by admin`
      }]
    });

    // Update user demo status
    await User.findByIdAndUpdate(freelancer._id, {
      'demoVerification.status': 'pending',
      'demoVerification.demoProject': demo._id,
      'demoVerification.lastUpdated': new Date()
    });

    // Send notification to freelancer
    try {
      await notificationHelper.demoAssigned(freelancer._id, demoTitle);
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Demo project assigned successfully',
      data: demo
    });
  } catch (error) {
    console.error('Error assigning demo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Review and score demo project (Admin)
// @route   PUT /api/demo/review/:id
// @access  Private (Admin only)
export const reviewDemo = async (req, res) => {
  try {
    const { score, adminComments } = req.body;

    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid score (0-100)'
      });
    }

    const demo = await DemoProject.findById(req.params.id);

    if (!demo) {
      return res.status(404).json({
        success: false,
        message: 'Demo project not found'
      });
    }

    if (demo.status !== 'Under Review') {
      return res.status(400).json({
        success: false,
        message: 'Demo is not under review'
      });
    }

    // Determine status based on score
    const newStatus = score >= 60 ? 'Verified' : 'Rejected';

    demo.score = score;
    demo.status = newStatus;
    demo.adminComments = adminComments;
    demo.admin = req.user._id;
    demo.dateReviewed = new Date();
    demo.activityLog.push({
      action: 'Reviewed',
      by: req.user._id,
      details: `Demo ${newStatus.toLowerCase()} with score ${score}`
    });

    await demo.save();

    // Update user demo status
    await User.findByIdAndUpdate(demo.freelancer, {
      'demoVerification.status': newStatus.toLowerCase(),
      'demoVerification.score': score,
      'demoVerification.adminComments': adminComments,
      'demoVerification.lastUpdated': new Date()
    });

    // Send notification to freelancer
    try {
      await notificationHelper.demoReviewed(
        demo.freelancer,
        score,
        newStatus.toLowerCase(),
        demo._id
      );
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: `Demo project ${newStatus.toLowerCase()} successfully`,
      data: demo
    });
  } catch (error) {
    console.error('Error reviewing demo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update demo status (Admin override)
// @route   PUT /api/demo/status/:id
// @access  Private (Admin only)
export const updateDemoStatus = async (req, res) => {
  try {
    const { status, adminComments } = req.body;

    const demo = await DemoProject.findById(req.params.id);

    if (!demo) {
      return res.status(404).json({
        success: false,
        message: 'Demo project not found'
      });
    }

    demo.status = status;
    if (adminComments) {
      demo.adminComments = adminComments;
    }
    demo.activityLog.push({
      action: 'Status Updated',
      by: req.user._id,
      details: `Status changed to ${status} by admin`
    });

    await demo.save();

    // Update user demo status
    await User.findByIdAndUpdate(demo.freelancer, {
      'demoVerification.status': status.toLowerCase().replace(' ', '_'),
      'demoVerification.adminComments': adminComments,
      'demoVerification.lastUpdated': new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Demo status updated successfully',
      data: demo
    });
  } catch (error) {
    console.error('Error updating demo status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete demo project (Admin)
// @route   DELETE /api/demo/:id
// @access  Private (Admin only)
export const deleteDemo = async (req, res) => {
  try {
    const demo = await DemoProject.findById(req.params.id);

    if (!demo) {
      return res.status(404).json({
        success: false,
        message: 'Demo project not found'
      });
    }

    // Update user demo status
    await User.findByIdAndUpdate(demo.freelancer, {
      'demoVerification.status': 'not_assigned',
      'demoVerification.demoProject': null,
      'demoVerification.score': null,
      'demoVerification.adminComments': null,
      'demoVerification.lastUpdated': new Date()
    });

    await demo.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Demo project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting demo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get demo statistics (Admin)
// @route   GET /api/demo/stats
// @access  Private (Admin only)
export const getDemoStats = async (req, res) => {
  try {
    const total = await DemoProject.countDocuments();
    const pending = await DemoProject.countDocuments({ status: 'Pending' });
    const underReview = await DemoProject.countDocuments({ status: 'Under Review' });
    const verified = await DemoProject.countDocuments({ status: 'Verified' });
    const rejected = await DemoProject.countDocuments({ status: 'Rejected' });

    const technical = await DemoProject.countDocuments({ freelancerType: 'Technical' });
    const nonTechnical = await DemoProject.countDocuments({ freelancerType: 'Non-Technical' });

    // Average score
    const scores = await DemoProject.aggregate([
      { $match: { score: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: {
          pending,
          underReview,
          verified,
          rejected
        },
        byType: {
          technical,
          nonTechnical
        },
        averageScore: scores.length > 0 ? scores[0].avgScore.toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching demo stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
