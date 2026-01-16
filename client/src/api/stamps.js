import api from './client';

export const stampsApi = {
  getMyStamps: () => api.get('/stamps/my-stamps'),
  getStats: () => api.get('/stamps/stats'),
  collect: (pulperiaId) => api.post('/stamps/collect', { pulperiaId }),
};
