import api from './client';

export const expensesApi = {
  // Listar
  list: (params) => api.get('/expenses', { params }),

  // Gastos de hoy
  getToday: () => api.get('/expenses/today'),

  // CRUD
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),

  // Resumen
  getSummary: (period) => api.get('/expenses/summary', { params: { period } }),

  // Reporte mensual
  getMonthlyReport: (year, month) =>
    api.get('/expenses/report/monthly', { params: { year, month } }),

  // Categorías
  getCategories: () => api.get('/expenses/meta/categories'),
};
