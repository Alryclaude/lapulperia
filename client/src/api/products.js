import api from './client';

export const productApi = {
  search: (params) => api.get('/products/search', { params }),
  getByPulperia: (pulperiaId, params) => api.get(`/products/pulperia/${pulperiaId}`, { params }),
  getById: (id) => api.get(`/products/${id}`),
  getMyProducts: (params) => api.get('/products/my-products', { params }),
  create: (formData) => api.post('/products', formData),
  update: (id, data) => api.patch(`/products/${id}`, data),
  updateImage: (id, formData) => api.patch(`/products/${id}/image`, formData),
  toggleStock: (id) => api.patch(`/products/${id}/stock`),
  toggleFeatured: (id) => api.patch(`/products/${id}/featured`),
  delete: (id) => api.delete(`/products/${id}`),
  createAlert: (id) => api.post(`/products/${id}/alert`),
  // Stock management
  updateStockQuantity: (id, data) => api.patch(`/products/${id}/stock-quantity`, data),
  getLowStock: () => api.get('/products/low-stock'),
  bulkStockUpdate: (updates) => api.post('/products/bulk-stock', { updates }),
  // Bulk create with images
  bulkCreateWithImages: (formData) => api.post('/products/bulk-create-with-images', formData, {
    timeout: 120000, // 2 minutos para uploads grandes en redes lentas
  }),
};
