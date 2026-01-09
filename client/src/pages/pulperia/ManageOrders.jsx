import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  User,
  Phone,
  ChevronDown,
  ChevronUp,
  Bell,
} from 'lucide-react';
import { orderApi } from '../../services/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { playNotificationSound, vibrate } from '../../services/notifications';
import { useAuthStore } from '../../stores/authStore';

const statusConfig = {
  PENDING: { label: 'Nueva', color: 'bg-yellow-500', icon: Bell },
  ACCEPTED: { label: 'Aceptada', color: 'bg-blue-500', icon: CheckCircle },
  PREPARING: { label: 'Preparando', color: 'bg-purple-500', icon: Package },
  READY: { label: 'Lista', color: 'bg-green-500', icon: Truck },
  DELIVERED: { label: 'Entregada', color: 'bg-gray-500', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-500', icon: XCircle },
};

const ManageOrders = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['pulperia-orders', filter],
    queryFn: () => orderApi.getPulperiaOrders({ status: filter === 'all' ? undefined : filter }),
    refetchInterval: 10000,
  });

  const orders = ordersData?.data?.orders || [];
  const statusCounts = ordersData?.data?.statusCounts || [];

  // Real-time updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || window.location.origin);

    socket.on('connect', () => {
      socket.emit('join', user.id);
    });

    socket.on('new-order', (data) => {
      queryClient.invalidateQueries(['pulperia-orders']);
      toast.success(data.message, {
        icon: '🔔',
        duration: 5000,
      });
      // Play sound and vibrate
      playNotificationSound('order');
      vibrate([200, 100, 200]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user.id, queryClient]);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, cancelReason }) =>
      orderApi.updateStatus(orderId, { status, cancelReason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pulperia-orders']);
    },
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });

      // Show celebration for delivered orders
      if (newStatus === 'DELIVERED') {
        toast.success('¡Pedido entregado! +1 venta', {
          icon: '🎉',
          duration: 3000,
        });
      } else if (newStatus === 'READY') {
        toast.success('¡Pedido listo para recoger!', {
          icon: '🚀',
        });
      } else {
        toast.success('Estado actualizado');
      }
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleCancel = async (orderId) => {
    const reason = prompt('Razon de cancelacion (opcional):');
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: 'CANCELLED',
        cancelReason: reason,
      });
      toast.success('Pedido cancelado');
    } catch (error) {
      toast.error('Error al cancelar');
    }
  };

  const filterTabs = [
    { key: 'all', label: 'Todas' },
    { key: 'PENDING', label: 'Nuevas' },
    { key: 'ACCEPTED', label: 'Aceptadas' },
    { key: 'READY', label: 'Listas' },
    { key: 'DELIVERED', label: 'Entregadas' },
  ];

  const getPendingCount = () => {
    const pending = statusCounts.find((s) => s.status === 'PENDING');
    return pending?._count || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ordenes</h1>
        <p className="text-gray-500">Gestiona los pedidos de tus clientes</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {tab.key === 'PENDING' && getPendingCount() > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {getPendingCount()}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4">
              <div className="skeleton h-6 w-1/3 mb-2" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`card overflow-hidden ${
                  order.status === 'PENDING'
                    ? 'ring-2 ring-yellow-400 ring-offset-2'
                    : ''
                }`}
              >
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${statusConfig[order.status].color}`} />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString('es-HN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          L. {order.total.toFixed(2)}
                        </p>
                        <span className={`badge ${
                          order.status === 'PENDING' ? 'badge-warning' :
                          order.status === 'READY' ? 'badge-success' :
                          'badge-gray'
                        }`}>
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                        {/* Customer Info */}
                        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                          {order.user.avatar ? (
                            <img
                              src={order.user.avatar}
                              alt={order.user.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{order.user.name}</p>
                            {order.user.phone && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {order.user.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2 mb-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.productName}</p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} x L. {item.priceAtTime.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-medium text-gray-900">
                                L. {(item.quantity * item.priceAtTime).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <div className="p-3 bg-yellow-50 rounded-xl mb-4">
                            <p className="text-sm text-yellow-800">
                              <strong>Nota:</strong> {order.notes}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {order.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(order.id, 'ACCEPTED')}
                                className="btn-primary flex-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aceptar
                              </button>
                              <button
                                onClick={() => handleCancel(order.id)}
                                className="btn-danger"
                              >
                                <XCircle className="w-4 h-4" />
                                Rechazar
                              </button>
                            </>
                          )}
                          {order.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'READY')}
                              className="btn-primary flex-1"
                            >
                              <Package className="w-4 h-4" />
                              Marcar como Lista
                            </button>
                          )}
                          {order.status === 'READY' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                              className="btn-primary flex-1"
                            >
                              <Truck className="w-4 h-4" />
                              Entregado
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay ordenes {filter !== 'all' && 'con este estado'}</p>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
