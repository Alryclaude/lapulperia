import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, MapPin, Phone, Camera, Save, Trash2, Download,
  AlertTriangle, Palmtree, X, Loader2, Settings, BookOpen,
  Calendar, MessageCircle, Globe, CreditCard, Receipt, Truck,
  ChevronRight, Tag, Facebook, Instagram, Music2, Twitter, Youtube, Send
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../../constants/categories';

// Configuración de redes sociales
const SOCIAL_NETWORKS = [
  { id: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'facebook.com/tu-pagina', color: 'text-blue-400' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@tu_usuario', color: 'text-pink-400' },
  { id: 'tiktok', label: 'TikTok', icon: Music2, placeholder: '@tu_usuario', color: 'text-gray-300' },
  { id: 'twitter', label: 'X (Twitter)', icon: Twitter, placeholder: '@tu_usuario', color: 'text-sky-400' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'youtube.com/@tu-canal', color: 'text-red-400' },
  { id: 'telegram', label: 'Telegram', icon: Send, placeholder: '@tu_usuario', color: 'text-sky-300' },
];
import { Link } from 'react-router-dom';
import { pulperiaApi, userApi } from '../../services/api';
import { reverseGeocode } from '../../services/geocoding';
import toast from 'react-hot-toast';

const PulperiaSettings = () => {
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [vacationMessage, setVacationMessage] = useState('');
  const [vacationReturn, setVacationReturn] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-pulperia'],
    queryFn: () => pulperiaApi.getMine(),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const pulperia = data?.data?.pulperia;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    reference: '',
    phone: '',
    whatsapp: '',
    story: '',
    foundedYear: '',
    latitude: null,
    longitude: null,
    categories: [],
    socialLinks: {},
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // Sync form when data loads
  React.useEffect(() => {
    if (pulperia) {
      setFormData({
        name: pulperia.name || '',
        description: pulperia.description || '',
        address: pulperia.address || '',
        reference: pulperia.reference || '',
        phone: pulperia.phone || '',
        whatsapp: pulperia.whatsapp || '',
        story: pulperia.story || '',
        foundedYear: pulperia.foundedYear || '',
        latitude: pulperia.latitude || null,
        longitude: pulperia.longitude || null,
        categories: pulperia.categories || [],
        socialLinks: pulperia.socialLinks || {},
      });
      setLogoPreview(pulperia.logo);
      setBannerPreview(pulperia.banner);
    }
  }, [pulperia]);

  // Función para obtener ubicación con geocoding reverso
  const handleGetLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      return;
    }

    setIsGettingLocation(true);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Get address from coordinates using reverse geocoding
      const { address } = await reverseGeocode(latitude, longitude);

      setFormData(prev => ({
        ...prev,
        latitude,
        longitude,
        // Only auto-fill if address field is empty
        address: prev.address || address || '',
      }));

      if (address) {
        toast.success('Ubicación y dirección obtenidas');
      } else {
        toast.success('Ubicación actualizada');
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      toast.error('No se pudo obtener la ubicación');
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  const updateMutation = useMutation({
    mutationFn: (data) => pulperiaApi.update(data),
    onSuccess: () => {
      toast.success('Cambios guardados');
      queryClient.invalidateQueries(['my-pulperia']);
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al guardar'),
  });

  const uploadLogoMutation = useMutation({
    mutationFn: (file) => {
      const form = new FormData();
      form.append('logo', file);
      return pulperiaApi.uploadLogo(form);
    },
    onSuccess: () => {
      toast.success('Logo actualizado');
      queryClient.invalidateQueries(['my-pulperia']);
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al subir logo'),
  });

  const uploadBannerMutation = useMutation({
    mutationFn: (file) => {
      const form = new FormData();
      form.append('banner', file);
      return pulperiaApi.uploadBanner(form);
    },
    onSuccess: () => {
      toast.success('Banner actualizado');
      queryClient.invalidateQueries(['my-pulperia']);
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al subir banner'),
  });

  const vacationMutation = useMutation({
    mutationFn: (data) => pulperiaApi.setVacation(data),
    onSuccess: () => {
      toast.success('Modo vacaciones activado');
      queryClient.invalidateQueries(['my-pulperia']);
      setShowVacationModal(false);
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al activar vacaciones'),
  });

  const exportMutation = useMutation({
    mutationFn: (format) => userApi.exportData(format),
    onSuccess: (data, format) => {
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lapulperia-backup-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      toast.success('Datos exportados');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      toast.success('Cuenta eliminada');
      window.location.href = '/';
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al eliminar cuenta'),
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      uploadLogoMutation.mutate(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
      uploadBannerMutation.mutate(file);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      ...formData,
      foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
      categories: formData.categories,
      socialLinks: formData.socialLinks,
    });
  };

  // Toggle categoría
  const toggleCategory = (categoryId) => {
    setFormData(prev => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories };
    });
  };

  // Actualizar red social
  const updateSocialLink = (networkId, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [networkId]: value || undefined, // undefined para eliminar campos vacíos
      },
    }));
  };

  const handleVacation = () => {
    vacationMutation.mutate({
      vacationMessage,
      vacationUntil: vacationReturn,
    });
  };

  const handleDelete = () => {
    if (deleteConfirm === pulperia?.name) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="h-48 bg-dark-100/60 rounded-2xl animate-pulse" />
        <div className="h-8 w-1/2 bg-dark-100/60 rounded animate-pulse" />
        <div className="h-32 bg-dark-100/60 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Settings className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-gray-400 text-sm">Personaliza tu pulpería</p>
        </div>
      </motion.div>

      {/* Quick Settings Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <Link to="/pulperia/payments">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4 flex items-center gap-3 hover:border-green-500/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Métodos de Pago</p>
              <p className="text-xs text-gray-500">Bancos y billeteras</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </motion.div>
        </Link>

        <Link to="/pulperia/fiado">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4 flex items-center gap-3 hover:border-amber-500/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Sistema de Fiado</p>
              <p className="text-xs text-gray-500">Crédito a clientes</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </motion.div>
        </Link>

        <Link to="/pulperia/shipping">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4 flex items-center gap-3 hover:border-purple-500/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Envíos</p>
              <p className="text-xs text-gray-500">Tienda online</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </motion.div>
        </Link>
      </motion.div>

      {/* Banner & Logo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
      >
        {/* Banner */}
        <div className="relative h-40 bg-gradient-to-br from-primary-600 to-primary-800">
          {bannerPreview && (
            <img src={bannerPreview} alt="" className="w-full h-full object-cover" />
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="text-white text-center">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 border border-white/20">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Cambiar banner</span>
            </div>
            <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
          </label>

          {/* Logo */}
          <div className="absolute -bottom-10 left-6">
            <div className="relative">
              {logoPreview ? (
                <img src={logoPreview} alt="" className="w-24 h-24 rounded-2xl border-4 border-dark-100 shadow-lg object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-dark-100 shadow-lg bg-primary-500/20 flex items-center justify-center">
                  <Store className="w-10 h-10 text-primary-400" />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-14 p-6">
          <p className="text-sm text-gray-500">Click en las imágenes para cambiarlas</p>
        </div>
      </motion.div>

      {/* Basic Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6 space-y-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Store className="w-4 h-4 text-primary-400" />
          </div>
          <h2 className="font-semibold text-white">Información Básica</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre de la Pulpería
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[80px] resize-none"
            placeholder="Breve descripción de tu negocio..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-400" />
            Nuestra Historia
          </label>
          <textarea
            value={formData.story}
            onChange={(e) => setFormData({ ...formData, story: e.target.value })}
            className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[100px] resize-none"
            placeholder="Cuenta la historia de tu negocio, tradiciones familiares..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Año de fundación
          </label>
          <input
            type="number"
            value={formData.foundedYear}
            onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
            placeholder="1990"
            className="w-32 px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </motion.div>

      {/* Categories Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6 space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Tag className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Categorías de tu Negocio</h2>
            <p className="text-xs text-gray-500">Ayuda a los clientes a encontrarte</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {BUSINESS_CATEGORIES.map((category) => {
            const isSelected = formData.categories.includes(category.id);
            return (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all
                  ${isSelected
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-dark-200/50 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }
                `}
              >
                <span className="text-xl">{category.emoji}</span>
                <div className="text-left">
                  <span className="font-medium block">{category.label}</span>
                  <span className="text-xs opacity-70">{category.description}</span>
                </div>
                {isSelected && (
                  <div className="ml-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500">Puedes seleccionar múltiples categorías</p>
      </motion.div>

      {/* Social Networks Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6 space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <Instagram className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Redes Sociales</h2>
            <p className="text-xs text-gray-500">Conecta con tus clientes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOCIAL_NETWORKS.map((network) => {
            const Icon = network.icon;
            return (
              <div key={network.id}>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${network.color}`} />
                  {network.label}
                </label>
                <input
                  type="text"
                  value={formData.socialLinks[network.id] || ''}
                  onChange={(e) => updateSocialLink(network.id, e.target.value)}
                  placeholder={network.placeholder}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all text-sm"
                />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Contact & Location */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6 space-y-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-green-400" />
          </div>
          <h2 className="font-semibold text-white">Contacto y Ubicación</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dirección
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Referencia (estilo hondureño)
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="Frente al palo de mango, casa azul..."
            className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>

        {/* Ubicación GPS */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ubicación en el Mapa
          </label>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${
              formData.latitude && formData.latitude !== pulperia?.latitude
                ? 'border-green-500/50 bg-green-500/10 text-green-400'
                : formData.latitude
                  ? 'border-white/10 text-gray-400 hover:border-primary-500/50 hover:text-primary-400'
                  : 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
            } disabled:opacity-50`}
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Obteniendo ubicación...
              </>
            ) : formData.latitude ? (
              <>
                <MapPin className="w-5 h-5" />
                Actualizar mi ubicación
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                Configurar ubicación (requerido)
              </>
            )}
          </motion.button>
          {formData.latitude && formData.latitude !== pulperia?.latitude && (
            <p className="text-xs text-green-400 mt-2 text-center">
              Nueva ubicación lista - Guarda los cambios para aplicar
            </p>
          )}
          {!formData.latitude && (
            <p className="text-xs text-yellow-400 mt-2 text-center">
              Sin ubicación, tu pulpería no aparecerá en el mapa
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9999-9999"
              className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-400" />
              WhatsApp
            </label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="9999-9999"
              className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
      >
        {updateMutation.isPending ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Save className="w-5 h-5" />
            Guardar Cambios
          </>
        )}
      </motion.button>

      {/* Online Only Mode */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Globe className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Tienda Solo en Línea</h3>
            <p className="text-sm text-gray-500">Sin ubicación física, solo entregas</p>
          </div>
          <button
            onClick={() => {
              updateMutation.mutate({ isOnlineOnly: !pulperia?.isOnlineOnly });
            }}
            className={`w-12 h-7 rounded-full transition-colors ${pulperia?.isOnlineOnly ? 'bg-purple-500' : 'bg-dark-300'}`}
          >
            <motion.div
              animate={{ x: pulperia?.isOnlineOnly ? 20 : 4 }}
              className="w-5 h-5 bg-white rounded-full shadow"
            />
          </button>
        </div>
      </motion.div>

      {/* Vacation Mode */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Palmtree className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Modo Vacaciones</h3>
            <p className="text-sm text-gray-500">Cierra temporalmente sin perder clientes</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowVacationModal(true)}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-medium hover:bg-blue-500/30 transition-colors"
          >
            Activar
          </motion.button>
        </div>
      </motion.div>

      {/* Export Data */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center">
            <Download className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Exportar Datos</h3>
            <p className="text-sm text-gray-500">Descarga una copia de toda tu información</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => exportMutation.mutate('json')}
            disabled={exportMutation.isPending}
            className="px-4 py-2 bg-dark-200/50 text-white border border-white/5 rounded-xl font-medium hover:bg-dark-200 transition-colors disabled:opacity-50"
          >
            {exportMutation.isPending ? 'Exportando...' : 'Exportar'}
          </motion.button>
        </div>
      </motion.div>

      {/* Delete Account */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-red-500/20 p-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-400">Eliminar Cuenta</h3>
            <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
          >
            Eliminar
          </motion.button>
        </div>
      </motion.div>

      {/* Vacation Modal */}
      <AnimatePresence>
        {showVacationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowVacationModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-dark-100 rounded-2xl max-w-md w-full p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Palmtree className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Modo Vacaciones</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowVacationModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mensaje para clientes
                  </label>
                  <textarea
                    value={vacationMessage}
                    onChange={(e) => setVacationMessage(e.target.value)}
                    placeholder="Estamos de vacaciones! Volvemos pronto..."
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[80px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de regreso
                  </label>
                  <input
                    type="date"
                    value={vacationReturn}
                    onChange={(e) => setVacationReturn(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowVacationModal(false)}
                    className="flex-1 px-4 py-3 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVacation}
                    disabled={vacationMutation.isPending}
                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {vacationMutation.isPending ? 'Activando...' : 'Activar Vacaciones'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-dark-100 rounded-2xl max-w-md w-full p-6 border border-red-500/30"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">Eliminar Cuenta</h2>
              </div>

              <p className="text-gray-400 mb-4">
                Esta acción eliminará permanentemente tu pulpería, productos, órdenes y toda la información asociada.
              </p>

              <p className="text-sm text-gray-500 mb-4">
                Escribe <strong className="text-white">{pulperia?.name}</strong> para confirmar:
              </p>

              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all mb-4"
                placeholder="Nombre de tu pulpería"
              />

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  disabled={deleteConfirm !== pulperia?.name || deleteMutation.isPending}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar Permanentemente'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PulperiaSettings;
