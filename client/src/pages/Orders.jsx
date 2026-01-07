import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { orderApi } from '../services/api';

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
  ACCEPTED: { label: 'Aceptado', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle },
  PREPARING: { label: 'Preparando', color: 'text-purple-600', bg: 'bg-purple-100', icon: Package },
  READY: { label: 'Listo', color: 'text-green-600', bg: 'bg-green-100', icon: Truck },
  DELIVERED: { label: 'Entregado', color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
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
          <div key={i} className="card p-4">
            <div className="skeleton h-6 w-1/3 mb-2" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                className="card p-4 block hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {order.pulperia.logo ? (
                      <img src={order.pulperia.logo} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{order.pulperia.name}</p>
                      <p className="text-sm text-gray-500">{order.orderNumber}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {status.label}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">L. {order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('es-HN')}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes pedidos</h2>
          <p className="text-gray-500 mb-6">Tus pedidos apareceran aqui</p>
          <Link to="/" className="btn-primary">
            Explorar Pulperias
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
