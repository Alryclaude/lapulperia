import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FileText, X, Check, Trash2, Copy, Send, Eye, DollarSign,
  User, Phone, Clock, Edit2, CheckCircle
} from 'lucide-react';
import { quotesApi } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  DRAFT: { label: 'Borrador', color: 'gray' },
  SENT: { label: 'Enviada', color: 'blue' },
  ACCEPTED: { label: 'Aceptada', color: 'green' },
  REJECTED: { label: 'Rechazada', color: 'red' },
  EXPIRED: { label: 'Expirada', color: 'amber' },
  COMPLETED: { label: 'Completada', color: 'cyan' }
};

const ManageQuotes = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [viewQuote, setViewQuote] = useState(null);
  const [activeStatus, setActiveStatus] = useState('');
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientWhatsapp: '',
    title: '',
    description: '',
    items: [{ name: '', qty: 1, unitPrice: 0 }],
    laborCost: '',
    materialsCost: '',
    discount: '',
    estimatedTime: '',
    warranty: '',
    paymentTerms: '',
    notes: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['quotes', activeStatus],
    queryFn: () => quotesApi.list({ status: activeStatus || undefined }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['quote-stats'],
    queryFn: () => quotesApi.getStats(),
  });

  const quotes = data?.data || [];
  const stats = statsData?.data || {};

  const createMutation = useMutation({
    mutationFn: (data) => quotesApi.create(data),
    onSuccess: () => {
      toast.success('Cotización creada');
      queryClient.invalidateQueries(['quotes']);
      queryClient.invalidateQueries(['quote-stats']);
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Error al crear'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => quotesApi.update(id, data),
    onSuccess: () => {
      toast.success('Cotización actualizada');
      queryClient.invalidateQueries(['quotes']);
      queryClient.invalidateQueries(['quote-stats']);
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => quotesApi.delete(id),
    onSuccess: () => {
      toast.success('Cotización eliminada');
      queryClient.invalidateQueries(['quotes']);
      queryClient.invalidateQueries(['quote-stats']);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => quotesApi.duplicate(id),
    onSuccess: () => {
      toast.success('Cotización duplicada');
      queryClient.invalidateQueries(['quotes']);
    },
    onError: () => toast.error('Error al duplicar'),
  });

  const openModal = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientWhatsapp: '',
      title: '',
      description: '',
      items: [{ name: '', qty: 1, unitPrice: 0 }],
      laborCost: '',
      materialsCost: '',
      discount: '',
      estimatedTime: '',
      warranty: '',
      paymentTerms: '',
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', qty: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'name' ? value : parseFloat(value) || 0;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) =>
      sum + (item.qty * item.unitPrice), 0);
    const labor = parseFloat(formData.laborCost) || 0;
    const materials = parseFloat(formData.materialsCost) || 0;
    const discount = parseFloat(formData.discount) || 0;
    return itemsTotal + labor + materials - discount;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (quote) => {
    if (window.confirm(`¿Eliminar cotización ${quote.quoteNumber}?`)) {
      deleteMutation.mutate(quote.id);
    }
  };

  const markAsSent = (quote) => {
    updateMutation.mutate({ id: quote.id, data: { status: 'SENT' } });
  };

  const shareWhatsApp = (quote) => {
    const phone = quote.clientWhatsapp || quote.clientPhone;
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const msg = encodeURIComponent(
        `*Cotización ${quote.quoteNumber}*\n\n` +
        `${quote.title}\n` +
        `Total: L ${quote.total.toFixed(2)}\n\n` +
        `Gracias por su preferencia!`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    }
  };

  const getStatusColor = (status) => {
    const config = STATUS_CONFIG[status];
    return config?.color === 'gray'
      ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      : config?.color === 'blue'
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        : config?.color === 'green'
          ? 'bg-green-500/20 text-green-400 border-green-500/30'
          : config?.color === 'red'
            ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : config?.color === 'amber'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
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
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cotizaciones</h1>
            <p className="text-gray-400 text-sm">{stats.total || 0} cotizaciones</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nueva Cotización</span>
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4">
          <p className="text-2xl font-bold text-gray-400">{stats.draft || 0}</p>
          <p className="text-xs text-gray-500">Borradores</p>
        </div>
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.sent || 0}</p>
          <p className="text-xs text-gray-500">Enviadas</p>
        </div>
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4">
          <p className="text-2xl font-bold text-green-400">{stats.accepted || 0}</p>
          <p className="text-xs text-gray-500">Aceptadas</p>
        </div>
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4">
          <p className="text-lg font-bold text-green-400">L {(stats.totalValue || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500">Valor total</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveStatus('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${!activeStatus
              ? 'bg-primary-500 text-white'
              : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
            }`}
        >
          Todas
        </button>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setActiveStatus(activeStatus === status ? '' : status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${activeStatus === status
                ? `${getStatusColor(status)} border`
                : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
              }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Quotes List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4">
              <div className="h-5 w-32 bg-dark-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-48 bg-dark-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : quotes.length > 0 ? (
        <div className="space-y-3">
          {quotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{quote.quoteNumber}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(quote.status)}`}>
                      {STATUS_CONFIG[quote.status]?.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white">{quote.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {quote.clientName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(quote.createdAt).toLocaleDateString('es-HN')}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-green-400">L {quote.total?.toFixed(2)}</p>
                  <div className="flex gap-1 mt-2">
                    {quote.status === 'DRAFT' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => markAsSent(quote)}
                        className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        title="Marcar como enviada"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    )}
                    {(quote.clientWhatsapp || quote.clientPhone) && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => shareWhatsApp(quote)}
                        className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        title="Enviar por WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => duplicateMutation.mutate(quote.id)}
                      className="p-1.5 rounded-lg bg-dark-200/50 text-gray-400 hover:bg-white/5 transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(quote)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
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
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin cotizaciones</h2>
          <p className="text-gray-400 mb-6">Crea tu primera cotización</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Cotización
          </motion.button>
        </motion.div>
      )}

      {/* Create Modal */}
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Nueva Cotización</h2>
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
                {/* Client Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cliente *
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Nombre del cliente"
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      placeholder="9999-9999"
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.clientWhatsapp}
                      onChange={(e) => setFormData({ ...formData, clientWhatsapp: e.target.value })}
                      placeholder="+504 9999-9999"
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
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
                    placeholder="Ej: Reparación de aire acondicionado"
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                    required
                  />
                </div>

                {/* Items */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Items *
                  </label>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="Descripción"
                          className="flex-1 px-3 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-white placeholder:text-gray-500 text-sm"
                          required
                        />
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(index, 'qty', e.target.value)}
                          placeholder="Cant"
                          className="w-16 px-2 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-white text-sm text-center"
                          min="1"
                        />
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          placeholder="Precio"
                          className="w-24 px-2 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-white text-sm"
                        />
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-2 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar item
                  </button>
                </div>

                {/* Costs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Mano de obra (L)
                    </label>
                    <input
                      type="number"
                      value={formData.laborCost}
                      onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Materiales (L)
                    </label>
                    <input
                      type="number"
                      value={formData.materialsCost}
                      onChange={(e) => setFormData({ ...formData, materialsCost: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Descuento (L)
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Total</span>
                    <span className="text-2xl font-bold text-green-400">
                      L {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Tiempo estimado
                    </label>
                    <input
                      type="text"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      placeholder="Ej: 2-3 días"
                      className="w-full px-3 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-white text-sm placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Garantía
                    </label>
                    <input
                      type="text"
                      value={formData.warranty}
                      onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      placeholder="Ej: 30 días"
                      className="w-full px-3 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-white text-sm placeholder:text-gray-500"
                    />
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
                    disabled={createMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                  >
                    {createMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Crear Cotización
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageQuotes;
