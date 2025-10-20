// Constants for API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    REFRESH: '/auth/refresh-token',
    UPDATE_PASSWORD: '/auth/password',
  },
  USERS: {
    BASE: '/users',
    PROFILE: (id: string) => `/users/${id}`,
    AVATAR: '/users/avatar',
    STATISTICS: (id: string) => `/users/${id}/statistics`,
    SEARCH: '/users/search',
  },
  JOBS: {
    BASE: '/jobs',
    SINGLE: (id: string) => `/jobs/${id}`,
    MY_JOBS: '/jobs/my-jobs',
    CATEGORIES: '/jobs/categories',
  },
  MESSAGES: {
    BASE: '/messages',
    CONVERSATIONS: '/messages/conversations',
    WITH_USER: (id: string) => `/messages/${id}`,
    MARK_READ: (id: string) => `/messages/${id}/read`,
    UNREAD: '/messages/unread',
  },
};

// Job categories
export const JOB_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Video Editing',
  'Photography',
  'Consulting',
  'Translation',
  'Virtual Assistant',
  'Data Entry',
  'Customer Support',
  'Other',
];

// Budget types
export const BUDGET_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
];

// Job statuses
export const JOB_STATUSES = [
  { value: 'open', label: 'Open', color: 'green' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

// Order statuses
export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'disputed', label: 'Disputed', color: 'orange' },
];

// User roles
export const USER_ROLES = [
  { value: 'client', label: 'Client' },
  { value: 'provider', label: 'Service Provider' },
];

// Cities in Pakistan
export const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Other',
];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
