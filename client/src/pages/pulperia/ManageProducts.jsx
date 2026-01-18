import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Package, Filter, CheckCircle, AlertTriangle, XCircle, ChevronDown, Upload } from 'lucide-react';
import { productApi } from '../../services/api';
import toast from 'react-hot-toast';
import { ManageProductCard, ProductFormModal, DeleteConfirmModal, StickyActionBar, BulkImageUpload } from '../../components/products';
import { PRODUCT_CATEGORIES as CATEGORIES } from '../../constants/categories';

const STOCK_FILTERS = [
  { id: 'all', label: 'Todos', icon: Package },
  { id: 'in_stock', label: 'En Stock', icon: CheckCircle, color: 'green' },
  { id: 'low_stock', label: 'Stock Bajo', icon: AlertTriangle, color: 'yellow' },
  { id: 'out_of_stock', label: 'Agotado', icon: XCircle, color: 'red' },
];

const ManageProducts = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-products', search],
    queryFn: () => productApi.getMyProducts({ search }),
  });

  const allProducts = data?.data?.products || [];

  // Filter products by stock status and category
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    // Apply stock filter
    if (stockFilter === 'in_stock') {
      result = result.filter(p => !p.outOfStock && (p.stockQuantity === null || p.stockQuantity > (p.lowStockAlert || 5)));
    } else if (stockFilter === 'low_stock') {
      result = result.filter(p => !p.outOfStock && p.stockQuantity !== null && p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockAlert || 5));
    } else if (stockFilter === 'out_of_stock') {
      result = result.filter(p => p.outOfStock || p.stockQuantity === 0);
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }

    return result;
  }, [allProducts, stockFilter, categoryFilter]);

  // Count products by stock status
  const stockCounts = useMemo(() => {
    const counts = { all: allProducts.length, in_stock: 0, low_stock: 0, out_of_stock: 0 };

    allProducts.forEach(p => {
      if (p.outOfStock || p.stockQuantity === 0) {
        counts.out_of_stock++;
      } else if (p.stockQuantity !== null && p.stockQuantity <= (p.lowStockAlert || 5)) {
        counts.low_stock++;
      } else {
        counts.in_stock++;
      }
    });

    return counts;
  }, [allProducts]);

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
        stockQuantity: formData.stockQuantity,
        lowStockAlert: formData.lowStockAlert,
        sku: formData.sku,
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
      if (formData.stockQuantity !== null && formData.stockQuantity !== undefined) {
        data.append('stockQuantity', formData.stockQuantity);
      }
      if (formData.lowStockAlert) {
        data.append('lowStockAlert', formData.lowStockAlert);
      }
      if (formData.sku) {
        data.append('sku', formData.sku);
      }
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
    <div className="space-y-6 pb-40 md:pb-24">
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
            <p className="text-gray-400 text-sm">{allProducts.length} productos en tu inventario</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-100 hover:bg-dark-200 text-white rounded-xl font-medium transition-colors border border-white/10"
          >
            <Upload className="w-5 h-5" />
            <span>Importar</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filters Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Search and Category */}
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-12 pr-4 py-3 bg-dark-100/60 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-4 py-3 bg-dark-100/60 backdrop-blur-sm border border-white/5 rounded-xl text-white hover:border-white/10 transition-all"
            >
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="hidden sm:inline text-sm">
                {categoryFilter || 'Categoria'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCategoryDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCategoryDropdown(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-48 bg-dark-100 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setCategoryFilter('');
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${
                      !categoryFilter ? 'text-primary-400 bg-primary-500/10' : 'text-gray-300'
                    }`}
                  >
                    Todas las categorias
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategoryFilter(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${
                        categoryFilter === cat ? 'text-primary-400 bg-primary-500/10' : 'text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stock Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STOCK_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = stockFilter === filter.id;
            const count = stockCounts[filter.id];

            return (
              <button
                key={filter.id}
                onClick={() => setStockFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? filter.color === 'green'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : filter.color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : filter.color === 'red'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-100/50 text-gray-400 border border-white/5 hover:bg-dark-100 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
                <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                  isActive ? 'bg-white/10' : 'bg-dark-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
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
      ) : filteredProducts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredProducts.map((product, index) => (
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
          {allProducts.length === 0 ? (
            <>
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
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Sin resultados</h2>
              <p className="text-gray-400 mb-4">No hay productos que coincidan con los filtros</p>
              <button
                onClick={() => {
                  setStockFilter('all');
                  setCategoryFilter('');
                  setSearch('');
                }}
                className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
              >
                Limpiar filtros
              </button>
            </>
          )}
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

      {/* Bulk Import Modal */}
      <BulkImageUpload
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={async () => {
          await queryClient.refetchQueries({ queryKey: ['my-products'] });
          setShowBulkImport(false);
        }}
      />

      {/* Sticky Action Bar (Mobile) */}
      <StickyActionBar
        onAddProduct={() => openModal()}
        onBulkImport={() => setShowBulkImport(true)}
      />
    </div>
  );
};

export default ManageProducts;
