import api from './client';

export const pulperiaServicesApi = {
  getMyServices: () => api.get('/pulperia-services/my-services'),
  getByPulperia: (pulperiaId) => api.get(`/pulperia-services/pulperia/${pulperiaId}`),
  getById: (id) => api.get(`/pulperia-services/${id}`),
  create: (formData) => api.post('/pulperia-services', formData),
  update: (id, data) => api.patch(`/pulperia-services/${id}`, data),
  updateImage: (id, formData) => api.patch(`/pulperia-services/${id}/image`, formData),
  delete: (id) => api.delete(`/pulperia-services/${id}`),
};
