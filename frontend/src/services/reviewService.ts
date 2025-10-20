import api from '../lib/api';

export interface Review {
  _id: string;
  order: string;
  job: {
    _id: string;
    title: string;
    category: string;
  };
  reviewer: {
    _id: string;
    fullName: string;
    profilePicture?: string;
    avatar?: string;
    city?: string;
  };
  reviewee: {
    _id: string;
    fullName: string;
    profilePicture?: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  categories?: {
    quality?: number;
    communication?: number;
    timeliness?: number;
    professionalism?: number;
  };
  response?: {
    comment: string;
    createdAt: string;
  };
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  orderId: string;
  rating: number;
  comment: string;
  categories?: {
    quality?: number;
    communication?: number;
    timeliness?: number;
    professionalism?: number;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

export const reviewService = {
  // Create a review
  createReview: async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post<{ success: boolean; data: Review }>('/reviews', data);
    return response.data.data;
  },

  // Get reviews for a provider
  getProviderReviews: async (
    providerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    reviews: Review[];
    stats: ReviewStats | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get<{
      success: boolean;
      data: {
        reviews: Review[];
        stats: ReviewStats | null;
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>(`/reviews/provider/${providerId}?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  // Get review for a specific order
  getOrderReview: async (orderId: string): Promise<Review | null> => {
    try {
      const response = await api.get<{ success: boolean; data: Review }>(`/reviews/order/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Update a review
  updateReview: async (reviewId: string, data: Partial<CreateReviewData>): Promise<Review> => {
    const response = await api.put<{ success: boolean; data: Review }>(`/reviews/${reviewId}`, data);
    return response.data.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },

  // Add response to a review (provider only)
  addReviewResponse: async (reviewId: string, comment: string): Promise<Review> => {
    const response = await api.post<{ success: boolean; data: Review }>(
      `/reviews/${reviewId}/response`,
      { comment }
    );
    return response.data.data;
  },
};
