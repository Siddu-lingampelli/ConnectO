import Order from '../models/Order.model.js';
import Job from '../models/Job.model.js';
import Proposal from '../models/Proposal.model.js';

// @desc    Get my orders (Provider or Client)
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    
    // Filter by role
    if (req.user.role === 'provider') {
      filter.provider = req.user._id;
    } else if (req.user.role === 'client') {
      filter.client = req.user._id;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate({
        path: 'job',
        select: 'title category budget budgetType location description'
      })
      .populate({
        path: 'client',
        select: 'fullName email phone city rating profilePicture'
      })
      .populate({
        path: 'provider',
        select: 'fullName email phone city rating profilePicture skills'
      })
      .populate({
        path: 'proposal',
        select: 'coverLetter proposedBudget estimatedDuration'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'title category budget budgetType location description client'
      })
      .populate({
        path: 'client',
        select: 'fullName email phone city rating profilePicture'
      })
      .populate({
        path: 'provider',
        select: 'fullName email phone city rating profilePicture skills services'
      })
      .populate({
        path: 'proposal',
        select: 'coverLetter proposedBudget estimatedDuration'
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization - only order participants can view
    const isClient = order.client._id.toString() === req.user._id.toString();
    const isProvider = order.provider._id.toString() === req.user._id.toString();

    if (!isClient && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// @desc    Update order status (Provider)
// @route   PUT /api/orders/:id/status
// @access  Private (Provider)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['in_progress', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the provider
    if (order.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update status
    order.status = status;

    if (status === 'in_progress' && !order.startDate) {
      order.startDate = new Date();
    }

    if (status === 'completed' && !order.completedDate) {
      order.completedDate = new Date();
    }

    await order.save();

    // Update job status
    if (status === 'completed') {
      await Job.findByIdAndUpdate(order.job, { status: 'completed' });
    }

    await order.populate([
      { path: 'job', select: 'title category budget budgetType location' },
      { path: 'client', select: 'fullName email phone city rating' },
      { path: 'provider', select: 'fullName email phone city rating' }
    ]);

    res.status(200).json({
      success: true,
      message: `Order marked as ${status}`,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// @desc    Accept delivery (Client)
// @route   PUT /api/orders/:id/accept-delivery
// @access  Private (Client)
export const acceptDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the client
    if (order.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept delivery for this order'
      });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order is not marked as completed yet'
      });
    }

    // Update payment status
    order.payment.status = 'released';
    order.payment.releasedAt = new Date();

    await order.save();

    // Update provider's completed jobs count
    await req.app.get('models').User.findByIdAndUpdate(
      order.provider,
      { $inc: { completedJobs: 1 } }
    );

    await order.populate([
      { path: 'job', select: 'title category budget budgetType location' },
      { path: 'client', select: 'fullName email phone city rating' },
      { path: 'provider', select: 'fullName email phone city rating' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Delivery accepted and payment released',
      data: order
    });
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept delivery',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Client or Provider)
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is client or provider
    const isClient = order.client.toString() === req.user._id.toString();
    const isProvider = order.provider.toString() === req.user._id.toString();

    if (!isClient && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel if not completed
    if (order.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed order'
      });
    }

    order.status = 'cancelled';
    order.notes = reason || 'Order cancelled';

    await order.save();

    // Update job status back to open
    await Job.findByIdAndUpdate(order.job, { 
      status: 'open',
      assignedProvider: null
    });

    await order.populate([
      { path: 'job', select: 'title category budget budgetType location' },
      { path: 'client', select: 'fullName email phone city rating' },
      { path: 'provider', select: 'fullName email phone city rating' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// @desc    Add milestone
// @route   POST /api/orders/:id/milestones
// @access  Private (Provider)
export const addMilestone = async (req, res) => {
  try {
    const { title, description, amount } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the provider
    if (order.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add milestones to this order'
      });
    }

    order.milestones.push({
      title,
      description,
      amount,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Milestone added successfully',
      data: order
    });
  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add milestone',
      error: error.message
    });
  }
};

// @desc    Complete milestone
// @route   PUT /api/orders/:id/milestones/:milestoneId
// @access  Private (Provider)
export const completeMilestone = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the provider
    if (order.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this milestone'
      });
    }

    const milestone = order.milestones.id(milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    milestone.status = 'completed';
    milestone.completedAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Milestone marked as completed',
      data: order
    });
  } catch (error) {
    console.error('Complete milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete milestone',
      error: error.message
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
export const getOrderStats = async (req, res) => {
  try {
    const filter = {};
    
    if (req.user.role === 'provider') {
      filter.provider = req.user._id;
    } else if (req.user.role === 'client') {
      filter.client = req.user._id;
    }

    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      totalEarnings: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
      if (stat._id === 'completed') {
        formattedStats.totalEarnings = stat.totalAmount;
      }
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

// @desc    Get rehire info for a provider
// @route   GET /api/orders/provider/:providerId/rehire-info
// @access  Private (Client only)
export const getRehireInfo = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Get past completed orders with this provider
    const completedOrders = await Order.find({
      client: req.user._id,
      provider: providerId,
      status: 'completed'
    })
      .populate({
        path: 'job',
        select: 'title category budget'
      })
      .populate({
        path: 'provider',
        select: 'fullName email phone profilePicture skills rating completedJobs hourlyRate'
      })
      .sort({ completedAt: -1 })
      .limit(5);

    if (completedOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No completed orders found with this provider'
      });
    }

    // Calculate statistics
    const totalSpent = completedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const avgRating = completedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / completedOrders.length;
    const lastJob = completedOrders[0];

    res.status(200).json({
      success: true,
      data: {
        provider: completedOrders[0].provider,
        pastOrders: completedOrders,
        stats: {
          totalOrders: completedOrders.length,
          totalSpent: totalSpent,
          averageRating: avgRating || 0,
          lastCompletedDate: lastJob.completedAt,
          lastJobTitle: lastJob.job?.title
        }
      }
    });
  } catch (error) {
    console.error('Get rehire info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rehire information',
      error: error.message
    });
  }
};
