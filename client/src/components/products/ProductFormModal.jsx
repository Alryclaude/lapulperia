import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, X, Check, Image as ImageIcon, Star, Calendar, Sparkles, Package, AlertTriangle, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { PRODUCT_CATEGORIES as CATEGORIES } from '../../constants/categories';

const initialFormData = {
  name: '',
  description: '',
  price: '',
  category: '',
  isFeatured: false,
  isSeasonal: false,
  seasonalTag: '',
  stockQuantity: '',
  lowStockAlert: '5',
  sku: '',
};

const ProductFormModal = ({
  isOpen,
  onClose,
  editProduct,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [trackInventory, setTrackInventory] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name,
        description: editProduct.description || '',
        price: editProduct.price.toString(),
        category: editProduct.category || '',
        isFeatured: editProduct.isFeatured,
        isSeasonal: editProduct.isSeasonal,
        seasonalTag: editProduct.seasonalTag || '',
        stockQuantity: editProduct.stockQuantity?.toString() || '',
        lowStockAlert: editProduct.lowStockAlert?.toString() || '5',
        sku: editProduct.sku || '',
      });
      setImagePreview(editProduct.imageUrl);
      setTrackInventory(editProduct.stockQuantity !== null);
    } else {
      setFormData(initialFormData);
      setImagePreview(null);
      setTrackInventory(false);
    }
    setImageFile(null);
  }, [editProduct, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('La imagen no puede superar 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editProduct && !imageFile) {
      toast.error('Selecciona una imagen');
      return;
    }

    const submitData = {
      ...formData,
      stockQuantity: trackInventory ? parseInt(formData.stockQuantity) || 0 : null,
      lowStockAlert: trackInventory ? parseInt(formData.lowStockAlert) || 5 : null,
    };

    await onSubmit({ formData: submitData, imageFile, editProduct });
  };

  const closeModal = () => {
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview(null);
    setTrackInventory(false);
    onClose();
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
          className="bg-dark-100 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col sm:m-4 border border-white/10"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                {editProduct ? <Edit2 className="w-5 h-5 text-primary-400" /> : <Sparkles className="w-5 h-5 text-primary-400" />}
              </div>
              <h2 className="text-xl font-bold text-white">
                {editProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen del producto
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden max-w-[200px] border border-white/10">
                      <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(editProduct?.imageUrl || null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center mb-2">
                        <ImageIcon className="w-5 h-5 text-primary-400" />
                      </div>
                      <span className="text-sm text-gray-400">Click para subir imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                  placeholder="Nombre del producto"
                  required
                />
              </div>

              {/* Price & Category Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio (L.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripcion
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[80px] resize-none"
                  placeholder="Descripcion opcional..."
                />
              </div>

              {/* Inventory Section */}
              <div className="border-t border-white/5 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-orange-400" />
                  <span className="font-medium text-white">Inventario</span>
                </div>

                {/* Track Inventory Toggle */}
                <label className="flex items-center gap-3 p-3 bg-dark-200/50 rounded-xl cursor-pointer border border-white/5 hover:border-orange-500/30 transition-colors mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">Controlar inventario</p>
                    <p className="text-xs text-gray-500">Llevar registro de cantidad</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors ${trackInventory ? 'bg-orange-500' : 'bg-dark-300'}`}>
                    <motion.div
                      animate={{ x: trackInventory ? 16 : 2 }}
                      className="w-5 h-5 bg-white rounded-full mt-0.5"
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={trackInventory}
                    onChange={(e) => setTrackInventory(e.target.checked)}
                    className="hidden"
                  />
                </label>

                <AnimatePresence>
                  {trackInventory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        {/* Stock Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            <span className="flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-gray-400" />
                              Stock actual
                            </span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                            className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                            placeholder="0"
                          />
                        </div>

                        {/* Low Stock Alert */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                              Alerta bajo
                            </span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.lowStockAlert}
                            onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
                            className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                            placeholder="5"
                          />
                        </div>
                      </div>

                      {/* SKU */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Hash className="w-4 h-4 text-gray-400" />
                            SKU (opcional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                          placeholder="Codigo interno del producto"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Badges */}
              <div className="border-t border-white/5 pt-5 space-y-3">
                <span className="font-medium text-white">Opciones</span>

                <label className="flex items-center gap-3 p-3 bg-dark-200/50 rounded-xl cursor-pointer border border-white/5 hover:border-yellow-500/30 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">Producto Destacado</p>
                    <p className="text-xs text-gray-500">Aparece primero en tu tienda</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors ${formData.isFeatured ? 'bg-yellow-500' : 'bg-dark-300'}`}>
                    <motion.div
                      animate={{ x: formData.isFeatured ? 16 : 2 }}
                      className="w-5 h-5 bg-white rounded-full mt-0.5"
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center gap-3 p-3 bg-dark-200/50 rounded-xl cursor-pointer border border-white/5 hover:border-blue-500/30 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">Producto de Temporada</p>
                    <p className="text-xs text-gray-500">Muestra etiqueta especial</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors ${formData.isSeasonal ? 'bg-blue-500' : 'bg-dark-300'}`}>
                    <motion.div
                      animate={{ x: formData.isSeasonal ? 16 : 2 }}
                      className="w-5 h-5 bg-white rounded-full mt-0.5"
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isSeasonal}
                    onChange={(e) => setFormData({ ...formData, isSeasonal: e.target.checked })}
                    className="hidden"
                  />
                </label>

                <AnimatePresence>
                  {formData.isSeasonal && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="text"
                        value={formData.seasonalTag}
                        onChange={(e) => setFormData({ ...formData, seasonalTag: e.target.value })}
                        placeholder="Etiqueta: Verano, Navidad..."
                        className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Fixed Action Buttons */}
            <div
              className="p-5 border-t border-white/5 bg-dark-100 flex-shrink-0"
              style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            >
              <div className="flex gap-3">
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
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editProduct ? 'Guardar' : 'Crear'}
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

export default ProductFormModal;
