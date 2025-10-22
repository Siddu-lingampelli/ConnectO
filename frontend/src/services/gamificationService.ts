import api from '../lib/api';

export interface Badge {
  name: string;
  icon: string;
  description: string;
  earnedAt: Date;
}

export interface GamificationStats {
  xp: number;
  level: number;
  progressXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
  badges: Badge[];
  totalBadges: number;
  completedJobs: number;
  rating: number;
  totalReviews: number;
  lastActive: Date;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    _id: string;
    fullName: string;
    profilePicture?: string;
    city?: string;
    providerType?: string;
  };
  xp: number;
  level: number;
  badges: number;
  completedJobs: number;
  rating: number;
  totalReviews: number;
}

export interface UserRank {
  rank: number;
  totalProviders: number;
  percentile: string;
  user: {
    xp: number;
    level: number;
    badges: number;
  };
  nearby: {
    above: any[];
    below: any[];
  };
}

class GamificationService {
  // Get user's gamification stats
  async getStats(userId: string): Promise<GamificationStats> {
    const response = await api.get(`/gamification/stats/${userId}`);
    return response.data.stats;
  }

  // Add XP to user (manual)
  async addXP(userId: string, xpGained: number, reason?: string) {
    const response = await api.post(`/gamification/add-xp/${userId}`, {
      xpGained,
      reason
    });
    return response.data;
  }

  // Award XP for specific action
  async awardXP(userId: string, action: string) {
    const response = await api.post(`/gamification/award-xp/${userId}`, {
      action
    });
    return response.data;
  }

  // Add badge to user
  async addBadge(userId: string, badgeKey: string) {
    const response = await api.post(`/gamification/add-badge/${userId}`, {
      badgeKey
    });
    return response.data;
  }

  // Get all available badges
  async getAvailableBadges() {
    const response = await api.get('/gamification/badges');
    return response.data.badges;
  }

  // Update last active (daily login bonus)
  async updateLastActive() {
    const response = await api.post('/gamification/update-active');
    return response.data;
  }

  // Get leaderboard
  async getLeaderboard(period: 'weekly' | 'monthly' | 'all' = 'all', limit: number = 10, providerType?: string): Promise<LeaderboardEntry[]> {
    const params: any = { period, limit };
    if (providerType) {
      params.providerType = providerType;
    }
    const response = await api.get('/leaderboard', { params });
    return response.data.leaderboard;
  }

  // Get user's rank
  async getUserRank(userId: string): Promise<UserRank> {
    const response = await api.get(`/leaderboard/my-rank/${userId}`);
    return response.data;
  }

  // Get top performers by category
  async getTopPerformers(category: 'xp' | 'rating' | 'jobs' | 'earnings' = 'xp') {
    const response = await api.get('/leaderboard/top-performers', {
      params: { category }
    });
    return response.data.performers;
  }

  // Get leaderboard statistics
  async getLeaderboardStats() {
    const response = await api.get('/leaderboard/stats');
    return response.data.stats;
  }

  // Helper: Calculate XP progress
  calculateProgress(xp: number, level: number) {
    const currentLevelXP = (level - 1) * 100;
    const progressXP = xp - currentLevelXP;
    const progressPercentage = (progressXP / 100) * 100;
    return {
      progressXP,
      xpToNextLevel: 100 - progressXP,
      progressPercentage: Math.min(progressPercentage, 100)
    };
  }

  // Helper: Get level color
  getLevelColor(level: number): string {
    if (level >= 20) return 'from-purple-500 to-pink-500';
    if (level >= 15) return 'from-red-500 to-orange-500';
    if (level >= 10) return 'from-yellow-500 to-orange-500';
    if (level >= 5) return 'from-green-500 to-teal-500';
    return 'from-blue-500 to-cyan-500';
  }

  // Helper: Get rank badge
  getRankBadge(rank: number): { emoji: string; color: string } {
    if (rank === 1) return { emoji: '🥇', color: 'text-yellow-500' };
    if (rank === 2) return { emoji: '🥈', color: 'text-gray-400' };
    if (rank === 3) return { emoji: '🥉', color: 'text-orange-600' };
    return { emoji: `#${rank}`, color: 'text-gray-600' };
  }
}

export const gamificationService = new GamificationService();
