import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Image as ImageIcon, Megaphone, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const initialFormData = {
  title: '',
  description: '',
  price: '',
};

/**
 * AnnouncementFormModal - Modal para crear/editar anuncios
 */
const AnnouncementFormModal = ({
  isOpen,
  onClose,
  editAnnouncement,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editAnnouncement) {
      setFormData({
        title: editAnnouncement.title,
        description: editAnnouncement.description || '',
        price: editAnnouncement.price?.toString() || '',
      });
      setImagePreview(editAnnouncement.imageUrl);
      setImageAspectRatio(editAnnouncement.imageAspectRatio || 1);
    } else {
      setFormData(initialFormData);
      setImagePreview(null);
      setImageAspectRatio(1);
    }
    setImageFile(null);
  }, [editAnnouncement, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede superar 5MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }

      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      // Calcular aspect ratio de la imagen
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setImageAspectRatio(ratio);
      };
      img.src = url;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (formData.title.length > 60) {
      toast.error('El título no puede exceder 60 caracteres');
      return;
    }

    if (!editAnnouncement && !imageFile) {
      toast.error('La imagen es requerida');
      return;
    }

    // Construir FormData
    const submitData = new FormData();
    submitData.append('title', formData.title.trim());
    if (formData.description) {
      submitData.append('description', formData.description.trim());
    }
    if (formData.price) {
      submitData.append('price', formData.price);
    }
    if (imageFile) {
      submitData.append('image', imageFile);
      submitData.append('imageAspectRatio', imageAspectRatio);
    }

    await onSubmit({ formData: submitData, editAnnouncement });
  };

  const closeModal = () => {
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview(null);
    setImageAspectRatio(1);
    onClose();
  };

  if (!isOpen) return null;

  const titleLength = formData.title.length;
  const maxTitleLength = 60;

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
          className="bg-dark-100 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[80vh] sm:max-h-[85vh] flex flex-col sm:m-4 border border-white/10"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {editAnnouncement ? 'Editar Anuncio' : 'Nuevo Anuncio'}
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
            <div className="p-5 pb-20 space-y-5 overflow-y-auto flex-1">
              {/* Imagen - Prominente */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen del afiche *
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div
                      className="relative rounded-xl overflow-hidden border border-white/10"
                      style={{ maxHeight: '250px' }}
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '250px' }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(editAnnouncement?.imageUrl || null);
                          setImageAspectRatio(editAnnouncement?.imageAspectRatio || 1);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ) : (
                    <label
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-3">
                        <ImageIcon className="w-6 h-6 text-orange-400" />
                      </div>
                      <span className="text-sm text-gray-400 font-medium">
                        Click para subir tu afiche
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        JPG, PNG hasta 5MB
                      </span>
                    </label>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Título */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Título del anuncio *
                  </label>
                  <span className={`text-xs ${titleLength > maxTitleLength ? 'text-red-400' : 'text-gray-500'}`}>
                    {titleLength}/{maxTitleLength}
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={maxTitleLength}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                  placeholder="Ej: Pollo asado con papas L.85"
                  required
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Precio (opcional)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    L.
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Descripción (opcional)
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.description.length}/200
                  </span>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none"
                  placeholder="Detalles adicionales de tu oferta..."
                />
              </div>

              {/* Info */}
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <p className="text-sm text-orange-200">
                  Tu anuncio será visible por <strong>7 días</strong> para todos los clientes
                  cercanos a tu negocio.
                </p>
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editAnnouncement ? 'Guardar' : 'Publicar'}
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

export default AnnouncementFormModal;
