import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Caja Simple - Control de ingresos y gastos del día
const SimpleCashRegister = ({ initialBalance = 0, onTransaction }) => {
  const [balance, setBalance] = useState(initialBalance);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState(null); // 'income' | 'expense'
  const [transactions, setTransactions] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTransaction = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;

    const isIncome = transactionType === 'income';
    const newBalance = isIncome ? balance + value : balance - value;

    const transaction = {
      id: Date.now(),
      type: transactionType,
      amount: value,
      description: description || (isIncome ? 'Ingreso' : 'Gasto'),
      timestamp: new Date(),
    };

    setBalance(newBalance);
    setTransactions([transaction, ...transactions.slice(0, 4)]);
    setAmount('');
    setDescription('');
    setTransactionType(null);

    // Animación de éxito
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);

    if (onTransaction) {
      onTransaction(transaction, newBalance);
    }
  };

  const formatCurrency = (value) => {
    return `L. ${value.toFixed(2)}`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-HN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/20">
          <Calculator className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Caja del Día</h3>
          <p className="text-xs text-gray-500">Control de ingresos y gastos</p>
        </div>
      </div>

      {/* Balance actual */}
      <div className="relative mb-6 p-4 bg-gradient-to-br from-green-500/10 to-cyan-500/5 rounded-xl border border-green-500/20">
        <p className="text-sm text-gray-400 mb-1">Balance actual</p>
        <motion.p
          key={balance}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`text-3xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}
        >
          {formatCurrency(balance)}
        </motion.p>

        {/* Animación de éxito */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm rounded-xl"
            >
              <div className="text-4xl">✓</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botones Ingreso/Gasto */}
      {!transactionType && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            onClick={() => setTransactionType('income')}
            className="h-16 flex-col gap-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400"
            variant="ghost"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Ingreso</span>
          </Button>
          <Button
            onClick={() => setTransactionType('expense')}
            className="h-16 flex-col gap-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
            variant="ghost"
          >
            <Minus className="w-6 h-6" />
            <span className="text-sm font-medium">Gasto</span>
          </Button>
        </div>
      )}

      {/* Formulario de transacción */}
      <AnimatePresence>
        {transactionType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 mb-4"
          >
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                transactionType === 'income'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {transactionType === 'income' ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
              <span className="text-white font-medium">
                {transactionType === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
              </span>
              <button
                onClick={() => setTransactionType(null)}
                className="ml-auto text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 bg-dark-200 border border-white/10 rounded-xl text-white text-2xl font-bold placeholder-gray-600 focus:border-primary-500 focus:outline-none"
                autoFocus
              />
            </div>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
            />

            <Button
              onClick={handleTransaction}
              disabled={!amount || parseFloat(amount) <= 0}
              className={`w-full py-3 ${
                transactionType === 'income'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {transactionType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Últimas transacciones */}
      {transactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-2">Últimos movimientos</p>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 px-3 bg-dark-200/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {tx.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm text-gray-300">{tx.description}</span>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    tx.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-500">{formatTime(tx.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SimpleCashRegister;
