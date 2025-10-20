import api from '../lib/api';
import type { User, ApiResponse } from '../types';

export const userService = {
  // Get user profile (current user)
  getProfile: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: { user: User } }>('/users/profile');
    return response.data.data.user;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get<{ success: boolean; data: { user: User } }>(`/users/${userId}`);
    return response.data.data.user;
  },

  // Update user profile (current user)
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<{ success: boolean; data: { user: User } }>('/users/profile', data);
    return response.data.data.user;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post<ApiResponse<{ url: string }>>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data!.url;
  },

  // Get user statistics (for provider)
  getStatistics: async (userId: string): Promise<any> => {
    const response = await api.get<ApiResponse>(`/users/${userId}/statistics`);
    return response.data.data;
  },

  // Search users
  searchUsers: async (query: string, role?: 'client' | 'provider'): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users/search', {
      params: { q: query, role },
    });
    return response.data.data!;
  },

  // Search providers
  searchProviders: async (params: {
    category?: string;
    city?: string;
    search?: string;
    minRating?: number;
  }): Promise<User[]> => {
    const response = await api.get<{ success: boolean; data: { providers: User[] } }>(
      '/users/search-providers',
      { params }
    );
    return response.data.data.providers;
  },

  // Search clients
  searchClients: async (params: {
    city?: string;
    search?: string;
    budgetRange?: string;
  }): Promise<User[]> => {
    const response = await api.get<{ success: boolean; data: { clients: User[] } }>(
      '/users/search-clients',
      { params }
    );
    return response.data.data.clients;
  },
};
