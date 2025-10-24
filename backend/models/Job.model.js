import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    minlength: [50, 'Description must be at least 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      // Technical Categories
      'Web Development',
      'Mobile App Development',
      'Software Development',
      'UI/UX Design',
      'Graphic Design',
      'Digital Marketing',
      'Content Writing',
      'Video Editing',
      'Data Entry',
      'Virtual Assistant',
      'SEO Services',
      'Social Media Management',
      'IT Support',
      'Other Technical Services',
      // Non-Technical Categories
      'Plumbing',
      'Electrical',
      'Carpentry',
      'Painting',
      'Cleaning',
      'Gardening',
      'AC Repair',
      'Appliance Repair',
      'Pest Control',
      'Moving & Packing',
      'Home Renovation',
      'Interior Design',
      'Beauty & Wellness',
      'Catering',
      'Photography',
      'Event Planning',
      'Other Non-Technical Services'
    ]
  },
  providerType: {
    type: String,
    required: [true, 'Provider type is required'],
    enum: ['Technical', 'Non-Technical']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget must be positive']
  },
  budgetType: {
    type: String,
    enum: ['fixed', 'hourly'],
    default: 'fixed'
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  location: {
    city: {
      type: String,
      required: true
    },
    area: {
      type: String,
      required: true
    },
    address: {
      type: String
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      }
    },
    latitude: Number,
    longitude: Number
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  proposalsCount: {
    type: Number,
    default: 0
  },
  assignedProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Peer-to-Peer Collaboration Feature
  collaborators: [{
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      trim: true,
      default: 'Collaborator'
    },
    sharePercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined'],
      default: 'invited'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date
    }
  }],
  // Payment Splits for Collaborators
  paymentSplits: [{
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sharePercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date
    }
  }],
  attachments: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id field
jobSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual populate proposals
jobSchema.virtual('proposals', {
  ref: 'Proposal',
  localField: '_id',
  foreignField: 'job'
});

// Index for better query performance
jobSchema.index({ client: 1, status: 1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index for nearby search

// Text indexes for recommendation system
jobSchema.index({ 
  title: 'text', 
  description: 'text', 
  category: 'text' 
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
