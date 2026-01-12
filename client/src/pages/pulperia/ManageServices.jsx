import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Wrench, Eye, EyeOff, Edit2, Trash2, DollarSign, Clock } from 'lucide-react';
import { pulperiaServicesApi } from '../../api';
import toast from 'react-hot-toast';
import { PulperiaServiceFormModal } from '../../components/services';

const ManageServices = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-services'],
    queryFn: () => pulperiaServicesApi.getMyServices(),
  });

  const services = data?.data?.services || data?.data || [];

  // Filter services by search
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(search.toLowerCase()) ||
    service.description?.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (data) => pulperiaServicesApi.create(data),
    onSuccess: () => {
      toast.success('Servicio creado');
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al crear servicio'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => pulperiaServicesApi.update(id, data),
    onSuccess: () => {
      toast.success('Servicio actualizado');
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => pulperiaServicesApi.delete(id),
    onSuccess: () => {
      toast.success('Servicio eliminado');
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      setDeleteConfirm(null);
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al eliminar'),
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }) => pulperiaServicesApi.update(id, { isAvailable }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-services'] }),
  });

  const openModal = (service = null) => {
    setEditService(service);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditService(null);
  };

  const handleSubmit = async (formData) => {
    if (editService) {
      updateMutation.mutate({ id: editService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleAvailability = (service) => {
    toggleAvailabilityMutation.mutate({ id: service.id, isAvailable: !service.isAvailable });
    toast.success(service.isAvailable ? 'Servicio desactivado' : 'Servicio activado');
  };

  const getPriceDisplay = (service) => {
    if (service.priceType === 'NEGOTIABLE') return 'Precio negociable';
    if (!service.price) return 'Gratis';
    if (service.priceType === 'HOURLY') return `L. ${service.price.toFixed(2)}/hora`;
    return `L. ${service.price.toFixed(2)}`;
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
            <Wrench className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Servicios</h1>
            <p className="text-gray-400 text-sm">Ofrece servicios adicionales a tus clientes</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo Servicio</span>
        </motion.button>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
      >
        <p className="text-sm text-purple-300">
          Agrega servicios como delivery, recargas, pago de servicios, etc. Estos apareceran en tu perfil de pulperia.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar servicios..."
          className="w-full pl-12 pr-4 py-3 bg-dark-100/60 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
        />
      </motion.div>

      {/* Services List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-dark-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/3 bg-dark-200 animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-dark-200 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 transition-all hover:border-white/10 ${
                !service.isAvailable ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl bg-dark-200 overflow-hidden flex-shrink-0">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white">{service.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{service.description}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${
                      service.isAvailable
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {service.isAvailable ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Price & Duration */}
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-sm text-purple-400">
                      <DollarSign className="w-4 h-4" />
                      {getPriceDisplay(service)}
                    </span>
                    {service.duration && (
                      <span className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        {service.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => openModal(service)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-200/50 hover:bg-dark-200 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleToggleAvailability(service)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    service.isAvailable
                      ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                  }`}
                >
                  {service.isAvailable ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Activar
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDeleteConfirm(service)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin servicios</h2>
          <p className="text-gray-400 mb-6">Agrega tu primer servicio para comenzar</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Servicio
          </motion.button>
        </motion.div>
      )}

      {/* Service Form Modal */}
      <PulperiaServiceFormModal
        isOpen={showModal}
        onClose={closeModal}
        editService={editService}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-100 rounded-2xl border border-white/10 p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Eliminar Servicio</h3>
            <p className="text-gray-400 mb-6">
              Estas seguro de eliminar "{deleteConfirm.name}"? Esta accion no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-200 hover:bg-dark-300 text-white font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
