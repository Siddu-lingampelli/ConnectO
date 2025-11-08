import api from '../lib/api';
import type { ApiResponse } from '../types';

export interface DemoProject {
  _id: string;
  freelancer: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    city?: string;
    profilePicture?: string;
  };
  freelancerType: 'Technical' | 'Non-Technical';
  demoTitle: string;
  description: string;
  submissionLink?: string;
  submissionFile?: string;
  score?: number;
  status: 'Pending' | 'Under Review' | 'Verified' | 'Rejected';
  adminComments?: string;
  dateAssigned: string;
  dateSubmitted?: string;
  dateReviewed?: string;
  admin?: {
    _id: string;
    fullName: string;
    email: string;
  };
  activityLog: Array<{
    action: string;
    date: string;
    by: string;
    details: string;
  }>;
}

export interface DemoStats {
  total: number;
  byStatus: {
    pending: number;
    underReview: number;
    verified: number;
    rejected: number;
  };
  byType: {
    technical: number;
    nonTechnical: number;
  };
  averageScore: number;
}

export interface PaginatedDemos {
  data: DemoProject[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export const demoService = {
  // Request demo project assignment
  requestDemo: async (): Promise<{ message: string; demoStatus: string }> => {
    const response = await api.post<ApiResponse<{ message: string; demoStatus: string }>>('/demo/request');
    return response.data.data!;
  },

  // Get current user's demo project
  getMyDemo: async (): Promise<DemoProject> => {
    const response = await api.get<ApiResponse<DemoProject>>('/demo/my-demo');
    return response.data.data!;
  },

  // Submit demo project
  submitDemo: async (data: { submissionLink?: string; submissionFile?: string }): Promise<DemoProject> => {
    const response = await api.post<ApiResponse<DemoProject>>('/demo/submit', data);
    return response.data.data!;
  },

  // Get all demos (Admin)
  getAllDemos: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedDemos> => {
    const response = await api.get<ApiResponse<PaginatedDemos>>('/demo/all', { params });
    return response.data.data!;
  },

  // Get demo statistics (Admin)
  getDemoStats: async (): Promise<DemoStats> => {
    const response = await api.get<ApiResponse<DemoStats>>('/demo/stats');
    return response.data.data!;
  },

  // Get pending demo requests (Admin)
  getPendingDemoRequests: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/demo/pending-requests');
    return response.data.data!;
  },

  // Assign demo project (Admin)
  assignDemo: async (data: {
    freelancerId?: string;
    freelancerEmail?: string;
    freelancerType: 'Technical' | 'Non-Technical';
    demoTitle: string;
    description: string;
  }): Promise<DemoProject> => {
    const response = await api.post<ApiResponse<DemoProject>>('/demo/assign', data);
    return response.data.data!;
  },

  // Review demo project (Admin)
  reviewDemo: async (demoId: string, data: {
    score: number;
    adminComments?: string;
  }): Promise<DemoProject> => {
    const response = await api.put<ApiResponse<DemoProject>>(`/demo/review/${demoId}`, data);
    return response.data.data!;
  },

  // Update demo status (Admin)
  updateDemoStatus: async (demoId: string, data: {
    status: string;
    adminComments?: string;
  }): Promise<DemoProject> => {
    const response = await api.put<ApiResponse<DemoProject>>(`/demo/status/${demoId}`, data);
    return response.data.data!;
  },

  // Delete demo project (Admin)
  deleteDemo: async (demoId: string): Promise<void> => {
    await api.delete(`/demo/${demoId}`);
  },
};
