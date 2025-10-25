import api from '../lib/api';

interface PostFilters {
  postType?: string;
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

interface PostData {
  content: string;
  postType?: string;
  category?: string;
  tags?: string[];
  images?: string[];
}

export const communityService = {
  // Get all posts with filters
  getPosts: async (filters: PostFilters = {}) => {
    const { postType = 'all', category = 'all', search = '', sort = 'recent', page = 1, limit = 10 } = filters;
    const response = await api.get('/community', {
      params: { postType, category, search, sort, page, limit }
    });
    return response.data;
  },

  // Get single post
  getPostById: async (postId: string) => {
    const response = await api.get(`/community/${postId}`);
    return response.data;
  },

  // Create new post
  createPost: async (postData: PostData) => {
    const response = await api.post('/community', postData);
    return response.data;
  },

  // Update post
  updatePost: async (postId: string, postData: Partial<PostData>) => {
    const response = await api.put(`/community/${postId}`, postData);
    return response.data;
  },

  // Delete post
  deletePost: async (postId: string) => {
    const response = await api.delete(`/community/${postId}`);
    return response.data;
  },

  // Toggle like
  toggleLike: async (postId: string) => {
    const response = await api.post(`/community/${postId}/like`);
    return response.data;
  },

  // Add comment
  addComment: async (postId: string, content: string) => {
    const response = await api.post(`/community/${postId}/comment`, { content });
    return response.data;
  },

  // Delete comment
  deleteComment: async (postId: string, commentId: string) => {
    const response = await api.delete(`/community/${postId}/comment/${commentId}`);
    return response.data;
  },

  // Get user's posts
  getMyPosts: async () => {
    const response = await api.get('/community/my-posts');
    return response.data;
  },

  // Get trending posts
  getTrendingPosts: async () => {
    const response = await api.get('/community/trending');
    return response.data;
  }
};

