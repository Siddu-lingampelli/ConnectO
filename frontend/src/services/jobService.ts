import api from '../lib/api';
import type { Job, JobFilter, PaginatedResponse, ApiResponse } from '../types';

export const jobService = {
  // Get all jobs with filters
  getJobs: async (filters?: JobFilter, page = 1, limit = 20): Promise<PaginatedResponse<Job>> => {
    const response = await api.get<PaginatedResponse<Job>>('/jobs', {
      params: { ...filters, page, limit },
    });
    // The backend returns the whole response, axios wraps it in .data
    // So response.data is already the PaginatedResponse
    return response.data;
  },

  // Get single job
  getJob: async (jobId: string): Promise<Job> => {
    const response = await api.get<ApiResponse<Job>>(`/jobs/${jobId}`);
    return response.data.data!;
  },

  // Create new job (client only)
  createJob: async (data: Partial<Job>): Promise<Job> => {
    const response = await api.post<ApiResponse<Job>>('/jobs', data);
    return response.data.data!;
  },

  // Update job
  updateJob: async (jobId: string, data: Partial<Job>): Promise<Job> => {
    const response = await api.put<ApiResponse<Job>>(`/jobs/${jobId}`, data);
    return response.data.data!;
  },

  // Delete job
  deleteJob: async (jobId: string): Promise<void> => {
    await api.delete(`/jobs/${jobId}`);
  },

  // Get my jobs (client)
  getMyJobs: async (): Promise<Job[]> => {
    const response = await api.get<ApiResponse<Job[]>>('/jobs/my-jobs');
    return response.data.data!;
  },

  // Get job categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/jobs/categories');
    return response.data.data!;
  },
};
