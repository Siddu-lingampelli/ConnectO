import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment, Escrow, Refund, Payout } from '../models/Payment.model.js';
import { Wallet, Transaction } from '../models/Wallet.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay initialized');
} else {
  console.warn('⚠️  Razorpay keys not found. Payment gateway features will be disabled.');
}

// Platform commission rate (5%)
const PLATFORM_COMMISSION = 0.05;

// ==================== RAZORPAY PAYMENT FUNCTIONS ====================

/**
 * Create Razorpay order for payment
 */
export const createRazorpayOrder = async (orderId, amount, userId) => {
  try {
    if (!razorpay) {
      throw new Error('Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId.toString(),
        userId: userId.toString()
      }
    });

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      user: userId,
      amount,
      currency: 'INR',
      paymentMethod: 'razorpay',
      razorpay: {
        orderId: razorpayOrder.id
      },
      razorpayAmount: amount,
      status: 'pending',
      transactionId: `TXN_${Date.now()}_${orderId}`
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment._id
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const text = `${orderId}|${paymentId}`;
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  return generated_signature === signature;
};

/**
 * Process successful Razorpay payment
 */
export const processRazorpayPayment = async (paymentId, razorpayPaymentId, razorpaySignature) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      payment.razorpay.orderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      payment.status = 'failed';
      payment.failureReason = 'Invalid payment signature';
      await payment.save();
      throw new Error('Payment verification failed');
    }

    // Update payment
    payment.razorpay.paymentId = razorpayPaymentId;
    payment.razorpay.signature = razorpaySignature;
    payment.status = 'completed';
    payment.paidAt = new Date();
    await payment.save();

    // Update order payment status
    const order = await Order.findById(payment.order);
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    await order.save();

    // Create escrow
    await createEscrow(payment);

    return payment;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

// ==================== WALLET PAYMENT FUNCTIONS ====================

/**
 * Process wallet payment
 */
export const processWalletPayment = async (orderId, userId, amount) => {
  try {
    // Get or create wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    // Check balance
    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Deduct from wallet
    wallet.balance -= amount;
    wallet.totalSpent += amount;
    await wallet.save();

    // Create transaction record
    const transaction = await Transaction.create({
      wallet: wallet._id,
      user: userId,
      type: 'debit',
      amount,
      category: 'job_payment',
      description: `Payment for job: ${order.job}`,
      relatedJob: order.job,
      relatedOrder: orderId,
      status: 'completed',
      balanceAfter: wallet.balance
    });

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      user: userId,
      amount,
      currency: 'INR',
      paymentMethod: 'wallet',
      walletAmount: amount,
      status: 'completed',
      paidAt: new Date(),
      transactionId: `TXN_${Date.now()}_${orderId}`
    });

    // Update order
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    await order.save();

    // Create escrow
    await createEscrow(payment);

    return { payment, transaction };
  } catch (error) {
    console.error('Wallet payment error:', error);
    throw error;
  }
};

/**
 * Process combined payment (wallet + Razorpay)
 */
export const processCombinedPayment = async (orderId, userId, walletAmount, razorpayAmount) => {
  try {
    // Get wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    // Check wallet balance
    if (wallet.balance < walletAmount) {
      throw new Error('Insufficient wallet balance');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Create Razorpay order for remaining amount
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(razorpayAmount * 100),
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId.toString(),
        userId: userId.toString(),
        paymentType: 'combined'
      }
    });

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      user: userId,
      amount: walletAmount + razorpayAmount,
      currency: 'INR',
      paymentMethod: 'combined',
      walletAmount,
      razorpayAmount,
      razorpay: {
        orderId: razorpayOrder.id
      },
      status: 'pending',
      transactionId: `TXN_${Date.now()}_${orderId}`
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment._id,
      walletAmount,
      razorpayAmount
    };
  } catch (error) {
    console.error('Combined payment error:', error);
    throw error;
  }
};

// ==================== ESCROW MANAGEMENT ====================

/**
 * Create escrow when payment is received
 */
export const createEscrow = async (payment) => {
  try {
    const order = await Order.findById(payment.order);
    
    // Calculate platform fee and provider amount
    const platformFee = payment.amount * PLATFORM_COMMISSION;
    const providerAmount = payment.amount - platformFee;

    // Calculate auto-release date (3 days after order completion)
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 3);

    const escrow = await Escrow.create({
      payment: payment._id,
      order: order._id,
      client: order.client,
      provider: order.provider,
      amount: payment.amount,
      platformFee,
      providerAmount,
      status: 'held',
      heldAt: new Date(),
      autoRelease: {
        enabled: true,
        daysAfterCompletion: 3,
        scheduledFor: releaseDate
      }
    });

    return escrow;
  } catch (error) {
    console.error('Escrow creation error:', error);
    throw error;
  }
};

/**
 * Release escrow to service provider
 */
export const releaseEscrow = async (escrowId) => {
  try {
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'held') {
      throw new Error('Escrow cannot be released');
    }

    // Get or create provider wallet
    let wallet = await Wallet.findOne({ user: escrow.provider });
    if (!wallet) {
      wallet = await Wallet.create({ user: escrow.provider });
    }

    // Credit provider wallet
    wallet.balance += escrow.providerAmount;
    wallet.totalEarned += escrow.providerAmount;
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      wallet: wallet._id,
      user: escrow.provider,
      type: 'credit',
      amount: escrow.providerAmount,
      category: 'job_earning',
      description: `Payment received for completed job`,
      relatedOrder: escrow.order,
      status: 'completed',
      balanceAfter: wallet.balance
    });

    // Update escrow
    escrow.status = 'released';
    escrow.releasedAt = new Date();
    await escrow.save();

    // Update order
    const order = await Order.findById(escrow.order);
    order.payment.status = 'released';
    order.payment.releasedAt = new Date();
    await order.save();

    return escrow;
  } catch (error) {
    console.error('Escrow release error:', error);
    throw error;
  }
};

/**
 * Auto-release escrows that are scheduled
 */
export const processAutoRelease = async () => {
  try {
    const now = new Date();
    
    // Find escrows scheduled for auto-release
    const escrows = await Escrow.find({
      status: 'held',
      'autoRelease.enabled': true,
      'autoRelease.scheduledFor': { $lte: now }
    });

    console.log(`Processing ${escrows.length} escrows for auto-release`);

    for (const escrow of escrows) {
      try {
        await releaseEscrow(escrow._id);
        console.log(`Auto-released escrow: ${escrow._id}`);
      } catch (error) {
        console.error(`Failed to auto-release escrow ${escrow._id}:`, error);
      }
    }

    return escrows.length;
  } catch (error) {
    console.error('Auto-release processing error:', error);
    throw error;
  }
};

// ==================== REFUND MANAGEMENT ====================

/**
 * Request a refund
 */
export const requestRefund = async (orderId, userId, amount, reason, type = 'full') => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const payment = await Payment.findOne({ order: orderId, status: 'completed' });
    if (!payment) {
      throw new Error('Payment not found');
    }

    const escrow = await Escrow.findOne({ order: orderId });

    const refund = await Refund.create({
      payment: payment._id,
      escrow: escrow?._id,
      order: orderId,
      requestedBy: userId,
      refundTo: order.client,
      amount,
      reason,
      type,
      status: 'pending'
    });

    return refund;
  } catch (error) {
    console.error('Refund request error:', error);
    throw error;
  }
};

/**
 * Process approved refund
 */
export const processRefund = async (refundId) => {
  try {
    const refund = await Refund.findById(refundId);
    if (!refund) {
      throw new Error('Refund not found');
    }

    if (refund.status !== 'approved') {
      throw new Error('Refund not approved');
    }

    refund.status = 'processing';
    await refund.save();

    const payment = await Payment.findById(refund.payment);
    
    // Process refund based on payment method
    if (payment.paymentMethod === 'razorpay' || payment.razorpayAmount > 0) {
      // Razorpay refund
      const razorpayRefund = await razorpay.payments.refund(payment.razorpay.paymentId, {
        amount: Math.round(refund.amount * 100),
        notes: {
          refundId: refund._id.toString(),
          orderId: refund.order.toString()
        }
      });

      refund.razorpayRefundId = razorpayRefund.id;
    }

    if (payment.paymentMethod === 'wallet' || payment.walletAmount > 0) {
      // Wallet refund
      let wallet = await Wallet.findOne({ user: refund.refundTo });
      if (!wallet) {
        wallet = await Wallet.create({ user: refund.refundTo });
      }

      const refundAmount = payment.walletAmount || refund.amount;
      wallet.balance += refundAmount;
      await wallet.save();

      const transaction = await Transaction.create({
        wallet: wallet._id,
        user: refund.refundTo,
        type: 'credit',
        amount: refundAmount,
        category: 'refund',
        description: `Refund for order: ${refund.order}`,
        relatedOrder: refund.order,
        status: 'completed',
        balanceAfter: wallet.balance
      });

      refund.walletTransactionId = transaction._id;
    }

    // Update refund status
    refund.status = 'completed';
    refund.completedAt = new Date();
    await refund.save();

    // Update payment
    if (refund.type === 'full') {
      payment.status = 'refunded';
    } else {
      payment.status = 'partially_refunded';
    }
    await payment.save();

    // Update escrow if exists
    if (refund.escrow) {
      const escrow = await Escrow.findById(refund.escrow);
      if (escrow) {
        escrow.status = 'refunded';
        escrow.refundedAt = new Date();
        await escrow.save();
      }
    }

    // Update order
    const order = await Order.findById(refund.order);
    order.payment.status = 'refunded';
    order.status = 'cancelled';
    await order.save();

    return refund;
  } catch (error) {
    console.error('Refund processing error:', error);
    
    // Update refund status to failed
    const refund = await Refund.findById(refundId);
    if (refund) {
      refund.status = 'failed';
      await refund.save();
    }
    
    throw error;
  }
};

// ==================== WALLET OPERATIONS ====================

/**
 * Add money to wallet via Razorpay
 */
export const addMoneyToWallet = async (userId, amount) => {
  try {
    if (!razorpay) {
      throw new Error('Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `wallet_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        purpose: 'wallet_topup'
      }
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    };
  } catch (error) {
    console.error('Add money to wallet error:', error);
    throw error;
  }
};

/**
 * Complete wallet top-up after Razorpay payment
 */
export const completeWalletTopup = async (userId, amount, razorpayPaymentId, razorpaySignature, razorpayOrderId) => {
  try {
    // Verify signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      throw new Error('Payment verification failed');
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    // Add money
    wallet.balance += amount;
    await wallet.save();

    // Create transaction
    const transaction = await Transaction.create({
      wallet: wallet._id,
      user: userId,
      type: 'credit',
      amount,
      category: 'deposit',
      description: 'Wallet top-up via Razorpay',
      status: 'completed',
      balanceAfter: wallet.balance
    });

    return { wallet, transaction };
  } catch (error) {
    console.error('Wallet topup completion error:', error);
    throw error;
  }
};

/**
 * Withdraw money from wallet
 */
export const withdrawFromWallet = async (userId, amount, method, details) => {
  try {
    // Get wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check balance
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Minimum withdrawal amount
    if (amount < 100) {
      throw new Error('Minimum withdrawal amount is ₹100');
    }

    // Deduct from wallet
    wallet.balance -= amount;
    await wallet.save();

    // Create transaction
    const transaction = await Transaction.create({
      wallet: wallet._id,
      user: userId,
      type: 'debit',
      amount,
      category: 'withdrawal',
      description: `Withdrawal via ${method}`,
      status: 'pending',
      balanceAfter: wallet.balance
    });

    // Create payout request
    const payout = await Payout.create({
      provider: userId,
      amount,
      method,
      status: 'pending',
      bankDetails: method === 'bank_transfer' ? details.bankDetails : undefined,
      upiId: method === 'upi' ? details.upiId : undefined,
      walletTransactionId: transaction._id
    });

    return { transaction, payout };
  } catch (error) {
    console.error('Withdrawal error:', error);
    throw error;
  }
};

export default {
  createRazorpayOrder,
  verifyRazorpaySignature,
  processRazorpayPayment,
  processWalletPayment,
  processCombinedPayment,
  createEscrow,
  releaseEscrow,
  processAutoRelease,
  requestRefund,
  processRefund,
  addMoneyToWallet,
  completeWalletTopup,
  withdrawFromWallet
};
