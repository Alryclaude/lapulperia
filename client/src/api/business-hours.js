import api from './client';

export const businessHoursApi = {
  getMine: () => api.get('/business-hours'),
  getByPulperia: (pulperiaId) => api.get(`/business-hours/pulperia/${pulperiaId}`),
  update: (data) => api.put('/business-hours', data),
};
