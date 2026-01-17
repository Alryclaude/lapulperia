import { motion } from 'framer-motion';
import { Copy, Check, MessageCircle, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { getBankIcon, CashIcon } from '../icons/BankIcons';
import toast from 'react-hot-toast';

/**
 * Muestra los métodos de pago de una pulpería en el perfil público
 * Permite copiar datos de cuenta y enviar captura por WhatsApp
 */
const PaymentMethodsDisplay = ({ paymentMethods = [], whatsapp, phone }) => {
  const [copiedId, setCopiedId] = useState(null);

  if (!paymentMethods || paymentMethods.length === 0) {
    return null;
  }

  const handleCopy = async (text, id, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success(`${label} copiado`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  const handleWhatsAppProof = () => {
    const phoneNumber = whatsapp || phone;
    if (phoneNumber) {
      const message = encodeURIComponent('Hola! Te envío el comprobante de pago:');
      window.open(`https://wa.me/504${phoneNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  // Separar efectivo de métodos electrónicos
  const electronicMethods = paymentMethods.filter(m => m.type !== 'CASH' && m.type !== 'EFECTIVO');
  const acceptsCash = paymentMethods.some(m => m.type === 'CASH' || m.type === 'EFECTIVO');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-dark-100/40 rounded-xl border border-white/5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <CreditCard className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium text-green-400">Cómo Pagar</span>
      </div>

      {/* Métodos de pago */}
      <div className="p-4 space-y-3">
        {/* Métodos electrónicos */}
        {electronicMethods.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {electronicMethods.map((method, index) => {
              const BankIconComponent = getBankIcon(method.bankName || method.type);
              const displayNumber = method.accountNumber
                ? `***${method.accountNumber.slice(-4)}`
                : method.phone || '';

              return (
                <motion.div
                  key={method.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-dark-200/50 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <BankIconComponent size={36} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">
                        {method.bankName || method.type}
                      </p>
                      {displayNumber && (
                        <p className="text-xs text-gray-400 font-mono">{displayNumber}</p>
                      )}
                      {method.accountHolder && (
                        <p className="text-xs text-gray-500 truncate">{method.accountHolder}</p>
                      )}
                    </div>

                    {/* Botón copiar */}
                    {(method.accountNumber || method.phone) && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(
                          method.accountNumber || method.phone,
                          method.id || index,
                          method.bankName || 'Número'
                        )}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedId === (method.id || index) ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Efectivo */}
        {acceptsCash && (
          <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CashIcon size={20} className="text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-300 text-sm">Efectivo</p>
              <p className="text-xs text-green-400/70">Aceptamos pago en efectivo</p>
            </div>
          </div>
        )}

        {/* Enviar comprobante por WhatsApp */}
        {electronicMethods.length > 0 && (whatsapp || phone) && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleWhatsAppProof}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Enviar captura de pago por WhatsApp
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default PaymentMethodsDisplay;
