import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({ product, onClose, onConfirm, isDeleting }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100]"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-dark-100 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 sm:m-4 border border-white/10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Eliminar producto</h2>
              <p className="text-gray-400 text-sm">Esta accion no se puede deshacer</p>
            </div>
          </div>

          <div className="bg-dark-200/50 rounded-xl p-4 mb-6 border border-white/5">
            <div className="flex items-center gap-3">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover border border-white/10"
                />
              )}
              <div>
                <p className="font-medium text-white">{product.name}</p>
                <p className="text-primary-400 text-sm font-medium">L. {product.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
