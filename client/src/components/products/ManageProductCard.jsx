import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Eye, EyeOff, Star, Calendar, AlertCircle, Tag, Minus, Plus, Package } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/api';
import toast from 'react-hot-toast';

const ManageProductCard = ({ product, index, onEdit, onDelete, onToggleStock }) => {
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const queryClient = useQueryClient();

  const updateStockMutation = useMutation({
    mutationFn: ({ id, quantity }) => productApi.updateStockQuantity(id, { stockQuantity: quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-products']);
      queryClient.invalidateQueries(['dashboard-stats']);
    },
    onError: () => {
      toast.error('Error al actualizar stock');
    },
    onSettled: () => {
      setIsUpdatingStock(false);
    },
  });

  const handleQuickStock = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    const newQuantity = Math.max(0, (product.stockQuantity || 0) + delta);
    setIsUpdatingStock(true);
    updateStockMutation.mutate({ id: product.id, quantity: newQuantity });
  };

  const handleEdit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onEdit(product);
  };

  const handleDelete = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onDelete(product);
  };

  const handleToggleStock = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onToggleStock(product);
  };

  // Determine stock status
  const getStockStatus = () => {
    if (product.outOfStock || product.stockQuantity === 0) {
      return { status: 'out', color: 'red', label: 'Agotado' };
    }
    if (product.stockQuantity !== null && product.stockQuantity <= (product.lowStockAlert || 5)) {
      return { status: 'low', color: 'yellow', label: 'Bajo' };
    }
    return { status: 'ok', color: 'green', label: 'Stock' };
  };

  const stockStatus = getStockStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all"
    >
      <div className="relative aspect-square">
        <img
          src={product.imageUrl || '/placeholder-product.png'}
          alt={product.name}
          className={`w-full h-full object-cover ${product.outOfStock ? 'opacity-40 grayscale' : ''}`}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isFeatured && (
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 backdrop-blur-sm text-yellow-400 text-xs font-medium rounded-lg border border-yellow-500/30">
              <Star className="w-3 h-3" />
              Destacado
            </span>
          )}
          {product.isSeasonal && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 backdrop-blur-sm text-blue-400 text-xs font-medium rounded-lg border border-blue-500/30">
              <Calendar className="w-3 h-3" />
              {product.seasonalTag || 'Temporada'}
            </span>
          )}
        </div>

        {/* Stock badge - top right */}
        <div className="absolute top-2 right-2">
          <span className={`flex items-center gap-1 px-2 py-1 backdrop-blur-sm text-xs font-medium rounded-lg border ${
            stockStatus.color === 'red'
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : stockStatus.color === 'yellow'
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              : 'bg-green-500/20 text-green-400 border-green-500/30'
          }`}>
            {stockStatus.status === 'out' && <AlertCircle className="w-3 h-3" />}
            {stockStatus.status === 'low' && <AlertCircle className="w-3 h-3" />}
            {stockStatus.status === 'ok' && <Package className="w-3 h-3" />}
            {product.stockQuantity !== null ? product.stockQuantity : stockStatus.label}
          </span>
        </div>

        {/* Desktop: Actions Overlay (hover only) */}
        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 items-end justify-center gap-2 pb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEdit}
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/10 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleStock}
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/10 transition-colors"
          >
            {product.outOfStock ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Mobile: Always visible action bar at bottom of image */}
        <div className="flex md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-2 px-2">
          <div className="flex items-center justify-center gap-2 w-full">
            <button
              type="button"
              onClick={handleEdit}
              onTouchEnd={(e) => { e.preventDefault(); handleEdit(e); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/10 active:bg-white/20 touch-manipulation"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Editar</span>
            </button>
            <button
              type="button"
              onClick={handleToggleStock}
              onTouchEnd={(e) => { e.preventDefault(); handleToggleStock(e); }}
              className="p-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/10 active:bg-white/20 touch-manipulation"
            >
              {product.outOfStock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              onTouchEnd={(e) => { e.preventDefault(); handleDelete(e); }}
              className="p-2.5 rounded-lg bg-red-500/20 backdrop-blur-sm text-red-400 border border-red-500/30 active:bg-red-500/30 touch-manipulation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-white truncate">{product.name}</h3>
        <p className="text-primary-400 font-semibold">L. {product.price.toFixed(2)}</p>

        {product.category && (
          <span className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Tag className="w-3 h-3" />
            {product.category}
          </span>
        )}

        {/* Quick stock controls */}
        {product.stockQuantity !== null && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <span className="text-xs text-gray-400">Stock:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleQuickStock(e, -1)}
                disabled={isUpdatingStock || product.stockQuantity === 0}
                className="w-6 h-6 rounded-md bg-dark-200 hover:bg-dark-300 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className={`w-8 text-center text-sm font-medium ${
                stockStatus.color === 'red' ? 'text-red-400' :
                stockStatus.color === 'yellow' ? 'text-yellow-400' :
                'text-white'
              }`}>
                {isUpdatingStock ? '...' : product.stockQuantity}
              </span>
              <button
                onClick={(e) => handleQuickStock(e, 1)}
                disabled={isUpdatingStock}
                className="w-6 h-6 rounded-md bg-dark-200 hover:bg-dark-300 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ManageProductCard;
