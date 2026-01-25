import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Store,
  MessageSquare,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { orderApi } from '../services/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AnimatedList,
  AnimatedListItem,
  FadeInView,
} from '@/components/ui';
import { staggerItem } from '@/lib/animations';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getItemsByPulperia, getTotalPrice } = useCartStore();
  const [notes, setNotes] = useState({});
  const [isOrdering, setIsOrdering] = useState(false);

  const groupedItems = getItemsByPulperia();
  const totalPrice = getTotalPrice();

  const createOrdersMutation = useMutation({
    mutationFn: (orders) => orderApi.createBatch({ orders }),
    onSuccess: (data) => {
      clearCart();
      toast.success(`${data.data.orders.length} pedido(s) enviado(s)!`);
      navigate('/orders');
    },
    onError: () => {
      toast.error('Error al crear pedidos');
    },
  });

  const handleOrder = async () => {
    if (items.length === 0) return;

    setIsOrdering(true);
    const orders = groupedItems.map((group) => ({
      pulperiaId: group.pulperia.id,
      items: group.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      notes: notes[group.pulperia.id] || '',
    }));

    await createOrdersMutation.mutateAsync(orders);
    setIsOrdering(false);
  };

  // Empty state
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <ShoppingBag className="w-10 h-10 text-amber-400" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-gray-900 mb-2"
        >
          Tu carrito esta vacio
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8 max-w-sm mx-auto"
        >
          Agrega productos de tus pulperias favoritas para comenzar tu pedido
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button asChild size="lg">
            <Link to="/">
              <Store className="w-5 h-5" />
              Explorar Pulperias
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tu Carrito</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? 'producto' : 'productos'} de {groupedItems.length}{' '}
            {groupedItems.length === 1 ? 'pulperia' : 'pulperias'}
          </p>
        </div>
        {groupedItems.length > 1 && (
          <Badge variant="secondary" className="gap-1">
            <PackageCheck className="w-3 h-3" />
            {groupedItems.length} pedidos
          </Badge>
        )}
      </motion.div>

      {/* Info banner for multiple orders */}
      <AnimatePresence>
        {groupedItems.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Multiples pulperias</p>
                <p className="text-amber-700 mt-0.5">
                  Se enviaran {groupedItems.length} pedidos separados, uno por cada pulperia.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grouped by Pulperia */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {groupedItems.map((group, groupIndex) => (
            <motion.div
              key={group.pulperia.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <Card className="overflow-hidden">
                {/* Pulperia Header */}
                <CardHeader className="p-4 bg-muted/50 border-b">
                  <div className="flex items-center gap-3">
                    {group.pulperia.logo ? (
                      <img
                        src={group.pulperia.logo}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-background"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center ring-2 ring-background">
                        <Store className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        to={`/pulperia/${group.pulperia.id}`}
                        className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {group.pulperia.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {group.items.length} {group.items.length === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-semibold">
                      L. {group.total.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Items */}
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    <AnimatePresence mode="popLayout">
                      {group.items.map((item) => (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, x: -50 }}
                          className="p-4 flex items-center gap-4"
                        >
                          {/* Product Image */}
                          <Link to={`/product/${item.product.id}`}>
                            <motion.img
                              whileHover={{ scale: 1.05 }}
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-20 h-20 rounded-xl object-cover cursor-pointer"
                            />
                          </Link>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.product.id}`}>
                              <h3 className="font-medium text-gray-900 truncate hover:text-primary-600 transition-colors">
                                {item.product.name}
                              </h3>
                            </Link>
                            <p className="text-primary-600 font-semibold mt-1">
                              L. {item.product.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Subtotal: L. {(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Quantity Controls - Touch targets mejorados */}
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                item.quantity === 1 
                                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="w-8 text-center font-semibold tabular-nums"
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>

                          {/* Remove Button - Separación mejorada */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(item.product.id)}
                            className="p-2.5 ml-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>

                {/* Notes Section */}
                <div className="px-4 py-3 border-t bg-muted/30">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Input
                      type="text"
                      placeholder="Agregar nota para esta pulperia..."
                      value={notes[group.pulperia.id] || ''}
                      onChange={(e) => setNotes({ ...notes, [group.pulperia.id]: e.target.value })}
                      className="text-sm border-none bg-transparent shadow-none px-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sticky Footer - Total & Order */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border z-40"
      >
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-2">
            <CardContent className="p-4">
              {/* Order Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} productos)</span>
                  <span>L. {totalPrice.toFixed(2)}</span>
                </div>
                {groupedItems.length > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pedidos a crear</span>
                    <span>{groupedItems.length} pedidos</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <motion.span
                    key={totalPrice}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-primary-600"
                  >
                    L. {totalPrice.toFixed(2)}
                  </motion.span>
                </div>
              </div>

              {/* Order Button */}
              <Button
                onClick={handleOrder}
                disabled={isOrdering}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isOrdering ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Enviar Pedido{groupedItems.length > 1 ? 's' : ''}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Cart;
