import api from '../lib/api';

export interface VerificationStatus {
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  documents?: {
    panCardUrl?: string;
    aadharCardUrl?: string;
  };
}

export interface VerificationResponse {
  verification: VerificationStatus;
  userInfo: {
    fullName: string;
    email: string;
    role: string;
  };
}

export const verificationService = {
  // Submit verification documents
  submitVerification: async (panCardUrl: string, aadharCardUrl: string): Promise<any> => {
    const response = await api.post<{ success: boolean; message: string; data: { user: any } }>(
      '/verification/submit',
      { panCardUrl, aadharCardUrl }
    );
    return response.data;
  },

  // Get verification status
  getVerificationStatus: async (): Promise<VerificationResponse> => {
    const response = await api.get<{ success: boolean; data: VerificationResponse }>(
      '/verification/status'
    );
    return response.data.data;
  },

  // Get pending verifications (Admin only)
  getPendingVerifications: async (): Promise<any[]> => {
    const response = await api.get<{ success: boolean; data: { users: any[] } }>(
      '/verification/pending'
    );
    return response.data.data.users;
  },

  // Approve verification (Admin only)
  approveVerification: async (userId: string): Promise<any> => {
    const response = await api.put(`/verification/approve/${userId}`);
    return response.data;
  },

  // Reject verification (Admin only)
  rejectVerification: async (userId: string, reason: string): Promise<any> => {
    const response = await api.put(`/verification/reject/${userId}`, { reason });
    return response.data;
  },
};
