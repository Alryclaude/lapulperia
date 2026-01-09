import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Eye, AlertTriangle, Sparkles, Calendar, Zap } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        <Card className="overflow-hidden group h-full">
          {/* Image */}
          <div className="relative aspect-square bg-muted">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              <AnimatePresence>
                {product.isFeatured && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Badge variant="accent" className="gap-1 shadow-sm">
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
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 shadow-sm">
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
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1 shadow-sm">
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
                  className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center"
                >
                  <Badge variant="destructive" className="gap-1.5 shadow-lg">
                    <AlertTriangle className="w-4 h-4" />
                    Agotado
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Views count for featured */}
            {product.isFeatured && product.viewsToday > 0 && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="bg-black/60 text-white border-none gap-1">
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
                  <Badge className="bg-primary-500 text-white shadow-lg">
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
              <p className="text-xs text-muted-foreground mb-1 truncate">
                {pulperia.name}
              </p>
            )}

            {/* Product name */}
            <h3 className="font-medium text-foreground line-clamp-2 text-sm group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>

            {/* Category */}
            {product.category && (
              <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
            )}

            {/* Price and cart button */}
            <div className="flex items-center justify-between mt-3">
              <span className="font-bold text-foreground">
                L. {product.price.toFixed(2)}
              </span>

              {!product.outOfStock && (
                inCart ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDecrement}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <motion.span
                      key={quantity}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="w-8 text-center font-semibold text-sm tabular-nums"
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
                    className="w-9 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors shadow-sm"
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
