import api from '../lib/api';

export const followService = {
  // Follow a user
  followUser: async (userId: string) => {
    const response = await api.post(`/follow/${userId}`);
    return response.data;
  },

  // Unfollow a user
  unfollowUser: async (userId: string) => {
    const response = await api.delete(`/follow/${userId}`);
    return response.data;
  },

  // Get followers list
  getFollowers: async (userId: string, page: number = 1, limit: number = 20) => {
    const response = await api.get(`/follow/${userId}/followers`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Get following list
  getFollowing: async (userId: string, page: number = 1, limit: number = 20) => {
    const response = await api.get(`/follow/${userId}/following`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Check if current user follows another user
  checkFollowStatus: async (userId: string) => {
    const response = await api.get(`/follow/${userId}/status`);
    return response.data;
  },

  // Get follow statistics
  getFollowStats: async (userId: string) => {
    const response = await api.get(`/follow/${userId}/stats`);
    return response.data;
  },

  // Get mutual follows
  getMutualFollows: async (userId: string) => {
    const response = await api.get(`/follow/${userId}/mutual`);
    return response.data;
  }
};
