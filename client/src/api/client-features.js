import api from './client';

export const clientFeaturesApi = {
  // Product favorites
  getFavoriteProducts: () => api.get('/client/favorites/products'),
  toggleProductFavorite: (productId) => api.post(`/client/favorites/products/${productId}`),
  checkProductFavorite: (productId) => api.get(`/client/favorites/products/${productId}/check`),

  // Reorder
  getReorderData: (orderId) => api.get(`/client/reorder/${orderId}`),

  // Shopping lists
  getShoppingLists: () => api.get('/client/shopping-lists'),
  createShoppingList: (data) => api.post('/client/shopping-lists', data),
  updateShoppingList: (id, data) => api.patch(`/client/shopping-lists/${id}`, data),
  deleteShoppingList: (id) => api.delete(`/client/shopping-lists/${id}`),

  // Product alerts
  getProductAlerts: () => api.get('/client/alerts'),
  createProductAlert: (productId) => api.post(`/client/alerts/${productId}`),
  deleteProductAlert: (productId) => api.delete(`/client/alerts/${productId}`),
};
