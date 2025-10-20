import api from '../lib/api';
import type { ApiResponse, PaginatedResponse, User, Job } from '../types';

export interface DashboardStats {
  users: {
    total: number;
    clients: number;
    providers: number;
    recent: number;
    growthRate: string;
  };
  jobs: {
    total: number;
    open: number;
    recent: number;
    growthRate: string;
  };
  proposals: {
    total: number;
  };
  verifications: {
    pending: number;
    verified: number;
  };
}

export interface AnalyticsData {
  userRegistrations: Array<{ _id: string; count: number }>;
  jobsPosted: Array<{ _id: string; count: number }>;
  jobsByCategory: Array<{ _id: string; count: number }>;
  topCities: Array<{ _id: string; count: number }>;
}

export const adminService = {
  // Dashboard & Analytics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return response.data.data!;
  },

  getAnalytics: async (period = '30'): Promise<AnalyticsData> => {
    const response = await api.get<ApiResponse<AnalyticsData>>('/admin/analytics', {
      params: { period }
    });
    return response.data.data!;
  },

  // User Management
  getAllUsers: async (params?: any): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/admin/users', { params });
    return response.data;
  },

  getUserDetails: async (userId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/admin/users/${userId}`);
    return response.data.data!;
  },

  updateUserStatus: async (userId: string, isActive: boolean, reason?: string): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}/status`, {
      isActive,
      reason
    });
    return response.data.data!;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Verification Management
  getPendingVerifications: async (params?: any): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/admin/verifications/pending', {
      params
    });
    return response.data;
  },

  updateVerificationStatus: async (
    userId: string,
    status: 'verified' | 'rejected',
    reason?: string
  ): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/admin/verifications/${userId}`, {
      status,
      reason
    });
    return response.data.data!;
  },

  // Job Management
  getAllJobs: async (params?: any): Promise<PaginatedResponse<Job>> => {
    const response = await api.get<PaginatedResponse<Job>>('/admin/jobs', { params });
    return response.data;
  },

  updateJobStatus: async (jobId: string, status: string, reason?: string): Promise<Job> => {
    const response = await api.put<ApiResponse<Job>>(`/admin/jobs/${jobId}/status`, {
      status,
      reason
    });
    return response.data.data!;
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await api.delete(`/admin/jobs/${jobId}`);
  },

  // Proposal Management
  getAllProposals: async (params?: any): Promise<PaginatedResponse<any>> => {
    const response = await api.get<PaginatedResponse<any>>('/admin/proposals', { params });
    return response.data;
  }
};
