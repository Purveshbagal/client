import axios from 'axios';

// Create axios instance with base URL (relative path for nginx proxy)
const api = axios.create({
  baseURL: '/api',
});

// Request interceptor to attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swadhan_access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 (token expired) and refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('swadhan_refresh');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const refreshResponse = await axios.post('/api/auth/refresh', {
          refreshToken
        });
        const newAccessToken = refreshResponse.data.accessToken;
        const newRefreshToken = refreshResponse.data.refreshToken;
        localStorage.setItem('swadhan_access', newAccessToken);
        localStorage.setItem('swadhan_refresh', newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        localStorage.removeItem('swadhan_access');
        localStorage.removeItem('swadhan_refresh');
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Convenience named helpers for common user actions
export const getFavorites = () => api.get('/users/favorites');
export const addToFavorites = (type, id) => api.post(`/users/favorites/${type}/${id}`);
export const removeFromFavorites = (type, id) => api.delete(`/users/favorites/${type}/${id}`);
