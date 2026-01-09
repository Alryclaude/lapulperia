import api from './client';

export const serviceApi = {
  getAll: (params) => api.get('/services', { params }),
  getMyCatalogs: () => api.get('/services/my-catalogs'),
  getById: (id) => api.get(`/services/${id}`),
  getByUser: (userId) => api.get(`/services/user/${userId}`),
  create: (formData) => api.post('/services', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.patch(`/services/${id}`, data),
  addImages: (id, formData) => api.post(`/services/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeImage: (id, imageIndex) => api.delete(`/services/${id}/images/${imageIndex}`),
  delete: (id) => api.delete(`/services/${id}`),
};
