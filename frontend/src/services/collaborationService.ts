import api from '../lib/api';

export interface Collaborator {
  _id: string;
  providerId: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
    providerType?: string;
  };
  role: string;
  sharePercent: number;
  status: 'invited' | 'accepted' | 'declined';
  invitedAt: string;
  respondedAt?: string;
}

export interface PaymentSplit {
  _id?: string;
  providerId: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  } | string;
  sharePercent: number;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
}

export interface InviteCollaboratorData {
  providerId: string;
  role?: string;
  sharePercent: number;
}

export interface InviteCollaboratorByEmailData {
  providerEmail: string;
  role?: string;
  sharePercent: number;
}

export interface UpdatePaymentSplitsData {
  splits: {
    providerId: string;
    sharePercent: number;
  }[];
}

class CollaborationService {
  /**
   * Invite a collaborator to a project
   */
  async inviteCollaborator(jobId: string, data: InviteCollaboratorData) {
    try {
      const response = await api.post(`/collaboration/projects/${jobId}/inviteCollaborator`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to invite collaborator');
    }
  }

  /**
   * Invite a collaborator by email
   */
  async inviteCollaboratorByEmail(jobId: string, data: InviteCollaboratorByEmailData) {
    try {
      const response = await api.post(`/collaboration/projects/${jobId}/inviteCollaboratorByEmail`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to invite collaborator');
    }
  }

  /**
   * Respond to a collaboration invitation
   */
  async respondToInvitation(jobId: string, collaboratorId: string, response: 'accepted' | 'declined') {
    try {
      const result = await api.patch(
        `/collaboration/projects/${jobId}/collaborator/${collaboratorId}/respond`,
        { response }
      );
      return result.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to respond to invitation');
    }
  }

  /**
   * Update payment splits for a project
   */
  async updatePaymentSplits(jobId: string, data: UpdatePaymentSplitsData) {
    try {
      const response = await api.patch(`/collaboration/projects/${jobId}/paymentSplits`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update payment splits');
    }
  }

  /**
   * Get all collaborators for a project
   */
  async getCollaborators(jobId: string) {
    try {
      const response = await api.get(`/collaboration/projects/${jobId}/collaborators`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch collaborators');
    }
  }

  /**
   * Remove a collaborator from a project
   */
  async removeCollaborator(jobId: string, collaboratorId: string) {
    try {
      const response = await api.delete(`/collaboration/projects/${jobId}/collaborator/${collaboratorId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove collaborator');
    }
  }

  /**
   * Get my pending collaboration invitations
   */
  async getMyInvitations() {
    try {
      const response = await api.get('/collaboration/my-invitations');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch invitations');
    }
  }
}

export default new CollaborationService();
