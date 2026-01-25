import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Minus,
  Bell,
  Store,
  Share2,
  ShoppingCart,
  Star,
  MapPin,
  Package,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { productApi } from '../services/api';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { ShareButtons } from '../components/share';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem, isInCart, getItemQuantity, updateQuantity, removeItem } = useCartStore();

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

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  // Not found state - Tema oscuro
  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Producto no encontrado</h2>
        <p className="text-gray-400 mb-6">No pudimos encontrar este producto</p>
        <Button asChild variant="outline">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </motion.div>
    );
  }

  const statusMap = {
    OPEN: { label: 'Abierto', variant: 'open' },
    CLOSING_SOON: { label: 'Por cerrar', variant: 'closing' },
    CLOSED: { label: 'Cerrado', variant: 'closed' },
    VACATION: { label: 'Vacaciones', variant: 'vacation' },
  };

  const pulperiaStatus = statusMap[pulperia?.status] || statusMap.CLOSED;

  return (
    <div className="max-w-2xl mx-auto pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>

        {/* Share Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
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

      {/* Image with Zoom */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-6"
      >
        <Zoom>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-2xl shadow-lg"
          />
        </Zoom>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
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
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 shadow-lg">
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
              className="absolute top-4 right-4"
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
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {/* Name and Category */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
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
          className="text-3xl font-bold text-primary-600"
        >
          L. {product.price.toFixed(2)}
        </motion.p>

        {/* Description */}
        {product.description && (
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        )}

        <Separator />

        {/* Pulperia Card */}
        <Link to={`/pulperia/${pulperia.id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {pulperia.logo ? (
                  <img
                    src={pulperia.logo}
                    alt={pulperia.name}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-background"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center ring-2 ring-background">
                    <Store className="w-7 h-7 text-primary-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{pulperia.name}</p>
                    <StatusBadge status={pulperiaStatus.variant} size="sm">
                      {pulperiaStatus.label}
                    </StatusBadge>
                  </div>
                  {pulperia.address && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{pulperia.address}</span>
                    </div>
                  )}
                  {pulperia.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{pulperia.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({pulperia.reviewCount} reseñas)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Sticky Add to Cart Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border z-40"
      >
        <div className="max-w-2xl mx-auto">
          {product.outOfStock ? (
            <Button
              onClick={handleAlert}
              variant="secondary"
              className="w-full h-14 text-base gap-2"
              size="lg"
            >
              <Bell className="w-5 h-5" />
              Avisarme cuando llegue
            </Button>
          ) : inCart ? (
            <Card className="shadow-lg border-2 border-primary-200 bg-primary-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-primary-700">En tu carrito</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => quantity > 1 ? updateQuantity(id, quantity - 1) : removeItem(id)}
                      className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </motion.button>
                    <motion.span
                      key={quantity}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-xl font-bold text-primary-600 w-10 text-center tabular-nums"
                    >
                      {quantity}
                    </motion.span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(id, quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-primary-500 text-white shadow flex items-center justify-center hover:bg-primary-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary-200">
                  <span className="text-sm text-primary-600">Subtotal</span>
                  <motion.span
                    key={quantity * product.price}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="font-bold text-primary-700"
                  >
                    L. {(quantity * product.price).toFixed(2)}
                  </motion.span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Precio</p>
                <p className="text-xl font-bold text-primary-600">
                  L. {product.price.toFixed(2)}
                </p>
              </div>
              <Button
                onClick={handleAddToCart}
                className="h-14 px-8 text-base gap-2"
                size="lg"
              >
                <Plus className="w-5 h-5" />
                Agregar al Carrito
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetail;
