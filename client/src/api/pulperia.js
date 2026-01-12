import api from './client';

export const pulperiaApi = {
  getAll: (params) => api.get('/pulperias', { params }),
  getById: (id) => api.get(`/pulperias/${id}`),
  getMine: () => api.get('/pulperias/me'),
  getFavorites: () => api.get('/pulperias/favorites'),
  update: (data) => api.patch('/pulperias/me', data),
  updateStatus: (data) => api.patch('/pulperias/me/status', data),
  uploadLogo: (formData) => api.post('/pulperias/me/logo', formData),
  uploadBanner: (formData) => api.post('/pulperias/me/banner', formData),
  toggleFavorite: (id, data) => api.post(`/pulperias/${id}/favorite`, data),
  setupLoyalty: (data) => api.post('/pulperias/me/loyalty', data),
  setVacation: (data) => api.patch('/pulperias/me/status', { status: 'VACATION', ...data }),
  close: () => api.post('/pulperias/me/close'),
  uploadStoryImages: (formData) => api.post('/pulperias/me/story-images', formData),
};
