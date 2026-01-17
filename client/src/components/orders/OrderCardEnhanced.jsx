import { useState, useEffect } from 'react';
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
  MessageSquare,
  PartyPopper,
} from 'lucide-react';
import OrderTimelineVisual from './OrderTimelineVisual';
import LempiraIcon from '../icons/LempiraIcon';
import confetti from 'canvas-confetti';

/**
 * Tarjeta de orden mejorada con timeline visual, animaciones y feedback
 */
const OrderCardEnhanced = ({
  order,
  onAccept,
  onReject,
  onMarkReady,
  onMarkDelivered,
  isNew = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Calcular tiempo transcurrido para órdenes pendientes
  useEffect(() => {
    if (order.status !== 'PENDING') return;

    const updateTime = () => {
      const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
      setTimeElapsed(elapsed);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt, order.status]);

  // Formatear tiempo transcurrido
  const formatElapsed = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Celebración al entregar
  const handleDelivered = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#10b981', '#14b8a6'],
    });
    onMarkDelivered(order.id);
  };

  const statusColors = {
    PENDING: {
      bg: 'from-yellow-500/20 to-amber-500/10',
      border: 'border-yellow-500/50',
      dot: 'bg-yellow-500',
      ring: 'ring-yellow-500/20',
    },
    ACCEPTED: {
      bg: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30',
      dot: 'bg-blue-500',
      ring: '',
    },
    PREPARING: {
      bg: 'from-purple-500/20 to-pink-500/10',
      border: 'border-purple-500/30',
      dot: 'bg-purple-500',
      ring: '',
    },
    READY: {
      bg: 'from-green-500/20 to-emerald-500/10',
      border: 'border-green-500/30',
      dot: 'bg-green-500',
      ring: '',
    },
    DELIVERED: {
      bg: 'from-gray-500/10 to-gray-600/5',
      border: 'border-gray-500/20',
      dot: 'bg-gray-500',
      ring: '',
    },
    CANCELLED: {
      bg: 'from-red-500/10 to-red-600/5',
      border: 'border-red-500/30',
      dot: 'bg-red-500',
      ring: '',
    },
  };

  const colors = statusColors[order.status] || statusColors.PENDING;
  const isPending = order.status === 'PENDING';
  const isUrgent = isPending && timeElapsed > 300; // Más de 5 min

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -20, scale: 0.95 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100 }}
      className={`bg-gradient-to-br ${colors.bg} backdrop-blur-sm rounded-2xl border ${colors.border} overflow-hidden transition-all ${
        isPending ? `ring-1 ${colors.ring}` : ''
      } ${isNew ? 'animate-pulse' : ''}`}
    >
      {/* Header - Clickable */}
      <div
        className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: Order info */}
          <div className="flex items-start gap-3">
            {/* Status dot with pulse for pending */}
            <div className="relative mt-1">
              <div className={`w-3 h-3 rounded-full ${colors.dot} ${isPending ? 'animate-pulse' : ''}`} />
              {isPending && (
                <div className={`absolute inset-0 w-3 h-3 rounded-full ${colors.dot} animate-ping opacity-75`} />
              )}
            </div>

            <div>
              {/* Order number and time badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-white">{order.orderNumber}</p>
                {isPending && (
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                    isUrgent
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatElapsed(timeElapsed)}
                  </span>
                )}
              </div>

              {/* Customer info */}
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                <User className="w-3.5 h-3.5" />
                <span>{order.user?.name || 'Cliente'}</span>
                {order.user?.phone && (
                  <>
                    <span className="text-gray-600">•</span>
                    <Phone className="w-3 h-3" />
                    <span>{order.user.phone}</span>
                  </>
                )}
              </div>

              {/* Items summary */}
              <p className="text-xs text-gray-500 mt-1">
                {order.items?.length || 0} {order.items?.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>

          {/* Right: Total and expand */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-white flex items-center gap-1 justify-end">
                <LempiraIcon size={16} className="text-green-400" />
                {order.total?.toFixed(2)}
              </p>
              {/* Compact timeline */}
              <div className="mt-1">
                <OrderTimelineVisual currentStatus={order.status} compact />
              </div>
            </div>

            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-4">
              {/* Full Timeline */}
              <div className="bg-dark-200/30 rounded-xl p-4">
                <h4 className="text-xs font-medium text-gray-400 uppercase mb-3">Progreso</h4>
                <OrderTimelineVisual currentStatus={order.status} />
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Productos</h4>
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-xl bg-dark-200/30 hover:bg-dark-200/50 transition-colors"
                    >
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded-lg object-cover border border-white/10"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x L. {item.priceAtTime?.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-green-400">
                        L. {(item.quantity * item.priceAtTime).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 font-medium mb-1">Nota del cliente</p>
                    <p className="text-sm text-amber-200">{order.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {order.status === 'PENDING' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onAccept(order.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aceptar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onReject(order.id)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium border border-red-500/30 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      Rechazar
                    </motion.button>
                  </>
                )}

                {order.status === 'ACCEPTED' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onMarkReady(order.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/20"
                  >
                    <Package className="w-5 h-5" />
                    Marcar como Lista
                  </motion.button>
                )}

                {order.status === 'READY' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelivered}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-500/20"
                  >
                    <Truck className="w-5 h-5" />
                    Entregado
                    <PartyPopper className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderCardEnhanced;
