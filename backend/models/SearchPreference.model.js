import mongoose from 'mongoose';

const searchPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  searchType: {
    type: String,
    enum: ['provider', 'job', 'all'],
    default: 'all'
  },
  filters: {
    // Provider Filters
    category: String,
    city: String,
    providerType: {
      type: String,
      enum: ['Technical', 'Non-Technical']
    },
    minRating: Number,
    maxHourlyRate: Number,
    minHourlyRate: Number,
    experience: String,
    skills: [String],
    isVerified: Boolean,
    
    // Job Filters
    jobCategory: String,
    jobCity: String,
    jobStatus: String,
    budget: {
      min: Number,
      max: Number
    },
    urgency: String,
    
    // Common Filters
    searchQuery: String,
    sortBy: {
      type: String,
      enum: ['relevance', 'rating', 'price-low', 'price-high', 'newest', 'experience'],
      default: 'relevance'
    },
    radius: Number, // in km for location-based search
    
    // Advanced Filters
    availability: String,
    languages: [String],
    hasPortfolio: Boolean,
    responseTime: String, // 'fast', 'medium', 'slow'
    completionRate: Number // minimum completion rate percentage
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
searchPreferenceSchema.index({ userId: 1, searchType: 1 });
searchPreferenceSchema.index({ userId: 1, isDefault: 1 });

// Method to increment usage
searchPreferenceSchema.methods.recordUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  await this.save();
};

const SearchPreference = mongoose.model('SearchPreference', searchPreferenceSchema);

export default SearchPreference;
