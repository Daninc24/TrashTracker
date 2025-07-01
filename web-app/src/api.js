import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// Rate limiting mechanism
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests

// Request interceptor to add rate limiting
api.interceptors.request.use(
  async (config) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    lastRequestTime = Date.now();
    
    // Add auth token if available
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

// Response interceptor to handle 429 errors and retry failed requests
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 429) {
      // Wait a bit longer before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.warn('Rate limited, retrying request...');
      
      // Retry the request once
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        return api(originalRequest);
      }
    }
    
    // Retry other network errors once
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
api.getUsers = () => api.get('/admin/users');
api.getUserStats = (userId) => api.get(`/admin/users/${userId}/stats`);
api.updateUserRole = (userId, role) => api.put(`/admin/users/${userId}/role`, { role });
api.deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
api.toggleUserStatus = (userId) => api.put(`/admin/users/${userId}/status`);
api.bulkDeleteUsers = (userIds) => api.post('/admin/users/bulk', { action: 'delete', userIds });
api.bulkUpdateUserRoles = (userIds, role) => api.post('/admin/users/bulk', { action: 'updateRole', userIds, role });
api.bulkUpdateUserStatus = (userIds, active) => api.post('/admin/users/bulk', { action: 'updateStatus', userIds, active });
api.exportUsers = (filters = {}) => api.get('/admin/users/export', { params: filters, responseType: 'blob' });

// Additional methods
api.getStats = () => api.get('/stats');
api.getReports = () => api.get('/reports');
api.deleteReport = (id) => api.delete(`/reports/${id}`);
api.updateReportStatus = (id, status) => api.put(`/reports/${id}/status`, { status });

// Notifications
api.getNotifications = (params = {}) => api.get('/notifications', { params });
api.markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
api.markAllNotificationsAsRead = () => api.put('/notifications/read-all');
api.deleteNotification = (id) => api.delete(`/notifications/${id}`);

// Admin endpoints
api.getAdminUserProfile = (userId) => api.get(`/admin/users/${userId}`);
api.exportAdminUserData = (userId) => api.get(`/admin/users/${userId}/export`);

export default api; 