// User Types
export interface User {
  id: string;
  _id?: string; // Keep for backward compatibility
  fullName: string;
  email: string;
  role: 'client' | 'provider' | 'admin';
  phone?: string;
  city?: string;
  area?: string;
  address?: string;
  landmark?: string;
  pincode?: string;
  profilePicture?: string;
  avatar?: string;
  bio?: string;
  profileCompleted?: boolean;
  rating?: number;
  completedJobs?: number;
  isVerified?: boolean;
  isActive?: boolean;
  
  // Provider-specific fields
  skills?: string[];
  services?: string[];
  experience?: string;
  education?: string;
  languages?: string[];
  availability?: string;
  preferredCategories?: string[];
  hourlyRate?: number;
  serviceRadius?: number;
  
  // Client preferences
  preferences?: {
    categories?: string[];
    budget?: string;
    communicationPreference?: string;
  };
  
  // Documents
  documents?: {
    idProof?: string;
    addressProof?: string;
    certifications?: string[];
  };
  
  // Verification
  verification?: {
    status?: 'unverified' | 'pending' | 'verified' | 'rejected';
    panCardUrl?: string;
    aadharCardUrl?: string;
    submittedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    rejectionReason?: string;
  };
  
  // Notifications
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  
  createdAt?: string;
  updatedAt?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'client' | 'provider';
  phone?: string;
  city?: string;
  area?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Job Types
export interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  location: {
    city: string;
    area: string;
  };
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  client: User | string;
  requirements?: string[];
  attachments?: string[];
  proposals: string[];
  createdAt: string;
  updatedAt: string;
}

// Proposal Types
export interface Proposal {
  _id: string;
  job: Job | string;
  provider: User | string;
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  _id: string;
  job: Job | string;
  client: User | string;
  provider: User | string;
  proposal: Proposal | string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  amount: number;
  startDate?: string;
  deadline: string;
  completedDate?: string;
  payment?: {
    status: 'pending' | 'paid' | 'released' | 'refunded';
    paidAt?: string;
    releasedAt?: string;
  };
  paymentStatus?: 'pending' | 'paid' | 'refunded'; // Legacy field
  milestones?: Array<{
    _id: string;
    title: string;
    description: string;
    amount: number;
    status: 'pending' | 'completed';
    completedAt?: string;
  }>;
  notes?: string;
  completionDate?: string; // Legacy field
  createdAt: string;
  updatedAt: string;
}

// Message Types
export interface Message {
  _id: string;
  sender: User | string;
  receiver: User | string;
  order?: Order | string;
  content: string;
  type: 'text' | 'file' | 'image';
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  _id: string;
  order: Order | string;
  reviewer: User | string;
  reviewee: User | string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Wallet Types
export interface Wallet {
  _id: string;
  user: User | string;
  balance: number;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'earning';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  order?: Order | string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Form Types
export interface SelectOption {
  value: string;
  label: string;
}

// Filter Types
export interface JobFilter {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: 'fixed' | 'hourly';
  city?: string;
  area?: string;
  status?: string;
  search?: string;
}
