import api from '../lib/api';

// Types
export interface EarningsSummary {
  walletBalance: number;
  totalEarned: number;
  pendingAmount: number;
  currentPeriodEarnings: number;
  growthRate: number;
  completedJobs: number;
}

export interface DailyEarning {
  _id: string;
  amount: number;
  count: number;
}

export interface MonthlyEarning {
  _id: string;
  amount: number;
  count: number;
}

export interface EarningsByCategory {
  _id: string;
  amount: number;
  count: number;
}

export interface TopClient {
  _id: string;
  totalEarned: number;
  totalSpent?: number;
  jobsCompleted: number;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface ProviderEarningsData {
  summary: EarningsSummary;
  dailyEarnings: DailyEarning[];
  monthlyEarnings: MonthlyEarning[];
  earningsByCategory: EarningsByCategory[];
  jobStats: any[];
  topClients: TopClient[];
  recentOrders: any[];
  recentTransactions: any[];
}

export interface PerformanceMetrics {
  completionRate: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageRating: number;
  totalReviews: number;
  averageResponseTime: number;
  earningsPerJob: number;
  profileViews: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  platformCommission: number;
  totalRefunds: number;
  refundCount: number;
  netRevenue: number;
  revenueGrowth: number;
  averageTransactionValue: number;
}

export interface DailyRevenue {
  _id: string;
  revenue: number;
  commission: number;
  transactions: number;
}

export interface RevenueByMethod {
  _id: string;
  total: number;
  count: number;
}

export interface RevenueByCategory {
  _id: string;
  revenue: number;
  orders: number;
}

export interface TopProvider {
  _id: string;
  totalEarned: number;
  ordersCompleted: number;
  name: string;
  email: string;
  profilePicture?: string;
  providerType: string;
}

export interface RevenueReportsData {
  summary: RevenueSummary;
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: DailyRevenue[];
  revenueByMethod: RevenueByMethod[];
  revenueByCategory: RevenueByCategory[];
  topProviders: TopProvider[];
  topClients: TopClient[];
}

export interface RealTimeStats {
  live: {
    activeUsers: number;
    ongoingOrders: number;
    timestamp: string;
  };
  today: {
    newUsers: number;
    jobsPosted: number;
    ordersCreated: number;
    ordersCompleted: number;
    revenue: number;
  };
  thisWeek: {
    newUsers: number;
    jobsPosted: number;
    ordersCreated: number;
  };
  recentActivity: {
    users: any[];
    jobs: any[];
    orders: any[];
  };
}

export interface ComprehensiveAnalytics {
  userEngagement: any[];
  usageTrends: any[];
  conversionRates: {
    jobToProposal: string;
    proposalToOrder: string;
  };
}

// Analytics Service
export const analyticsService = {
  /**
   * Get provider earnings analytics
   */
  getProviderEarnings: async (period: string = '30'): Promise<ProviderEarningsData> => {
    try {
      const response = await api.get(`/analytics/provider/earnings?period=${period}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Get provider earnings error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get provider performance metrics
   */
  getProviderPerformance: async (period: string = '30'): Promise<PerformanceMetrics> => {
    try {
      const response = await api.get(`/analytics/provider/performance?period=${period}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Get provider performance error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get admin revenue reports
   */
  getRevenueReports: async (period: string = '30'): Promise<RevenueReportsData> => {
    try {
      const response = await api.get(`/analytics/admin/revenue-reports?period=${period}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Get revenue reports error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get real-time statistics
   */
  getRealTimeStats: async (): Promise<RealTimeStats> => {
    try {
      const response = await api.get('/analytics/real-time');
      return response.data.data;
    } catch (error: any) {
      console.error('Get real-time stats error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get comprehensive admin analytics
   */
  getComprehensiveAnalytics: async (period: string = '30'): Promise<ComprehensiveAnalytics> => {
    try {
      const response = await api.get(`/analytics/admin/comprehensive?period=${period}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Get comprehensive analytics error:', error);
      throw error.response?.data || error;
    }
  }
};

export default analyticsService;
