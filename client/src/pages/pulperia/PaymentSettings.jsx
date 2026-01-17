import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Trash2,
  Loader2,
  Building,
  Smartphone,
  Banknote,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';

const PROVIDERS = {
  BAC: { name: 'BAC Credomatic', icon: Building, type: 'bank' },
  BANPAIS: { name: 'Banpaís', icon: Building, type: 'bank' },
  FICOHSA: { name: 'Ficohsa', icon: Building, type: 'bank' },
  ATLANTIDA: { name: 'Banco Atlántida', icon: Building, type: 'bank' },
  DAVIVIENDA: { name: 'Davivienda', icon: Building, type: 'bank' },
  OCCIDENTE: { name: 'Banco de Occidente', icon: Building, type: 'bank' },
  BANRURAL: { name: 'Banrural', icon: Building, type: 'bank' },
  LAFISE: { name: 'Banco LAFISE', icon: Building, type: 'bank' },
  TIGO_MONEY: { name: 'Tigo Money', icon: Smartphone, type: 'wallet' },
  TENGO: { name: 'Tengo', icon: Smartphone, type: 'wallet' },
  CASH: { name: 'Efectivo', icon: Banknote, type: 'cash' },
  OTHER: { name: 'Otro', icon: CreditCard, type: 'other' },
};

const PaymentSettings = () => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    provider: '',
    accountName: '',
    accountNumber: '',
    instructions: '',
  });

  // Fetch payment methods
  const { data, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.get('/payment/methods'),
  });

  const methods = data?.data?.methods || [];

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data) => api.post('/payment/methods', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-methods']);
      toast.success('Método de pago agregado');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al agregar');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/payment/methods/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-methods']);
      toast.success('Método de pago actualizado');
      setEditingId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/payment/methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-methods']);
      toast.success('Método de pago eliminado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar');
    },
  });

  const resetForm = () => {
    setFormData({ provider: '', accountName: '', accountNumber: '', instructions: '' });
    setShowAddForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (method) => {
    setFormData({
      provider: method.provider,
      accountName: method.accountName,
      accountNumber: method.accountNumber,
      instructions: method.instructions || '',
    });
    setEditingId(method.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este método de pago?')) {
      deleteMutation.mutate(id);
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
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Métodos de Pago</h1>
            <p className="text-gray-400 text-sm">Configura cómo pueden pagarte tus clientes</p>
          </div>
        </div>

        {!showAddForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar
          </motion.button>
        )}
      </motion.div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingId ? 'Editar método de pago' : 'Agregar método de pago'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Provider Select */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Proveedor</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none"
                  required
                  disabled={editingId}
                >
                  <option value="">Seleccionar...</option>
                  <optgroup label="Bancos">
                    {Object.entries(PROVIDERS)
                      .filter(([, p]) => p.type === 'bank')
                      .map(([key, p]) => (
                        <option key={key} value={key}>{p.name}</option>
                      ))}
                  </optgroup>
                  <optgroup label="Billeteras">
                    {Object.entries(PROVIDERS)
                      .filter(([, p]) => p.type === 'wallet')
                      .map(([key, p]) => (
                        <option key={key} value={key}>{p.name}</option>
                      ))}
                  </optgroup>
                  <optgroup label="Otros">
                    {Object.entries(PROVIDERS)
                      .filter(([, p]) => p.type === 'cash' || p.type === 'other')
                      .map(([key, p]) => (
                        <option key={key} value={key}>{p.name}</option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre del titular</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                  required
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {PROVIDERS[formData.provider]?.type === 'wallet' ? 'Número de teléfono' : 'Número de cuenta'}
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder={PROVIDERS[formData.provider]?.type === 'wallet' ? '9999-9999' : '0000-0000-0000'}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                  required
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Instrucciones (opcional)</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Enviar captura de comprobante por WhatsApp"
                  rows={2}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none resize-none"
                />
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
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
            {methods.map((method, index) => {
              const provider = PROVIDERS[method.provider] || PROVIDERS.OTHER;
              const Icon = provider.icon;

              return (
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
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      provider.type === 'bank' ? 'bg-blue-500/20' :
                      provider.type === 'wallet' ? 'bg-purple-500/20' :
                      'bg-green-500/20'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        provider.type === 'bank' ? 'text-blue-400' :
                        provider.type === 'wallet' ? 'text-purple-400' :
                        'text-green-400'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{provider.name}</p>
                      <p className="text-sm text-gray-400">{method.accountName}</p>
                      <p className="text-sm text-gray-500 font-mono">{method.accountNumber}</p>
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

                  {method.instructions && (
                    <p className="mt-3 text-sm text-gray-400 bg-dark-200/50 rounded-lg p-2">
                      {method.instructions}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin métodos de pago</h2>
          <p className="text-gray-400 mb-6">
            Agrega formas en que tus clientes pueden pagarte
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar método de pago
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default PaymentSettings;
