import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Phone, MessageCircle, MapPin, Camera, Plus,
  Trash2, Edit2, X, Check, Wrench
} from 'lucide-react';
import { serviceApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import Zoom from 'react-medium-image-zoom';
import toast from 'react-hot-toast';

const ServiceCatalog = ({ isOwner }) => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [formData, setFormData] = useState({
    profession: '',
    description: '',
  });
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const serviceId = isOwner ? 'mine' : id;

  const { data, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => isOwner ? serviceApi.getMine() : serviceApi.getById(id),
  });

  // getMine() retorna { services: [...] } (array), getById() retorna { service: ... } (singular)
  const service = isOwner
    ? data?.data?.services?.[0]
    : data?.data?.service;
  const serviceUser = service?.user || user;

  const createMutation = useMutation({
    mutationFn: (data) => serviceApi.create(data),
    onSuccess: () => {
      toast.success('Servicio publicado');
      queryClient.invalidateQueries(['service', 'mine']);
      closeModal();
    },
    onError: () => toast.error('Error al crear servicio'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => serviceApi.update(id, data),
    onSuccess: () => {
      toast.success('Servicio actualizado');
      queryClient.invalidateQueries(['service', 'mine']);
      closeModal();
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => serviceApi.delete(id),
    onSuccess: () => {
      toast.success('Servicio eliminado');
      queryClient.invalidateQueries(['service', 'mine']);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const openModal = (existingService = null) => {
    if (existingService) {
      setEditService(existingService);
      setFormData({
        profession: existingService.profession,
        description: existingService.description || '',
      });
      setImages(existingService.images || []);
    } else {
      setEditService(null);
      setFormData({ profession: '', description: '' });
      setImages([]);
    }
    setNewImages([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditService(null);
    setNewImages([]);
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + newImages.length + files.length > 6) {
      toast.error('Maximo 6 imagenes');
      return;
    }
    setNewImages([...newImages, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('profession', formData.profession);
    data.append('description', formData.description);
    newImages.forEach((img) => data.append('images', img));

    if (editService) {
      updateMutation.mutate({ id: editService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleWhatsApp = () => {
    const phone = serviceUser.phone;
    if (phone) {
      window.open(`https://wa.me/504${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  // Define renderModal BEFORE any returns that use it
  const renderModal = () => (
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
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              {editService ? <Edit2 className="w-5 h-5 text-primary-400" /> : <Plus className="w-5 h-5 text-primary-400" />}
            </div>
            <h2 className="text-xl font-bold text-white">
              {editService ? 'Editar Servicio' : 'Nuevo Servicio'}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profesion / Oficio *
            </label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="Ej: Carpintero, Electricista, Plomero..."
              className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripcion
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe los servicios que ofreces, experiencia, disponibilidad..."
              className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[120px] resize-none"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fotos de trabajos ({images.length + newImages.length}/6)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={`existing-${i}`} className="relative aspect-square">
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-white/10" />
                </div>
              ))}
              {newImages.map((file, i) => (
                <div key={`new-${i}`} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover rounded-lg border border-white/10"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 bg-red-500/80 backdrop-blur-sm text-white rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
              ))}
              {images.length + newImages.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition-colors">
                  <Camera className="w-6 h-6 text-gray-500" />
                  <span className="text-xs text-gray-500 mt-1">Agregar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageAdd}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

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
                  {editService ? 'Guardar' : 'Publicar'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-xl bg-dark-200 animate-pulse" />
        <div className="h-8 w-1/2 bg-dark-200 animate-pulse rounded" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-dark-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Owner view with no service yet
  if (isOwner && !service) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Servicios</h1>
            <p className="text-gray-400 text-sm">Ofrece tus habilidades profesionales</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Ofrece tus servicios
          </h2>
          <p className="text-gray-400 mb-6">
            Muestra tus habilidades y encuentra clientes
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Crear Catalogo
          </motion.button>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && renderModal()}
        </AnimatePresence>
      </div>
    );
  }

  // Not found state
  if (!service && !isOwner) {
    return (
      <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center">
        <p className="text-gray-400">Servicio no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      {!isOwner && (
        <Link to="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Ver todos los servicios
        </Link>
      )}

      {isOwner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mis Servicios</h1>
              <p className="text-gray-400 text-sm">Tu catalogo profesional</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal(service)}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </motion.button>
        </motion.div>
      )}

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center gap-4">
          {serviceUser.avatar ? (
            <img
              src={serviceUser.avatar}
              alt={serviceUser.name}
              className="w-20 h-20 rounded-2xl object-cover border border-white/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
              <span className="text-2xl font-bold text-primary-400">
                {serviceUser.name?.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{serviceUser.name}</h1>
            <p className="text-primary-400 font-semibold">{service.profession}</p>
            {service.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium text-white">{service.rating.toFixed(1)}</span>
                <span className="text-gray-500">({service.reviewCount} resenas)</span>
              </div>
            )}
          </div>
        </div>

        {service.description && (
          <p className="text-gray-400 mt-4">{service.description}</p>
        )}

        {/* Contact */}
        {!isOwner && serviceUser.phone && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWhatsApp}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Contactar por WhatsApp
          </motion.button>
        )}
      </motion.div>

      {/* Portfolio */}
      {service.images?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
        >
          <h2 className="font-semibold text-white mb-4">Trabajos Realizados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {service.images.map((img, i) => (
              <Zoom key={i}>
                <img
                  src={img}
                  alt={`Trabajo ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity border border-white/5"
                />
              </Zoom>
            ))}
          </div>
        </motion.div>
      )}

      {/* Delete */}
      {isOwner && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            if (window.confirm('Eliminar tu catalogo de servicios?')) {
              deleteMutation.mutate(service.id);
            }
          }}
          className="w-full bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
        >
          <Trash2 className="w-5 h-5" />
          Eliminar Catalogo
        </motion.button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && renderModal()}
      </AnimatePresence>
    </div>
  );
};

export default ServiceCatalog;
