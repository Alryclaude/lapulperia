import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Package, Star, Eye, EyeOff,
  Image as ImageIcon, X, Check, AlertCircle, Tag, Sparkles, Calendar
} from 'lucide-react';
import { productApi } from '../../services/api';
import toast from 'react-hot-toast';

const ManageProducts = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isFeatured: false,
    isSeasonal: false,
    seasonalTag: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-products', search],
    queryFn: () => productApi.getMyProducts({ search }),
  });

  const products = data?.data?.products || [];

  const createMutation = useMutation({
    mutationFn: (data) => productApi.create(data),
    onSuccess: () => {
      toast.success('Producto creado');
      queryClient.invalidateQueries(['my-products']);
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al crear producto'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-products']);
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al actualizar'),
  });

  const updateImageMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.updateImage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-products']);
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al actualizar imagen'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.delete(id),
    onSuccess: () => {
      toast.success('Producto eliminado');
      queryClient.invalidateQueries(['my-products']);
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al eliminar'),
  });

  const toggleStockMutation = useMutation({
    mutationFn: ({ id, outOfStock }) => productApi.update(id, { outOfStock }),
    onSuccess: () => queryClient.invalidateQueries(['my-products']),
  });

  const openModal = (product = null) => {
    if (product) {
      setEditProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category || '',
        isFeatured: product.isFeatured,
        isSeasonal: product.isSeasonal,
        seasonalTag: product.seasonalTag || '',
      });
      setImagePreview(product.imageUrl);
    } else {
      setEditProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        isFeatured: false,
        isSeasonal: false,
        seasonalTag: '',
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      isFeatured: false,
      isSeasonal: false,
      seasonalTag: '',
    });
    setImageFile(null);
    setImagePreview(null);
  };

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

    if (editProduct) {
      // For updates: Send JSON data (not FormData)
      const jsonData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        isFeatured: formData.isFeatured,
        isSeasonal: formData.isSeasonal,
        seasonalTag: formData.seasonalTag,
      };

      try {
        // Update product data
        await updateMutation.mutateAsync({ id: editProduct.id, data: jsonData });

        // If there's a new image, update it separately
        if (imageFile) {
          const imageData = new FormData();
          imageData.append('image', imageFile);
          await updateImageMutation.mutateAsync({ id: editProduct.id, data: imageData });
        }

        toast.success('Producto actualizado');
        closeModal();
      } catch {
        // Error already handled by mutation onError
      }
    } else {
      // For create: Send FormData with image
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('isFeatured', formData.isFeatured);
      data.append('isSeasonal', formData.isSeasonal);
      data.append('seasonalTag', formData.seasonalTag);
      data.append('image', imageFile);

      createMutation.mutate(data);
    }
  };

  const handleDelete = (product) => {
    if (window.confirm(`Eliminar "${product.name}"?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Productos</h1>
            <p className="text-gray-400 text-sm">{products.length} productos en tu inventario</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Agregar</span>
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-12 pr-4 py-3 bg-dark-100/60 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
        />
      </motion.div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-3">
              <div className="aspect-square rounded-xl bg-dark-200 animate-pulse mb-3" />
              <div className="h-4 w-3/4 bg-dark-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all"
            >
              <div className="relative aspect-square">
                <img
                  src={product.imageUrl}
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
                  {product.outOfStock && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 backdrop-blur-sm text-red-400 text-xs font-medium rounded-lg border border-red-500/30">
                      <AlertCircle className="w-3 h-3" />
                      Agotado
                    </span>
                  )}
                </div>

                {/* Desktop: Actions Overlay (hover only) */}
                <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 items-end justify-center gap-2 pb-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openModal(product)}
                    className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/10 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleStockMutation.mutate({ id: product.id, outOfStock: !product.outOfStock })}
                    className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/10 transition-colors"
                  >
                    {product.outOfStock ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(product)}
                    className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Mobile: Always visible action bar at bottom of image */}
                <div className="flex md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-2 px-2">
                  <div className="flex items-center justify-center gap-2 w-full">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); openModal(product); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/10"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Editar</span>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); toggleStockMutation.mutate({ id: product.id, outOfStock: !product.outOfStock }); }}
                      className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/10"
                    >
                      {product.outOfStock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                      className="p-2 rounded-lg bg-red-500/20 backdrop-blur-sm text-red-400 border border-red-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
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
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin productos</h2>
          <p className="text-gray-400 mb-6">Agrega tu primer producto para comenzar</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Producto
          </motion.button>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
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

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio (Lempiras) *
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
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ej: Bebidas, Abarrotes..."
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[80px] resize-none"
                      placeholder="Descripción opcional..."
                    />
                  </div>

                  {/* Badges */}
                  <div className="space-y-3">
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
                      disabled={createMutation.isPending || updateMutation.isPending || updateImageMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                    >
                      {(createMutation.isPending || updateMutation.isPending || updateImageMutation.isPending) ? (
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageProducts;
