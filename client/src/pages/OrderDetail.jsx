import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, Store,
  Phone, MessageCircle, MapPin, Star
} from 'lucide-react';
import { orderApi, reviewApi } from '../services/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
  ACCEPTED: { label: 'Aceptado', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle },
  PREPARING: { label: 'Preparando', color: 'text-purple-600', bg: 'bg-purple-100', icon: Package },
  READY: { label: 'Listo para recoger', color: 'text-green-600', bg: 'bg-green-100', icon: Truck },
  DELIVERED: { label: 'Entregado', color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
};

const OrderDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showReview, setShowReview] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
  });

  const order = data?.data?.order;
  const hasReviewed = data?.data?.hasReviewed;

  const reviewMutation = useMutation({
    mutationFn: (data) => reviewApi.create(order.pulperia.id, data),
    onSuccess: () => {
      toast.success('Gracias por tu reseña!');
      setShowReview(false);
      queryClient.invalidateQueries(['order', id]);
    },
    onError: () => {
      toast.error('Error al enviar reseña');
    },
  });

  const handleReview = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Selecciona una calificacion');
      return;
    }
    reviewMutation.mutate({ rating, comment, orderId: id });
  };

  const handleWhatsApp = () => {
    const phone = order.pulperia.whatsapp || order.pulperia.phone;
    if (phone) {
      const message = `Hola! Tengo una consulta sobre mi pedido #${order.orderNumber}`;
      window.open(`https://wa.me/504${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-32 w-full rounded-xl" />
        <div className="skeleton h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pedido no encontrado</p>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5" />
        Mis Pedidos
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Pedido</p>
            <p className="text-xl font-bold text-gray-900">#{order.orderNumber}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} ${status.color}`}>
            <StatusIcon className="w-5 h-5" />
            <span className="font-medium">{status.label}</span>
          </div>
        </div>

        {/* Progress */}
        {order.status !== 'CANCELLED' && (
          <div className="flex items-center gap-2 mt-4">
            {['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED'].map((s, i) => {
              const isActive = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED'].indexOf(order.status) >= i;
              return (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary-500' : 'bg-gray-200'}`} />
                  {i < 4 && <div className={`flex-1 h-1 ${isActive ? 'bg-primary-500' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pulperia */}
      <Link to={`/pulperia/${order.pulperia.id}`} className="card p-4 flex items-center gap-4">
        {order.pulperia.logo ? (
          <img src={order.pulperia.logo} alt="" className="w-14 h-14 rounded-xl object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center">
            <Store className="w-7 h-7 text-primary-600" />
          </div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{order.pulperia.name}</p>
          <p className="text-sm text-gray-500">{order.pulperia.address}</p>
        </div>
      </Link>

      {/* Items */}
      <div className="card overflow-hidden">
        <h3 className="px-5 py-3 bg-gray-50 font-medium text-gray-700">Productos</h3>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-4">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                <p className="text-sm text-gray-500">x{item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-900">L. {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-gray-50 border-t flex justify-between">
          <span className="font-medium text-gray-700">Total</span>
          <span className="text-xl font-bold text-primary-600">L. {order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="card p-5">
          <h3 className="font-medium text-gray-700 mb-2">Notas</h3>
          <p className="text-gray-600">{order.notes}</p>
        </div>
      )}

      {/* Actions */}
      {order.status === 'READY' && (
        <div className="card p-5 bg-green-50 border-green-200">
          <div className="flex items-center gap-3 text-green-700 mb-4">
            <Truck className="w-6 h-6" />
            <span className="font-semibold">Tu pedido esta listo!</span>
          </div>
          <p className="text-green-600 mb-4">
            Puedes pasar a recogerlo en {order.pulperia.name}
          </p>
          {(order.pulperia.whatsapp || order.pulperia.phone) && (
            <button onClick={handleWhatsApp} className="btn-primary w-full">
              <MessageCircle className="w-5 h-5" />
              Contactar por WhatsApp
            </button>
          )}
        </div>
      )}

      {/* Review */}
      {order.status === 'DELIVERED' && !hasReviewed && (
        <div className="card p-5">
          {showReview ? (
            <form onSubmit={handleReview} className="space-y-4">
              <h3 className="font-semibold text-gray-900">Como fue tu experiencia?</h3>

              {/* Stars */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe un comentario (opcional)"
                className="input min-h-[100px]"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReview(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {reviewMutation.isPending ? 'Enviando...' : 'Enviar Reseña'}
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowReview(true)} className="btn-secondary w-full">
              <Star className="w-5 h-5" />
              Dejar una Reseña
            </button>
          )}
        </div>
      )}

      {/* Date */}
      <p className="text-center text-sm text-gray-500">
        Pedido realizado el {new Date(order.createdAt).toLocaleDateString('es-HN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
};

export default OrderDetail;
