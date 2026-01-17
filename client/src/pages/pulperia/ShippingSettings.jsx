import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Plus,
  Trash2,
  Loader2,
  Package,
  Globe,
  MapPin,
  Edit2,
  Check,
  X,
  Clock,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';

const SHIPPING_SCOPES = {
  PICKUP: { name: 'Recoger', description: 'Solo recoger en tienda', icon: Package },
  LOCAL: { name: 'Local', description: 'Delivery en tu zona (< 3 km)', icon: MapPin },
  CIUDAD: { name: 'Ciudad', description: 'Toda la ciudad', icon: MapPin },
  NACIONAL: { name: 'Nacional', description: 'Todo Honduras', icon: Globe },
  DIGITAL: { name: 'Digital', description: 'Productos digitales', icon: Package },
};

const ShippingSettings = () => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    coverageArea: '',
    estimatedDays: '',
    baseCost: '',
  });

  // Fetch shipping methods
  const { data, isLoading } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: () => api.get('/shipping/methods'),
  });

  const methods = data?.data?.methods || [];

  // Fetch pulperia settings (for shippingScope and originCity)
  const { data: pulperiaData } = useQuery({
    queryKey: ['my-pulperia'],
    queryFn: () => api.get('/pulperias/me'),
  });

  const pulperia = pulperiaData?.data?.pulperia || {};

  // Update pulperia settings mutation
  const updatePulperiaMutation = useMutation({
    mutationFn: (data) => api.patch('/pulperias/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-pulperia']);
      toast.success('Configuración actualizada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar');
    },
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data) => api.post('/shipping/methods', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-methods']);
      toast.success('Método de envío agregado');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al agregar');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/shipping/methods/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-methods']);
      toast.success('Método de envío actualizado');
      setEditingId(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/shipping/methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-methods']);
      toast.success('Método de envío eliminado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar');
    },
  });

  const resetForm = () => {
    setFormData({ name: '', coverageArea: '', estimatedDays: '', baseCost: '' });
    setShowAddForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      baseCost: formData.baseCost ? parseFloat(formData.baseCost) : null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...submitData });
    } else {
      addMutation.mutate(submitData);
    }
  };

  const handleEdit = (method) => {
    setFormData({
      name: method.name,
      coverageArea: method.coverageArea || '',
      estimatedDays: method.estimatedDays || '',
      baseCost: method.baseCost?.toString() || '',
    });
    setEditingId(method.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este método de envío?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleScopeChange = (scope) => {
    updatePulperiaMutation.mutate({ shippingScope: scope });
  };

  const handleOriginCityChange = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      updatePulperiaMutation.mutate({ originCity: e.target.value.trim() });
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
            <Truck className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Configuración de Entregas</h1>
            <p className="text-gray-400 text-sm">Configura cómo tus clientes reciben sus pedidos</p>
          </div>
        </div>
      </motion.div>

      {/* Shipping Scope Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Alcance de Entregas</h2>
        <p className="text-sm text-gray-400 mb-4">Define cómo pueden recibir sus pedidos tus clientes</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(SHIPPING_SCOPES).map(([key, scope]) => {
            const Icon = scope.icon;
            const isSelected = pulperia.shippingScope === key;

            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleScopeChange(key)}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-dark-200 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-purple-500/30' : 'bg-dark-300'
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                      {scope.name}
                    </p>
                    <p className="text-xs text-gray-500">{scope.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Origin City */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-2">Ciudad de origen</h2>
        <p className="text-sm text-gray-400 mb-4">Desde donde envías tus productos</p>

        <div className="flex gap-2">
          <input
            type="text"
            defaultValue={pulperia.originCity || ''}
            onKeyDown={handleOriginCityChange}
            onBlur={(e) => {
              if (e.target.value.trim() && e.target.value !== pulperia.originCity) {
                updatePulperiaMutation.mutate({ originCity: e.target.value.trim() });
              }
            }}
            placeholder="Ej: Tegucigalpa"
            className="flex-1 px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </motion.div>

      {/* Shipping Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Métodos de envío</h2>
          {!showAddForm && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar
            </motion.button>
          )}
        </div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingId ? 'Editar método de envío' : 'Agregar método de envío'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nombre del servicio</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Cargo Expreso, Entrega propia"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Coverage Area */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Área de cobertura</label>
                  <input
                    type="text"
                    value={formData.coverageArea}
                    onChange={(e) => setFormData({ ...formData, coverageArea: e.target.value })}
                    placeholder="Ej: Tegucigalpa, Francisco Morazán"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Estimated Days */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tiempo estimado</label>
                    <input
                      type="text"
                      value={formData.estimatedDays}
                      onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                      placeholder="Ej: 1-2 días"
                      className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Base Cost */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Costo base (L.)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.baseCost}
                      onChange={(e) => setFormData({ ...formData, baseCost: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setEditingId(null);
                    }}
                    className="flex-1 px-4 py-3 bg-dark-200 hover:bg-dark-300 text-gray-300 rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={addMutation.isPending || updateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {(addMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {editingId ? 'Actualizar' : 'Agregar'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Methods List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
                <div className="h-6 w-1/3 bg-dark-200 animate-pulse rounded mb-2" />
                <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : methods.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {methods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-dark-100/60 backdrop-blur-sm rounded-2xl border p-4 ${
                    method.isActive ? 'border-white/5' : 'border-red-500/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-purple-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{method.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {method.coverageArea && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {method.coverageArea}
                          </span>
                        )}
                        {method.estimatedDays && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {method.estimatedDays}
                          </span>
                        )}
                        {method.baseCost !== null && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            L. {method.baseCost.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(method)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(method.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Sin métodos de envío</h2>
            <p className="text-gray-400 mb-6">
              Agrega los servicios de envío que utilizas para tus entregas
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar método de envío
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ShippingSettings;
