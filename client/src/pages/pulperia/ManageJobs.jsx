import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Briefcase, Edit2, Trash2, X, Check, Users, Eye, EyeOff, Clock
} from 'lucide-react';
import { jobApi } from '../../services/api';
import toast from 'react-hot-toast';

const ManageJobs = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [viewApplications, setViewApplications] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    type: 'FULL_TIME',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => jobApi.getMyJobs(),
  });

  const jobs = data?.data?.jobs || [];

  const createMutation = useMutation({
    mutationFn: (data) => jobApi.create(data),
    onSuccess: () => {
      toast.success('Empleo publicado');
      queryClient.invalidateQueries(['my-jobs']);
      closeModal();
    },
    onError: () => toast.error('Error al crear empleo'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => jobApi.update(id, data),
    onSuccess: () => {
      toast.success('Empleo actualizado');
      queryClient.invalidateQueries(['my-jobs']);
      closeModal();
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobApi.delete(id),
    onSuccess: () => {
      toast.success('Empleo eliminado');
      queryClient.invalidateQueries(['my-jobs']);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => jobApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries(['my-jobs']),
  });

  const openModal = (job = null) => {
    if (job) {
      setEditJob(job);
      setFormData({
        title: job.title,
        description: job.description,
        requirements: job.requirements || '',
        salary: job.salary || '',
        type: job.type || 'FULL_TIME',
      });
    } else {
      setEditJob(null);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        salary: '',
        type: 'FULL_TIME',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditJob(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editJob) {
      updateMutation.mutate({ id: editJob.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (job) => {
    if (window.confirm(`Eliminar "${job.title}"?`)) {
      deleteMutation.mutate(job.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Empleos</h1>
          <p className="text-gray-500">{jobs.length} publicaciones</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Publicar Empleo
        </button>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-6 w-1/2 mb-2" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                    {!job.isActive && (
                      <span className="badge-gray">Pausado</span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    {job.salary && (
                      <span className="text-green-600 font-medium">{job.salary}</span>
                    )}
                    <span className="badge-gray">{job.type === 'FULL_TIME' ? 'Tiempo Completo' : 'Medio Tiempo'}</span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      {job._count?.applications || 0} aplicaciones
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {new Date(job.createdAt).toLocaleDateString('es-HN')}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {(job._count?.applications || 0) > 0 && (
                    <button
                      onClick={() => setViewApplications(job)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                      title="Ver aplicaciones"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => toggleActiveMutation.mutate({ id: job.id, isActive: !job.isActive })}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    title={job.isActive ? 'Pausar' : 'Activar'}
                  >
                    {job.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openModal(job)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(job)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin empleos publicados</h2>
          <p className="text-gray-500 mb-6">Publica tu primera oferta de trabajo</p>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="w-5 h-5" />
            Publicar Empleo
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editJob ? 'Editar Empleo' : 'Publicar Empleo'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titulo del puesto *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Cajero/a, Despachador, Repartidor..."
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripcion *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe las responsabilidades del puesto..."
                  className="input min-h-[120px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Experiencia previa, disponibilidad, etc..."
                  className="input min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salario
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="Ej: L. 8,000 - 10,000"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                  >
                    <option value="FULL_TIME">Tiempo Completo</option>
                    <option value="PART_TIME">Medio Tiempo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editJob ? 'Guardar' : 'Publicar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {viewApplications && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Aplicaciones</h2>
                <p className="text-gray-500">{viewApplications.title}</p>
              </div>
              <button onClick={() => setViewApplications(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {viewApplications.applications?.length > 0 ? (
                <div className="space-y-4">
                  {viewApplications.applications.map((app) => (
                    <div key={app.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        {app.user.avatar ? (
                          <img src={app.user.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                            <span className="font-bold text-primary-600">{app.user.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{app.user.name}</p>
                          <p className="text-sm text-gray-500">{app.user.email}</p>
                        </div>
                      </div>
                      {app.message && (
                        <p className="text-gray-600 mt-3">{app.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(app.createdAt).toLocaleDateString('es-HN')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Sin aplicaciones aun</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
