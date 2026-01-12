import api from './client';

export const promotionsApi = {
  getMyPromotions: (params) => api.get('/promotions/my-promotions', { params }),
  getByPulperia: (pulperiaId) => api.get(`/promotions/pulperia/${pulperiaId}`),
  getById: (id) => api.get(`/promotions/${id}`),
  create: (data) => api.post('/promotions', data),
  update: (id, data) => api.patch(`/promotions/${id}`, data),
  delete: (id) => api.delete(`/promotions/${id}`),
  use: (id) => api.post(`/promotions/${id}/use`),
};
