import { useState, useEffect, useRef } from 'react';
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
  ShoppingBag,
  MessageSquare,
} from 'lucide-react';
import { orderApi } from '../../services/api';
import toast from 'react-hot-toast';
import { socketService } from '../../services/socket';
import { playNotificationSound, vibrate } from '../../services/notifications';
import { useAuthStore } from '../../stores/authStore';
import { OrderCardEnhanced } from '../../components/orders';

const statusConfig = {
  PENDING: { label: 'Nueva', color: 'yellow', icon: Bell },
  ACCEPTED: { label: 'Aceptada', color: 'blue', icon: CheckCircle },
  PREPARING: { label: 'Preparando', color: 'purple', icon: Package },
  READY: { label: 'Lista', color: 'green', icon: Truck },
  DELIVERED: { label: 'Entregada', color: 'gray', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'red', icon: XCircle },
};

const ManageOrders = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const prevOrdersRef = useRef([]);

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['pulperia-orders', filter],
    queryFn: () => orderApi.getPulperiaOrders({ status: filter === 'all' ? undefined : filter }),
    refetchInterval: 10000,
  });

  const orders = ordersData?.data?.orders || [];
  const statusCounts = ordersData?.data?.statusCounts || [];

  // Real-time updates usando socketService singleton
  useEffect(() => {
    if (!user?.id) return;

    // Conectar usando el servicio singleton
    socketService.connect(user.id);

    // Suscribirse a nuevas órdenes
    const unsubscribe = socketService.subscribe('new-order', (data) => {
      queryClient.invalidateQueries(['pulperia-orders']);
      toast.success(data.message || '¡Nueva orden recibida!', {
        icon: '🔔',
        duration: 5000,
      });
      // Play sound and vibrate
      playNotificationSound('order');
      vibrate([200, 100, 200]);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id, queryClient]);

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
    const reason = prompt('Razón de cancelación (opcional):');
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
    { key: 'all', label: 'Todas', icon: ShoppingBag },
    { key: 'PENDING', label: 'Nuevas', icon: Bell },
    { key: 'ACCEPTED', label: 'Aceptadas', icon: CheckCircle },
    { key: 'READY', label: 'Listas', icon: Truck },
    { key: 'DELIVERED', label: 'Entregadas', icon: Package },
  ];

  const getPendingCount = () => {
    const pending = statusCounts.find((s) => s.status === 'PENDING');
    return pending?._count || 0;
  };

  const getStatusColorClasses = (status) => {
    const colors = {
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[statusConfig[status]?.color] || colors.gray;
  };

  const getStatusDotColor = (status) => {
    const colors = {
      yellow: 'bg-yellow-400',
      blue: 'bg-blue-400',
      purple: 'bg-purple-400',
      green: 'bg-green-400',
      gray: 'bg-gray-400',
      red: 'bg-red-400',
    };
    return colors[statusConfig[status]?.color] || colors.gray;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Órdenes</h1>
          <p className="text-gray-400 text-sm">Gestiona los pedidos de tus clientes</p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-100/60 backdrop-blur-sm border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.key === 'PENDING' && getPendingCount() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    filter === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {getPendingCount()}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
              <div className="h-6 w-1/3 bg-dark-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order, index) => (
              <OrderCardEnhanced
                key={order.id}
                order={order}
                isNew={newOrderIds.has(order.id)}
                onAccept={(id) => handleStatusChange(id, 'ACCEPTED')}
                onReject={handleCancel}
                onMarkReady={(id) => handleStatusChange(id, 'READY')}
                onMarkDelivered={(id) => handleStatusChange(id, 'DELIVERED')}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin órdenes</h2>
          <p className="text-gray-400">
            No hay órdenes {filter !== 'all' && 'con este estado'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ManageOrders;
