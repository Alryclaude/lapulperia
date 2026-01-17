import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Briefcase, Wrench, Edit2, Trash2, X, Check, Users, Eye, EyeOff, Clock,
  CheckCircle, XCircle, MessageCircle, Phone, Zap, HandCoins, DollarSign
} from 'lucide-react';
import { chambasApi } from '../../services/api';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  EMPLOYMENT: { label: 'Empleo', icon: Briefcase, color: 'purple' },
  SERVICE: { label: 'Servicio', icon: Wrench, color: 'green' },
  REQUEST: { label: 'Solicitud', icon: HandCoins, color: 'amber' }
};

const ManageChambas = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editChamba, setEditChamba] = useState(null);
  const [viewResponses, setViewResponses] = useState(null);
  const [activeTab, setActiveTab] = useState(''); // '', 'EMPLOYMENT', 'SERVICE', 'REQUEST'
  const [formData, setFormData] = useState({
    type: 'EMPLOYMENT',
    category: 'OTRO',
    title: '',
    description: '',
    priceType: 'NEGOTIABLE',
    priceMin: '',
    priceMax: '',
    salary: '',
    requirements: '',
    duration: '',
    serviceArea: '',
    isPartTime: false,
    isUrgent: false,
    contactPhone: '',
    contactWhatsapp: ''
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['chamba-categories'],
    queryFn: () => chambasApi.getCategories(),
    staleTime: 1000 * 60 * 60
  });

  const categories = categoriesData?.data || [];

  const { data, isLoading } = useQuery({
    queryKey: ['my-chambas', activeTab],
    queryFn: () => chambasApi.getMyList({ type: activeTab || undefined }),
  });

  const chambas = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => chambasApi.create(data),
    onSuccess: () => {
      toast.success('Chamba publicada');
      queryClient.invalidateQueries(['my-chambas']);
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Error al crear'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => chambasApi.update(id, data),
    onSuccess: () => {
      toast.success('Chamba actualizada');
      queryClient.invalidateQueries(['my-chambas']);
      closeModal();
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => chambasApi.delete(id),
    onSuccess: () => {
      toast.success('Chamba eliminada');
      queryClient.invalidateQueries(['my-chambas']);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => chambasApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries(['my-chambas']),
  });

  const updateResponseMutation = useMutation({
    mutationFn: ({ responseId, status, responseNote }) =>
      chambasApi.updateResponse(responseId, { status, responseNote }),
    onSuccess: (_, vars) => {
      const statusText = vars.status === 'ACCEPTED' ? 'aceptada' : 'rechazada';
      toast.success(`Respuesta ${statusText}`);
      queryClient.invalidateQueries(['my-chambas']);
      queryClient.invalidateQueries(['chamba-responses']);
    },
    onError: () => toast.error('Error al actualizar respuesta'),
  });

  const { data: responsesData, isLoading: loadingResponses } = useQuery({
    queryKey: ['chamba-responses', viewResponses?.id],
    queryFn: () => chambasApi.getResponses(viewResponses?.id),
    enabled: !!viewResponses?.id,
  });

  const responses = responsesData?.data || [];

  const openModal = (chamba = null) => {
    if (chamba) {
      setEditChamba(chamba);
      setFormData({
        type: chamba.type,
        category: chamba.category,
        title: chamba.title,
        description: chamba.description || '',
        priceType: chamba.priceType || 'NEGOTIABLE',
        priceMin: chamba.priceMin || '',
        priceMax: chamba.priceMax || '',
        salary: chamba.salary || '',
        requirements: chamba.requirements || '',
        duration: chamba.duration || '',
        serviceArea: chamba.serviceArea || '',
        isPartTime: chamba.isPartTime || false,
        isUrgent: chamba.isUrgent || false,
        contactPhone: chamba.contactPhone || '',
        contactWhatsapp: chamba.contactWhatsapp || ''
      });
    } else {
      setEditChamba(null);
      setFormData({
        type: 'EMPLOYMENT',
        category: 'OTRO',
        title: '',
        description: '',
        priceType: 'NEGOTIABLE',
        priceMin: '',
        priceMax: '',
        salary: '',
        requirements: '',
        duration: '',
        serviceArea: '',
        isPartTime: false,
        isUrgent: false,
        contactPhone: '',
        contactWhatsapp: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditChamba(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      priceMin: formData.priceMin ? parseFloat(formData.priceMin) : null,
      priceMax: formData.priceMax ? parseFloat(formData.priceMax) : null,
    };

    if (editChamba) {
      updateMutation.mutate({ id: editChamba.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (chamba) => {
    if (window.confirm(`¿Eliminar "${chamba.title}"?`)) {
      deleteMutation.mutate(chamba.id);
    }
  };

  const getTypeColor = (type) => {
    const config = TYPE_CONFIG[type];
    return config?.color === 'purple'
      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      : config?.color === 'green'
        ? 'bg-green-500/20 text-green-400 border-green-500/30'
        : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
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
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Chambas</h1>
            <p className="text-gray-400 text-sm">{chambas.length} publicaciones</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nueva Chamba</span>
        </motion.button>
      </motion.div>

      {/* Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${!activeTab
              ? 'bg-primary-500 text-white'
              : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
            }`}
        >
          Todas
        </button>
        {Object.entries(TYPE_CONFIG).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={type}
              onClick={() => setActiveTab(activeTab === type ? '' : type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 ${activeTab === type
                  ? `${getTypeColor(type)} border`
                  : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
                }`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Chambas List */}
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
      ) : chambas.length > 0 ? (
        <div className="space-y-4">
          {chambas.map((chamba, index) => {
            const TypeIcon = TYPE_CONFIG[chamba.type]?.icon || Briefcase;
            return (
              <motion.div
                key={chamba.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getTypeColor(chamba.type)}`}>
                        <TypeIcon className="w-3 h-3" />
                        {TYPE_CONFIG[chamba.type]?.label}
                      </span>
                      {chamba.isUrgent && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                          <Zap className="w-3 h-3" />
                          Urgente
                        </span>
                      )}
                      {!chamba.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-500/20 text-gray-400 rounded-full border border-gray-500/30">
                          Pausada
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-lg">{chamba.title}</h3>
                    <p className="text-gray-400 mt-1 line-clamp-2">{chamba.description}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                      {(chamba.priceMin || chamba.priceMax || chamba.salary) && (
                        <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 font-medium flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {chamba.salary || (
                            chamba.priceMin && chamba.priceMax
                              ? `L ${chamba.priceMin} - L ${chamba.priceMax}`
                              : chamba.priceMin
                                ? `Desde L ${chamba.priceMin}`
                                : `Hasta L ${chamba.priceMax}`
                          )}
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-dark-200/50 text-gray-400 rounded-lg border border-white/5">
                        {categories.find(c => c.value === chamba.category)?.label || chamba.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Users className="w-4 h-4" />
                        {chamba._count?.responses || 0} respuestas
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Eye className="w-4 h-4" />
                        {chamba.viewCount || 0} vistas
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="w-4 h-4" />
                        {new Date(chamba.createdAt).toLocaleDateString('es-HN')}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(chamba._count?.responses || 0) > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewResponses(chamba)}
                        className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                        title="Ver respuestas"
                      >
                        <Users className="w-5 h-5" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleActiveMutation.mutate({ id: chamba.id, isActive: !chamba.isActive })}
                      className="p-2.5 rounded-xl bg-dark-200/50 text-gray-400 hover:bg-white/5 hover:text-white border border-white/5 transition-colors"
                      title={chamba.isActive ? 'Pausar' : 'Activar'}
                    >
                      {chamba.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openModal(chamba)}
                      className="p-2.5 rounded-xl bg-dark-200/50 text-gray-400 hover:bg-white/5 hover:text-white border border-white/5 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(chamba)}
                      className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin chambas publicadas</h2>
          <p className="text-gray-400 mb-6">Publica tu primera chamba</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Chamba
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
              <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-dark-100 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    {editChamba ? <Edit2 className="w-5 h-5 text-primary-400" /> : <Plus className="w-5 h-5 text-primary-400" />}
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {editChamba ? 'Editar Chamba' : 'Nueva Chamba'}
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
                {/* Type Selection */}
                {!editChamba && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de chamba *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, type })}
                            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.type === type
                                ? `${getTypeColor(type)} border-current`
                                : 'bg-dark-200/50 border-white/5 text-gray-400 hover:border-white/10'
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{config.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={
                      formData.type === 'EMPLOYMENT'
                        ? 'Ej: Cajero/a, Despachador...'
                        : formData.type === 'SERVICE'
                          ? 'Ej: Reparación de celulares, Cortes de cabello...'
                          : 'Ej: Busco plomero para reparación...'
                    }
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe los detalles..."
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[100px] resize-none"
                  />
                </div>

                {/* Employment-specific fields */}
                {formData.type === 'EMPLOYMENT' && (
                  <>
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
                      <div className="flex items-end gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isPartTime}
                            onChange={(e) => setFormData({ ...formData, isPartTime: e.target.checked })}
                            className="w-4 h-4 rounded border-white/20 bg-dark-200/50 text-primary-500 focus:ring-primary-500/20"
                          />
                          <span className="text-sm text-gray-300">Medio tiempo</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Service-specific fields */}
                {(formData.type === 'SERVICE' || formData.type === 'REQUEST') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Precio mínimo (L)
                        </label>
                        <input
                          type="number"
                          value={formData.priceMin}
                          onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                          placeholder="0"
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Precio máximo (L)
                        </label>
                        <input
                          type="number"
                          value={formData.priceMax}
                          onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                          placeholder="0"
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Duración estimada
                        </label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="Ej: 1-2 horas"
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Área de servicio
                        </label>
                        <input
                          type="text"
                          value={formData.serviceArea}
                          onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                          placeholder="Ej: Tegucigalpa"
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Contact info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono contacto
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="9999-9999"
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.contactWhatsapp}
                      onChange={(e) => setFormData({ ...formData, contactWhatsapp: e.target.value })}
                      placeholder="+504 9999-9999"
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Urgent toggle */}
                <label className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-dark-200/50 text-red-500 focus:ring-red-500/20"
                  />
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">Marcar como urgente</span>
                  </div>
                </label>

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
                        {editChamba ? 'Guardar' : 'Publicar'}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responses Modal */}
      <AnimatePresence>
        {viewResponses && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100]"
            onClick={(e) => e.target === e.currentTarget && setViewResponses(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-dark-100 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto sm:m-4 border border-white/10"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-dark-100 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Respuestas</h2>
                    <p className="text-gray-400 text-sm truncate max-w-[200px]">{viewResponses.title}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewResponses(null)}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-5">
                {loadingResponses ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : responses.length > 0 ? (
                  <div className="space-y-4">
                    {responses.map((resp, index) => (
                      <motion.div
                        key={resp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-dark-200/50 rounded-xl border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          {resp.user.avatar ? (
                            <img src={resp.user.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                              <span className="font-bold text-primary-400">{resp.user.name?.charAt(0)}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white">{resp.user.name}</p>
                            {resp.user.phone && (
                              <p className="text-sm text-gray-400">{resp.user.phone}</p>
                            )}
                          </div>
                          {/* Status Badge */}
                          <div>
                            {resp.status === 'PENDING' && (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                                Pendiente
                              </span>
                            )}
                            {resp.status === 'ACCEPTED' && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                Aceptada
                              </span>
                            )}
                            {resp.status === 'REJECTED' && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                Rechazada
                              </span>
                            )}
                            {resp.status === 'COMPLETED' && (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                                Completada
                              </span>
                            )}
                          </div>
                        </div>

                        {resp.message && (
                          <p className="text-gray-400 mt-3 text-sm">{resp.message}</p>
                        )}

                        {resp.proposedPrice && (
                          <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Precio propuesto: L {resp.proposedPrice}
                          </p>
                        )}

                        {resp.estimatedTime && (
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Tiempo estimado: {resp.estimatedTime}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {new Date(resp.createdAt).toLocaleDateString('es-HN')}
                          </span>

                          {/* Action Buttons */}
                          {resp.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateResponseMutation.mutate({
                                  responseId: resp.id,
                                  status: 'ACCEPTED'
                                })}
                                disabled={updateResponseMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 border border-green-500/30 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aceptar
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateResponseMutation.mutate({
                                  responseId: resp.id,
                                  status: 'REJECTED'
                                })}
                                disabled={updateResponseMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 border border-red-500/30 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                Rechazar
                              </motion.button>
                            </div>
                          )}

                          {/* Contact buttons for accepted */}
                          {resp.status === 'ACCEPTED' && (
                            <div className="flex gap-2">
                              {resp.user.phone && (
                                <a
                                  href={`https://wa.me/${resp.user.phone.replace(/\D/g, '')}?text=Hola, acepto tu propuesta para "${viewResponses.title}"`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 border border-green-500/30 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  WhatsApp
                                </a>
                              )}
                              {resp.user.phone && (
                                <a
                                  href={`tel:${resp.user.phone}`}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-500/30 border border-primary-500/30 transition-colors"
                                >
                                  <Phone className="w-4 h-4" />
                                  Llamar
                                </a>
                              )}
                            </div>
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
                    <p className="text-gray-400">Sin respuestas aún</p>
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

export default ManageChambas;
