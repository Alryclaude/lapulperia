import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ImagePlus, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { productApi } from '../../services/api';
import toast from 'react-hot-toast';
import ImageProductCard from './ImageProductCard';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const BulkImageUpload = ({ isOpen, onClose, onSuccess }) => {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      images.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      setImages([]);
      setUploadProgress(0);
    }
  }, [isOpen]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach((file) => {
      const errors = file.errors.map((e) => e.message).join(', ');
      toast.error(`${file.file.name}: ${errors}`);
    });

    // Create image objects with previews
    const newImages = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: '',
      price: '',
      description: '',
      category: '',
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
  });

  const handleUpdate = (index, updatedImage) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = updatedImage;
      return newImages;
    });
  };

  const handleRemove = (index) => {
    setImages((prev) => {
      const img = prev[index];
      if (img.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const completeImages = images.filter((img) => {
    const priceNum = parseFloat(img.price);
    return img.name?.trim() && img.price !== '' && !isNaN(priceNum) && priceNum > 0;
  });
  const incompleteCount = images.length - completeImages.length;

  const handleSubmit = async () => {
    if (completeImages.length === 0) {
      toast.error('No hay productos completos para crear');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Add images and product data as indexed fields (Multer parses these correctly)
      completeImages.forEach((img, index) => {
        formData.append('images', img.file);
        formData.append(`products[${index}][name]`, img.name.trim());
        formData.append(`products[${index}][price]`, parseFloat(img.price));
        formData.append(`products[${index}][description]`, img.description?.trim() || '');
        formData.append(`products[${index}][category]`, img.category || '');
      });

      // Simulate progress (actual progress would require XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await productApi.bulkCreateWithImages(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      const { created, errors } = response.data;

      // Si no se creó ningún producto, no cerrar el modal
      if (created === 0) {
        toast.error('No se creó ningún producto. Verifica los datos.');
        setIsUploading(false);
        return;
      }

      if (created > 0) {
        toast.success(`${created} producto${created > 1 ? 's' : ''} creado${created > 1 ? 's' : ''}`);
      }

      if (errors && errors.length > 0) {
        toast.warning(`${errors.length} producto${errors.length > 1 ? 's' : ''} con errores`);
      }

      // ESPERAR refetch antes de cerrar modal
      await onSuccess?.();
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error(error.response?.data?.error?.message || 'Error al crear productos');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !isUploading && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] bg-dark-100 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Importar Productos</h2>
            <p className="text-sm text-gray-400">
              {images.length === 0
                ? 'Selecciona imágenes para comenzar'
                : `${completeImages.length} de ${images.length} productos listos`}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {images.length === 0 ? (
            /* Dropzone */
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
                isDragActive
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                <ImagePlus className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {isDragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Formatos: JPG, PNG, WEBP • Máximo 10MB cada una
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
              >
                <Upload className="w-5 h-5" />
                Seleccionar Imágenes
              </button>
            </div>
          ) : (
            /* Image Grid */
            <div className="space-y-4">
              {/* Add More Button */}
              {!isUploading && (
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-white/40 transition-colors cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <p className="text-gray-400 text-sm">
                    <span className="text-primary-400">+ Agregar más imágenes</span>
                  </p>
                </div>
              )}

              {/* Status Summary */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  <span>{completeImages.length} completos</span>
                </div>
                {incompleteCount > 0 && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{incompleteCount} pendientes</span>
                  </div>
                )}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                  {images.map((image, index) => (
                    <ImageProductCard
                      key={`${image.file.name}-${index}`}
                      image={image}
                      index={index}
                      onUpdate={handleUpdate}
                      onRemove={handleRemove}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {images.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-dark-200/50">
            {isUploading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Subiendo productos...</span>
                  <span className="text-primary-400">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-dark-300 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-primary-500 rounded-full"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    images.forEach((img) => {
                      if (img.preview) URL.revokeObjectURL(img.preview);
                    });
                    setImages([]);
                  }}
                  className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  Limpiar todo
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={completeImages.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors min-h-[44px]"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  Crear {completeImages.length} producto{completeImages.length !== 1 ? 's' : ''}
                </motion.button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BulkImageUpload;
