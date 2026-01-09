import api from './client';

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
