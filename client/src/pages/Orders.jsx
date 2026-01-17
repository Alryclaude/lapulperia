import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { orderApi } from '../services/api';
import NotificationPrompt from '../components/NotificationPrompt';

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', icon: Clock },
  ACCEPTED: { label: 'Aceptado', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: CheckCircle },
  PREPARING: { label: 'Preparando', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', icon: Package },
  READY: { label: 'Listo', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: Truck },
  DELIVERED: { label: 'Entregado', color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: XCircle },
};

const Orders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderApi.getMyOrders({}),
  });

  const orders = data?.data?.orders || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
            <div className="h-6 w-1/3 bg-dark-200 animate-pulse rounded mb-2" />
            <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Package className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Pedidos</h1>
          <p className="text-gray-400 text-sm">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </motion.div>

      {/* Prompt para activar notificaciones */}
      <NotificationPrompt />

      {orders.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {orders.map((order, index) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/order/${order.id}`}
                  className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4 block hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {order.pulperia.logo ? (
                        <img src={order.pulperia.logo} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                          <Package className="w-6 h-6 text-primary-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">{order.pulperia.name}</p>
                        <p className="text-sm text-gray-500">{order.orderNumber}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color} border ${status.border}`}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">L. {order.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('es-HN')}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No tienes pedidos</h2>
          <p className="text-gray-400 mb-6">Tus pedidos apareceran aqui</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
            >
              Explorar Pulperias
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Orders;
