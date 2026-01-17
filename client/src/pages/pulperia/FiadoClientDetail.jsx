import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Clock,
  MessageSquare,
  Share2,
  AlertTriangle,
  Check,
  Loader2,
  Package,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import LempiraIcon from '../../components/icons/LempiraIcon';

const FiadoClientDetail = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedTx, setExpandedTx] = useState(null);

  // Fetch account details
  const { data, isLoading, error } = useQuery({
    queryKey: ['fiado-account', accountId],
    queryFn: () => api.get(`/fiado/accounts/${accountId}`),
  });

  const account = data?.data?.account;

  const handleWhatsAppReminder = () => {
    if (!account?.client?.phone) {
      toast.error('Cliente sin teléfono registrado');
      return;
    }
    const message = `Hola ${account.client.name}! Te recordamos que tienes un saldo pendiente de L. ${account.currentBalance.toFixed(2)} en nuestra pulpería. Gracias por tu preferencia!`;
    window.open(`https://wa.me/504${account.client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const generateWhatsAppHistory = () => {
    if (!account) return '';

    let message = `*Historial de Fiado*\n`;
    message += `Cliente: ${account.client.name}\n`;
    message += `Saldo actual: L. ${account.currentBalance.toFixed(2)}\n\n`;
    message += `*Movimientos:*\n`;

    account.transactions.slice(0, 15).forEach(tx => {
      const date = new Date(tx.createdAt).toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit',
      });
      const type = tx.type === 'CREDIT' ? '+' : '-';
      message += `${date} | ${type}L. ${tx.amount.toFixed(2)}`;

      if (tx.items && tx.items.length > 0) {
        const itemsText = tx.items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
        message += ` (${itemsText})`;
      }
      message += '\n';
    });

    message += `\n_Generado desde La Pulpería_`;
    return message;
  };

  const handleExportWhatsApp = () => {
    const text = generateWhatsAppHistory();
    const phone = account?.client?.phone?.replace(/\D/g, '') || '';
    if (phone) {
      window.open(`https://wa.me/504${phone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      // Copiar al portapapeles si no hay teléfono
      navigator.clipboard.writeText(text);
      toast.success('Historial copiado al portapapeles');
    }
  };

  const handleCopyHistory = () => {
    const text = generateWhatsAppHistory();
    navigator.clipboard.writeText(text);
    toast.success('Historial copiado');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-400">Cuenta de fiado no encontrada</p>
        <button
          onClick={() => navigate('/pulperia/fiado')}
          className="mt-4 text-primary-400 hover:underline"
        >
          Volver al dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate('/pulperia/fiado')}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {account.client.avatar ? (
              <img
                src={account.client.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-400" />
              </div>
            )}
            {account.client.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
            {account.client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {account.client.phone}
              </span>
            )}
            {account.client.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {account.client.email}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-2xl border border-red-500/30 p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Saldo pendiente</p>
            <div className="flex items-center gap-2">
              <LempiraIcon className="w-8 h-8 text-red-400" />
              <span className="text-4xl font-bold text-white">
                {account.currentBalance.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Límite: L. {account.creditLimit.toFixed(0)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppReminder}
                className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-colors"
                title="Enviar recordatorio"
              >
                <MessageSquare className="w-5 h-5 text-green-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportWhatsApp}
                className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-colors"
                title="Exportar historial"
              >
                <Share2 className="w-5 h-5 text-blue-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyHistory}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-dark-100 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-dark-200 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copiar historial
        </motion.button>
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-400" />
          Historial de movimientos
        </h2>

        {account.transactions.length === 0 ? (
          <div className="bg-dark-100/60 rounded-2xl border border-white/5 p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Sin movimientos registrados</p>
          </div>
        ) : (
          <div className="relative">
            {/* Línea del timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-dark-border" />

            <div className="space-y-4">
              {account.transactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-14"
                >
                  {/* Icono del timeline */}
                  <div className={`absolute left-3 w-6 h-6 rounded-full flex items-center justify-center ${
                    tx.type === 'CREDIT'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {tx.type === 'CREDIT' ? (
                      <ShoppingBag className="w-3 h-3" />
                    ) : (
                      <DollarSign className="w-3 h-3" />
                    )}
                  </div>

                  {/* Card de transacción */}
                  <div
                    className={`bg-dark-100/60 rounded-xl border p-4 cursor-pointer transition-colors ${
                      tx.type === 'CREDIT'
                        ? 'border-red-500/20 hover:border-red-500/40'
                        : 'border-green-500/20 hover:border-green-500/40'
                    }`}
                    onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString('es-HN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                          {' • '}
                          {new Date(tx.createdAt).toLocaleTimeString('es-HN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xl font-bold ${
                            tx.type === 'CREDIT' ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}L. {tx.amount.toFixed(2)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            tx.type === 'CREDIT'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {tx.type === 'CREDIT' ? 'Fiado' : 'Abono'}
                          </span>
                        </div>
                        {tx.note && (
                          <p className="text-sm text-gray-500 mt-1">{tx.note}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Balance</p>
                          <p className="text-sm font-medium text-gray-300">
                            L. {tx.balanceAfter?.toFixed(2) || '—'}
                          </p>
                        </div>
                        {tx.items && tx.items.length > 0 && (
                          <div className="text-gray-500">
                            {expandedTx === tx.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items expandidos */}
                    <AnimatePresence>
                      {expandedTx === tx.id && tx.items && tx.items.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-white/10"
                        >
                          <p className="text-xs text-gray-500 mb-2">Productos:</p>
                          <div className="space-y-2">
                            {tx.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-300">{item.productName}</span>
                                  <span className="text-gray-500">x{item.quantity}</span>
                                </div>
                                <span className="text-gray-400">
                                  L. {(item.unitPrice * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-dark-100/60 rounded-xl border border-white/5 p-4">
          <p className="text-sm text-gray-500">Total fiado</p>
          <p className="text-xl font-bold text-red-400">
            L. {account.transactions
              .filter(t => t.type === 'CREDIT')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </p>
        </div>
        <div className="bg-dark-100/60 rounded-xl border border-white/5 p-4">
          <p className="text-sm text-gray-500">Total abonado</p>
          <p className="text-xl font-bold text-green-400">
            L. {account.transactions
              .filter(t => t.type === 'PAYMENT')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default FiadoClientDetail;
