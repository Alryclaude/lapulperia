import api from './client';

export const userApi = {
  getStats: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
  exportData: () => api.get('/auth/export'),
  deleteAccount: () => api.delete('/auth/me'),
};
