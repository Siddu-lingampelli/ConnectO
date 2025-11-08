import { Wallet, Transaction } from '../models/Wallet.model.js';
import paymentService from '../services/payment.service.js';

/**
 * Get user wallet
 */
export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id });
    }

    res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet',
      error: error.message
    });
  }
};

/**
 * Get wallet transactions with pagination and filtering
 */
export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, status } = req.query;
    
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.json({
        success: true,
        data: {
          transactions: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: 0
          }
        }
      });
    }

    // Build filter
    const filter = { wallet: wallet._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    // Get transactions with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedJob', 'title')
      .populate('relatedOrder', 'status');

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error.message
    });
  }
};

/**
 * Get wallet statistics
 */
export const getWalletStats = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      return res.json({
        success: true,
        data: {
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          pendingAmount: 0,
          recentTransactions: []
        }
      });
    }

    // Get recent transactions
    const recentTransactions = await Transaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('relatedJob', 'title')
      .populate('relatedOrder', 'status');

    // Get monthly stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          wallet: wallet._id,
          type: 'credit',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthlySpending = await Transaction.aggregate([
      {
        $match: {
          wallet: wallet._id,
          type: 'debit',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalSpent: wallet.totalSpent,
        pendingAmount: wallet.pendingAmount,
        monthlyEarnings: monthlyEarnings[0]?.total || 0,
        monthlySpending: monthlySpending[0]?.total || 0,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet statistics',
      error: error.message
    });
  }
};

/**
 * Create Razorpay order for adding money
 */
export const createAddMoneyOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount is ₹100'
      });
    }

    if (amount > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum amount is ₹1,00,000'
      });
    }

    const orderData = await paymentService.addMoneyToWallet(req.user._id, amount);

    res.json({
      success: true,
      data: orderData
    });
  } catch (error) {
    console.error('Create add money order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

/**
 * Verify and complete wallet top-up
 */
export const verifyAddMoney = async (req, res) => {
  try {
    const { amount, razorpay_payment_id, razorpay_signature, razorpay_order_id } = req.body;

    if (!amount || !razorpay_payment_id || !razorpay_signature || !razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const result = await paymentService.completeWalletTopup(
      req.user._id,
      amount,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_order_id
    );

    res.json({
      success: true,
      message: 'Money added successfully',
      data: {
        wallet: result.wallet,
        transaction: result.transaction
      }
    });
  } catch (error) {
    console.error('Verify add money error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
      error: error.message
    });
  }
};

/**
 * Request withdrawal
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, bankDetails, upiId } = req.body;

    // Validate inputs
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹100'
      });
    }

    if (!method || !['bank_transfer', 'upi'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal method'
      });
    }

    if (method === 'bank_transfer' && !bankDetails) {
      return res.status(400).json({
        success: false,
        message: 'Bank details are required'
      });
    }

    if (method === 'upi' && !upiId) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required'
      });
    }

    const result = await paymentService.withdrawFromWallet(
      req.user._id,
      amount,
      method,
      { bankDetails, upiId }
    );

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        transaction: result.transaction,
        payout: result.payout
      }
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process withdrawal',
      error: error.message
    });
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id)
      .populate('relatedJob', 'title')
      .populate('relatedOrder', 'status amount');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if transaction belongs to user
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction',
      error: error.message
    });
  }
};

export default {
  getWallet,
  getTransactions,
  getWalletStats,
  createAddMoneyOrder,
  verifyAddMoney,
  requestWithdrawal,
  getTransactionById
};
