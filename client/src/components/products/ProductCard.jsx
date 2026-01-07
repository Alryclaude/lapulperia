import { Link } from 'react-router-dom';
import { Plus, Minus, Eye, AlertTriangle } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const ProductCard = ({ product, pulperia, showPulperia = false }) => {
  const { isAuthenticated } = useAuthStore();
  const { addItem, removeItem, isInCart, getItemQuantity, updateQuantity } = useCartStore();

  const quantity = getItemQuantity(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Inicia sesion para agregar al carrito');
      return;
    }

    if (product.outOfStock) {
      toast.error('Producto agotado');
      return;
    }

    addItem(product, pulperia);
    toast.success('Agregado al carrito');
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
      toast.success('Eliminado del carrito');
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="card card-hover block overflow-hidden group"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="badge-accent">
              Destacado
            </span>
          )}
          {product.isSeasonal && (
            <span className="badge bg-blue-100 text-blue-700">
              {product.seasonalTag || 'Temporada'}
            </span>
          )}
          {product.sellsQuickly && (
            <span className="badge bg-orange-100 text-orange-700">
              Se agota rapido
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {product.outOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="badge-error flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Agotado
            </span>
          </div>
        )}

        {/* Views count for featured */}
        {product.isFeatured && product.viewsToday > 0 && (
          <div className="absolute bottom-2 right-2 badge bg-black/60 text-white">
            <Eye className="w-3 h-3" />
            {product.viewsToday}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Pulperia name */}
        {showPulperia && pulperia && (
          <p className="text-xs text-gray-500 mb-1 truncate">
            {pulperia.name}
          </p>
        )}

        {/* Product name */}
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
        )}

        {/* Price and cart button */}
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-gray-900">
            L. {product.price.toFixed(2)}
          </span>

          {!product.outOfStock && (
            inCart ? (
              <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-9 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            )
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
