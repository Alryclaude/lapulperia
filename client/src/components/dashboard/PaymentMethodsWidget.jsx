import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, CreditCard, Settings } from 'lucide-react';
import { getBankIcon, CashIcon } from '../icons/BankIcons';

/**
 * Widget compacto para mostrar métodos de pago configurados
 */
const PaymentMethodsWidget = ({ paymentMethods = [] }) => {
  // Separar efectivo de métodos electrónicos
  const electronicMethods = paymentMethods.filter(m => m.type !== 'CASH' && m.type !== 'EFECTIVO');
  const acceptsCash = paymentMethods.some(m => m.type === 'CASH' || m.type === 'EFECTIVO');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="font-semibold text-white">Métodos de Pago</h3>
        </div>
        <Link
          to="/pulperia/payments"
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      {paymentMethods.length > 0 ? (
        <div className="space-y-2">
          {/* Métodos electrónicos */}
          {electronicMethods.map((method, index) => {
            const BankIconComponent = getBankIcon(method.bankName || method.type);
            const displayNumber = method.accountNumber
              ? `***${method.accountNumber.slice(-4)}`
              : method.phone || '';

            return (
              <div
                key={method.id || index}
                className="flex items-center gap-3 p-2 rounded-lg bg-dark-200/50 border border-white/5"
              >
                <BankIconComponent size={28} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {method.bankName || method.type}
                  </p>
                  {displayNumber && (
                    <p className="text-xs text-gray-500 font-mono">{displayNumber}</p>
                  )}
                </div>
                <div className={`w-2 h-2 rounded-full ${method.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
            );
          })}

          {/* Efectivo */}
          {acceptsCash && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CashIcon size={18} className="text-green-400" />
              </div>
              <p className="text-sm font-medium text-green-300">Efectivo</p>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6 text-purple-400/50" />
          </div>
          <p className="text-sm text-gray-400 mb-3">Sin métodos configurados</p>
          <Link
            to="/pulperia/payments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </Link>
        </div>
      )}

      {paymentMethods.length > 0 && (
        <Link
          to="/pulperia/payments"
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar método
        </Link>
      )}
    </motion.div>
  );
};

export default PaymentMethodsWidget;
