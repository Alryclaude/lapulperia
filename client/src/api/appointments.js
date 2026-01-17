import api from './client';

export const appointmentsApi = {
  // Listar (negocio)
  list: (params) => api.get('/appointments', { params }),

  // Mis citas (cliente)
  getMyAppointments: (params) => api.get('/appointments/my', { params }),

  // Detalle
  getById: (id) => api.get(`/appointments/${id}`),

  // CRUD
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),

  // Disponibilidad
  getAvailableSlots: (pulperiaId, date) =>
    api.get(`/appointments/available/${pulperiaId}`, { params: { date } }),

  // Estadísticas
  getStats: () => api.get('/appointments/stats/summary'),
};
