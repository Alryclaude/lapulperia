import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, Edit2, Trash2, Package, Star, Eye, EyeOff,
  Image as ImageIcon, X, Check, AlertCircle
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
      toast.success('Producto actualizado');
      queryClient.invalidateQueries(['my-products']);
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Error al actualizar'),
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

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('isFeatured', formData.isFeatured);
    data.append('isSeasonal', formData.isSeasonal);
    data.append('seasonalTag', formData.seasonalTag);
    if (imageFile) {
      data.append('image', imageFile);
    }

    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, data });
    } else {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Productos</h1>
          <p className="text-gray-500">{products.length} productos</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Agregar
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl"
        />
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-3">
              <div className="skeleton aspect-square rounded-xl mb-3" />
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="card overflow-hidden group">
              <div className="relative aspect-square">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`w-full h-full object-cover ${product.outOfStock ? 'opacity-50' : ''}`}
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isFeatured && (
                    <span className="badge-accent text-xs">Destacado</span>
                  )}
                  {product.isSeasonal && (
                    <span className="badge bg-blue-100 text-blue-700 text-xs">
                      {product.seasonalTag || 'Temporada'}
                    </span>
                  )}
                  {product.outOfStock && (
                    <span className="badge-error text-xs">Agotado</span>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openModal(product)}
                    className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleStockMutation.mutate({ id: product.id, outOfStock: !product.outOfStock })}
                    className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100"
                  >
                    {product.outOfStock ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-3">
                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-primary-600 font-semibold">L. {product.price.toFixed(2)}</p>
                {product.category && (
                  <span className="text-xs text-gray-500">{product.category}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin productos</h2>
          <p className="text-gray-500 mb-6">Agrega tu primer producto</p>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="w-5 h-5" />
            Agregar Producto
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[100]">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] sm:max-h-[85vh] flex flex-col sm:m-4">
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {editProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del producto
                  </label>
                  <div className="relative">
                    {imagePreview ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden max-w-[200px]">
                        <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(editProduct?.imageUrl || null);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click para subir imagen</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (Lempiras) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ej: Bebidas, Abarrotes..."
                    className="input"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripcion
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input min-h-[60px]"
                    placeholder="Opcional..."
                  />
                </div>

                {/* Badges */}
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-5 h-5 rounded text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Producto Destacado</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSeasonal}
                      onChange={(e) => setFormData({ ...formData, isSeasonal: e.target.checked })}
                      className="w-5 h-5 rounded text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Producto de Temporada</p>
                    </div>
                  </label>

                  {formData.isSeasonal && (
                    <input
                      type="text"
                      value={formData.seasonalTag}
                      onChange={(e) => setFormData({ ...formData, seasonalTag: e.target.value })}
                      placeholder="Etiqueta: Verano, Navidad..."
                      className="input"
                    />
                  )}
                </div>
              </div>

              {/* Fixed Action Buttons */}
              <div
                className="p-4 border-t bg-white flex-shrink-0"
                style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
              >
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn-primary flex-1"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {editProduct ? 'Guardar' : 'Crear'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
