import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get fresh token from Firebase (not from localStorage)
    if (auth?.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        console.error('Error getting Firebase token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth storage and redirect to login
      localStorage.removeItem('auth-storage');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const pulperiaApi = {
  getAll: (params) => api.get('/pulperias', { params }),
  getById: (id) => api.get(`/pulperias/${id}`),
  getMine: () => api.get('/pulperias/me'),
  update: (data) => api.patch('/pulperias/me', data),
  updateStatus: (data) => api.patch('/pulperias/me/status', data),
  uploadLogo: (formData) => api.post('/pulperias/me/logo', formData),
  uploadBanner: (formData) => api.post('/pulperias/me/banner', formData),
  toggleFavorite: (id, data) => api.post(`/pulperias/${id}/favorite`, data),
  setupLoyalty: (data) => api.post('/pulperias/me/loyalty', data),
  setVacation: (data) => api.patch('/pulperias/me/status', { status: 'VACATION', ...data }),
  close: () => api.post('/pulperias/me/close'),
};

export const productApi = {
  search: (params) => api.get('/products/search', { params }),
  getByPulperia: (pulperiaId, params) => api.get(`/products/pulperia/${pulperiaId}`, { params }),
  getById: (id) => api.get(`/products/${id}`),
  getMyProducts: (params) => api.get('/products/my-products', { params }),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => {
    // Check if data is FormData (has image) or regular object
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

export const orderApi = {
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getPulperiaOrders: (params) => api.get('/orders/pulperia-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  createBatch: (data) => api.post('/orders/batch', data),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

export const jobApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getMyJobs: () => api.get('/jobs/my-jobs'),
  getMyApplications: () => api.get('/jobs/my-applications'),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.patch(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  apply: (id, formData) => api.post(`/jobs/${id}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateApplication: (id, data) => api.patch(`/jobs/applications/${id}`, data),
};

export const reviewApi = {
  getByPulperia: (pulperiaId, params) => api.get(`/reviews/pulperia/${pulperiaId}`, { params }),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.patch(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

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

export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),
  getInsights: () => api.get('/stats/insights'),
  export: (params) => api.get('/stats/export', { params }),
};

export const userApi = {
  getStats: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
  exportData: () => api.get('/auth/export'),
  deleteAccount: () => api.delete('/auth/me'),
};
