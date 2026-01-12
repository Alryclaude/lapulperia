import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Package } from 'lucide-react';
import { productApi } from '../../services/api';
import toast from 'react-hot-toast';
import { ManageProductCard, ProductFormModal, DeleteConfirmModal } from '../../components/products';

const ManageProducts = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-products', search],
    queryFn: () => productApi.getMyProducts({ search }),
  });

  const products = data?.data?.products || [];

  const createMutation = useMutation({
    mutationFn: (data) => productApi.create(data),
    onSuccess: () => {
      toast.success('Producto creado');
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al crear producto'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al actualizar'),
  });

  const updateImageMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.updateImage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al actualizar imagen'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.delete(id),
    onSuccess: () => {
      toast.success('Producto eliminado');
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al eliminar'),
  });

  const toggleStockMutation = useMutation({
    mutationFn: ({ id, outOfStock }) => productApi.update(id, { outOfStock }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-products'] }),
  });

  const openModal = (product = null) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
  };

  const handleSubmit = async ({ formData, imageFile, editProduct }) => {
    if (editProduct) {
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
        await updateMutation.mutateAsync({ id: editProduct.id, data: jsonData });

        if (imageFile) {
          const imageData = new FormData();
          imageData.append('image', imageFile);
          await updateImageMutation.mutateAsync({ id: editProduct.id, data: imageData });
        }

        toast.success('Producto actualizado');
        closeModal();
      } catch {
        // Error handled by mutation
      }
    } else {
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

  const handleToggleStock = (product) => {
    toggleStockMutation.mutate({ id: product.id, outOfStock: !product.outOfStock });
    toast.success(product.outOfStock ? 'Producto disponible' : 'Producto agotado');
  };

  const confirmDelete = () => {
    if (deleteProduct) {
      deleteMutation.mutate(deleteProduct.id);
      setDeleteProduct(null);
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
            <ManageProductCard
              key={product.id}
              product={product}
              index={index}
              onEdit={openModal}
              onDelete={setDeleteProduct}
              onToggleStock={handleToggleStock}
            />
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

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showModal}
        onClose={closeModal}
        editProduct={editProduct}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending || updateImageMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        product={deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default ManageProducts;
