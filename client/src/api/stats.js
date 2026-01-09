import api from './client';

export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),
  getInsights: () => api.get('/stats/insights'),
  export: (params) => api.get('/stats/export', { params }),
};
