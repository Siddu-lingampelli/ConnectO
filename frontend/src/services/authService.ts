import api from '../lib/api';
import { localAuthService } from './localAuthService';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    if ('code' in e && (e.code === 'ERR_NETWORK' || e.code === 'ECONNREFUSED')) return true;
    if ('message' in e && typeof e.message === 'string' &&
      (e.message.includes('Network Error') || e.message.includes('connect') || e.message.includes('ECONNREFUSED'))) return true;
  }
  return false;
}

export const authService = {
  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data);
      return response.data.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.info('[authService] Backend unreachable, using localStorage fallback');
        return localAuthService.register(data);
      }
      throw error;
    }
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', data);
      return response.data.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.info('[authService] Backend unreachable, using localStorage fallback');
        return localAuthService.login(data);
      }
      throw error;
    }
  },

  // Get current user
  getMe: async (): Promise<User> => {
    try {
      const response = await api.get<{ success: boolean; data: User }>('/auth/me');
      return response.data.data;
    } catch (error) {
      if (isNetworkError(error) && localAuthService.isLocalSession()) {
        const user = localAuthService.getMe();
        if (user) return user;
      }
      throw error;
    }
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
    } catch (error) {
      if (isNetworkError(error) && localAuthService.isLocalSession()) {
        console.info('[authService] Backend unreachable, password update unavailable in local mode');
        throw new Error('Password update is only available when connected to the server');
      }
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>('/auth/refresh-token');
    return response.data;
  },

  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
