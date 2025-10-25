import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    // Check if it's a network error (no response from server)
    if (!error.response) {
      console.error('Network Error:', error.message);
      // Don't show toast for network errors - let components handle it
      // toast.error('Cannot connect to server. Please check if backend is running.');
      return Promise.reject(error);
    }

    const message = error.response?.data?.message || 'An error occurred';
    
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      // Don't auto-show toast for forbidden - let components handle
      console.error('403 Forbidden:', message);
    } else if (error.response?.status === 404) {
      // Don't auto-show toast for 404 - let components handle
      console.error('404 Not Found:', message);
    } else if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
      // Don't auto-show toast for server errors - let components handle
    }
    // Don't show generic error toasts - let components handle specific errors
    
    return Promise.reject(error);
  }
);

export default api;
