import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Briefcase, Edit2, Trash2, X, Check, Users, Eye, EyeOff, Clock,
  CheckCircle, XCircle, Mail
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

  const updateApplicationMutation = useMutation({
    mutationFn: ({ applicationId, status }) => jobApi.updateApplication(applicationId, { status }),
    onSuccess: (_, vars) => {
      const statusText = vars.status === 'ACCEPTED' ? 'aceptada' : 'rechazada';
      toast.success(`Aplicacion ${statusText}`);
      queryClient.invalidateQueries(['my-jobs']);
    },
    onError: () => toast.error('Error al actualizar aplicacion'),
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
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Empleos</h1>
            <p className="text-gray-400 text-sm">{jobs.length} publicaciones</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Publicar Empleo</span>
        </motion.button>
      </motion.div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
              <div className="h-6 w-1/2 bg-dark-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-full bg-dark-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-3/4 bg-dark-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                    {!job.isActive && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-500/20 text-gray-400 rounded-full border border-gray-500/30">
                        Pausado
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 mt-1 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                    {job.salary && (
                      <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 font-medium">
                        {job.salary}
                      </span>
                    )}
                    <span className="px-2.5 py-1 bg-dark-200/50 text-gray-400 rounded-lg border border-white/5">
                      {job.type === 'FULL_TIME' ? 'Tiempo Completo' : 'Medio Tiempo'}
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Users className="w-4 h-4" />
                      {job._count?.applications || 0} aplicaciones
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {new Date(job.createdAt).toLocaleDateString('es-HN')}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(job._count?.applications || 0) > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewApplications(job)}
                      className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                      title="Ver aplicaciones"
                    >
                      <Users className="w-5 h-5" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleActiveMutation.mutate({ id: job.id, isActive: !job.isActive })}
                    className="p-2.5 rounded-xl bg-dark-200/50 text-gray-400 hover:bg-white/5 hover:text-white border border-white/5 transition-colors"
                    title={job.isActive ? 'Pausar' : 'Activar'}
                  >
                    {job.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openModal(job)}
                    className="p-2.5 rounded-xl bg-dark-200/50 text-gray-400 hover:bg-white/5 hover:text-white border border-white/5 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(job)}
                    className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin empleos publicados</h2>
          <p className="text-gray-400 mb-6">Publica tu primera oferta de trabajo</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Publicar Empleo
          </motion.button>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100]"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-dark-100 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto sm:m-4 border border-white/10"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    {editJob ? <Edit2 className="w-5 h-5 text-purple-400" /> : <Briefcase className="w-5 h-5 text-purple-400" />}
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {editJob ? 'Editar Empleo' : 'Publicar Empleo'}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titulo del puesto *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Cajero/a, Despachador, Repartidor..."
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripcion *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe las responsabilidades del puesto..."
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[120px] resize-none"
                    required
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Requisitos
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Experiencia previa, disponibilidad, etc..."
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[80px] resize-none"
                  />
                </div>

                {/* Salary & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Salario
                    </label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="Ej: L. 8,000 - 10,000"
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="FULL_TIME">Tiempo Completo</option>
                      <option value="PART_TIME">Medio Tiempo</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {editJob ? 'Guardar' : 'Publicar'}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applications Modal */}
      <AnimatePresence>
        {viewApplications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100]"
            onClick={(e) => e.target === e.currentTarget && setViewApplications(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-dark-100 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto sm:m-4 border border-white/10"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Aplicaciones</h2>
                    <p className="text-gray-400 text-sm">{viewApplications.title}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewApplications(null)}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-5">
                {viewApplications.applications?.length > 0 ? (
                  <div className="space-y-4">
                    {viewApplications.applications.map((app, index) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-dark-200/50 rounded-xl border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          {app.user.avatar ? (
                            <img src={app.user.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                              <span className="font-bold text-primary-400">{app.user.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white">{app.user.name}</p>
                            <p className="text-sm text-gray-400 truncate">{app.user.email}</p>
                          </div>
                          {/* Status Badge */}
                          <div>
                            {app.status === 'PENDING' && (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                                Pendiente
                              </span>
                            )}
                            {app.status === 'ACCEPTED' && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                Aceptado
                              </span>
                            )}
                            {app.status === 'REJECTED' && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                Rechazado
                              </span>
                            )}
                          </div>
                        </div>
                        {app.coverLetter && (
                          <p className="text-gray-400 mt-3 text-sm">{app.coverLetter}</p>
                        )}
                        {app.contactInfo && (
                          <p className="text-sm text-gray-500 mt-2">
                            <strong className="text-gray-400">Contacto:</strong> {app.contactInfo}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {new Date(app.createdAt).toLocaleDateString('es-HN')}
                          </span>

                          {/* Action Buttons */}
                          {app.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateApplicationMutation.mutate({
                                  applicationId: app.id,
                                  status: 'ACCEPTED'
                                })}
                                disabled={updateApplicationMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 border border-green-500/30 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aceptar
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateApplicationMutation.mutate({
                                  applicationId: app.id,
                                  status: 'REJECTED'
                                })}
                                disabled={updateApplicationMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 border border-red-500/30 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                Rechazar
                              </motion.button>
                            </div>
                          )}

                          {/* Contact button for accepted */}
                          {app.status === 'ACCEPTED' && app.user.email && (
                            <a
                              href={`mailto:${app.user.email}?subject=Aplicacion aceptada - ${viewApplications.title}`}
                              className="flex items-center gap-1 px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-500/30 border border-primary-500/30 transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                              Contactar
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400">Sin aplicaciones aun</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageJobs;
