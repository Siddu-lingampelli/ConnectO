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
 * Get wallet balance and info
 */
export const getWallet = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/wallet`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get wallet statistics
 */
export const getWalletStats = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/wallet/stats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get wallet transactions
 */
export const getTransactions = async (params?: {
  page?: number;
  limit?: number;
  type?: 'credit' | 'debit';
  category?: string;
  status?: string;
}) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/wallet/transactions`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (id: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/wallet/transactions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Add money to wallet via Razorpay
 */
export const addMoneyToWallet = async (
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
    const token = localStorage.getItem('token');
    const orderResponse = await axios.post(
      `${API_URL}/wallet/add-money/create`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const orderData = orderResponse.data.data;

    return new Promise((resolve, reject) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ConnectO',
        description: 'Add Money to Wallet',
        order_id: orderData.razorpayOrderId,
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
            const verifyResponse = await axios.post(
              `${API_URL}/wallet/add-money/verify`,
              {
                amount,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_order_id: response.razorpay_order_id
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
 * Request withdrawal from wallet
 */
export const requestWithdrawal = async (
  amount: number,
  method: 'bank_transfer' | 'upi',
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  },
  upiId?: string
) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/wallet/withdraw`,
    {
      amount,
      method,
      bankDetails,
      upiId
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export default {
  getWallet,
  getWalletStats,
  getTransactions,
  getTransactionById,
  addMoneyToWallet,
  requestWithdrawal
};
