import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Tag, Calendar, Percent, DollarSign, Package, Gift } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/api';
import toast from 'react-hot-toast';

const PROMOTION_TYPES = [
  { value: 'PERCENTAGE', label: 'Porcentaje', icon: Percent, description: 'Descuento % sobre el precio' },
  { value: 'FIXED_AMOUNT', label: 'Monto fijo', icon: DollarSign, description: 'Descuento en Lempiras' },
  { value: 'BUY_X_GET_Y', label: 'Compra X, Lleva Y', icon: Gift, description: '2x1, 3x2, etc.' },
];

const APPLY_TO_OPTIONS = [
  { value: 'ALL', label: 'Todos los productos' },
  { value: 'CATEGORY', label: 'Categoria especifica' },
  { value: 'PRODUCTS', label: 'Productos especificos' },
];

const CATEGORIES = [
  'Bebidas',
  'Lacteos',
  'Carnes',
  'Panaderia',
  'Abarrotes',
  'Snacks',
  'Frutas y Verduras',
  'Limpieza',
  'Cuidado Personal',
  'Otros',
];

const initialFormData = {
  name: '',
  description: '',
  type: 'PERCENTAGE',
  value: '',
  buyQuantity: '2',
  getQuantity: '1',
  applyTo: 'ALL',
  category: '',
  productIds: [],
  minPurchase: '',
  maxDiscount: '',
  maxUsage: '',
  startDate: '',
  endDate: '',
  isActive: true,
  noEndDate: false,
  noUsageLimit: true,
};

const PromotionFormModal = ({
  isOpen,
  onClose,
  editPromotion,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState(initialFormData);

  // Fetch products for selection
  const { data: productsData } = useQuery({
    queryKey: ['my-products-for-promotions'],
    queryFn: () => productApi.getMyProducts({}),
    enabled: isOpen && formData.applyTo === 'PRODUCTS',
  });

  const products = productsData?.data?.products || [];

  useEffect(() => {
    if (editPromotion) {
      setFormData({
        name: editPromotion.name,
        description: editPromotion.description || '',
        type: editPromotion.type,
        value: editPromotion.value?.toString() || '',
        buyQuantity: editPromotion.buyQuantity?.toString() || '2',
        getQuantity: editPromotion.getQuantity?.toString() || '1',
        applyTo: editPromotion.productIds?.length > 0 ? 'PRODUCTS' : editPromotion.category ? 'CATEGORY' : 'ALL',
        category: editPromotion.category || '',
        productIds: editPromotion.productIds || [],
        minPurchase: editPromotion.minPurchase?.toString() || '',
        maxDiscount: editPromotion.maxDiscount?.toString() || '',
        maxUsage: editPromotion.maxUsage?.toString() || '',
        startDate: editPromotion.startDate ? new Date(editPromotion.startDate).toISOString().split('T')[0] : '',
        endDate: editPromotion.endDate ? new Date(editPromotion.endDate).toISOString().split('T')[0] : '',
        isActive: editPromotion.isActive,
        noEndDate: !editPromotion.endDate,
        noUsageLimit: !editPromotion.maxUsage,
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({ ...initialFormData, startDate: today });
    }
  }, [editPromotion, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.startDate) {
      toast.error('La fecha de inicio es requerida');
      return;
    }

    if (formData.type !== 'BUY_X_GET_Y' && !formData.value) {
      toast.error('El valor del descuento es requerido');
      return;
    }

    const submitData = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      value: formData.type === 'BUY_X_GET_Y' ? 0 : parseFloat(formData.value),
      buyQuantity: formData.type === 'BUY_X_GET_Y' ? parseInt(formData.buyQuantity) : null,
      getQuantity: formData.type === 'BUY_X_GET_Y' ? parseInt(formData.getQuantity) : null,
      category: formData.applyTo === 'CATEGORY' ? formData.category : null,
      productIds: formData.applyTo === 'PRODUCTS' ? formData.productIds : [],
      minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      maxUsage: formData.noUsageLimit ? null : (formData.maxUsage ? parseInt(formData.maxUsage) : null),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.noEndDate ? null : (formData.endDate ? new Date(formData.endDate).toISOString() : null),
      isActive: formData.isActive,
    };

    await onSubmit(submitData);
  };

  const closeModal = () => {
    setFormData(initialFormData);
    onClose();
  };

  const toggleProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-dark-100 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] sm:max-h-[85vh] flex flex-col sm:m-4 border border-white/10"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Tag className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {editPromotion ? 'Editar Promocion' : 'Nueva Promocion'}
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

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            {/* Scrollable Content */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la promocion *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                  placeholder="Ej: 2x1 en Bebidas"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripcion (visible para clientes)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all min-h-[80px] resize-none"
                  placeholder="Describe la promocion..."
                />
              </div>

              {/* Promotion Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Tipo de promocion *
                </label>
                <div className="space-y-2">
                  {PROMOTION_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                          formData.type === type.value
                            ? 'bg-amber-500/20 border border-amber-500/30'
                            : 'bg-dark-200/50 border border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          formData.type === type.value ? 'bg-amber-500/30' : 'bg-dark-300'
                        }`}>
                          <Icon className={`w-4 h-4 ${formData.type === type.value ? 'text-amber-400' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className={`font-medium ${formData.type === type.value ? 'text-amber-400' : 'text-white'}`}>
                            {type.label}
                          </p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Value Input - based on type */}
              {formData.type === 'PERCENTAGE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Porcentaje de descuento *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-4 py-3 pr-10 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                      placeholder="15"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>
              )}

              {formData.type === 'FIXED_AMOUNT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monto de descuento (L.) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">L.</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                      placeholder="50.00"
                    />
                  </div>
                </div>
              )}

              {formData.type === 'BUY_X_GET_Y' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Compra
                    </label>
                    <input
                      type="number"
                      min="2"
                      value={formData.buyQuantity}
                      onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Lleva (paga)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.getQuantity}
                      onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Apply To */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-400" />
                    Aplicar a
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {APPLY_TO_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, applyTo: option.value, category: '', productIds: [] })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        formData.applyTo === option.value
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-dark-200/50 text-gray-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              {formData.applyTo === 'CATEGORY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                  >
                    <option value="">Seleccionar categoria</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Product Selection */}
              {formData.applyTo === 'PRODUCTS' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Productos ({formData.productIds.length} seleccionados)
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2 bg-dark-200/30 rounded-xl p-3">
                    {products.length > 0 ? products.map((product) => (
                      <label
                        key={product.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.productIds.includes(product.id)
                            ? 'bg-amber-500/20 border border-amber-500/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.productIds.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="hidden"
                        />
                        <div className="w-8 h-8 rounded-lg bg-dark-300 overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">L. {product.price.toFixed(2)}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          formData.productIds.includes(product.id)
                            ? 'bg-amber-500'
                            : 'bg-dark-300 border border-white/10'
                        }`}>
                          {formData.productIds.includes(product.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </label>
                    )) : (
                      <p className="text-sm text-gray-500 text-center py-4">No hay productos disponibles</p>
                    )}
                  </div>
                </div>
              )}

              {/* Conditions */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Condiciones (opcional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Compra minima</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">L.</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-dark-200/50 border border-white/5 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Descuento maximo</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">L.</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-dark-200/50 border border-white/5 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.noUsageLimit}
                    onChange={(e) => setFormData({ ...formData, noUsageLimit: e.target.checked, maxUsage: '' })}
                    className="w-4 h-4 rounded bg-dark-300 border-white/10 text-amber-500 focus:ring-amber-500/20"
                  />
                  <span className="text-sm text-gray-300">Sin limite de usos</span>
                </label>
                {!formData.noUsageLimit && (
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUsage}
                    onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-200/50 border border-white/5 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
                    placeholder="Numero maximo de usos"
                  />
                )}
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Vigencia
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fecha inicio *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-dark-200/50 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fecha fin</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      disabled={formData.noEndDate}
                      className="w-full px-3 py-2.5 bg-dark-200/50 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={formData.noEndDate}
                    onChange={(e) => setFormData({ ...formData, noEndDate: e.target.checked, endDate: '' })}
                    className="w-4 h-4 rounded bg-dark-300 border-white/10 text-amber-500 focus:ring-amber-500/20"
                  />
                  <span className="text-sm text-gray-400">Sin fecha de fin</span>
                </label>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-3 p-3 bg-dark-200/50 rounded-xl cursor-pointer border border-white/5 hover:border-amber-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Activar promocion</p>
                  <p className="text-xs text-gray-500">Visible para clientes inmediatamente</p>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-dark-300'}`}>
                  <motion.div
                    animate={{ x: formData.isActive ? 16 : 2 }}
                    className="w-5 h-5 bg-white rounded-full mt-0.5"
                  />
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="hidden"
                />
              </label>
            </div>

            {/* Fixed Action Buttons */}
            <div
              className="p-5 border-t border-white/5 bg-dark-100 flex-shrink-0 relative z-10"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            >
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3.5 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors pointer-events-auto"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors pointer-events-auto"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editPromotion ? 'Guardar' : 'Crear'}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromotionFormModal;
