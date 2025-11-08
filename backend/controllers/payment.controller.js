import { Payment, Escrow, Refund, Payout } from '../models/Payment.model.js';
import Order from '../models/Order.model.js';
import paymentService from '../services/payment.service.js';
import crypto from 'crypto';

/**
 * Create payment order (Razorpay or Wallet)
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, walletAmount, razorpayAmount } = req.body;

    // Validate inputs
    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if already paid
    if (order.payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order already paid'
      });
    }

    let result;

    switch (paymentMethod) {
      case 'razorpay':
        result = await paymentService.createRazorpayOrder(orderId, amount, req.user._id);
        break;

      case 'wallet':
        result = await paymentService.processWalletPayment(orderId, req.user._id, amount);
        break;

      case 'combined':
        if (!walletAmount || !razorpayAmount) {
          return res.status(400).json({
            success: false,
            message: 'Wallet and Razorpay amounts are required for combined payment'
          });
        }
        result = await paymentService.processCombinedPayment(
          orderId,
          req.user._id,
          walletAmount,
          razorpayAmount
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
    }

    res.json({
      success: true,
      message: paymentMethod === 'wallet' ? 'Payment completed' : 'Payment order created',
      data: result
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * Verify Razorpay payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpay_payment_id, razorpay_signature } = req.body;

    if (!paymentId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const payment = await paymentService.processRazorpayPayment(
      paymentId,
      razorpay_payment_id,
      razorpay_signature
    );

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: payment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * Get payment details
 */
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate('order')
      .populate('user', 'fullName email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment',
      error: error.message
    });
  }
};

/**
 * Get order payment status
 */
export const getOrderPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (
      order.client.toString() !== req.user._id.toString() &&
      order.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const payment = await Payment.findOne({ order: orderId });
    const escrow = await Escrow.findOne({ order: orderId });

    res.json({
      success: true,
      data: {
        orderPaymentStatus: order.payment,
        payment,
        escrow
      }
    });
  } catch (error) {
    console.error('Get order payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

/**
 * Release escrow (for client after work completion)
 */
export const releasePayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only client can release payment
    if (order.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only client can release payment'
      });
    }

    // Check order status
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be completed to release payment'
      });
    }

    const escrow = await Escrow.findOne({ order: orderId });
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    const releasedEscrow = await paymentService.releaseEscrow(escrow._id);

    res.json({
      success: true,
      message: 'Payment released successfully',
      data: releasedEscrow
    });
  } catch (error) {
    console.error('Release payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to release payment',
      error: error.message
    });
  }
};

/**
 * Request refund
 */
export const requestRefund = async (req, res) => {
  try {
    const { orderId, amount, reason, type } = req.body;

    if (!orderId || !amount || !reason || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only client can request refund
    if (order.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only client can request refund'
      });
    }

    const refund = await paymentService.requestRefund(
      orderId,
      req.user._id,
      amount,
      reason,
      type
    );

    res.json({
      success: true,
      message: 'Refund request submitted successfully',
      data: refund
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to request refund',
      error: error.message
    });
  }
};

/**
 * Get user's refund requests
 */
export const getRefunds = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { requestedBy: req.user._id };
    if (status) filter.status = status;

    const refunds = await Refund.find(filter)
      .sort({ createdAt: -1 })
      .populate('order', 'status amount')
      .populate('payment', 'amount paymentMethod');

    res.json({
      success: true,
      data: refunds
    });
  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get refunds',
      error: error.message
    });
  }
};

/**
 * Get escrow details
 */
export const getEscrow = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (
      order.client.toString() !== req.user._id.toString() &&
      order.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const escrow = await Escrow.findOne({ order: orderId })
      .populate('payment')
      .populate('client', 'fullName email')
      .populate('provider', 'fullName email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    res.json({
      success: true,
      data: escrow
    });
  } catch (error) {
    console.error('Get escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get escrow',
      error: error.message
    });
  }
};

/**
 * Razorpay webhook handler
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log('Razorpay webhook event:', event);

    // Handle different events
    switch (event) {
      case 'payment.captured':
        // Payment successful
        console.log('Payment captured:', payload.payment.entity.id);
        break;

      case 'payment.failed':
        // Payment failed
        console.log('Payment failed:', payload.payment.entity.id);
        break;

      case 'refund.processed':
        // Refund processed
        console.log('Refund processed:', payload.refund.entity.id);
        break;

      default:
        console.log('Unhandled event:', event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

export default {
  createPaymentOrder,
  verifyPayment,
  getPayment,
  getOrderPaymentStatus,
  releasePayment,
  requestRefund,
  getRefunds,
  getEscrow,
  handleWebhook
};
