import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Minus, Bell, Store, Share2, X } from 'lucide-react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { productApi } from '../services/api';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import ShareButtons from '../components/ShareButtons';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { addItem, isInCart, getItemQuantity, updateQuantity, removeItem } = useCartStore();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShareMenu]);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
  });

  const product = data?.data?.product;
  const pulperia = product?.pulperia;
  const quantity = getItemQuantity(id);
  const inCart = isInCart(id);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesion para agregar al carrito');
      return;
    }
    addItem(product, pulperia);
    toast.success('Agregado al carrito');
  };

  const handleAlert = async () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesion para recibir alertas');
      return;
    }
    try {
      await productApi.createAlert(id);
      toast.success('Te avisaremos cuando llegue');
    } catch (error) {
      toast.error('Error al crear alerta');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton aspect-square max-w-md mx-auto rounded-2xl" />
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-6 w-1/2" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Producto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <Link to={-1} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-5 h-5" />
        Volver
      </Link>

      {/* Image with Zoom */}
      <div className="relative mb-6">
        <Zoom>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-2xl"
          />
        </Zoom>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isFeatured && <span className="badge-accent">Destacado</span>}
          {product.isSeasonal && <span className="badge bg-blue-100 text-blue-700">{product.seasonalTag || 'Temporada'}</span>}
          {product.outOfStock && <span className="badge-error">Agotado</span>}
        </div>

        {/* Share */}
        <div className="absolute top-4 right-4" ref={shareMenuRef}>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-2.5 rounded-xl bg-white/90 hover:bg-white shadow"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>

          {/* Share dropdown menu */}
          {showShareMenu && (
            <div className="absolute right-0 mt-2 p-3 bg-white rounded-xl shadow-lg z-50 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Compartir</span>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <ShareButtons
                title={product.name}
                text={`Mira ${product.name} en La Pulperia`}
                variant="icons"
              />
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          {product.category && <span className="badge-gray mt-2">{product.category}</span>}
        </div>

        <p className="text-3xl font-bold text-primary-600">L. {product.price.toFixed(2)}</p>

        {product.description && (
          <p className="text-gray-600">{product.description}</p>
        )}

        {/* Pulperia Link */}
        <Link
          to={`/pulperia/${pulperia.id}`}
          className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {pulperia.logo ? (
            <img src={pulperia.logo} alt="" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-600" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{pulperia.name}</p>
            <p className="text-sm text-gray-500">
              {pulperia.status === 'OPEN' ? 'Abierto ahora' : 'Cerrado'}
            </p>
          </div>
        </Link>

        {/* Actions */}
        {product.outOfStock ? (
          <button onClick={handleAlert} className="btn-secondary w-full">
            <Bell className="w-5 h-5" />
            Avisarme cuando llegue
          </button>
        ) : inCart ? (
          <div className="flex items-center justify-center gap-4 p-4 bg-primary-50 rounded-xl">
            <button
              onClick={() => quantity > 1 ? updateQuantity(id, quantity - 1) : removeItem(id)}
              className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-50"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-2xl font-bold text-primary-600 w-16 text-center">{quantity}</span>
            <button
              onClick={() => updateQuantity(id, quantity + 1)}
              className="w-12 h-12 rounded-xl bg-primary-500 text-white shadow flex items-center justify-center hover:bg-primary-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button onClick={handleAddToCart} className="btn-primary w-full text-lg py-4">
            <Plus className="w-5 h-5" />
            Agregar al Carrito
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
