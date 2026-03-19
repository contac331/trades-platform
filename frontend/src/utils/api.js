import axios from 'axios';

// API URL configuration for deployment
const API_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'  // Same domain in production
    : 'http://localhost:5000/api'
);

// Disable WebSocket in production
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('beforeunload', () => {
    // Prevent WebSocket connection attempts
  });
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
