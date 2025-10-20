import User from '../models/User.model.js';

// @desc    Submit verification documents
// @route   POST /api/verification/submit
// @access  Private
export const submitVerification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { panCardUrl, aadharCardUrl } = req.body;

    console.log('📤 Submitting verification for user:', userId);

    if (!panCardUrl || !aadharCardUrl) {
      return res.status(400).json({
        success: false,
        message: 'Both PAN card and Aadhar card are required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.verification.status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Update verification details
    user.verification = {
      status: 'pending',
      submittedAt: new Date(),
      documents: {
        panCardUrl,
        aadharCardUrl
      }
    };

    await user.save();

    console.log('✅ Verification documents submitted successfully');

    res.status(200).json({
      success: true,
      message: 'Verification documents submitted successfully. Our team will review them within 24-48 hours.',
      data: { user }
    });
  } catch (error) {
    console.error('❌ Submit verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get verification status
// @route   GET /api/verification/status
// @access  Private
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('verification fullName email role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { 
        verification: user.verification,
        userInfo: {
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('❌ Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve verification (Admin only)
// @route   PUT /api/verification/approve/:userId
// @access  Private/Admin
export const approveVerification = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.verification.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'No pending verification to approve'
      });
    }

    user.verification.status = 'verified';
    user.verification.verifiedAt = new Date();
    await user.save();

    console.log('✅ User verification approved:', userId);

    res.status(200).json({
      success: true,
      message: 'User verification approved',
      data: { user }
    });
  } catch (error) {
    console.error('❌ Approve verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject verification (Admin only)
// @route   PUT /api/verification/reject/:userId
// @access  Private/Admin
export const rejectVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.verification.status = 'rejected';
    user.verification.rejectionReason = reason || 'Documents do not meet verification requirements';
    await user.save();

    console.log('❌ User verification rejected:', userId);

    res.status(200).json({
      success: true,
      message: 'User verification rejected',
      data: { user }
    });
  } catch (error) {
    console.error('❌ Reject verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all pending verifications (Admin only)
// @route   GET /api/verification/pending
// @access  Private/Admin
export const getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({ 
      'verification.status': 'pending' 
    }).select('fullName email role verification createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('❌ Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
