import api from './client';

export const chambasApi = {
  // Públicas
  list: (params) => api.get('/chambas', { params }),
  getById: (id) => api.get(`/chambas/${id}`),
  getCategories: () => api.get('/chambas/meta/categories'),

  // Mis chambas (como dueño)
  getMyList: (params) => api.get('/chambas/my/list', { params }),

  // CRUD
  create: (data) => api.post('/chambas', data),
  update: (id, data) => api.put(`/chambas/${id}`, data),
  delete: (id) => api.delete(`/chambas/${id}`),

  // Respuestas
  respond: (id, data) => api.post(`/chambas/${id}/respond`, data),
  getResponses: (id) => api.get(`/chambas/${id}/responses`),
  updateResponse: (responseId, data) => api.put(`/chambas/response/${responseId}`, data),

  // Mis aplicaciones
  getMyApplications: () => api.get('/chambas/my/applications'),
};
