import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ Enable sending cookies with requests (HTTP-only cookies)
  withCredentials: true,
});

// ❌ REMOVED: Request interceptor for Authorization header
// Cookies are sent automatically with withCredentials: true

// Response interceptor: Handle 401 errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Trigger logout on 401 Unauthorized
      useAuthStore.getState().logout();
    }
    
    return Promise.reject(error);
  }
);
