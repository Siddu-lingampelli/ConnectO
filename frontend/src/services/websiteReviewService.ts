import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface WebsiteReview {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    profilePicture?: string;
    role: string;
  };
  rating: number;
  title: string;
  review: string;
  category: 'usability' | 'features' | 'support' | 'overall' | 'other';
  isApproved: boolean;
  isFeatured: boolean;
  helpfulCount: number;
  response?: {
    text: string;
    respondedBy: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  pendingReviews: number;
  averageRating: number;
  ratingDistribution: { _id: number; count: number }[];
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const websiteReviewService = {
  // Submit or update website review
  submitReview: async (data: {
    rating: number;
    title: string;
    review: string;
    category?: string;
  }): Promise<{ message: string; review: WebsiteReview }> => {
    const response = await axios.post(
      `${API_URL}/website-reviews/submit`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get approved reviews for homepage
  getApprovedReviews: async (limit: number = 10, featured: boolean = false): Promise<WebsiteReview[]> => {
    const response = await axios.get(
      `${API_URL}/website-reviews/approved`,
      { params: { limit, featured: featured.toString() } }
    );
    return response.data;
  },

  // Get user's own review
  getMyReview: async (): Promise<WebsiteReview | null> => {
    try {
      const response = await axios.get(
        `${API_URL}/website-reviews/my-review`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get all reviews (admin only)
  getAllReviews: async (status?: string, page: number = 1, limit: number = 20) => {
    const response = await axios.get(
      `${API_URL}/website-reviews/all`,
      {
        params: { status, page, limit },
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  // Update review status (admin only)
  updateReviewStatus: async (
    reviewId: string,
    data: { isApproved?: boolean; isFeatured?: boolean }
  ): Promise<{ message: string; review: WebsiteReview }> => {
    const response = await axios.put(
      `${API_URL}/website-reviews/${reviewId}/status`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId: string): Promise<{ message: string }> => {
    const response = await axios.delete(
      `${API_URL}/website-reviews/${reviewId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get review statistics
  getStats: async (): Promise<ReviewStats> => {
    const response = await axios.get(`${API_URL}/website-reviews/stats`);
    return response.data;
  }
};
