import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Save, Clock, Trash2,
  Filter, X, TrendingUp, History, Bookmark
} from 'lucide-react';
import { toast } from 'react-toastify';
import searchService, { SearchFilter, SearchPreference, SearchHistoryItem } from '../../services/searchService';
import VoiceSearch from '../search/VoiceSearch';

interface AdvancedSearchPanelProps {
  searchType: 'provider' | 'job' | 'all';
  onSearch: (query: string, filters: SearchFilter) => void;
  initialFilters?: SearchFilter;
}

const categories = [
  'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
  'Gardening', 'AC Repair', 'Appliance Repair', 'Pest Control',
  'Moving & Packing', 'Home Renovation', 'Interior Design',
  'Beauty & Wellness', 'IT & Tech Support', 'Other Services'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

const AdvancedSearchPanel = ({ searchType, onSearch, initialFilters = {} }: AdvancedSearchPanelProps) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>(initialFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [preferences, setPreferences] = useState<SearchPreference[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [popularSearches, setPopularSearches] = useState<Array<{ _id: string; count: number }>>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [preferenceName, setPreferenceName] = useState('');
  const [isDefaultPreference, setIsDefaultPreference] = useState(false);

  useEffect(() => {
    loadPreferences();
    loadHistory();
  }, [searchType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        loadSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const loadPreferences = async () => {
    try {
      const prefs = await searchService.getSearchPreferences(searchType);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await searchService.getSearchHistory(searchType, 10);
      setHistory(data.history);
      setPopularSearches(data.popularSearches);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const suggs = await searchService.getSearchSuggestions(query, searchType);
      setSuggestions(suggs);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSearch = () => {
    onSearch(query, filters);
    setShowSuggestions(false);
  };

  const handleSavePreference = async () => {
    if (!preferenceName.trim()) {
      toast.error('Please enter a name for this search preference');
      return;
    }

    try {
      await searchService.saveSearchPreference(
        preferenceName,
        searchType,
        { ...filters, searchQuery: query },
        isDefaultPreference
      );
      toast.success('Search preference saved successfully');
      setShowSaveModal(false);
      setPreferenceName('');
      setIsDefaultPreference(false);
      loadPreferences();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save preference');
    }
  };

  const loadPreference = async (preference: SearchPreference) => {
    setFilters(preference.filters);
    setQuery(preference.filters.searchQuery || '');
    setShowPreferences(false);
    toast.success(`Loaded "${preference.name}" search`);
  };

  const deletePreference = async (id: string) => {
    try {
      await searchService.deleteSearchPreference(id);
      toast.success('Preference deleted');
      loadPreferences();
    } catch (error: any) {
      toast.error('Failed to delete preference');
    }
  };

  const loadHistoryItem = (item: SearchHistoryItem) => {
    setQuery(item.query || '');
    setFilters(item.filters);
    setShowHistory(false);
    handleSearch();
  };

  const clearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      try {
        await searchService.clearSearchHistory();
        setHistory([]);
        setPopularSearches([]);
        toast.success('Search history cleared');
      } catch (error) {
        toast.error('Failed to clear history');
      }
    }
  };

  const clearAllFilters = () => {
    setFilters({});
    setQuery('');
    toast.info('All filters cleared');
  };

  const updateFilter = (key: keyof SearchFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFilter];
    return value !== undefined && value !== '' && value !== null;
  }).length;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-border p-6 mb-6">
      {/* Main Search Bar */}
      <div className="relative mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={`Search ${searchType === 'all' ? 'providers & jobs' : searchType + 's'}...`}
              className="w-full pl-12 pr-12 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-border rounded-xl shadow-medium z-50 max-h-80 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(suggestion.text);
                        setShowSuggestions(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-surface transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                    >
                      {suggestion.type === 'history' && <Clock className="w-4 h-4 text-text-secondary" />}
                      {suggestion.type === 'provider' && <span className="text-lg">👤</span>}
                      {suggestion.type === 'job' && <span className="text-lg">💼</span>}
                      <div className="flex-1">
                        <div className="font-medium text-text-primary">{suggestion.text}</div>
                        {suggestion.skills && (
                          <div className="text-xs text-text-secondary">
                            {suggestion.skills.join(', ')}
                          </div>
                        )}
                        {suggestion.category && (
                          <div className="text-xs text-text-secondary">{suggestion.category}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <VoiceSearch
            value={query}
            onSearch={(text) => {
              setQuery(text);
              handleSearch();
            }}
            placeholder=""
          />

          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-medium transition-all font-medium hover:scale-105"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            showAdvancedFilters
              ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white'
              : 'border-2 border-[#6B8F71] text-text-primary hover:bg-surface'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>

        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className="px-4 py-2 border-2 border-[#6B8F71] text-text-primary rounded-xl hover:bg-surface transition-all font-medium text-sm flex items-center gap-2"
        >
          <Bookmark className="w-4 h-4" />
          Saved ({preferences.length})
        </button>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 border-2 border-[#6B8F71] text-text-primary rounded-xl hover:bg-surface transition-all font-medium text-sm flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          History
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium text-sm flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}

        {(query || activeFilterCount > 0) && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="ml-auto px-4 py-2 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-text-primary rounded-xl hover:shadow-medium transition-all font-medium text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Search
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-[#AEC3B0] pt-4 mt-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Provider Filters */}
              {(searchType === 'provider' || searchType === 'all') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Category/Skill
                    </label>
                    <select
                      value={filters.category || ''}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      City
                    </label>
                    <select
                      value={filters.city || ''}
                      onChange={(e) => updateFilter('city', e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    >
                      <option value="">All Cities</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Provider Type
                    </label>
                    <select
                      value={filters.providerType || ''}
                      onChange={(e) => updateFilter('providerType', e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    >
                      <option value="">All Types</option>
                      <option value="Technical">💻 Technical</option>
                      <option value="Non-Technical">🔧 Non-Technical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.minRating || ''}
                      onChange={(e) => updateFilter('minRating', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    >
                      <option value="">Any Rating</option>
                      <option value="4.5">⭐ 4.5+</option>
                      <option value="4">⭐ 4+</option>
                      <option value="3.5">⭐ 3.5+</option>
                      <option value="3">⭐ 3+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Min Hourly Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.minHourlyRate || ''}
                      onChange={(e) => updateFilter('minHourlyRate', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Min rate"
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Max Hourly Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.maxHourlyRate || ''}
                      onChange={(e) => updateFilter('maxHourlyRate', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Max rate"
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    />
                  </div>

                  <div className="flex items-center gap-3 col-span-1">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={filters.isVerified || false}
                      onChange={(e) => updateFilter('isVerified', e.target.checked)}
                      className="w-5 h-5 text-[#6B8F71] border-border rounded focus:ring-[#6B8F71]"
                    />
                    <label htmlFor="verified" className="text-sm font-medium text-text-primary cursor-pointer">
                      ✓ Verified Providers Only
                    </label>
                  </div>

                  <div className="flex items-center gap-3 col-span-1">
                    <input
                      type="checkbox"
                      id="portfolio"
                      checked={filters.hasPortfolio || false}
                      onChange={(e) => updateFilter('hasPortfolio', e.target.checked)}
                      className="w-5 h-5 text-[#6B8F71] border-border rounded focus:ring-[#6B8F71]"
                    />
                    <label htmlFor="portfolio" className="text-sm font-medium text-text-primary cursor-pointer">
                      📁 Has Portfolio
                    </label>
                  </div>
                </>
              )}

              {/* Job Filters */}
              {(searchType === 'job' || searchType === 'all') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Job Category
                    </label>
                    <select
                      value={filters.jobCategory || ''}
                      onChange={(e) => updateFilter('jobCategory', e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Budget Min (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.budget?.min || ''}
                      onChange={(e) => updateFilter('budget', { ...filters.budget, min: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Min budget"
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Budget Max (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.budget?.max || ''}
                      onChange={(e) => updateFilter('budget', { ...filters.budget, max: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Max budget"
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Urgency
                    </label>
                    <select
                      value={filters.urgency || ''}
                      onChange={(e) => updateFilter('urgency', e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                    >
                      <option value="">Any Urgency</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </>
              )}

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Highest Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="experience">Most Experienced</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Preferences Panel */}
      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-[#AEC3B0] pt-4 mt-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                Saved Searches
              </h3>
            </div>

            {preferences.length === 0 ? (
              <div className="text-center py-6 text-text-secondary">
                No saved searches yet. Save your current search to access it later!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {preferences.map((pref) => (
                  <div
                    key={pref._id}
                    className="border-2 border-border rounded-xl p-4 hover:border-[#6B8F71] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary flex items-center gap-2">
                          {pref.name}
                          {pref.isDefault && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-text-secondary mt-1">
                          Used {pref.usageCount} times
                        </p>
                      </div>
                      <button
                        onClick={() => deletePreference(pref._id)}
                        className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => loadPreference(pref)}
                      className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-medium transition-all text-sm font-medium"
                    >
                      Load Search
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-[#AEC3B0] pt-4 mt-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Searches
              </h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </button>
              )}
            </div>

            {popularSearches.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Popular Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <button
                      key={search._id}
                      onClick={() => {
                        setQuery(search._id);
                        handleSearch();
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-text-primary rounded-full text-sm font-medium hover:shadow-soft transition-all"
                    >
                      {search._id} ({search.count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.length === 0 ? (
              <div className="text-center py-6 text-text-secondary">
                No search history yet
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-left border-2 border-border rounded-xl p-3 hover:border-[#6B8F71] transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-text-primary flex items-center gap-2">
                          {item.isVoiceSearch && <span>🎤</span>}
                          {item.query || 'Filter search'}
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {item.resultsCount} results • {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="text-[#6B8F71] opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Search Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-medium p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <Save className="w-6 h-6" />
                  Save Search
                </h3>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Search Name
                  </label>
                  <input
                    type="text"
                    value={preferenceName}
                    onChange={(e) => setPreferenceName(e.target.value)}
                    placeholder="e.g., Plumbers in Mumbai"
                    className="w-full px-4 py-2 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="default"
                    checked={isDefaultPreference}
                    onChange={(e) => setIsDefaultPreference(e.target.checked)}
                    className="w-5 h-5 text-[#6B8F71] border-border rounded focus:ring-[#6B8F71]"
                  />
                  <label htmlFor="default" className="text-sm font-medium text-text-primary cursor-pointer">
                    Set as default search
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-4 py-2 border-2 border-border text-text-primary rounded-xl hover:bg-surface transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreference}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-medium transition-all font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearchPanel;
