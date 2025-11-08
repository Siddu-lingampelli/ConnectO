import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Create payment order
 */
export const createPaymentOrder = async (orderId: string, amount: number, paymentMethod: 'razorpay' | 'wallet' | 'combined', walletAmount?: number, razorpayAmount?: number) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/payment/create-order`,
    {
      orderId,
      amount,
      paymentMethod,
      walletAmount,
      razorpayAmount
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

/**
 * Process Razorpay payment
 */
export const processRazorpayPayment = async (
  orderId: string,
  amount: number,
  userEmail: string,
  userName: string,
  userPhone: string
): Promise<any> => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Create order
    const orderData = await createPaymentOrder(orderId, amount, 'razorpay');

    return new Promise((resolve, reject) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: 'INR',
        name: 'ConnectO',
        description: 'Job Payment',
        order_id: orderData.data.razorpayOrderId,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone
        },
        theme: {
          color: '#0F870F'
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const token = localStorage.getItem('token');
            const verifyResponse = await axios.post(
              `${API_URL}/payment/verify`,
              {
                paymentId: orderData.data.paymentId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            resolve(verifyResponse.data);
          } catch (error: any) {
            reject(error.response?.data || error);
          }
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Process wallet payment
 */
export const processWalletPayment = async (orderId: string, amount: number) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/payment/create-order`,
    {
      orderId,
      amount,
      paymentMethod: 'wallet'
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

/**
 * Process combined payment (wallet + Razorpay)
 */
export const processCombinedPayment = async (
  orderId: string,
  totalAmount: number,
  walletAmount: number,
  razorpayAmount: number,
  userEmail: string,
  userName: string,
  userPhone: string
): Promise<any> => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Create combined order
    const orderData = await createPaymentOrder(orderId, totalAmount, 'combined', walletAmount, razorpayAmount);

    return new Promise((resolve, reject) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: 'INR',
        name: 'ConnectO',
        description: 'Job Payment (Wallet + Card)',
        order_id: orderData.data.razorpayOrderId,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone
        },
        theme: {
          color: '#0F870F'
        },
        handler: async function (response: any) {
          try {
            const token = localStorage.getItem('token');
            const verifyResponse = await axios.post(
              `${API_URL}/payment/verify`,
              {
                paymentId: orderData.data.paymentId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            resolve(verifyResponse.data);
          } catch (error: any) {
            reject(error.response?.data || error);
          }
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (orderId: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/payment/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get escrow details
 */
export const getEscrow = async (orderId: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/payment/escrow/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Release payment to provider
 */
export const releasePayment = async (orderId: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/payment/release/${orderId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

/**
 * Request refund
 */
export const requestRefund = async (
  orderId: string,
  amount: number,
  reason: string,
  type: 'full' | 'partial'
) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/payment/refund/request`,
    {
      orderId,
      amount,
      reason,
      type
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

/**
 * Get user's refunds
 */
export const getRefunds = async (status?: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/payment/refunds`, {
    params: { status },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export default {
  processRazorpayPayment,
  processWalletPayment,
  processCombinedPayment,
  getPaymentStatus,
  getEscrow,
  releasePayment,
  requestRefund,
  getRefunds
};
