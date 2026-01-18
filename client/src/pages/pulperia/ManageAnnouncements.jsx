import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Eye,
  MessageCircle,
  Clock,
  Trash2,
  RefreshCw,
  Edit3,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { announcementsApi } from '@/api';
import { AnnouncementFormModal } from '@/components/announcements';
import { Card } from '@/components/ui/card';

/**
 * ManageAnnouncements - Página de gestión de anuncios para pulperías
 */
const ManageAnnouncements = () => {
  const queryClient = useQueryClient();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'expired'

  // Query para obtener mis anuncios
  const { data, isLoading } = useQuery({
    queryKey: ['my-announcements', activeTab],
    queryFn: () => announcementsApi.getMine({ status: activeTab }),
  });

  const announcements = data?.data?.announcements || [];
  const counts = data?.data?.counts || { active: 0, expired: 0, maxAllowed: 3 };

  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: (formData) => announcementsApi.create(formData),
    onSuccess: () => {
      toast.success('Anuncio publicado');
      queryClient.invalidateQueries({ queryKey: ['my-announcements'] });
      closeFormModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al publicar');
    },
  });

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => announcementsApi.update(id, formData),
    onSuccess: () => {
      toast.success('Anuncio actualizado');
      queryClient.invalidateQueries({ queryKey: ['my-announcements'] });
      closeFormModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar');
    },
  });

  // Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: (id) => announcementsApi.delete(id),
    onSuccess: () => {
      toast.success('Anuncio eliminado');
      queryClient.invalidateQueries({ queryKey: ['my-announcements'] });
      setDeleteConfirm(null);
    },
    onError: () => {
      toast.error('Error al eliminar');
    },
  });

  // Mutation para renovar
  const renewMutation = useMutation({
    mutationFn: (id) => announcementsApi.renew(id),
    onSuccess: () => {
      toast.success('Anuncio renovado por 7 días');
      queryClient.invalidateQueries({ queryKey: ['my-announcements'] });
    },
    onError: () => {
      toast.error('Error al renovar');
    },
  });

  // Handlers
  const openCreateModal = () => {
    if (counts.active >= counts.maxAllowed) {
      toast.error(`Ya tienes ${counts.maxAllowed} anuncios activos. Elimina uno para crear más.`);
      return;
    }
    setEditAnnouncement(null);
    setShowFormModal(true);
  };

  const openEditModal = (announcement) => {
    setEditAnnouncement(announcement);
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditAnnouncement(null);
  };

  const handleSubmit = async ({ formData, editAnnouncement }) => {
    if (editAnnouncement) {
      await updateMutation.mutateAsync({ id: editAnnouncement.id, formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  // Calcular días restantes
  const getDaysRemaining = (expiresAt) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Verificar si está expirado
  const isExpired = (expiresAt) => new Date(expiresAt) <= new Date();

  return (
    <div className="space-y-6 pb-40 md:pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Anuncios</h1>
            <p className="text-gray-400 text-sm">
              {counts.active}/{counts.maxAllowed} activos
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          disabled={counts.active >= counts.maxAllowed}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo</span>
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'bg-dark-200/50 text-gray-400 border border-transparent hover:bg-dark-200'
            }`}
          >
            Activos ({counts.active})
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-colors ${
              activeTab === 'expired'
                ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                : 'bg-dark-200/50 text-gray-400 border border-transparent hover:bg-dark-200'
            }`}
          >
            Expirados ({counts.expired})
          </button>
        </div>

        {/* Lista de anuncios */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-28 bg-dark-200/50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/20 flex items-center justify-center">
              <Megaphone className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">
              {activeTab === 'active' ? 'Sin anuncios activos' : 'Sin anuncios expirados'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {activeTab === 'active'
                ? 'Publica tu primera oferta para atraer clientes'
                : 'Los anuncios expirados aparecerán aquí'}
            </p>
            {activeTab === 'active' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreateModal}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
              >
                Crear primer anuncio
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {announcements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Card className="p-4 bg-dark-100/80">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={announcement.imageUrl}
                          alt={announcement.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {announcement.title}
                        </h3>
                        {announcement.price && (
                          <p className="text-accent-400 font-bold text-sm">
                            L. {announcement.price.toLocaleString()}
                          </p>
                        )}

                        {/* Métricas */}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {announcement.viewCount} vistas
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {announcement.contactCount} contactos
                          </span>
                          {!isExpired(announcement.expiresAt) && (
                            <span className="flex items-center gap-1 text-primary-400">
                              <Clock className="w-3 h-3" />
                              {getDaysRemaining(announcement.expiresAt)} días
                            </span>
                          )}
                          {isExpired(announcement.expiresAt) && (
                            <span className="flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              Expirado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                      {/* Renovar (solo si expirado o próximo a expirar) */}
                      {(isExpired(announcement.expiresAt) ||
                        getDaysRemaining(announcement.expiresAt) <= 2) && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => renewMutation.mutate(announcement.id)}
                          disabled={renewMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Renovar
                        </motion.button>
                      )}

                      {/* Editar */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(announcement)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-dark-200/50 hover:bg-dark-200 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar
                      </motion.button>

                      {/* Eliminar */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDeleteConfirm(announcement)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Modal de formulario */}
      <AnnouncementFormModal
        isOpen={showFormModal}
        onClose={closeFormModal}
        editAnnouncement={editAnnouncement}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-100 rounded-2xl max-w-sm w-full p-6 border border-white/10"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg text-center mb-2">
                Eliminar anuncio
              </h3>
              <p className="text-gray-400 text-sm text-center mb-6">
                ¿Seguro que quieres eliminar "{deleteConfirm.title}"? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-dark-200/50 hover:bg-dark-200 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                >
                  {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Action Bar (Mobile) */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] left-0 right-0 z-[55] px-4 md:hidden"
      >
        <div className="bg-dark-100/95 backdrop-blur-lg border border-white/10 rounded-2xl p-3 shadow-xl">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            disabled={counts.active >= counts.maxAllowed}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors min-h-[48px]"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Anuncio</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageAnnouncements;
