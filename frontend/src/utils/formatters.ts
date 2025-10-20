import { format, formatDistance, formatRelative } from 'date-fns';

// Format date
export const formatDate = (date: string | Date, formatStr = 'MMM dd, yyyy'): string => {
  return format(new Date(date), formatStr);
};

// Format date relative (e.g., "2 hours ago")
export const formatDateRelative = (date: string | Date): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

// Format date relative to now (e.g., "Today at 3:30 PM")
export const formatDateFull = (date: string | Date): string => {
  return formatRelative(new Date(date), new Date());
};

// Format currency (PKR)
export const formatCurrency = (amount: number, currency = 'PKR'): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-PK').format(num);
};

// Format phone number
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Truncate text
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Get initials from name
export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Get status color
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'yellow',
    'in-progress': 'blue',
    completed: 'green',
    cancelled: 'red',
    disputed: 'orange',
    open: 'green',
    accepted: 'blue',
    rejected: 'red',
  };
  return colors[status] || 'gray';
};
