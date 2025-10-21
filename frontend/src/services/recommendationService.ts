import api from '../lib/api';

export const recommendationService = {
  // Get recommended providers for a specific job
  getRecommendedProviders: async (jobId: string) => {
    try {
      const response = await api.get(`/recommend/providers/${jobId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get recommended jobs for a specific provider
  getRecommendedJobs: async (providerId: string) => {
    try {
      const response = await api.get(`/recommend/jobs/${providerId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get personalized recommendations for current user
  getPersonalizedRecommendations: async () => {
    try {
      const response = await api.get('/recommend/for-me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
};
