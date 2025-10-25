import User from '../models/User.model.js';

/**
 * Switch user's active role between client and provider
 * @route PATCH /api/role/switch
 * @access Private
 */
export const switchRole = async (req, res) => {
  try {
    const { targetRole } = req.body;
    const userId = req.user._id;

    // Validate target role
    if (!targetRole || !['client', 'provider'].includes(targetRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "client" or "provider".'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has this role enabled
    if (!user.enabledRoles.includes(targetRole)) {
      return res.status(403).json({
        success: false,
        message: `You don't have ${targetRole} role enabled. Please enable it first.`
      });
    }

    // If switching to provider, check demo verification
    if (targetRole === 'provider') {
      // Check if provider type is set
      if (!user.providerType) {
        return res.status(400).json({
          success: false,
          message: 'Please set your provider type before switching to provider mode.'
        });
      }

      // Check verification status (must be verified to work as provider)
      if (user.verification.status !== 'verified') {
        return res.status(403).json({
          success: false,
          message: 'You must complete verification before switching to provider mode.',
          requiresVerification: true
        });
      }
    }

    // Update active role
    user.activeRole = targetRole;
    user.role = targetRole; // Also update the main role field for backward compatibility
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `Successfully switched to ${targetRole} mode`,
      data: {
        activeRole: user.activeRole,
        enabledRoles: user.enabledRoles,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          activeRole: user.activeRole,
          enabledRoles: user.enabledRoles,
          role: user.role,
          providerType: user.providerType,
          verification: user.verification
        }
      }
    });
  } catch (error) {
    console.error('Error switching role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to switch role',
      error: error.message
    });
  }
};

/**
 * Enable a new role for the user (add provider capability)
 * @route POST /api/role/enable
 * @access Private
 */
export const enableRole = async (req, res) => {
  try {
    const { role, providerType } = req.body;
    const userId = req.user._id;

    // Validate role
    if (!role || !['client', 'provider'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "client" or "provider".'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if role is already enabled
    if (user.enabledRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `${role} role is already enabled for your account.`
      });
    }

    // If enabling provider role, require provider type
    if (role === 'provider') {
      if (!providerType || !['Technical', 'Non-Technical'].includes(providerType)) {
        return res.status(400).json({
          success: false,
          message: 'Please select a valid provider type: Technical or Non-Technical.'
        });
      }
      user.providerType = providerType;
    }

    // Add role to enabled roles
    user.enabledRoles.push(role);
    
    // Add to role history
    user.roleHistory.push({
      role: role,
      enabledAt: new Date()
    });

    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `${role} role enabled successfully! ${role === 'provider' ? 'Please complete verification to start accepting jobs.' : ''}`,
      data: {
        enabledRoles: user.enabledRoles,
        activeRole: user.activeRole,
        providerType: user.providerType,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          activeRole: user.activeRole,
          enabledRoles: user.enabledRoles,
          role: user.role,
          providerType: user.providerType,
          verification: user.verification
        }
      }
    });
  } catch (error) {
    console.error('Error enabling role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable role',
      error: error.message
    });
  }
};

/**
 * Get current role status and available roles
 * @route GET /api/role/status
 * @access Private
 */
export const getRoleStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('activeRole enabledRoles role providerType verification.status demoStatus');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        activeRole: user.activeRole,
        enabledRoles: user.enabledRoles,
        role: user.role,
        providerType: user.providerType,
        canSwitchToProvider: user.enabledRoles.includes('provider') && user.verification.status === 'verified',
        canSwitchToClient: user.enabledRoles.includes('client'),
        isVerified: user.verification.status === 'verified',
        demoStatus: user.demoStatus
      }
    });
  } catch (error) {
    console.error('Error getting role status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get role status',
      error: error.message
    });
  }
};

/**
 * Disable a role (except the currently active one)
 * @route DELETE /api/role/disable/:role
 * @access Private
 */
export const disableRole = async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user._id;

    // Validate role
    if (!['client', 'provider'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Can't disable the active role
    if (user.activeRole === role) {
      return res.status(400).json({
        success: false,
        message: `Cannot disable your active role. Please switch to another role first.`
      });
    }

    // Can't disable if it's the only enabled role
    if (user.enabledRoles.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot disable your only enabled role.'
      });
    }

    // Remove from enabled roles
    user.enabledRoles = user.enabledRoles.filter(r => r !== role);
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `${role} role disabled successfully`,
      data: {
        enabledRoles: user.enabledRoles,
        activeRole: user.activeRole
      }
    });
  } catch (error) {
    console.error('Error disabling role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable role',
      error: error.message
    });
  }
};
