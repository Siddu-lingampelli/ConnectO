import api from '../lib/api';

export interface SearchFilter {
  // Provider Filters
  category?: string;
  city?: string;
  providerType?: 'Technical' | 'Non-Technical';
  minRating?: number;
  maxHourlyRate?: number;
  minHourlyRate?: number;
  experience?: string;
  skills?: string[];
  isVerified?: boolean;
  
  // Job Filters
  jobCategory?: string;
  jobCity?: string;
  jobStatus?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  urgency?: string;
  
  // Common Filters
  searchQuery?: string;
  sortBy?: 'relevance' | 'rating' | 'price-low' | 'price-high' | 'newest' | 'experience';
  radius?: number;
  
  // Advanced Filters
  availability?: string;
  languages?: string[];
  hasPortfolio?: boolean;
  responseTime?: string;
  completionRate?: number;
}

export interface SearchPreference {
  _id: string;
  userId: string;
  name: string;
  searchType: 'provider' | 'job' | 'all';
  filters: SearchFilter;
  isDefault: boolean;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchHistoryItem {
  _id: string;
  userId: string;
  searchType: 'provider' | 'job' | 'all';
  query?: string;
  filters: SearchFilter;
  resultsCount: number;
  clickedResults: Array<{
    resultId: string;
    resultType: 'User' | 'Job';
    clickedAt: string;
  }>;
  isVoiceSearch: boolean;
  duration?: number;
  savedAsPreference: boolean;
  createdAt: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'history' | 'provider' | 'job';
  searchType?: string;
  skills?: string[];
  category?: string;
}

export interface SearchResult {
  results: any[];
  total: number;
  page: number;
  pages: number;
  searchId: string;
}

const searchService = {
  // Save a search preference
  saveSearchPreference: async (
    name: string,
    searchType: 'provider' | 'job' | 'all',
    filters: SearchFilter,
    isDefault: boolean = false
  ): Promise<SearchPreference> => {
    const response = await api.post('/search/preferences', {
      name,
      searchType,
      filters,
      isDefault
    });
    return response.data.data;
  },

  // Get all search preferences
  getSearchPreferences: async (searchType?: 'provider' | 'job' | 'all'): Promise<SearchPreference[]> => {
    const params = searchType ? { searchType } : {};
    const response = await api.get('/search/preferences', { params });
    return response.data.data;
  },

  // Update a search preference
  updateSearchPreference: async (
    id: string,
    updates: { name?: string; filters?: SearchFilter; isDefault?: boolean }
  ): Promise<SearchPreference> => {
    const response = await api.put(`/search/preferences/${id}`, updates);
    return response.data.data;
  },

  // Delete a search preference
  deleteSearchPreference: async (id: string): Promise<void> => {
    await api.delete(`/search/preferences/${id}`);
  },

  // Record a search in history
  recordSearchHistory: async (
    searchType: 'provider' | 'job' | 'all',
    query: string,
    filters: SearchFilter,
    resultsCount: number,
    isVoiceSearch: boolean = false,
    duration?: number
  ): Promise<SearchHistoryItem> => {
    const response = await api.post('/search/history', {
      searchType,
      query,
      filters,
      resultsCount,
      isVoiceSearch,
      duration
    });
    return response.data.data;
  },

  // Get search history
  getSearchHistory: async (
    searchType?: 'provider' | 'job' | 'all',
    limit: number = 20,
    page: number = 1
  ): Promise<{
    history: SearchHistoryItem[];
    total: number;
    page: number;
    pages: number;
    popularSearches: Array<{ _id: string; count: number; lastSearched: string }>;
  }> => {
    const params: any = { limit, page };
    if (searchType) params.searchType = searchType;
    const response = await api.get('/search/history', { params });
    return response.data.data;
  },

  // Clear all search history
  clearSearchHistory: async (): Promise<void> => {
    await api.delete('/search/history');
  },

  // Get search suggestions
  getSearchSuggestions: async (
    query: string,
    type?: 'provider' | 'job' | 'all'
  ): Promise<SearchSuggestion[]> => {
    if (!query || query.length < 2) return [];
    const params: any = { query };
    if (type) params.type = type;
    const response = await api.get('/search/suggestions', { params });
    return response.data.data;
  },

  // Record a click on search result
  recordSearchClick: async (
    searchId: string,
    resultId: string,
    resultType: 'User' | 'Job'
  ): Promise<void> => {
    await api.post(`/search/history/${searchId}/click`, {
      resultId,
      resultType
    });
  },

  // Advanced search with all filters
  advancedSearch: async (
    searchType: 'provider' | 'job' | 'all',
    query: string,
    filters: SearchFilter = {},
    sortBy: string = 'relevance',
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResult> => {
    const response = await api.post('/search/advanced', {
      searchType,
      query,
      filters,
      sortBy,
      page,
      limit
    });
    return response.data.data;
  }
};

export default searchService;
