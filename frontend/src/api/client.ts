import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { useAuthStore } from '@stores';
import toast from 'react-hot-toast';  
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. REQUEST INTERCEPTOR: Automatically inject JWT Token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. RESPONSE INTERCEPTOR: Global Error Handling (MAANG Standard)
apiClient.interceptors.response.use(
  (response) => {
    // If the request is successful, just pass it through
    return response;
  },
  (error: AxiosError) => {
    // If the request fails, handle it globally based on status code
    if (error.response) {
      const status = error.response.status;
      // FastAPI usually sends errors in a {"detail": "..."} format
      const data = error.response.data as any;
      const message = data?.detail || data?.message || 'An error occurred';

      if (status === 401) {
        toast.error('Session expired. Please log in again.');
        useAuthStore.getState().logout(); // Instantly log them out
      } else if (status === 403) {
        toast.error('You do not have permission to edit this document.');
      } else if (status === 404) {
        toast.error('Resource not found.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        // Fallback for 400 Bad Request, etc.
        toast.error(message);
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g., backend is down)
      toast.error('Network error. Is the server running?');
    }

    // Still reject the promise so the specific component can stop its loading state
    return Promise.reject(error);
  }
);

export default apiClient;