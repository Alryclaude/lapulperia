import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { orderApi } from '../services/api';
import toast from 'react-hot-toast';

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

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Tu carrito esta vacio</h2>
        <p className="text-gray-500 mb-6">Agrega productos de tus pulperias favoritas</p>
        <Link to="/" className="btn-primary">
          Explorar Pulperias
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tu Carrito</h1>

      {/* Grouped by Pulperia */}
      {groupedItems.map((group) => (
        <div key={group.pulperia.id} className="card overflow-hidden">
          {/* Pulperia Header */}
          <div className="p-4 bg-gray-50 border-b flex items-center gap-3">
            {group.pulperia.logo ? (
              <img src={group.pulperia.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-600" />
              </div>
            )}
            <Link to={`/pulperia/${group.pulperia.id}`} className="font-semibold text-gray-900 hover:text-primary-600">
              {group.pulperia.name}
            </Link>
          </div>

          {/* Items */}
          <div className="divide-y">
            {group.items.map((item) => (
              <div key={item.product.id} className="p-4 flex items-center gap-4">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                  <p className="text-primary-600 font-semibold">L. {item.product.price.toFixed(2)}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="p-4 border-t">
            <input
              type="text"
              placeholder="Nota para esta pulperia (opcional)"
              value={notes[group.pulperia.id] || ''}
              onChange={(e) => setNotes({ ...notes, [group.pulperia.id]: e.target.value })}
              className="input text-sm"
            />
          </div>

          {/* Subtotal */}
          <div className="p-4 bg-gray-50 border-t flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">L. {group.total.toFixed(2)}</span>
          </div>
        </div>
      ))}

      {/* Total & Order */}
      <div className="card p-5 sticky bottom-20">
        <div className="flex justify-between mb-4">
          <span className="text-lg font-medium text-gray-900">Total</span>
          <span className="text-xl font-bold text-primary-600">L. {totalPrice.toFixed(2)}</span>
        </div>
        <button
          onClick={handleOrder}
          disabled={isOrdering}
          className="btn-primary w-full"
        >
          {isOrdering ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Enviar Pedido{groupedItems.length > 1 ? 's' : ''}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          {groupedItems.length > 1 && `Se enviaran ${groupedItems.length} pedidos separados`}
        </p>
      </div>
    </div>
  );
};

export default Cart;
