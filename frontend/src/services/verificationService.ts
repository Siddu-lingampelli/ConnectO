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

  // ==================== ADVANCED VERIFICATION ====================

  // ID Verification
  submitIdVerification: async (data: {
    idType: 'aadhaar' | 'pan' | 'passport' | 'driving_license' | 'voter_id';
    idNumber: string;
    idDocumentUrl: string;
    selfieUrl: string;
  }) => {
    const response = await api.post('/verification/id', data);
    return response.data;
  },

  // Skill Certifications
  addCertification: async (data: {
    skill: string;
    certificationName: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    certificateUrl?: string;
  }) => {
    const response = await api.post('/verification/certifications', data);
    return response.data;
  },

  deleteCertification: async (certId: string) => {
    const response = await api.delete(`/verification/certifications/${certId}`);
    return response.data;
  },

  // Verification Overview
  getVerificationOverview: async () => {
    const response = await api.get('/verification/overview');
    return response.data;
  },

  // Admin: Review ID Verification
  reviewIdVerification: async (userId: string, status: 'verified' | 'rejected', rejectionReason?: string) => {
    const response = await api.put(`/verification/id/${userId}/review`, {
      status,
      rejectionReason
    });
    return response.data;
  },

  // Admin: Get Pending ID Verifications
  getPendingIdVerifications: async () => {
    const response = await api.get('/verification/id/pending');
    return response.data;
  },

  // Admin: Request Background Check
  requestBackgroundCheck: async (userId: string, provider?: string, notes?: string) => {
    const response = await api.post(`/verification/background-check/${userId}`, {
      provider,
      notes
    });
    return response.data;
  },

  // Admin: Update Background Check
  updateBackgroundCheck: async (userId: string, data: {
    status?: string;
    checks?: any;
    reportUrl?: string;
    notes?: string;
  }) => {
    const response = await api.put(`/verification/background-check/${userId}`, data);
    return response.data;
  },

  // Admin: Verify Skill Certification
  verifyCertification: async (userId: string, certId: string, verificationStatus: 'verified' | 'invalid' | 'expired') => {
    const response = await api.put(`/verification/certifications/${userId}/${certId}/verify`, {
      verificationStatus
    });
    return response.data;
  },

  // Admin: Get All Verifications
  getAllVerifications: async (filter?: string) => {
    const response = await api.get('/verification/all', {
      params: { filter }
    });
    return response.data;
  }
};
