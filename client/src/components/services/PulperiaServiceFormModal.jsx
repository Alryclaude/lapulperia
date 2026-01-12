import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Image as ImageIcon, Wrench, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const PRICE_TYPES = [
  { value: 'FIXED', label: 'Precio fijo' },
  { value: 'HOURLY', label: 'Por hora' },
  { value: 'NEGOTIABLE', label: 'Negociable' },
];

const initialFormData = {
  name: '',
  description: '',
  price: '',
  priceType: 'FIXED',
  duration: '',
  isAvailable: true,
};

const PulperiaServiceFormModal = ({
  isOpen,
  onClose,
  editService,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (editService) {
      setFormData({
        name: editService.name,
        description: editService.description || '',
        price: editService.price?.toString() || '',
        priceType: editService.priceType || 'FIXED',
        duration: editService.duration || '',
        isAvailable: editService.isAvailable,
      });
      setImagePreview(editService.imageUrl);
    } else {
      setFormData(initialFormData);
      setImagePreview(null);
    }
    setImageFile(null);
  }, [editService, isOpen]);

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

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    if (formData.priceType !== 'NEGOTIABLE' && formData.price) {
      submitData.append('price', formData.price);
    }
    submitData.append('priceType', formData.priceType);
    submitData.append('duration', formData.duration);
    submitData.append('isAvailable', formData.isAvailable);

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    await onSubmit(submitData);
  };

  const closeModal = () => {
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview(null);
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
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {editService ? 'Editar Servicio' : 'Nuevo Servicio'}
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
                  Imagen (opcional)
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden max-w-[250px] border border-white/10">
                      <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(editService?.imageUrl || null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-2">
                        <ImageIcon className="w-5 h-5 text-purple-400" />
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
                  Nombre del servicio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                  placeholder="Ej: Delivery a domicilio"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripcion *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all min-h-[100px] resize-none"
                  placeholder="Describe el servicio que ofreces..."
                  required
                />
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-purple-400" />
                    Tipo de precio
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRICE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priceType: type.value })}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        formData.priceType === type.value
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-dark-200/50 text-gray-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Input (shown for FIXED and HOURLY) */}
              {formData.priceType !== 'NEGOTIABLE' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio (L.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                    placeholder={formData.priceType === 'HOURLY' ? 'Precio por hora' : 'Precio fijo'}
                  />
                </motion.div>
              )}

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Duracion estimada
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                  placeholder="Ej: 30-45 minutos"
                />
              </div>

              {/* Available Toggle */}
              <label className="flex items-center gap-3 p-3 bg-dark-200/50 rounded-xl cursor-pointer border border-white/5 hover:border-green-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Servicio disponible</p>
                  <p className="text-xs text-gray-500">Mostrar en tu perfil</p>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${formData.isAvailable ? 'bg-green-500' : 'bg-dark-300'}`}>
                  <motion.div
                    animate={{ x: formData.isAvailable ? 16 : 2 }}
                    className="w-5 h-5 bg-white rounded-full mt-0.5"
                  />
                </div>
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="hidden"
                />
              </label>
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editService ? 'Guardar' : 'Crear'}
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

export default PulperiaServiceFormModal;
