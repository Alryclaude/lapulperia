import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Tag, Calendar, Percent, DollarSign, Gift, Play, Pause, Trash2, Edit2, Clock, Users } from 'lucide-react';
import { promotionsApi } from '../../api';
import toast from 'react-hot-toast';
import { PromotionFormModal } from '../../components/promotions';

const TABS = [
  { id: 'active', label: 'Activas' },
  { id: 'scheduled', label: 'Programadas' },
  { id: 'ended', label: 'Finalizadas' },
];

const ManagePromotions = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [editPromotion, setEditPromotion] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-promotions'],
    queryFn: () => promotionsApi.getAll(),
  });

  const promotions = data?.data?.promotions || data?.data || [];

  // Filter and categorize promotions
  const now = new Date();
  const categorizedPromotions = {
    active: promotions.filter(p => {
      const startDate = new Date(p.startDate);
      const endDate = p.endDate ? new Date(p.endDate) : null;
      return p.isActive && startDate <= now && (!endDate || endDate >= now);
    }),
    scheduled: promotions.filter(p => {
      const startDate = new Date(p.startDate);
      return p.isActive && startDate > now;
    }),
    ended: promotions.filter(p => {
      const endDate = p.endDate ? new Date(p.endDate) : null;
      return !p.isActive || (endDate && endDate < now);
    }),
  };

  // Apply search filter
  const filteredPromotions = categorizedPromotions[activeTab].filter(promo =>
    promo.name.toLowerCase().includes(search.toLowerCase()) ||
    promo.description?.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (data) => promotionsApi.create(data),
    onSuccess: () => {
      toast.success('Promocion creada');
      queryClient.invalidateQueries({ queryKey: ['my-promotions'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al crear promocion'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => promotionsApi.update(id, data),
    onSuccess: () => {
      toast.success('Promocion actualizada');
      queryClient.invalidateQueries({ queryKey: ['my-promotions'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => promotionsApi.delete(id),
    onSuccess: () => {
      toast.success('Promocion eliminada');
      queryClient.invalidateQueries({ queryKey: ['my-promotions'] });
      setDeleteConfirm(null);
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al eliminar'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => promotionsApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-promotions'] }),
  });

  const openModal = (promotion = null) => {
    setEditPromotion(promotion);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditPromotion(null);
  };

  const handleSubmit = async (formData) => {
    if (editPromotion) {
      updateMutation.mutate({ id: editPromotion.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (promotion) => {
    toggleActiveMutation.mutate({ id: promotion.id, isActive: !promotion.isActive });
    toast.success(promotion.isActive ? 'Promocion pausada' : 'Promocion activada');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PERCENTAGE': return Percent;
      case 'FIXED_AMOUNT': return DollarSign;
      case 'BUY_X_GET_Y': return Gift;
      default: return Tag;
    }
  };

  const getTypeLabel = (promo) => {
    switch (promo.type) {
      case 'PERCENTAGE': return `${promo.value}% de descuento`;
      case 'FIXED_AMOUNT': return `L. ${promo.value.toFixed(2)} de descuento`;
      case 'BUY_X_GET_Y': return `${promo.buyQuantity}x${promo.getQuantity}`;
      default: return promo.type;
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-HN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Tag className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Promociones</h1>
            <p className="text-gray-400 text-sm">Crea descuentos y ofertas especiales</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nueva Promocion</span>
        </motion.button>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
      >
        <p className="text-sm text-amber-300">
          Las promociones apareceran automaticamente a tus clientes cuando esten activas. Puedes programarlas para fechas especiales.
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
          placeholder="Buscar promociones..."
          className="w-full pl-12 pr-4 py-3 bg-dark-100/60 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
        />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-dark-100/50 text-gray-400 border border-white/5 hover:bg-dark-100 hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-md text-xs ${
              activeTab === tab.id ? 'bg-white/10' : 'bg-dark-200'
            }`}>
              {categorizedPromotions[tab.id].length}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Promotions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-dark-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/3 bg-dark-200 animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-dark-200 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPromotions.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredPromotions.map((promotion, index) => {
              const TypeIcon = getTypeIcon(promotion.type);
              const daysRemaining = getDaysRemaining(promotion.endDate);

              return (
                <motion.div
                  key={promotion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 transition-all hover:border-white/10 ${
                    !promotion.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-6 h-6 text-amber-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-white">{promotion.name}</h3>
                          <p className="text-sm text-gray-400 line-clamp-1 mt-0.5">{promotion.description}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${
                          promotion.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {promotion.isActive ? 'Activa' : 'Pausada'}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className="flex items-center gap-1.5 text-sm text-amber-400">
                          <TypeIcon className="w-4 h-4" />
                          {getTypeLabel(promotion)}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(promotion.startDate)}
                          {promotion.endDate && ` - ${formatDate(promotion.endDate)}`}
                        </span>
                        {daysRemaining !== null && daysRemaining > 0 && (
                          <span className="flex items-center gap-1.5 text-sm text-blue-400">
                            <Clock className="w-4 h-4" />
                            {daysRemaining} dias restantes
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      {promotion.usageCount > 0 && (
                        <div className="mt-3 p-3 bg-dark-200/50 rounded-xl">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-gray-400">
                              <Users className="w-4 h-4" />
                              Usada {promotion.usageCount} veces
                            </span>
                            {promotion.maxUsage && (
                              <span className="text-gray-500">
                                de {promotion.maxUsage} max
                              </span>
                            )}
                          </div>
                          {promotion.maxUsage && (
                            <div className="mt-2 h-1.5 bg-dark-300 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{ width: `${Math.min((promotion.usageCount / promotion.maxUsage) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => openModal(promotion)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-200/50 hover:bg-dark-200 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleActive(promotion)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        promotion.isActive
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                      }`}
                    >
                      {promotion.isActive ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Activar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(promotion)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {activeTab === 'active' ? 'Sin promociones activas' :
             activeTab === 'scheduled' ? 'Sin promociones programadas' :
             'Sin promociones finalizadas'}
          </h2>
          <p className="text-gray-400 mb-6">
            {activeTab === 'active' ? 'Crea tu primera promocion para atraer mas clientes' :
             activeTab === 'scheduled' ? 'Programa promociones para fechas especiales' :
             'Las promociones finalizadas apareceran aqui'}
          </p>
          {activeTab !== 'ended' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Promocion
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Promotion Form Modal */}
      <PromotionFormModal
        isOpen={showModal}
        onClose={closeModal}
        editPromotion={editPromotion}
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
            <h3 className="text-lg font-semibold text-white mb-2">Eliminar Promocion</h3>
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

export default ManagePromotions;
