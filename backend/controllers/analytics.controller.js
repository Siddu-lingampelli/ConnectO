import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import Order from '../models/Order.model.js';
import { Wallet, Transaction } from '../models/Wallet.model.js';
import { Payment } from '../models/Payment.model.js';
import Proposal from '../models/Proposal.model.js';

// ==================== PROVIDER EARNINGS ANALYTICS ====================

/**
 * @desc    Get provider earnings analytics
 * @route   GET /api/analytics/provider/earnings
 * @access  Private (Provider only)
 */
export const getProviderEarnings = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { period = '30' } = req.query; // 7, 30, 90, 365, all
    
    // Calculate date range
    let startDate = new Date();
    if (period !== 'all') {
      startDate.setDate(startDate.getDate() - parseInt(period));
    } else {
      startDate = new Date(0); // Beginning of time
    }

    // Get wallet info
    const wallet = await Wallet.findOne({ user: providerId });
    const walletBalance = wallet?.balance || 0;
    const totalEarned = wallet?.totalEarned || 0;
    const pendingAmount = wallet?.pendingAmount || 0;

    // Get completed orders
    const completedOrders = await Order.find({
      provider: providerId,
      status: 'completed',
      completedAt: { $gte: startDate }
    }).populate('job', 'title category')
      .populate('client', 'fullName profilePicture')
      .sort({ completedAt: -1 });

    // Daily earnings breakdown
    const dailyEarnings = await Transaction.aggregate([
      {
        $match: {
          user: providerId,
          type: 'credit',
          category: { $in: ['job_payment', 'order_payment', 'bonus', 'referral'] },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Earnings by category
    const earningsByCategory = await Transaction.aggregate([
      {
        $match: {
          user: providerId,
          type: 'credit',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    // Job completion stats
    const jobStats = await Order.aggregate([
      {
        $match: {
          provider: providerId,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Top clients (by earnings)
    const topClients = await Order.aggregate([
      {
        $match: {
          provider: providerId,
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$client',
          totalEarned: { $sum: '$amount' },
          jobsCompleted: { $sum: 1 }
        }
      },
      { $sort: { totalEarned: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      { $unwind: '$clientInfo' },
      {
        $project: {
          _id: 1,
          totalEarned: 1,
          jobsCompleted: 1,
          name: '$clientInfo.fullName',
          email: '$clientInfo.email',
          profilePicture: '$clientInfo.profilePicture'
        }
      }
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({
      user: providerId,
      createdAt: { $gte: startDate }
    })
      .populate('relatedJob', 'title')
      .populate('relatedOrder', 'status')
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate growth rate
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period || 30));
    
    const currentPeriodEarnings = await Transaction.aggregate([
      {
        $match: {
          user: providerId,
          type: 'credit',
          createdAt: { $gte: startDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const previousPeriodEarnings = await Transaction.aggregate([
      {
        $match: {
          user: providerId,
          type: 'credit',
          createdAt: { $gte: previousPeriodStart, $lt: startDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const current = currentPeriodEarnings[0]?.total || 0;
    const previous = previousPeriodEarnings[0]?.total || 0;
    const growthRate = previous > 0 ? (((current - previous) / previous) * 100).toFixed(1) : 0;

    // Monthly breakdown
    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          user: providerId,
          type: 'credit',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          walletBalance,
          totalEarned,
          pendingAmount,
          currentPeriodEarnings: current,
          growthRate: parseFloat(growthRate),
          completedJobs: completedOrders.length
        },
        dailyEarnings,
        monthlyEarnings,
        earningsByCategory,
        jobStats,
        topClients,
        recentOrders: completedOrders.slice(0, 10),
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Provider earnings analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get provider performance metrics
 * @route   GET /api/analytics/provider/performance
 * @access  Private (Provider only)
 */
export const getProviderPerformance = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { period = '30' } = req.query;
    
    let startDate = new Date();
    if (period !== 'all') {
      startDate.setDate(startDate.getDate() - parseInt(period));
    } else {
      startDate = new Date(0);
    }

    // Job completion rate
    const totalOrders = await Order.countDocuments({
      provider: providerId,
      createdAt: { $gte: startDate }
    });

    const completedOrders = await Order.countDocuments({
      provider: providerId,
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    const cancelledOrders = await Order.countDocuments({
      provider: providerId,
      status: 'cancelled',
      createdAt: { $gte: startDate }
    });

    const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;

    // Average rating
    const user = await User.findById(providerId);
    const averageRating = user?.averageRating || 0;
    const totalReviews = user?.totalReviews || 0;

    // Response time (average proposal time)
    const proposals = await Proposal.find({
      provider: providerId,
      createdAt: { $gte: startDate }
    }).populate('job', 'createdAt');

    let totalResponseTime = 0;
    proposals.forEach(proposal => {
      if (proposal.job?.createdAt) {
        const responseTime = proposal.createdAt - proposal.job.createdAt;
        totalResponseTime += responseTime;
      }
    });

    const averageResponseTime = proposals.length > 0 
      ? Math.round(totalResponseTime / proposals.length / (1000 * 60 * 60)) // in hours
      : 0;

    // Earnings per job
    const earningsPerJob = completedOrders > 0 
      ? (user?.totalEarned || 0) / completedOrders
      : 0;

    res.json({
      success: true,
      data: {
        completionRate: parseFloat(completionRate),
        totalOrders,
        completedOrders,
        cancelledOrders,
        averageRating,
        totalReviews,
        averageResponseTime,
        earningsPerJob: Math.round(earningsPerJob),
        profileViews: user?.profileViews || 0
      }
    });
  } catch (error) {
    console.error('Provider performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: error.message
    });
  }
};

// ==================== ADMIN REVENUE ANALYTICS ====================

/**
 * @desc    Get platform revenue reports (Admin)
 * @route   GET /api/admin/revenue-reports
 * @access  Private (Admin only)
 */
export const getRevenueReports = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    let startDate = new Date();
    if (period !== 'all') {
      startDate.setDate(startDate.getDate() - parseInt(period));
    } else {
      startDate = new Date(0);
    }

    // Total revenue (all payments)
    const totalRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Platform commission (assuming 10% commission)
    const COMMISSION_RATE = 0.10;
    const totalAmount = totalRevenue[0]?.total || 0;
    const platformCommission = totalAmount * COMMISSION_RATE;

    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Daily revenue
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          commission: { $sum: { $multiply: ['$amount', COMMISSION_RATE] } },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          commission: { $sum: { $multiply: ['$amount', COMMISSION_RATE] } },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Refunds
    const totalRefunds = await Payment.aggregate([
      {
        $match: {
          status: 'refunded',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Top revenue categories
    const revenueByCategory = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobInfo'
        }
      },
      { $unwind: '$jobInfo' },
      {
        $group: {
          _id: '$jobInfo.category',
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Top earning providers
    const topProviders = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$provider',
          totalEarned: { $sum: '$amount' },
          ordersCompleted: { $sum: 1 }
        }
      },
      { $sort: { totalEarned: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'providerInfo'
        }
      },
      { $unwind: '$providerInfo' },
      {
        $project: {
          _id: 1,
          totalEarned: 1,
          ordersCompleted: 1,
          name: '$providerInfo.fullName',
          email: '$providerInfo.email',
          profilePicture: '$providerInfo.profilePicture',
          providerType: '$providerInfo.providerType'
        }
      }
    ]);

    // Top spending clients
    const topClients = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$client',
          totalSpent: { $sum: '$amount' },
          ordersPlaced: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      { $unwind: '$clientInfo' },
      {
        $project: {
          _id: 1,
          totalSpent: 1,
          ordersPlaced: 1,
          name: '$clientInfo.fullName',
          email: '$clientInfo.email',
          profilePicture: '$clientInfo.profilePicture'
        }
      }
    ]);

    // Calculate growth
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period || 30));
    
    const previousRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: previousPeriodStart, $lt: startDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const previous = previousRevenue[0]?.total || 0;
    const revenueGrowth = previous > 0 ? (((totalAmount - previous) / previous) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalAmount,
          platformCommission,
          totalRefunds: totalRefunds[0]?.total || 0,
          refundCount: totalRefunds[0]?.count || 0,
          netRevenue: totalAmount - (totalRefunds[0]?.total || 0),
          revenueGrowth: parseFloat(revenueGrowth),
          averageTransactionValue: dailyRevenue.length > 0 
            ? totalAmount / dailyRevenue.reduce((sum, d) => sum + d.transactions, 0)
            : 0
        },
        dailyRevenue,
        monthlyRevenue,
        revenueByMethod,
        revenueByCategory,
        topProviders,
        topClients
      }
    });
  } catch (error) {
    console.error('Revenue reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue reports',
      error: error.message
    });
  }
};

/**
 * @desc    Get real-time platform statistics
 * @route   GET /api/analytics/real-time
 * @access  Private (Admin only)
 */
export const getRealTimeStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now);
    thisWeek.setDate(thisWeek.getDate() - 7);

    // Today's stats
    const todayStats = await Promise.all([
      // New users today
      User.countDocuments({ createdAt: { $gte: today } }),
      
      // Jobs posted today
      Job.countDocuments({ createdAt: { $gte: today } }),
      
      // Orders created today
      Order.countDocuments({ createdAt: { $gte: today } }),
      
      // Orders completed today
      Order.countDocuments({ 
        status: 'completed', 
        completedAt: { $gte: today } 
      }),
      
      // Today's revenue
      Payment.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: today }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Active users (logged in within last hour)
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: oneHourAgo }
    });

    // Ongoing orders
    const ongoingOrders = await Order.countDocuments({
      status: { $in: ['in_progress', 'pending'] }
    });

    // Recent activity
    const recentActivity = await Promise.all([
      // Recent users
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName email role createdAt profilePicture'),
      
      // Recent jobs
      Job.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'fullName')
        .select('title category budget createdAt'),
      
      // Recent orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('provider', 'fullName')
        .populate('client', 'fullName')
        .select('status amount createdAt')
    ]);

    // This week's comparison
    const weekStats = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thisWeek } }),
      Job.countDocuments({ createdAt: { $gte: thisWeek } }),
      Order.countDocuments({ createdAt: { $gte: thisWeek } })
    ]);

    res.json({
      success: true,
      data: {
        live: {
          activeUsers,
          ongoingOrders,
          timestamp: now
        },
        today: {
          newUsers: todayStats[0],
          jobsPosted: todayStats[1],
          ordersCreated: todayStats[2],
          ordersCompleted: todayStats[3],
          revenue: todayStats[4][0]?.total || 0
        },
        thisWeek: {
          newUsers: weekStats[0],
          jobsPosted: weekStats[1],
          ordersCreated: weekStats[2]
        },
        recentActivity: {
          users: recentActivity[0],
          jobs: recentActivity[1],
          orders: recentActivity[2]
        }
      }
    });
  } catch (error) {
    console.error('Real-time stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get comprehensive admin analytics
 * @route   GET /api/admin/analytics/comprehensive
 * @access  Private (Admin only)
 */
export const getComprehensiveAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    let startDate = new Date();
    if (period !== 'all') {
      startDate.setDate(startDate.getDate() - parseInt(period));
    } else {
      startDate = new Date(0);
    }

    // User engagement
    const userEngagement = await User.aggregate([
      {
        $group: {
          _id: '$role',
          total: { $sum: 1 },
          verified: {
            $sum: { $cond: [{ $eq: ['$verification.status', 'verified'] }, 1, 0] }
          },
          active: {
            $sum: { $cond: [{ $gte: ['$lastActive', startDate] }, 1, 0] }
          }
        }
      }
    ]);

    // Platform usage trends
    const usageTrends = await Job.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          jobs: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'proposals',
          let: { date: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    '$$date'
                  ]
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'proposalData'
        }
      },
      {
        $project: {
          _id: 1,
          jobs: 1,
          proposals: { $ifNull: [{ $arrayElemAt: ['$proposalData.count', 0] }, 0] }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Conversion rates
    const totalJobs = await Job.countDocuments({ createdAt: { $gte: startDate } });
    const jobsWithProposals = await Job.countDocuments({
      createdAt: { $gte: startDate },
      proposalCount: { $gt: 0 }
    });
    const jobsWithOrders = await Job.countDocuments({
      createdAt: { $gte: startDate },
      'acceptedProposal': { $exists: true }
    });

    const conversionRates = {
      jobToProposal: totalJobs > 0 ? ((jobsWithProposals / totalJobs) * 100).toFixed(1) : 0,
      proposalToOrder: jobsWithProposals > 0 ? ((jobsWithOrders / jobsWithProposals) * 100).toFixed(1) : 0
    };

    res.json({
      success: true,
      data: {
        userEngagement,
        usageTrends,
        conversionRates
      }
    });
  } catch (error) {
    console.error('Comprehensive analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comprehensive analytics',
      error: error.message
    });
  }
};

export default {
  getProviderEarnings,
  getProviderPerformance,
  getRevenueReports,
  getRealTimeStats,
  getComprehensiveAnalytics
};
