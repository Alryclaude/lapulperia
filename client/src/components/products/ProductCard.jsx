import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Eye, AlertTriangle, Sparkles, Calendar, Zap } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cardHover } from '@/lib/animations';

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
    <Link to={`/product/${product.id}`} className="block">
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        <Card className="overflow-hidden group h-full bg-dark-100/60 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-square bg-dark-200">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-400/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              <AnimatePresence>
                {product.isFeatured && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Badge className="gap-1 bg-accent-500/90 text-white border-accent-400/50 shadow-gold">
                      <Sparkles className="w-3 h-3" />
                      Destacado
                    </Badge>
                  </motion.div>
                )}
                {product.isSeasonal && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 gap-1">
                      <Calendar className="w-3 h-3" />
                      {product.seasonalTag || 'Temporada'}
                    </Badge>
                  </motion.div>
                )}
                {product.sellsQuickly && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30 gap-1">
                      <Zap className="w-3 h-3" />
                      Se agota rapido
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Out of stock overlay */}
            <AnimatePresence>
              {product.outOfStock && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-dark-400/90 backdrop-blur-[2px] flex items-center justify-center"
                >
                  <Badge className="gap-1.5 bg-red-500/90 text-white shadow-lg">
                    <AlertTriangle className="w-4 h-4" />
                    Agotado
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Views count for featured */}
            {product.isFeatured && product.viewsToday > 0 && (
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-dark-400/80 text-white border-white/10 gap-1">
                  <Eye className="w-3 h-3" />
                  {product.viewsToday}
                </Badge>
              </div>
            )}

            {/* Cart quantity indicator */}
            <AnimatePresence>
              {inCart && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-2 right-2"
                >
                  <Badge className="bg-primary-500 text-white shadow-primary border-none">
                    {quantity}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
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
            <h3 className="font-medium text-white line-clamp-2 text-sm group-hover:text-primary-400 transition-colors">
              {product.name}
            </h3>

            {/* Category */}
            {product.category && (
              <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
            )}

            {/* Price and cart button */}
            <div className="flex items-center justify-between mt-3">
              <span className="font-bold text-white">
                L. {product.price.toFixed(2)}
              </span>

              {!product.outOfStock && (
                inCart ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDecrement}
                      className="w-8 h-8 rounded-lg bg-dark-50 hover:bg-dark-200 flex items-center justify-center transition-colors text-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <motion.span
                      key={quantity}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="w-8 text-center font-semibold text-sm tabular-nums text-white"
                    >
                      {quantity}
                    </motion.span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleIncrement}
                      className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddToCart}
                    className="w-9 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors shadow-primary"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                )
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
