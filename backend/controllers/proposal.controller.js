import Proposal from '../models/Proposal.model.js';
import Job from '../models/Job.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import notificationHelper from '../utils/notificationHelper.js';

// @desc    Create new proposal (Provider only)
// @route   POST /api/proposals
// @access  Private (Provider)
export const createProposal = async (req, res) => {
  try {
    const { jobId, coverLetter, proposedBudget, estimatedDuration, attachments } = req.body;

    // Validate required fields
    if (!jobId || !coverLetter || !proposedBudget || !estimatedDuration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if provider's demo is verified
    const provider = await User.findById(req.user._id);
    if (provider && provider.role === 'provider') {
      const demoStatus = provider.demoVerification?.status;
      if (demoStatus !== 'verified') {
        return res.status(403).json({
          success: false,
          message: 'You must complete and pass the demo project verification before applying for jobs',
          requiresDemoVerification: true,
          demoStatus: demoStatus || 'not_assigned'
        });
      }
    }

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting proposals'
      });
    }

    // Check if provider is the job owner (can't apply to own job)
    if (job.client.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own job'
      });
    }

    // Check if provider type matches job requirement
    if (provider.providerType !== job.providerType) {
      return res.status(403).json({
        success: false,
        message: `This job is for ${job.providerType} service providers only. Your profile is set as ${provider.providerType}.`,
        providerTypeMismatch: true,
        requiredType: job.providerType,
        yourType: provider.providerType
      });
    }

    // Check if provider already submitted a proposal for this job
    const existingProposal = await Proposal.findOne({
      job: jobId,
      provider: req.user._id,
      status: { $ne: 'withdrawn' }
    });

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a proposal for this job'
      });
    }

    // Create proposal
    const proposal = await Proposal.create({
      job: jobId,
      provider: req.user._id,
      coverLetter,
      proposedBudget,
      estimatedDuration,
      attachments: attachments || []
    });

    // Populate job and provider details
    await proposal.populate([
      { path: 'job', select: 'title category budget budgetType location' },
      { path: 'provider', select: 'fullName email profilePicture city rating' }
    ]);

    // Send notification to client
    try {
      await notificationHelper.proposalReceived(
        job.client,
        job.title,
        req.user.fullName,
        proposal._id,
        jobId
      );
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      data: proposal
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit proposal',
      error: error.message
    });
  }
};

// @desc    Get my proposals (Provider)
// @route   GET /api/proposals/my-proposals
// @access  Private (Provider)
export const getMyProposals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { provider: req.user._id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const proposals = await Proposal.find(filter)
      .populate({
        path: 'job',
        select: 'title category budget budgetType location status client',
        populate: {
          path: 'client',
          select: 'fullName email city rating'
        }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Proposal.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: proposals,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposals',
      error: error.message
    });
  }
};

// @desc    Get proposals for a job (Job owner)
// @route   GET /api/proposals/job/:jobId
// @access  Private
export const getJobProposals = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Only job owner can view proposals
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view proposals for this job'
      });
    }

    const filter = { job: jobId };
    
    if (status) {
      filter.status = status;
    }

    const proposals = await Proposal.find(filter)
      .populate({
        path: 'provider',
        select: 'fullName email profilePicture city rating skills services completedJobs'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: proposals
    });
  } catch (error) {
    console.error('Get job proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposals',
      error: error.message
    });
  }
};

// @desc    Get single proposal
// @route   GET /api/proposals/:id
// @access  Private
export const getProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'title category budget budgetType location status client',
        populate: {
          path: 'client',
          select: 'fullName email city rating'
        }
      })
      .populate({
        path: 'provider',
        select: 'fullName email profilePicture city rating skills services'
      });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Check authorization - only proposal owner or job owner can view
    const isProposalOwner = proposal.provider._id.toString() === req.user._id.toString();
    const isJobOwner = proposal.job.client._id.toString() === req.user._id.toString();

    if (!isProposalOwner && !isJobOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this proposal'
      });
    }

    res.status(200).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposal',
      error: error.message
    });
  }
};

// @desc    Update proposal (Provider only - own proposals)
// @route   PUT /api/proposals/:id
// @access  Private (Provider)
export const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Check if user is proposal owner
    if (proposal.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this proposal'
      });
    }

    // Can only update pending proposals
    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending proposals'
      });
    }

    const { coverLetter, proposedBudget, estimatedDuration, attachments } = req.body;

    if (coverLetter) proposal.coverLetter = coverLetter;
    if (proposedBudget) proposal.proposedBudget = proposedBudget;
    if (estimatedDuration) proposal.estimatedDuration = estimatedDuration;
    if (attachments) proposal.attachments = attachments;

    await proposal.save();

    await proposal.populate([
      { path: 'job', select: 'title category budget budgetType location' },
      { path: 'provider', select: 'fullName email profilePicture city rating' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Proposal updated successfully',
      data: proposal
    });
  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update proposal',
      error: error.message
    });
  }
};

// @desc    Withdraw proposal (Provider only)
// @route   DELETE /api/proposals/:id
// @access  Private (Provider)
export const withdrawProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Check if user is proposal owner
    if (proposal.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this proposal'
      });
    }

    // Can only withdraw pending proposals
    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only withdraw pending proposals'
      });
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    res.status(200).json({
      success: true,
      message: 'Proposal withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw proposal',
      error: error.message
    });
  }
};

// @desc    Accept/Reject proposal (Client only - job owner)
// @route   PUT /api/proposals/:id/status
// @access  Private (Client)
export const updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "accepted" or "rejected"'
      });
    }

    const proposal = await Proposal.findById(req.params.id).populate('job');

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Check if user is job owner
    if (proposal.job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this proposal'
      });
    }

    // Can only accept/reject pending proposals
    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Proposal has already been processed'
      });
    }

    proposal.status = status;
    await proposal.save();

    // If accepted, update job status and reject other proposals
    if (status === 'accepted') {
      // Update job status
      const updatedJob = await Job.findByIdAndUpdate(
        proposal.job._id,
        {
          status: 'in_progress',
          assignedProvider: proposal.provider
        },
        { new: true }
      );

      // Reject other pending proposals for this job
      await Proposal.updateMany(
        {
          job: proposal.job._id,
          _id: { $ne: proposal._id },
          status: 'pending'
        },
        { status: 'rejected' }
      );

      // Create order automatically
      await Order.create({
        job: proposal.job._id,
        proposal: proposal._id,
        client: proposal.job.client,
        provider: proposal.provider,
        amount: proposal.proposedBudget,
        deadline: updatedJob.deadline,
        status: 'pending',
        payment: {
          status: 'pending'
        }
      });

      // Send notification to provider
      try {
        await notificationHelper.proposalAccepted(
          proposal.provider,
          proposal.job.title,
          proposal._id,
          proposal.job._id
        );
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }
    } else if (status === 'rejected') {
      // Send rejection notification to provider
      try {
        await notificationHelper.proposalRejected(
          proposal.provider,
          proposal.job.title,
          proposal._id
        );
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }
    }

    await proposal.populate([
      { path: 'job', select: 'title category budget budgetType location' },
      { path: 'provider', select: 'fullName email profilePicture city rating' }
    ]);

    res.status(200).json({
      success: true,
      message: `Proposal ${status} successfully`,
      data: proposal
    });
  } catch (error) {
    console.error('Update proposal status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update proposal status',
      error: error.message
    });
  }
};
