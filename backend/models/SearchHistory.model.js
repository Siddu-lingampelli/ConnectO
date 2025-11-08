import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  searchType: {
    type: String,
    enum: ['provider', 'job', 'all'],
    required: true
  },
  query: {
    type: String,
    trim: true
  },
  filters: {
    category: String,
    city: String,
    providerType: String,
    minRating: Number,
    maxHourlyRate: Number,
    minHourlyRate: Number,
    skills: [String],
    sortBy: String,
    radius: Number,
    // Job specific
    jobCategory: String,
    jobStatus: String,
    budget: {
      min: Number,
      max: Number
    }
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  clickedResults: [{
    resultId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'clickedResults.resultType'
    },
    resultType: {
      type: String,
      enum: ['User', 'Job']
    },
    clickedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVoiceSearch: {
    type: Boolean,
    default: false
  },
  duration: Number, // Search session duration in seconds
  savedAsPreference: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ userId: 1, searchType: 1 });
searchHistorySchema.index({ query: 'text' });

// Auto-delete old history after 90 days
searchHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Method to record a click
searchHistorySchema.methods.recordClick = async function(resultId, resultType) {
  this.clickedResults.push({
    resultId,
    resultType,
    clickedAt: new Date()
  });
  await this.save();
};

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
