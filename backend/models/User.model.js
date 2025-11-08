import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['client', 'provider', 'admin'],
    default: 'client'
  },
  
  // Dual Role System - NEW
  // Tracks which roles the user has enabled
  enabledRoles: [{
    type: String,
    enum: ['client', 'provider'],
    default: ['client'] // Everyone starts as a client
  }],
  
  // Current active role (can switch between enabled roles)
  activeRole: {
    type: String,
    enum: ['client', 'provider', 'admin'],
    default: 'client'
  },
  
  // Track when roles were enabled
  roleHistory: [{
    role: {
      type: String,
      enum: ['client', 'provider']
    },
    enabledAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Provider Type (for service providers)
  providerType: {
    type: String,
    enum: ['Technical', 'Non-Technical', ''],
    default: ''
  },
  
  city: {
    type: String,
    trim: true
  },
  area: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  
  // Professional Info (mainly for providers)
  bio: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    trim: true
  },
  education: {
    type: String,
    trim: true
  },
  languages: [{
    type: String,
    trim: true
  }],
  
  // Preferences
  availability: [{
    type: String,
    enum: ['Full Time', 'Part Time', 'Weekends Only', 'Flexible', 'Monday - Friday', ''],
    trim: true
  }],
  preferredCategories: [{
    type: String,
    trim: true
  }],
  hourlyRate: {
    type: Number,
    default: 0
  },
  serviceRadius: {
    type: Number,
    default: 10
  },
  
  // Services (for providers)
  services: [{
    type: String,
    trim: true
  }],
  
  // Portfolio (for providers)
  portfolio: [{
    title: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['image', 'video', 'link', 'github'],
      required: true
    },
    url: {
      type: String,
      trim: true,
      required: true
    },
    thumbnail: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Client preferences
  preferences: {
    categories: [{
      type: String,
      trim: true
    }],
    budget: {
      type: String,
      trim: true
    },
    communicationPreference: {
      type: String,
      trim: true
    },
    // GDPR Consent preferences
    marketingEmails: {
      type: Boolean,
      default: false
    },
    dataSharing: {
      type: Boolean,
      default: false
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'connections'],
      default: 'public'
    }
  },
  
  // Documents
  documents: {
    idProof: {
      type: String,
      trim: true
    },
    addressProof: {
      type: String,
      trim: true
    },
    certifications: [{
      type: String,
      trim: true
    }],
    // Verification documents
    panCard: {
      type: String,
      trim: true
    },
    aadharCard: {
      type: String,
      trim: true
    }
  },
  
  // Verification Status
  verification: {
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified'
    },
    submittedAt: {
      type: Date
    },
    verifiedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    documents: {
      panCardUrl: {
        type: String,
        trim: true
      },
      aadharCardUrl: {
        type: String,
        trim: true
      }
    }
  },
  
  // Demo Project Verification (for service providers)
  demoVerification: {
    status: {
      type: String,
      enum: ['not_assigned', 'pending_request', 'pending', 'under_review', 'verified', 'rejected'],
      default: 'not_assigned'
    },
    score: { type: Number, min: 0, max: 100 },
    demoProject: { type: mongoose.Schema.Types.ObjectId, ref: 'DemoProject' },
    requestedAt: { type: Date },
    lastUpdated: { type: Date },
    adminComments: { type: String, trim: true }
  },

  // Advanced Verification (Enhanced Provider Verification)
  idVerification: {
    status: {
      type: String,
      enum: ['not_submitted', 'pending', 'verified', 'rejected'],
      default: 'not_submitted'
    },
    idType: {
      type: String,
      enum: ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id'],
    },
    idNumber: {
      type: String,
      trim: true
    },
    idDocumentUrl: {
      type: String,
      trim: true
    },
    selfieUrl: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date
    },
    verifiedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  backgroundCheck: {
    status: {
      type: String,
      enum: ['not_initiated', 'in_progress', 'cleared', 'failed'],
      default: 'not_initiated'
    },
    requestedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    provider: {
      type: String,
      trim: true // e.g., "Manual Review", "Third-party Service"
    },
    reportUrl: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    checks: {
      criminalRecord: {
        type: String,
        enum: ['pending', 'clear', 'flagged', 'not_checked'],
        default: 'not_checked'
      },
      employmentHistory: {
        type: String,
        enum: ['pending', 'verified', 'discrepancy', 'not_checked'],
        default: 'not_checked'
      },
      educationVerification: {
        type: String,
        enum: ['pending', 'verified', 'discrepancy', 'not_checked'],
        default: 'not_checked'
      },
      referenceCheck: {
        type: String,
        enum: ['pending', 'positive', 'negative', 'not_checked'],
        default: 'not_checked'
      }
    }
  },

  skillCertifications: [{
    skill: {
      type: String,
      required: true,
      trim: true
    },
    certificationName: {
      type: String,
      required: true,
      trim: true
    },
    issuingOrganization: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date
    },
    credentialId: {
      type: String,
      trim: true
    },
    credentialUrl: {
      type: String,
      trim: true
    },
    certificateUrl: {
      type: String,
      trim: true
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'expired', 'invalid'],
      default: 'pending'
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Additional location fields
  address: {
    type: String,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  
  // GeoJSON Location for map-based search (for service providers)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  locationEnabled: {
    type: Boolean,
    default: false
  },
  lastLocationUpdate: {
    type: Date
  },
  
  // Notifications
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  
  // Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  blockReason: {
    type: String,
    default: ''
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  
  // Online status
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  typingTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Stats for providers
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  
  // Gamification fields
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  badges: [{
    name: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Referral System
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  referralCount: {
    type: Number,
    default: 0,
    min: 0
  },
  referralEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Last login
  lastLogin: {
    type: Date
  },
  
  // GDPR & Account Status
  accountStatus: {
    type: String,
    enum: ['active', 'pending_deletion', 'deleted', 'suspended'],
    default: 'active'
  },
  deletionScheduledDate: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id field (MongoDB uses _id)
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Text indexes for recommendation system
userSchema.index({ 
  fullName: 'text', 
  skills: 'text', 
  services: 'text',
  bio: 'text'
});

// Geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

export default User;
