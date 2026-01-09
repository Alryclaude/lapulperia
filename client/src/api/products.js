import api from './client';

export const productApi = {
  search: (params) => api.get('/products/search', { params }),
  getByPulperia: (pulperiaId, params) => api.get(`/products/pulperia/${pulperiaId}`, { params }),
  getById: (id) => api.get(`/products/${id}`),
  getMyProducts: (params) => api.get('/products/my-products', { params }),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.patch(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.patch(`/products/${id}`, data);
  },
  updateImage: (id, formData) => api.patch(`/products/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  toggleStock: (id) => api.patch(`/products/${id}/stock`),
  toggleFeatured: (id) => api.patch(`/products/${id}/featured`),
  delete: (id) => api.delete(`/products/${id}`),
  createAlert: (id) => api.post(`/products/${id}/alert`),
};
