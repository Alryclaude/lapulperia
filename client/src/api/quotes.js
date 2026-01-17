import api from './client';

export const quotesApi = {
  // Listar
  list: (params) => api.get('/quotes', { params }),

  // Detalle
  getById: (id) => api.get(`/quotes/${id}`),

  // CRUD
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  delete: (id) => api.delete(`/quotes/${id}`),

  // Duplicar
  duplicate: (id) => api.post(`/quotes/${id}/duplicate`),

  // Estadísticas
  getStats: () => api.get('/quotes/stats/summary'),
};
