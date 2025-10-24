import Job from '../models/Job.model.js';
import User from '../models/User.model.js';

/**
 * Invite a collaborator to the project
 * Only the main provider (assignedProvider) can invite
 */
export const inviteCollaborator = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { providerId, role, sharePercent } = req.body;

    // Validate input
    if (!providerId || !sharePercent) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID and share percentage are required'
      });
    }

    if (sharePercent <= 0 || sharePercent > 100) {
      return res.status(400).json({
        success: false,
        message: 'Share percentage must be between 0 and 100'
      });
    }

    // Find the job
    const job = await Job.findById(jobId).populate('assignedProvider');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the main provider
    if (!job.assignedProvider || job.assignedProvider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned provider can invite collaborators'
      });
    }

    // Check if job is in progress
    if (job.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Can only invite collaborators for in-progress jobs'
      });
    }

    // Check if provider exists and is a service provider
    const collaborator = await User.findById(providerId);
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (collaborator.role !== 'provider') {
      return res.status(400).json({
        success: false,
        message: 'User must be a service provider'
      });
    }

    // Check if already invited
    const existingCollaborator = job.collaborators.find(
      c => c.providerId.toString() === providerId
    );

    if (existingCollaborator) {
      return res.status(400).json({
        success: false,
        message: 'This provider is already invited to this project'
      });
    }

    // Check if main provider is trying to invite themselves
    if (job.assignedProvider._id.toString() === providerId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot invite yourself as a collaborator'
      });
    }

    // Calculate total share percentage including the new collaborator
    const currentTotalShare = job.collaborators
      .filter(c => c.status !== 'declined')
      .reduce((sum, c) => sum + c.sharePercent, 0);

    if (currentTotalShare + sharePercent > 100) {
      return res.status(400).json({
        success: false,
        message: `Total share percentage cannot exceed 100%. Current: ${currentTotalShare}%, Trying to add: ${sharePercent}%`
      });
    }

    // Add collaborator
    job.collaborators.push({
      providerId,
      role: role || 'Collaborator',
      sharePercent,
      status: 'invited',
      invitedAt: new Date()
    });

    await job.save({ validateModifiedOnly: true });

    // Populate the newly added collaborator
    await job.populate('collaborators.providerId', 'fullName email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Collaborator invited successfully',
      collaborators: job.collaborators
    });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invite collaborator',
      error: error.message
    });
  }
};

/**
 * Invite a collaborator by email (easier for users)
 * Only the main provider (assignedProvider) can invite
 */
export const inviteCollaboratorByEmail = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { providerEmail, role, sharePercent } = req.body;

    // Validate input
    if (!providerEmail || !sharePercent) {
      return res.status(400).json({
        success: false,
        message: 'Provider email and share percentage are required'
      });
    }

    if (sharePercent <= 0 || sharePercent > 100) {
      return res.status(400).json({
        success: false,
        message: 'Share percentage must be between 0 and 100'
      });
    }

    // Find the provider by email
    const collaborator = await User.findOne({ email: providerEmail.toLowerCase() });
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'No provider found with this email address'
      });
    }

    if (collaborator.role !== 'provider') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a service provider'
      });
    }

    // Find the job
    const job = await Job.findById(jobId).populate('assignedProvider');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the main provider
    if (!job.assignedProvider || job.assignedProvider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned provider can invite collaborators'
      });
    }

    // Check if job is in progress
    if (job.status !== 'in_progress' && job.status !== 'in-progress' && job.status !== 'IN PROGRESS') {
      return res.status(400).json({
        success: false,
        message: 'Can only invite collaborators for in-progress jobs'
      });
    }

    // Check if already invited
    const existingCollaborator = job.collaborators.find(
      c => c.providerId.toString() === collaborator._id.toString()
    );

    if (existingCollaborator) {
      return res.status(400).json({
        success: false,
        message: 'This provider is already invited to this project'
      });
    }

    // Check if main provider is trying to invite themselves
    if (job.assignedProvider._id.toString() === collaborator._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot invite yourself as a collaborator'
      });
    }

    // Calculate total share percentage including the new collaborator
    const currentTotalShare = job.collaborators
      .filter(c => c.status !== 'declined')
      .reduce((sum, c) => sum + c.sharePercent, 0);

    if (currentTotalShare + sharePercent > 100) {
      return res.status(400).json({
        success: false,
        message: `Total share percentage cannot exceed 100%. Current: ${currentTotalShare}%, Trying to add: ${sharePercent}%`
      });
    }

    // Add collaborator
    job.collaborators.push({
      providerId: collaborator._id,
      role: role || 'Collaborator',
      sharePercent,
      status: 'invited',
      invitedAt: new Date()
    });

    // Save without validating the entire document (to avoid category enum validation)
    await job.save({ validateModifiedOnly: true });

    // Populate the newly added collaborator
    await job.populate('collaborators.providerId', 'fullName email profilePicture providerType');

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${collaborator.fullName} (${collaborator.email})`,
      collaborators: job.collaborators
    });
  } catch (error) {
    console.error('Error inviting collaborator by email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invite collaborator',
      error: error.message
    });
  }
};

/**
 * Respond to collaboration invitation (accept or decline)
 */
export const respondToInvitation = async (req, res) => {
  try {
    const { id: jobId, cid: collaboratorId } = req.params;
    const { response } = req.body; // 'accepted' or 'declined'

    if (!['accepted', 'declined'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Response must be either "accepted" or "declined"'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Find the collaborator entry
    const collaborator = job.collaborators.id(collaboratorId);
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'Collaborator invitation not found'
      });
    }

    // Check if the logged-in user is the invited provider
    if (collaborator.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to your own invitations'
      });
    }

    // Check if already responded
    if (collaborator.status !== 'invited') {
      return res.status(400).json({
        success: false,
        message: `Invitation already ${collaborator.status}`
      });
    }

    // Update status
    collaborator.status = response;
    collaborator.respondedAt = new Date();

    await job.save({ validateModifiedOnly: true });
    await job.populate('collaborators.providerId', 'fullName email profilePicture');

    res.status(200).json({
      success: true,
      message: `Invitation ${response} successfully`,
      collaborator
    });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to invitation',
      error: error.message
    });
  }
};

/**
 * Update payment splits for the project
 * Only main provider can update splits
 */
export const updatePaymentSplits = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { splits } = req.body; // Array of { providerId, sharePercent }

    if (!splits || !Array.isArray(splits)) {
      return res.status(400).json({
        success: false,
        message: 'Splits array is required'
      });
    }

    const job = await Job.findById(jobId).populate('assignedProvider');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the main provider
    if (!job.assignedProvider || job.assignedProvider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned provider can update payment splits'
      });
    }

    // Validate total percentage equals 100%
    const totalPercent = splits.reduce((sum, split) => sum + split.sharePercent, 0);
    if (Math.abs(totalPercent - 100) > 0.01) { // Allow small floating point differences
      return res.status(400).json({
        success: false,
        message: `Total share percentage must equal 100%. Current total: ${totalPercent}%`
      });
    }

    // Validate all providers are either main provider or accepted collaborators
    const acceptedCollaboratorIds = job.collaborators
      .filter(c => c.status === 'accepted')
      .map(c => c.providerId.toString());

    const mainProviderId = job.assignedProvider._id.toString();

    for (const split of splits) {
      if (split.providerId !== mainProviderId && !acceptedCollaboratorIds.includes(split.providerId)) {
        return res.status(400).json({
          success: false,
          message: 'All providers in splits must be either main provider or accepted collaborators'
        });
      }
    }

    // Calculate payment amounts
    const paymentSplits = splits.map(split => ({
      providerId: split.providerId,
      sharePercent: split.sharePercent,
      amount: (job.budget * split.sharePercent) / 100,
      isPaid: false
    }));

    job.paymentSplits = paymentSplits;
    await job.save({ validateModifiedOnly: true });

    await job.populate('paymentSplits.providerId', 'fullName email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Payment splits updated successfully',
      paymentSplits: job.paymentSplits
    });
  } catch (error) {
    console.error('Error updating payment splits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment splits',
      error: error.message
    });
  }
};

/**
 * Get collaborators for a job
 */
export const getCollaborators = async (req, res) => {
  try {
    const { id: jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate('collaborators.providerId', 'fullName email profilePicture providerType')
      .populate('assignedProvider', 'fullName email profilePicture');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Only main provider and collaborators can view the list
    const userId = req.user._id.toString();
    const isMainProvider = job.assignedProvider && job.assignedProvider._id.toString() === userId;
    const isCollaborator = job.collaborators.some(c => c.providerId._id.toString() === userId);

    if (!isMainProvider && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view collaborators for this job'
      });
    }

    res.status(200).json({
      success: true,
      collaborators: job.collaborators,
      mainProvider: job.assignedProvider
    });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaborators',
      error: error.message
    });
  }
};

/**
 * Remove a collaborator (only for invited status or by declining collaborator)
 */
export const removeCollaborator = async (req, res) => {
  try {
    const { id: jobId, cid: collaboratorId } = req.params;

    const job = await Job.findById(jobId).populate('assignedProvider');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const collaborator = job.collaborators.id(collaboratorId);
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'Collaborator not found'
      });
    }

    // Check permissions: main provider can remove invited collaborators
    const isMainProvider = job.assignedProvider && job.assignedProvider._id.toString() === req.user._id.toString();
    const isCollaboratorSelf = collaborator.providerId.toString() === req.user._id.toString();

    if (!isMainProvider && !isCollaboratorSelf) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove this collaborator'
      });
    }

    // Can only remove if status is invited or declined
    if (collaborator.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove accepted collaborators. Please update payment splits first.'
      });
    }

    job.collaborators.pull(collaboratorId);
    await job.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully'
    });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove collaborator',
      error: error.message
    });
  }
};

/**
 * Get all pending collaboration invitations for the current user
 */
export const getMyInvitations = async (req, res) => {
  try {
    // Find all jobs where the current user is invited as a collaborator
    const jobs = await Job.find({
      'collaborators.providerId': req.user._id,
      'collaborators.status': 'invited'
    })
      .populate('client', 'fullName email profilePicture')
      .populate('assignedProvider', 'fullName email profilePicture')
      .select('title description category budget deadline status createdAt collaborators');

    // Filter to only get this user's invitation details
    const invitations = jobs.map(job => {
      const collaboration = job.collaborators.find(
        c => c.providerId.toString() === req.user._id.toString() && c.status === 'invited'
      );

      return {
        _id: collaboration._id,
        jobId: job._id,
        jobTitle: job.title,
        jobDescription: job.description,
        jobCategory: job.category,
        jobBudget: job.budget,
        jobDeadline: job.deadline,
        jobStatus: job.status,
        mainProvider: job.assignedProvider,
        client: job.client,
        role: collaboration.role,
        sharePercent: collaboration.sharePercent,
        shareAmount: ((job.budget * collaboration.sharePercent) / 100).toFixed(2),
        invitedAt: collaboration.invitedAt,
        status: collaboration.status
      };
    });

    res.status(200).json({
      success: true,
      count: invitations.length,
      invitations
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invitations',
      error: error.message
    });
  }
};
