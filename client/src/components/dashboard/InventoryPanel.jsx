import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, XCircle, Minus, Plus, RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/api';
import toast from 'react-hot-toast';

const InventoryPanel = ({ lowStockProducts = [], onRestockClick }) => {
  const [updatingId, setUpdatingId] = useState(null);
  const queryClient = useQueryClient();

  const updateStockMutation = useMutation({
    mutationFn: ({ id, quantity }) => productApi.updateStockQuantity(id, { stockQuantity: quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboard-stats']);
      queryClient.invalidateQueries(['products']);
      toast.success('Stock actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar stock');
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const handleQuickUpdate = (product, delta) => {
    const newQuantity = Math.max(0, (product.stockQuantity || 0) + delta);
    setUpdatingId(product.id);
    updateStockMutation.mutate({ id: product.id, quantity: newQuantity });
  };

  const getStockStatus = (product) => {
    if (product.outOfStock || product.stockQuantity === 0) {
      return { status: 'out', color: 'red', label: 'Agotado' };
    }
    if (product.stockQuantity <= (product.lowStockAlert || 5)) {
      return { status: 'low', color: 'yellow', label: 'Stock bajo' };
    }
    return { status: 'ok', color: 'green', label: 'En stock' };
  };

  const outOfStock = lowStockProducts.filter(p => p.outOfStock || p.stockQuantity === 0);
  const lowStock = lowStockProducts.filter(p => !p.outOfStock && p.stockQuantity > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-400" />
              Alertas de Inventario
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {lowStockProducts.length} productos requieren atencion
            </p>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30">
            <XCircle className="w-4 h-4" />
            {outOfStock.length} agotados
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm border border-yellow-500/30">
            <AlertTriangle className="w-4 h-4" />
            {lowStock.length} bajo stock
          </div>
        </div>

        {/* Product list */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {lowStockProducts.length > 0 ? (
            lowStockProducts.map((product) => {
              const { status, color, label } = getStockStatus(product);
              const isUpdating = updatingId === product.id;

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-dark-200/50 border border-white/5 hover:border-white/10 transition-colors"
                >
                  {/* Product image */}
                  <div className="w-12 h-12 rounded-lg bg-dark-300 overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        color === 'red'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {label}
                      </span>
                      <span className="text-sm text-gray-400">
                        Stock: {product.stockQuantity || 0}
                      </span>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-2">
                    {/* Quick quantity update */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickUpdate(product, -1)}
                        disabled={isUpdating || (product.stockQuantity || 0) === 0}
                        className="w-7 h-7 rounded-lg bg-dark-300 hover:bg-dark-400 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-white">
                        {isUpdating ? (
                          <RefreshCw className="w-4 h-4 mx-auto animate-spin" />
                        ) : (
                          product.stockQuantity || 0
                        )}
                      </span>
                      <button
                        onClick={() => handleQuickUpdate(product, 1)}
                        disabled={isUpdating}
                        className="w-7 h-7 rounded-lg bg-dark-300 hover:bg-dark-400 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Restock button */}
                    <button
                      onClick={() => onRestockClick?.(product)}
                      className="px-3 py-1.5 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 text-sm font-medium transition-colors"
                    >
                      Reabastecer
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Todo tu inventario esta en orden</p>
              <p className="text-sm text-gray-500 mt-1">No hay productos con stock bajo</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InventoryPanel;
