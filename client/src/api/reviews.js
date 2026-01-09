import api from './client';

export const reviewApi = {
  getByPulperia: (pulperiaId, params) => api.get(`/reviews/pulperia/${pulperiaId}`, { params }),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.patch(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};
