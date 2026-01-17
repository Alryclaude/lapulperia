import api from './client';

export const orderApi = {
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getPulperiaOrders: (params) => api.get('/orders/pulperia-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  createBatch: (data) => api.post('/orders/batch', data),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),

  // Quick Sale (venta rápida sin productos)
  quickSale: (data) => api.post('/orders/quick-sale', data),
  getQuickSalesToday: () => api.get('/orders/quick-sales/today'),
  deleteQuickSale: (id) => api.delete(`/orders/quick-sale/${id}`),
};
