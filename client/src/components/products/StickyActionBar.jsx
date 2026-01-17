import { motion } from 'framer-motion';
import { Plus, Upload } from 'lucide-react';

const StickyActionBar = ({ onAddProduct, onBulkImport }) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-20 left-0 right-0 z-[55] px-4 md:hidden"
    >
      <div className="bg-dark-100/95 backdrop-blur-lg border border-white/10 rounded-2xl p-3 shadow-xl">
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddProduct}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors min-h-[48px]"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBulkImport}
            className="flex items-center justify-center gap-2 px-4 py-3.5 bg-dark-200 hover:bg-dark-300 text-white rounded-xl font-medium transition-colors border border-white/10 min-h-[48px]"
          >
            <Upload className="w-5 h-5" />
            <span>Importar</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default StickyActionBar;
