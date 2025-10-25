import api from '../lib/api';

/**
 * Role Switch Service
 * Handles all role switching operations between client and provider modes
 */

export interface RoleStatus {
  activeRole: 'client' | 'provider' | 'admin';
  enabledRoles: ('client' | 'provider')[];
  role: string;
  providerType?: string;
  canSwitchToProvider: boolean;
  canSwitchToClient: boolean;
  isVerified: boolean;
  demoStatus?: string;
}

export interface EnableRoleData {
  role: 'client' | 'provider';
  providerType?: 'Technical' | 'Non-Technical';
}

class RoleSwitchService {
  /**
   * Switch active role between client and provider
   */
  async switchRole(targetRole: 'client' | 'provider') {
    try {
      const response = await api.patch('/role/switch', { targetRole });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to switch role');
    }
  }

  /**
   * Enable a new role for the user
   */
  async enableRole(data: EnableRoleData) {
    try {
      const response = await api.post('/role/enable', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to enable role');
    }
  }

  /**
   * Get current role status and capabilities
   */
  async getRoleStatus(): Promise<{ success: boolean; data: RoleStatus }> {
    try {
      const response = await api.get('/role/status');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get role status');
    }
  }

  /**
   * Disable a role (cannot disable active role)
   */
  async disableRole(role: 'client' | 'provider') {
    try {
      const response = await api.delete(`/role/disable/${role}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to disable role');
    }
  }
}

export default new RoleSwitchService();
