import api from '../lib/api';
import type { Order, PaginatedResponse, ApiResponse } from '../types';

interface OrderStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  totalEarnings: number;
}

interface AcceptDeliveryResponse extends Order {
  paymentReleased?: boolean;
  amountReleased?: number;
}

export const orderService = {
  // Get my orders
  getMyOrders: async (status?: string, page = 1, limit = 20): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<PaginatedResponse<Order>>('/orders/my-orders', {
      params: { status, page, limit },
    });
    return response.data;
  },

  // Get single order
  getOrder: async (orderId: string): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return response.data.data!;
  },

  // Update order status (Provider)
  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
    return response.data.data!;
  },

  // Accept delivery (Client)
  acceptDelivery: async (orderId: string): Promise<AcceptDeliveryResponse> => {
    const response = await api.put<ApiResponse<AcceptDeliveryResponse>>(`/orders/${orderId}/accept-delivery`);
    return response.data.data!;
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${orderId}/cancel`, { reason });
    return response.data.data!;
  },

  // Add milestone (Provider)
  addMilestone: async (orderId: string, milestone: { title: string; description: string; amount: number }): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/milestones`, milestone);
    return response.data.data!;
  },

  // Complete milestone (Provider)
  completeMilestone: async (orderId: string, milestoneId: string): Promise<Order> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${orderId}/milestones/${milestoneId}`);
    return response.data.data!;
  },

  // Get order statistics
  getOrderStats: async (): Promise<OrderStats> => {
    const response = await api.get<ApiResponse<OrderStats>>('/orders/stats');
    return response.data.data!;
  },
};
