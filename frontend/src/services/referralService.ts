import api from '../lib/api';

const referralService = {
  // Generate referral code for user
  generateReferralCode: async (userId: string) => {
    const response = await api.post(`/referral/generate/${userId}`);
    return response.data;
  },

  // Validate referral code
  validateReferralCode: async (referralCode: string) => {
    const response = await api.get(`/referral/validate/${referralCode}`);
    return response.data;
  },

  // Get referral stats
  getReferralStats: async (userId: string) => {
    const response = await api.get(`/referral/stats/${userId}`);
    return response.data;
  },

  // Get referral leaderboard
  getReferralLeaderboard: async (limit: number = 10) => {
    const response = await api.get(`/referral/leaderboard?limit=${limit}`);
    return response.data;
  },

  // Redeem referral credits
  redeemCredits: async (userId: string, amount: number) => {
    const response = await api.post(`/referral/redeem/${userId}`, { amount });
    return response.data;
  },
};

export default referralService;
