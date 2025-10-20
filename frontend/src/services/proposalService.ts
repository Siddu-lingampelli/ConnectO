import api from '../lib/api';
import type { Proposal, PaginatedResponse, ApiResponse } from '../types';

interface CreateProposalData {
  jobId: string;
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration: string;
  attachments?: string[];
}

export const proposalService = {
  // Create new proposal (Provider only)
  createProposal: async (data: CreateProposalData): Promise<Proposal> => {
    const response = await api.post<ApiResponse<Proposal>>('/proposals', data);
    return response.data.data!;
  },

  // Get my proposals (Provider)
  getMyProposals: async (status?: string, page = 1, limit = 20): Promise<PaginatedResponse<Proposal>> => {
    const response = await api.get<PaginatedResponse<Proposal>>('/proposals/my-proposals', {
      params: { status, page, limit },
    });
    return response.data;
  },

  // Get proposals for a job (Client - job owner)
  getJobProposals: async (jobId: string, status?: string): Promise<Proposal[]> => {
    const response = await api.get<ApiResponse<Proposal[]>>(`/proposals/job/${jobId}`, {
      params: { status },
    });
    return response.data.data!;
  },

  // Get single proposal
  getProposal: async (proposalId: string): Promise<Proposal> => {
    const response = await api.get<ApiResponse<Proposal>>(`/proposals/${proposalId}`);
    return response.data.data!;
  },

  // Update proposal (Provider only - own proposals)
  updateProposal: async (proposalId: string, data: Partial<CreateProposalData>): Promise<Proposal> => {
    const response = await api.put<ApiResponse<Proposal>>(`/proposals/${proposalId}`, data);
    return response.data.data!;
  },

  // Withdraw proposal (Provider only)
  withdrawProposal: async (proposalId: string): Promise<void> => {
    await api.delete(`/proposals/${proposalId}`);
  },

  // Accept/Reject proposal (Client only - job owner)
  updateProposalStatus: async (proposalId: string, status: 'accepted' | 'rejected'): Promise<Proposal> => {
    const response = await api.put<ApiResponse<Proposal>>(`/proposals/${proposalId}/status`, { status });
    return response.data.data!;
  },
};
