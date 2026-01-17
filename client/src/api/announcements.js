import api from './client';

export const announcementsApi = {
  // Feed público (requiere geolocalización)
  getFeed: (params) => api.get('/announcements', { params }),

  // Detalle de un anuncio
  getById: (id) => api.get(`/announcements/${id}`),

  // Mis anuncios (pulpería)
  getMine: (params) => api.get('/announcements/mine', { params }),

  // Crear anuncio (FormData con imagen)
  create: (formData) => api.post('/announcements', formData),

  // Actualizar anuncio
  update: (id, formData) => api.patch(`/announcements/${id}`, formData),

  // Eliminar anuncio
  delete: (id) => api.delete(`/announcements/${id}`),

  // Renovar anuncio (+7 días)
  renew: (id) => api.post(`/announcements/${id}/renew`),

  // Registrar contacto (click en WhatsApp)
  registerContact: (id) => api.post(`/announcements/${id}/contact`),
};
