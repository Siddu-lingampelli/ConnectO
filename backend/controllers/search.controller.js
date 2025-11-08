import SearchPreference from '../models/SearchPreference.model.js';
import SearchHistory from '../models/SearchHistory.model.js';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';

// @desc    Save search preference
// @route   POST /api/search/preferences
// @access  Private
export const saveSearchPreference = async (req, res) => {
  try {
    const { name, searchType, filters, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await SearchPreference.updateMany(
        { userId: req.user._id, searchType },
        { isDefault: false }
      );
    }

    const preference = await SearchPreference.create({
      userId: req.user._id,
      name,
      searchType,
      filters,
      isDefault
    });

    res.status(201).json({
      success: true,
      data: preference
    });
  } catch (error) {
    console.error('Error saving search preference:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save search preference',
      error: error.message
    });
  }
};

// @desc    Get user's search preferences
// @route   GET /api/search/preferences
// @access  Private
export const getSearchPreferences = async (req, res) => {
  try {
    const { searchType } = req.query;
    
    const query = { userId: req.user._id };
    if (searchType) {
      query.searchType = searchType;
    }

    const preferences = await SearchPreference.find(query)
      .sort({ isDefault: -1, usageCount: -1, updatedAt: -1 });

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error getting search preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search preferences',
      error: error.message
    });
  }
};

// @desc    Update search preference
// @route   PUT /api/search/preferences/:id
// @access  Private
export const updateSearchPreference = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, filters, isDefault } = req.body;

    const preference = await SearchPreference.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: 'Search preference not found'
      });
    }

    // If setting as default, unset other defaults
    if (isDefault && !preference.isDefault) {
      await SearchPreference.updateMany(
        { userId: req.user._id, searchType: preference.searchType, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    if (name) preference.name = name;
    if (filters) preference.filters = { ...preference.filters, ...filters };
    if (isDefault !== undefined) preference.isDefault = isDefault;

    await preference.save();

    res.json({
      success: true,
      data: preference
    });
  } catch (error) {
    console.error('Error updating search preference:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update search preference',
      error: error.message
    });
  }
};

// @desc    Delete search preference
// @route   DELETE /api/search/preferences/:id
// @access  Private
export const deleteSearchPreference = async (req, res) => {
  try {
    const { id } = req.params;

    const preference = await SearchPreference.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: 'Search preference not found'
      });
    }

    res.json({
      success: true,
      message: 'Search preference deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting search preference:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete search preference',
      error: error.message
    });
  }
};

// @desc    Record search in history
// @route   POST /api/search/history
// @access  Private
export const recordSearchHistory = async (req, res) => {
  try {
    const { searchType, query, filters, resultsCount, isVoiceSearch, duration } = req.body;

    const history = await SearchHistory.create({
      userId: req.user._id,
      searchType,
      query,
      filters,
      resultsCount,
      isVoiceSearch,
      duration
    });

    res.status(201).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error recording search history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record search history',
      error: error.message
    });
  }
};

// @desc    Get user's search history
// @route   GET /api/search/history
// @access  Private
export const getSearchHistory = async (req, res) => {
  try {
    const { searchType, limit = 20, page = 1 } = req.query;
    
    const query = { userId: req.user._id };
    if (searchType) {
      query.searchType = searchType;
    }

    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      SearchHistory.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      SearchHistory.countDocuments(query)
    ]);

    // Get popular searches
    const popularSearches = await SearchHistory.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { 
          _id: '$query',
          count: { $sum: 1 },
          lastSearched: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1, lastSearched: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        history,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        popularSearches
      }
    });
  } catch (error) {
    console.error('Error getting search history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search history',
      error: error.message
    });
  }
};

// @desc    Clear search history
// @route   DELETE /api/search/history
// @access  Private
export const clearSearchHistory = async (req, res) => {
  try {
    await SearchHistory.deleteMany({ userId: req.user._id });

    res.json({
      success: true,
      message: 'Search history cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing search history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear search history',
      error: error.message
    });
  }
};

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Private
export const getSearchSuggestions = async (req, res) => {
  try {
    const { query, type } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = [];

    // Get from search history
    const historySuggestions = await SearchHistory.find({
      userId: req.user._id,
      query: new RegExp(query, 'i')
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('query searchType');

    suggestions.push(...historySuggestions.map(h => ({
      text: h.query,
      type: 'history',
      searchType: h.searchType
    })));

    // Get from providers/jobs based on type
    if (type === 'provider' || type === 'all') {
      const providers = await User.find({
        role: 'provider',
        $or: [
          { fullName: new RegExp(query, 'i') },
          { skills: { $regex: query, $options: 'i' } },
          { services: { $regex: query, $options: 'i' } }
        ]
      })
        .limit(3)
        .select('fullName skills');

      suggestions.push(...providers.map(p => ({
        text: p.fullName,
        type: 'provider',
        skills: p.skills?.slice(0, 2)
      })));
    }

    if (type === 'job' || type === 'all') {
      const jobs = await Job.find({
        $or: [
          { title: new RegExp(query, 'i') },
          { category: new RegExp(query, 'i') }
        ],
        status: 'open'
      })
        .limit(3)
        .select('title category');

      suggestions.push(...jobs.map(j => ({
        text: j.title,
        type: 'job',
        category: j.category
      })));
    }

    res.json({
      success: true,
      data: suggestions.slice(0, 10)
    });
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions',
      error: error.message
    });
  }
};

// @desc    Record click on search result
// @route   POST /api/search/history/:id/click
// @access  Private
export const recordSearchClick = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultId, resultType } = req.body;

    const history = await SearchHistory.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Search history not found'
      });
    }

    await history.recordClick(resultId, resultType);

    res.json({
      success: true,
      message: 'Click recorded successfully'
    });
  } catch (error) {
    console.error('Error recording search click:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record click',
      error: error.message
    });
  }
};

// @desc    Advanced search with AI-powered relevance
// @route   POST /api/search/advanced
// @access  Private
export const advancedSearch = async (req, res) => {
  try {
    const {
      searchType,
      query,
      filters = {},
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.body;

    const skip = (page - 1) * limit;
    let results = [];
    let total = 0;

    if (searchType === 'provider' || searchType === 'all') {
      const providerQuery = { role: 'provider' };

      // Text search
      if (query) {
        providerQuery.$or = [
          { fullName: new RegExp(query, 'i') },
          { bio: new RegExp(query, 'i') },
          { skills: { $regex: query, $options: 'i' } },
          { services: { $regex: query, $options: 'i' } }
        ];
      }

      // Apply filters
      if (filters.category) {
        providerQuery.$or = [
          { skills: { $regex: filters.category, $options: 'i' } },
          { services: { $regex: filters.category, $options: 'i' } }
        ];
      }
      if (filters.city) providerQuery.city = filters.city;
      if (filters.providerType) providerQuery.providerType = filters.providerType;
      if (filters.isVerified !== undefined) providerQuery.isVerified = filters.isVerified;
      if (filters.minRating) providerQuery.rating = { $gte: filters.minRating };
      if (filters.minHourlyRate || filters.maxHourlyRate) {
        providerQuery.hourlyRate = {};
        if (filters.minHourlyRate) providerQuery.hourlyRate.$gte = filters.minHourlyRate;
        if (filters.maxHourlyRate) providerQuery.hourlyRate.$lte = filters.maxHourlyRate;
      }
      if (filters.skills && filters.skills.length > 0) {
        providerQuery.skills = { $in: filters.skills };
      }
      if (filters.hasPortfolio) {
        providerQuery['portfolio.0'] = { $exists: true };
      }
      if (filters.completionRate) {
        providerQuery.completionRate = { $gte: filters.completionRate };
      }

      // Sorting
      let sort = {};
      switch (sortBy) {
        case 'rating':
          sort = { rating: -1, completedJobs: -1 };
          break;
        case 'price-low':
          sort = { hourlyRate: 1 };
          break;
        case 'price-high':
          sort = { hourlyRate: -1 };
          break;
        case 'experience':
          sort = { completedJobs: -1, rating: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { rating: -1, completedJobs: -1, createdAt: -1 };
      }

      const [providers, providerCount] = await Promise.all([
        User.find(providerQuery)
          .sort(sort)
          .limit(searchType === 'all' ? 10 : parseInt(limit))
          .skip(searchType === 'all' ? 0 : skip)
          .select('-password'),
        User.countDocuments(providerQuery)
      ]);

      if (searchType === 'provider') {
        results = providers;
        total = providerCount;
      } else {
        results.push({
          type: 'providers',
          data: providers,
          total: providerCount
        });
      }
    }

    if (searchType === 'job' || searchType === 'all') {
      const jobQuery = {};

      // Text search
      if (query) {
        jobQuery.$or = [
          { title: new RegExp(query, 'i') },
          { description: new RegExp(query, 'i') },
          { category: new RegExp(query, 'i') }
        ];
      }

      // Apply filters
      if (filters.jobCategory) jobQuery.category = filters.jobCategory;
      if (filters.jobCity) jobQuery['location.city'] = filters.jobCity;
      if (filters.jobStatus) jobQuery.status = filters.jobStatus;
      else jobQuery.status = 'open'; // Default to open jobs
      
      if (filters.budget) {
        jobQuery.budget = {};
        if (filters.budget.min) jobQuery.budget.$gte = filters.budget.min;
        if (filters.budget.max) jobQuery.budget.$lte = filters.budget.max;
      }
      if (filters.urgency) jobQuery.urgency = filters.urgency;
      if (filters.providerType) jobQuery.providerType = filters.providerType;

      // Sorting
      let sort = {};
      switch (sortBy) {
        case 'price-high':
          sort = { budget: -1 };
          break;
        case 'price-low':
          sort = { budget: 1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1, budget: -1 };
      }

      const [jobs, jobCount] = await Promise.all([
        Job.find(jobQuery)
          .populate('client', 'fullName profilePicture city rating')
          .sort(sort)
          .limit(searchType === 'all' ? 10 : parseInt(limit))
          .skip(searchType === 'all' ? 0 : skip),
        Job.countDocuments(jobQuery)
      ]);

      if (searchType === 'job') {
        results = jobs;
        total = jobCount;
      } else {
        results.push({
          type: 'jobs',
          data: jobs,
          total: jobCount
        });
      }
    }

    // Record search in history
    const history = await SearchHistory.create({
      userId: req.user._id,
      searchType,
      query,
      filters,
      resultsCount: searchType === 'all' 
        ? results.reduce((sum, r) => sum + (r.total || 0), 0)
        : total
    });

    res.json({
      success: true,
      data: {
        results,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        searchId: history._id
      }
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

export default {
  saveSearchPreference,
  getSearchPreferences,
  updateSearchPreference,
  deleteSearchPreference,
  recordSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  getSearchSuggestions,
  recordSearchClick,
  advancedSearch
};
