import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, ArrowRight, MessageCircle, Clock } from 'lucide-react';
import LempiraIcon from '../icons/LempiraIcon';

/**
 * Widget compacto para mostrar resumen de sistema de fiado
 */
const FiadoSummaryWidget = ({ fiado = {} }) => {
  const { total = 0, clients = 0, alertCount = 0, debtors = [] } = fiado;

  const handleSendReminder = (debtor) => {
    const msg = encodeURIComponent(
      `Hola ${debtor.name}! Te recuerdo que tienes un saldo pendiente de L. ${debtor.amount?.toFixed(2)}. Gracias por tu preferencia!`
    );
    window.open(`https://wa.me/504${debtor.phone?.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Sistema de Fiado</h3>
            {alertCount > 0 && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {alertCount} en alerta roja
              </span>
            )}
          </div>
        </div>
        <Link
          to="/manage/fiado"
          className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          Ver detalles
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-dark-200/50 border border-white/5">
          <p className="text-2xl font-bold text-white flex items-center gap-1">
            <LempiraIcon size={18} className="text-amber-400" />
            {total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400">Total por cobrar</p>
        </div>
        <div className="p-3 rounded-xl bg-dark-200/50 border border-white/5">
          <p className="text-2xl font-bold text-white">{clients}</p>
          <p className="text-xs text-gray-400">Clientes con deuda</p>
        </div>
      </div>

      {/* Debtors List */}
      {debtors.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase font-medium">Clientes con deuda</p>
          {debtors.slice(0, 3).map((debtor, index) => (
            <motion.div
              key={debtor.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-2 rounded-lg border ${
                debtor.days >= 15
                  ? 'bg-red-500/10 border-red-500/20'
                  : debtor.days >= 7
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-dark-200/50 border-white/5'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{debtor.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <LempiraIcon size={10} />
                    {debtor.amount?.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {debtor.days} días
                  </span>
                </div>
              </div>
              {debtor.phone && (
                <button
                  onClick={() => handleSendReminder(debtor)}
                  className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                  title="Enviar recordatorio por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
              <Link
                to={`/manage/fiado/${debtor.id}`}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">Sin deudas pendientes</p>
          <p className="text-xs text-green-400 mt-1">Excelente!</p>
        </div>
      )}

      {debtors.length > 3 && (
        <Link
          to="/manage/fiado"
          className="mt-3 w-full flex items-center justify-center py-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
        >
          Ver todos ({clients})
        </Link>
      )}
    </motion.div>
  );
};

export default FiadoSummaryWidget;
