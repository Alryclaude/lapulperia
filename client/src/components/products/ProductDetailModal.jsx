import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  Bell,
  Store,
  Share2,
  ShoppingCart,
  Star,
  MapPin,
  Sparkles,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { productApi } from '@/services/api';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import ShareButtons from '@/components/ShareButtons';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const ProductDetailModal = ({ product, pulperia, open, onOpenChange }) => {
  const { isAuthenticated } = useAuthStore();
  const { addItem, isInCart, getItemQuantity, updateQuantity, removeItem } = useCartStore();
  const [shareOpen, setShareOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!product || !pulperia) return null;

  const quantity = getItemQuantity(product.id);
  const inCart = isInCart(product.id);

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
      await productApi.createAlert(product.id);
      toast.success('Te avisaremos cuando llegue');
    } catch (error) {
      toast.error('Error al crear alerta');
    }
  };

  const statusMap = {
    OPEN: { label: 'Abierto', variant: 'open' },
    CLOSING_SOON: { label: 'Por cerrar', variant: 'closing' },
    CLOSED: { label: 'Cerrado', variant: 'closed' },
    VACATION: { label: 'Vacaciones', variant: 'vacation' },
  };

  const pulperiaStatus = statusMap[pulperia?.status] || statusMap.CLOSED;

  const ModalContent = () => (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto -mx-6 px-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="pb-4">
          {/* Image with Zoom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mb-4"
          >
            <Zoom>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-2xl"
              />
            </Zoom>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <AnimatePresence>
                {product.isFeatured && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Badge variant="accent" className="gap-1 shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      Destacado
                    </Badge>
                  </motion.div>
                )}
                {product.isSeasonal && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 gap-1 shadow-lg">
                      <Calendar className="w-3 h-3" />
                      {product.seasonalTag || 'Temporada'}
                    </Badge>
                  </motion.div>
                )}
                {product.outOfStock && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge variant="destructive" className="gap-1 shadow-lg">
                      <AlertCircle className="w-3 h-3" />
                      Agotado
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart indicator */}
            <AnimatePresence>
              {inCart && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-3 right-3"
                >
                  <Badge className="gap-1 shadow-lg bg-primary-500">
                    <ShoppingCart className="w-3 h-3" />
                    {quantity} en carrito
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            {/* Name and Category */}
            <div>
              <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
              {product.category && (
                <Badge variant="secondary" className="mt-2">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* Price */}
            <motion.p
              key={product.price}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-primary-500"
            >
              L. {product.price.toFixed(2)}
            </motion.p>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
            )}

            <Separator className="my-3" />

            {/* Pulperia Card */}
            <Link
              to={`/pulperia/${pulperia.id}`}
              onClick={() => onOpenChange(false)}
            >
              <Card className="bg-dark-100/60 border-white/5 hover:border-white/10 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {pulperia.logo ? (
                      <img
                        src={pulperia.logo}
                        alt={pulperia.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center ring-2 ring-white/10">
                        <Store className="w-6 h-6 text-primary-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate text-sm">{pulperia.name}</p>
                        <StatusBadge status={pulperiaStatus.variant} size="sm">
                          {pulperiaStatus.label}
                        </StatusBadge>
                      </div>
                      {pulperia.address && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{pulperia.address}</span>
                        </div>
                      )}
                      {pulperia.rating > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-medium text-foreground">{pulperia.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({pulperia.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Share Button */}
            <Sheet open={shareOpen} onOpenChange={setShareOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <Share2 className="w-4 h-4" />
                  Compartir
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle>Compartir {product.name}</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <ShareButtons
                    title={product.name}
                    text={`Mira ${product.name} en La Pulperia - L. ${product.price.toFixed(2)}`}
                    variant="icons"
                  />
                </div>
              </SheetContent>
            </Sheet>
          </motion.div>
        </div>
      </div>

      {/* Sticky Add to Cart Bar */}
      <div className="pt-4 border-t border-white/5 -mx-6 px-6 pb-2 bg-background">
        {product.outOfStock ? (
          <Button
            onClick={handleAlert}
            variant="secondary"
            className="w-full h-12 text-sm gap-2"
          >
            <Bell className="w-4 h-4" />
            Avisarme cuando llegue
          </Button>
        ) : inCart ? (
          <Card className="bg-primary-500/10 border-primary-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-primary-400">En carrito</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => quantity > 1 ? updateQuantity(product.id, quantity - 1) : removeItem(product.id)}
                    className="w-8 h-8 rounded-lg bg-dark-200 flex items-center justify-center hover:bg-dark-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold text-primary-500 w-8 text-center tabular-nums"
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary-500/20">
                <span className="text-xs text-primary-400">Subtotal</span>
                <motion.span
                  key={quantity * product.price}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-bold text-primary-400"
                >
                  L. {(quantity * product.price).toFixed(2)}
                </motion.span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Precio</p>
              <p className="text-lg font-bold text-primary-500">
                L. {product.price.toFixed(2)}
              </p>
            </div>
            <Button
              onClick={handleAddToCart}
              className="h-12 px-6 text-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop: Centered Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] p-6 bg-dark-200 border-white/10">
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          <ModalContent />
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile: Bottom Sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-6 bg-dark-200 border-white/10">
        <ModalContent />
      </SheetContent>
    </Sheet>
  );
};

export default ProductDetailModal;
