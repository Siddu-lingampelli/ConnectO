import User from '../models/User.model.js';
import notificationHelper from '../utils/notificationHelper.js';

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

// ==================== ID VERIFICATION ====================

// @desc    Submit ID verification
// @route   POST /api/verification/id
// @access  Private
export const submitIdVerification = async (req, res) => {
  try {
    const { idType, idNumber, idDocumentUrl, selfieUrl } = req.body;

    if (!idType || !idNumber || !idDocumentUrl || !selfieUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update ID verification details
    user.idVerification = {
      status: 'pending',
      idType,
      idNumber,
      idDocumentUrl,
      selfieUrl,
      submittedAt: new Date()
    };

    await user.save();

    // Notify admins
    try {
      await notificationHelper.notifyAdmins({
        type: 'id_verification_submitted',
        message: `${user.fullName} submitted ID verification`,
        relatedUser: user._id
      });
    } catch (notifError) {
      console.log('⚠️ Could not send admin notification:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'ID verification submitted successfully. Admin will review shortly.',
      data: user.idVerification
    });
  } catch (error) {
    console.error('❌ Submit ID verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Review ID verification (Admin only)
// @route   PUT /api/verification/id/:userId/review
// @access  Private (Admin)
export const reviewIdVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "verified" or "rejected"'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.idVerification.status = status;
    user.idVerification.verifiedAt = status === 'verified' ? new Date() : null;
    user.idVerification.rejectionReason = status === 'rejected' ? rejectionReason : null;
    user.idVerification.verifiedBy = req.user._id;

    await user.save();

    // Notify user
    try {
      await notificationHelper.createNotification({
        user: user._id,
        type: status === 'verified' ? 'id_verified' : 'id_rejected',
        message: status === 'verified' 
          ? '✅ Your ID verification has been approved!'
          : `❌ Your ID verification was rejected. Reason: ${rejectionReason}`
      });
    } catch (notifError) {
      console.log('⚠️ Could not send notification:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: `ID verification ${status} successfully`,
      data: user.idVerification
    });
  } catch (error) {
    console.error('❌ Review ID verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all pending ID verifications (Admin only)
// @route   GET /api/verification/id/pending
// @access  Private (Admin)
export const getPendingIdVerifications = async (req, res) => {
  try {
    const users = await User.find({
      'idVerification.status': 'pending'
    }).select('fullName email profilePicture idVerification createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Get pending ID verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==================== BACKGROUND CHECK ====================

// @desc    Request background check
// @route   POST /api/verification/background-check/:userId
// @access  Private (Admin)
export const requestBackgroundCheck = async (req, res) => {
  try {
    const { userId } = req.params;
    const { provider, notes } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.backgroundCheck = {
      status: 'in_progress',
      requestedAt: new Date(),
      provider: provider || 'Manual Review',
      notes,
      checks: {
        criminalRecord: 'pending',
        employmentHistory: 'pending',
        educationVerification: 'pending',
        referenceCheck: 'pending'
      }
    };

    await user.save();

    // Notify user
    try {
      await notificationHelper.createNotification({
        user: user._id,
        type: 'background_check_initiated',
        message: '🔍 Background verification process has been initiated for your profile'
      });
    } catch (notifError) {
      console.log('⚠️ Could not send notification:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Background check initiated',
      data: user.backgroundCheck
    });
  } catch (error) {
    console.error('❌ Request background check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update background check
// @route   PUT /api/verification/background-check/:userId
// @access  Private (Admin)
export const updateBackgroundCheck = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, checks, reportUrl, notes } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (status) {
      user.backgroundCheck.status = status;
      if (status === 'cleared' || status === 'failed') {
        user.backgroundCheck.completedAt = new Date();
      }
    }

    if (checks) {
      user.backgroundCheck.checks = { ...user.backgroundCheck.checks, ...checks };
    }

    if (reportUrl) {
      user.backgroundCheck.reportUrl = reportUrl;
    }

    if (notes) {
      user.backgroundCheck.notes = notes;
    }

    await user.save();

    // Notify user if completed
    if (status === 'cleared' || status === 'failed') {
      try {
        await notificationHelper.createNotification({
          user: user._id,
          type: status === 'cleared' ? 'background_check_cleared' : 'background_check_failed',
          message: status === 'cleared' 
            ? '✅ Your background verification has been cleared!'
            : '❌ Background verification could not be completed. Please contact support.'
        });
      } catch (notifError) {
        console.log('⚠️ Could not send notification:', notifError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Background check updated',
      data: user.backgroundCheck
    });
  } catch (error) {
    console.error('❌ Update background check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==================== SKILL CERTIFICATIONS ====================

// @desc    Add skill certification
// @route   POST /api/verification/certifications
// @access  Private
export const addSkillCertification = async (req, res) => {
  try {
    const {
      skill,
      certificationName,
      issuingOrganization,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      certificateUrl
    } = req.body;

    if (!skill || !certificationName || !issuingOrganization || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const certification = {
      skill,
      certificationName,
      issuingOrganization,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      credentialId,
      credentialUrl,
      certificateUrl,
      verificationStatus: 'pending',
      addedAt: new Date()
    };

    user.skillCertifications.push(certification);
    await user.save();

    // Notify admins
    try {
      await notificationHelper.notifyAdmins({
        type: 'certification_submitted',
        message: `${user.fullName} added a new certification: ${certificationName}`,
        relatedUser: user._id
      });
    } catch (notifError) {
      console.log('⚠️ Could not send admin notification:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Certification added successfully. Admin will verify it soon.',
      data: user.skillCertifications
    });
  } catch (error) {
    console.error('❌ Add skill certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify skill certification (Admin only)
// @route   PUT /api/verification/certifications/:userId/:certId/verify
// @access  Private (Admin)
export const verifySkillCertification = async (req, res) => {
  try {
    const { userId, certId } = req.params;
    const { verificationStatus } = req.body;

    if (!['verified', 'invalid', 'expired'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const certification = user.skillCertifications.id(certId);
    
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    certification.verificationStatus = verificationStatus;
    certification.verifiedAt = new Date();
    certification.verifiedBy = req.user._id;

    await user.save();

    // Notify user
    try {
      await notificationHelper.createNotification({
        user: user._id,
        type: `certification_${verificationStatus}`,
        message: verificationStatus === 'verified'
          ? `✅ Your certification "${certification.certificationName}" has been verified!`
          : `❌ Your certification "${certification.certificationName}" could not be verified.`
      });
    } catch (notifError) {
      console.log('⚠️ Could not send notification:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: `Certification marked as ${verificationStatus}`,
      data: certification
    });
  } catch (error) {
    console.error('❌ Verify skill certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete skill certification
// @route   DELETE /api/verification/certifications/:certId
// @access  Private
export const deleteSkillCertification = async (req, res) => {
  try {
    const { certId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.skillCertifications.pull(certId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Certification deleted successfully',
      data: user.skillCertifications
    });
  } catch (error) {
    console.error('❌ Delete skill certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get comprehensive verification status overview
// @route   GET /api/verification/overview
// @access  Private
export const getVerificationOverview = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'idVerification backgroundCheck skillCertifications demoVerification verification'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate completion percentage
    let completionScore = 0;

    if (user.verification?.status === 'verified') completionScore += 20;
    if (user.demoVerification?.status === 'verified') completionScore += 20;
    if (user.idVerification?.status === 'verified') completionScore += 20;
    if (user.backgroundCheck?.status === 'cleared') completionScore += 20;
    if (user.skillCertifications?.some(cert => cert.verificationStatus === 'verified')) {
      completionScore += 20;
    }

    const overview = {
      basicVerification: user.verification,
      demoVerification: user.demoVerification,
      idVerification: user.idVerification,
      backgroundCheck: user.backgroundCheck,
      skillCertifications: user.skillCertifications,
      completionPercentage: completionScore,
      isFullyVerified: completionScore === 100
    };

    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('❌ Get verification overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users with verification details (Admin only)
// @route   GET /api/verification/all
// @access  Private (Admin)
export const getAllVerifications = async (req, res) => {
  try {
    const { filter } = req.query; // 'pending_id', 'pending_certs', 'background_check', 'all'

    let query = {};

    if (filter === 'pending_id') {
      query['idVerification.status'] = 'pending';
    } else if (filter === 'pending_certs') {
      query['skillCertifications.verificationStatus'] = 'pending';
    } else if (filter === 'background_check') {
      query['backgroundCheck.status'] = 'in_progress';
    }

    const users = await User.find(query)
      .select('fullName email profilePicture role idVerification backgroundCheck skillCertifications demoVerification verification')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Get all verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
