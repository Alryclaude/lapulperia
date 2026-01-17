import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Search,
  User,
  Phone,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  Clock,
  MessageSquare,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';

const FiadoDashboard = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch fiado accounts
  const { data, isLoading } = useQuery({
    queryKey: ['fiado-accounts'],
    queryFn: () => api.get('/fiado/accounts'),
  });

  const accounts = data?.data?.accounts || [];
  const summary = data?.data?.summary || { totalFiado: 0, totalClients: 0, clientsWithDebt: 0 };

  // Search clients for adding
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search-clients', searchQuery],
    queryFn: () => api.get(`/fiado/search-clients?q=${searchQuery}`),
    enabled: searchQuery.length >= 2,
  });

  const clients = searchResults?.data?.clients || [];

  // Create fiado account mutation
  const createAccountMutation = useMutation({
    mutationFn: (data) => api.post('/fiado/accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['fiado-accounts']);
      toast.success('Cliente agregado al fiado');
      setShowAddModal(false);
      setSearchQuery('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al agregar');
    },
  });

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: ({ accountId, ...data }) => api.post(`/fiado/accounts/${accountId}/transactions`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['fiado-accounts']);
      toast.success('Transacción registrada');
      setShowTransactionModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al registrar');
    },
  });

  const handleAddClient = (clientId) => {
    createAccountMutation.mutate({ clientId, creditLimit: 500 });
  };

  const handleWhatsAppReminder = (account) => {
    const phone = account.client.phone;
    if (!phone) {
      toast.error('Cliente sin teléfono registrado');
      return;
    }
    const message = `Hola ${account.client.name}! Te recordamos que tienes un saldo pendiente de L. ${account.currentBalance.toFixed(2)} en nuestra pulpería. Gracias por tu preferencia!`;
    window.open(`https://wa.me/504${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'red': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'yellow': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getAlertIcon = (level) => {
    if (level === 'red' || level === 'yellow') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <Check className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Sistema de Fiado</h1>
            <p className="text-gray-400 text-sm">Gestiona los créditos de tus clientes</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar cliente
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">L. {summary.totalFiado.toFixed(0)}</p>
              <p className="text-xs text-gray-500">Total fiado</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{summary.totalClients}</p>
              <p className="text-xs text-gray-500">Clientes</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{summary.clientsWithDebt}</p>
              <p className="text-xs text-gray-500">Con deuda</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Accounts List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
              <div className="h-6 w-1/3 bg-dark-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : accounts.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {accounts.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-dark-100/60 backdrop-blur-sm rounded-2xl border p-4 ${
                  account.isBlocked ? 'border-red-500/30 opacity-60' : 'border-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {account.client.avatar ? (
                    <img
                      src={account.client.avatar}
                      alt={account.client.name}
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white truncate">{account.client.name}</p>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getAlertColor(account.alertLevel)}`}>
                        {getAlertIcon(account.alertLevel)}
                        {account.daysSincePayment !== null ? `${account.daysSincePayment}d` : 'Nuevo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-lg font-bold text-red-400">
                        L. {account.currentBalance.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        / L. {account.creditLimit.toFixed(0)} límite
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleWhatsAppReminder(account)}
                      className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                      title="Enviar recordatorio"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedAccount(account);
                        setShowTransactionModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Recent transactions */}
                {account.transactions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-gray-500 mb-2">Últimos movimientos:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {account.transactions.slice(0, 3).map((tx) => (
                        <span
                          key={tx.id}
                          className={`px-2 py-1 rounded-lg text-xs whitespace-nowrap ${
                            tx.type === 'CREDIT'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {tx.type === 'CREDIT' ? '+' : '-'}L. {tx.amount.toFixed(0)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin cuentas de fiado</h2>
          <p className="text-gray-400 mb-6">
            Agrega clientes para empezar a gestionar sus créditos
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar cliente
          </motion.button>
        </motion.div>
      )}

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Agregar cliente</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="w-full pl-12 pr-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                )}

                {!isSearching && searchQuery.length >= 2 && clients.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No se encontraron clientes</p>
                )}

                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center gap-3 p-3 bg-dark-200/50 rounded-xl hover:bg-dark-200 transition-colors"
                  >
                    {client.avatar ? (
                      <img src={client.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{client.name}</p>
                      <p className="text-sm text-gray-500 truncate">{client.email}</p>
                    </div>
                    {client.hasFiadoAccount ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                        Ya tiene cuenta
                      </span>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddClient(client.id)}
                        disabled={createAccountMutation.isPending}
                        className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                      >
                        Agregar
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showTransactionModal && selectedAccount && (
          <TransactionModal
            account={selectedAccount}
            onClose={() => {
              setShowTransactionModal(false);
              setSelectedAccount(null);
            }}
            onSubmit={(data) => addTransactionMutation.mutate(data)}
            isLoading={addTransactionMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Transaction Modal Component
const TransactionModal = ({ account, onClose, onSubmit, isLoading }) => {
  const [type, setType] = useState('PAYMENT');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      accountId: account.id,
      type,
      amount: parseFloat(amount),
      note: note || undefined,
    });
  };

  const availableCredit = account.creditLimit - account.currentBalance;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-dark-100 rounded-2xl border border-white/10 p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{account.client.name}</h2>
            <p className="text-sm text-gray-400">
              Saldo: <span className="text-red-400 font-semibold">L. {account.currentBalance.toFixed(2)}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('PAYMENT')}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                type === 'PAYMENT'
                  ? 'bg-green-500 text-white'
                  : 'bg-dark-200 text-gray-400 hover:text-white'
              }`}
            >
              Abono
            </button>
            <button
              type="button"
              onClick={() => setType('CREDIT')}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                type === 'CREDIT'
                  ? 'bg-red-500 text-white'
                  : 'bg-dark-200 text-gray-400 hover:text-white'
              }`}
            >
              Fiado
            </button>
          </div>

          {type === 'CREDIT' && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-sm text-yellow-400">
                Crédito disponible: <span className="font-semibold">L. {availableCredit.toFixed(2)}</span>
              </p>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Monto (L.)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max={type === 'CREDIT' ? availableCredit : undefined}
              className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white text-xl font-bold text-center placeholder-gray-500 focus:border-primary-500 focus:outline-none"
              required
              autoFocus
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nota (opcional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Descripción del movimiento..."
              className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 ${
              type === 'PAYMENT'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {type === 'PAYMENT' ? 'Registrar abono' : 'Registrar fiado'}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default FiadoDashboard;
