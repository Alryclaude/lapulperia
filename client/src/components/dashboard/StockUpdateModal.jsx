import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Minus, Plus, Save, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/api';
import toast from 'react-hot-toast';

const StockUpdateModal = ({ isOpen, onClose, product }) => {
  const [stockQuantity, setStockQuantity] = useState(0);
  const [lowStockAlert, setLowStockAlert] = useState(5);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (product) {
      setStockQuantity(product.stockQuantity || 0);
      setLowStockAlert(product.lowStockAlert || 5);
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (data) => productApi.updateStockQuantity(product.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboard-stats']);
      queryClient.invalidateQueries(['products']);
      toast.success('Stock actualizado correctamente');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar stock');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      stockQuantity,
      lowStockAlert,
    });
  };

  const handleQuantityChange = (delta) => {
    setStockQuantity(prev => Math.max(0, prev + delta));
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md"
          >
            <div className="bg-dark-100 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Actualizar Stock</h2>
                    <p className="text-sm text-gray-400 truncate max-w-[200px]">{product.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Product preview */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200/50 border border-white/5">
                  <div className="w-16 h-16 rounded-lg bg-dark-300 overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-sm text-gray-400">{product.category}</p>
                    <p className="text-sm text-primary-400 font-medium">L. {product.price?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Stock quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cantidad en Stock
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-10)}
                      className="w-12 h-12 rounded-xl bg-dark-200 hover:bg-dark-300 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      className="w-12 h-12 rounded-xl bg-dark-200 hover:bg-dark-300 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 h-12 px-4 rounded-xl bg-dark-200 border border-white/10 text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      className="w-12 h-12 rounded-xl bg-dark-200 hover:bg-dark-300 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(10)}
                      className="w-12 h-12 rounded-xl bg-dark-200 hover:bg-dark-300 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Low stock alert */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Alerta de Stock Bajo
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Recibiras una alerta cuando el stock baje de este numero
                  </p>
                  <input
                    type="number"
                    value={lowStockAlert}
                    onChange={(e) => setLowStockAlert(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-11 px-4 rounded-xl bg-dark-200 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>

                {/* Warning if low */}
                {stockQuantity <= lowStockAlert && stockQuantity > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <p className="text-sm text-yellow-400">
                      El stock actual esta por debajo del umbral de alerta
                    </p>
                  </div>
                )}

                {stockQuantity === 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">
                      El producto se marcara como agotado
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-dark-200 hover:bg-dark-300 text-gray-300 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StockUpdateModal;
