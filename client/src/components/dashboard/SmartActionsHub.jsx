import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Package,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Clock,
  Users,
} from 'lucide-react';
import LempiraIcon from '../icons/LempiraIcon';

/**
 * SmartActionsHub - Centro de control inteligente con datos en tiempo real
 * Reemplaza las acciones rápidas simples con información contextual y urgente
 */
const SmartActionsHub = ({ stats = {}, onQuickSale, onRegisterFiado }) => {
  const pendingOrders = stats.today?.pending || 0;
  const fiadoTotal = stats.fiado?.total || 0;
  const fiadoClients = stats.fiado?.clients || 0;
  const fiadoOldest = stats.fiado?.oldest;
  const lowStockCount = stats.lowStockProducts?.length || 0;
  const lowStockNames = stats.lowStockProducts?.slice(0, 3).map(p => p.name).join(', ') || '';

  // Calcular tiempo desde última orden pendiente
  const lastOrderTime = stats.today?.lastPendingOrderTime;
  const timeSinceLastOrder = lastOrderTime
    ? Math.floor((Date.now() - new Date(lastOrderTime).getTime()) / 60000)
    : null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Pulso del Negocio
      </h2>

      <div className="space-y-3">
        {/* Órdenes Urgentes */}
        {pendingOrders > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-red-500/20 to-dark-100/80 backdrop-blur-sm rounded-2xl border border-red-500/30 p-4 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-500 text-white animate-pulse">
                    URGENTE
                  </span>
                  <span className="text-white font-semibold">
                    {pendingOrders} {pendingOrders === 1 ? 'orden esperando' : 'órdenes esperando'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Acepta o rechaza ahora
                </p>
                {timeSinceLastOrder !== null && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Última: hace {timeSinceLastOrder} min
                  </div>
                )}
              </div>
              <Link
                to="/manage/orders"
                className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors"
              >
                VER
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Fiado Pendiente */}
        {fiadoTotal > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-4 relative overflow-hidden group hover:border-amber-500/40 transition-all"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-xs text-amber-400 font-medium">FIADO</span>
                      <p className="text-white font-bold flex items-center gap-1">
                        <LempiraIcon size={16} className="text-amber-400" />
                        {fiadoTotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                        <span className="text-sm font-normal text-gray-400">por cobrar</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {fiadoClients} {fiadoClients === 1 ? 'cliente' : 'clientes'} con deuda
                  </p>
                  {fiadoOldest && (
                    <p className="text-xs text-amber-400/80 mt-1">
                      {fiadoOldest.name} debe L. {fiadoOldest.amount} ({fiadoOldest.days} días)
                    </p>
                  )}
                </div>
                <Link
                  to="/manage/fiado"
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  Ver
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* WhatsApp reminder button */}
              {fiadoOldest && (
                <button
                  onClick={() => {
                    const msg = encodeURIComponent(`Hola ${fiadoOldest.name}! Te recuerdo que tienes un saldo pendiente de L. ${fiadoOldest.amount}. Gracias!`);
                    window.open(`https://wa.me/504${fiadoOldest.phone?.replace(/\D/g, '')}?text=${msg}`, '_blank');
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar recordatorio WhatsApp
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Stock Bajo */}
        {lowStockCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-4 relative overflow-hidden group hover:border-orange-500/40 transition-all"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors duration-300" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <span className="text-xs text-orange-400 font-medium">STOCK</span>
                    <p className="text-white font-bold">
                      {lowStockCount} {lowStockCount === 1 ? 'producto' : 'productos'} por agotarse
                    </p>
                  </div>
                </div>
                {lowStockNames && (
                  <p className="text-sm text-gray-400 mt-1 truncate">
                    {lowStockNames}...
                  </p>
                )}
              </div>
              <Link
                to="/manage/products?filter=low_stock"
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-colors"
              >
                Reabastecer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onQuickSale}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl text-green-400 font-medium hover:border-green-500/50 transition-all"
          >
            <LempiraIcon size={20} />
            Venta Rápida
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRegisterFiado}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl text-amber-400 font-medium hover:border-amber-500/50 transition-all"
          >
            <CreditCard size={20} />
            Registrar Fiado
          </motion.button>
        </div>

        {/* Sin alertas - mensaje positivo */}
        {pendingOrders === 0 && fiadoTotal === 0 && lowStockCount === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-green-300 font-medium">Todo en orden</p>
            <p className="text-sm text-green-400/70 mt-1">
              No hay alertas pendientes
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SmartActionsHub;
