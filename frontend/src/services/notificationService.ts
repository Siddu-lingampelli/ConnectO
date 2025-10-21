import api from '../lib/api';
import type { ApiResponse } from '../types';

export interface Notification {
  _id: string;
  recipient: string;
  type: 
    | 'profile_incomplete'
    | 'demo_assigned'
    | 'demo_pending'
    | 'demo_reviewed'
    | 'demo_verified'
    | 'demo_rejected'
    | 'proposal_received'
    | 'proposal_accepted'
    | 'proposal_rejected'
    | 'message_received'
    | 'job_posted'
    | 'job_completed'
    | 'payment_received'
    | 'review_received'
    | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    jobId?: string;
    proposalId?: string;
    demoId?: string;
    messageId?: string;
    senderId?: {
      _id: string;
      fullName: string;
      profilePicture?: string;
    };
    amount?: number;
    score?: number;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    unreadCount: number;
  };
}

export const notificationService = {
  // Get all notifications
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationPagination> => {
    const response = await api.get<ApiResponse<NotificationPagination>>('/notifications', { params });
    return response.data.data!;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data!.count;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.put<ApiResponse<Notification>>(`/notifications/${notificationId}/read`);
    return response.data.data!;
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/mark-all-read');
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Clear read notifications
  clearReadNotifications: async (): Promise<void> => {
    await api.delete('/notifications/clear-read');
  },
};
