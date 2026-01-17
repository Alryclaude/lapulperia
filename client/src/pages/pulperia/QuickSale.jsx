import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Delete, CheckCircle, Trash2, Clock, X,
  Calculator, Plus, History, TrendingUp
} from 'lucide-react';
import { orderApi } from '../../services/api';
import toast from 'react-hot-toast';

const QuickSale = () => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Query para ventas del día
  const { data: todayData, isLoading } = useQuery({
    queryKey: ['quick-sales-today'],
    queryFn: () => orderApi.getQuickSalesToday(),
    refetchInterval: 30000, // Refetch cada 30 segundos
  });

  // Mutation para crear venta
  const createMutation = useMutation({
    mutationFn: (data) => orderApi.quickSale(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['quick-sales-today'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      toast.success(response.data.message || 'Venta registrada');
      setAmount('0');
      setDescription('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al registrar venta');
    }
  });

  // Mutation para eliminar venta
  const deleteMutation = useMutation({
    mutationFn: (id) => orderApi.deleteQuickSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-sales-today'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      toast.success('Venta eliminada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar');
    }
  });

  // Manejar input del teclado numérico
  const handleKeyPress = useCallback((key) => {
    if (key === 'C') {
      setAmount('0');
      return;
    }

    if (key === 'backspace') {
      setAmount((prev) => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
      return;
    }

    if (key === '.') {
      if (amount.includes('.')) return;
      setAmount((prev) => prev + '.');
      return;
    }

    // Números
    setAmount((prev) => {
      if (prev === '0' && key !== '.') return key;
      // Limitar a 2 decimales
      if (prev.includes('.')) {
        const decimals = prev.split('.')[1];
        if (decimals && decimals.length >= 2) return prev;
      }
      // Limitar longitud total
      if (prev.length >= 10) return prev;
      return prev + key;
    });
  }, [amount]);

  // Escuchar teclado físico
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === '.') {
        handleKeyPress('.');
      } else if (e.key === 'Backspace') {
        handleKeyPress('backspace');
      } else if (e.key === 'Escape') {
        handleKeyPress('C');
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    createMutation.mutate({
      amount: numAmount,
      description: description.trim() || null
    });
  };

  const sales = todayData?.data?.sales || [];
  const totalToday = todayData?.data?.total || 0;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            Venta Rápida
          </h1>
          <p className="text-gray-400">Registra ventas sin crear productos</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-2 rounded-lg transition-colors ${
            showHistory
              ? 'bg-primary text-white'
              : 'bg-dark-card text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      {/* Resumen del día */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Ventas de hoy</p>
              <p className="text-2xl font-bold text-white">
                L {totalToday.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{sales.length}</p>
            <p className="text-sm text-gray-400">transacciones</p>
          </div>
        </div>
      </div>

      {/* Calculadora */}
      <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
        {/* Display */}
        <div className="p-6 bg-dark-lighter">
          <div className="text-right">
            <span className="text-gray-500 text-lg">L</span>
            <span className="text-4xl font-bold text-white ml-2">
              {parseFloat(amount).toLocaleString('es-HN', {
                minimumFractionDigits: amount.includes('.') ? amount.split('.')[1]?.length || 0 : 0,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        </div>

        {/* Descripción opcional */}
        <div className="px-4 pt-4">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full px-4 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Teclado numérico */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {['7', '8', '9', 'C'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className={`p-4 rounded-xl text-xl font-semibold transition-colors ${
                key === 'C'
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-dark-lighter text-white hover:bg-dark-border'
              }`}
            >
              {key}
            </button>
          ))}
          {['4', '5', '6', 'backspace'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className={`p-4 rounded-xl text-xl font-semibold transition-colors ${
                key === 'backspace'
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-dark-lighter text-white hover:bg-dark-border'
              }`}
            >
              {key === 'backspace' ? <Delete className="w-6 h-6 mx-auto" /> : key}
            </button>
          ))}
          {['1', '2', '3'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="p-4 rounded-xl text-xl font-semibold bg-dark-lighter text-white hover:bg-dark-border transition-colors"
            >
              {key}
            </button>
          ))}
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || parseFloat(amount) <= 0}
            className="p-4 rounded-xl bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors row-span-2"
          >
            <CheckCircle className="w-8 h-8 mx-auto" />
          </button>
          {['0', '.'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className={`p-4 rounded-xl text-xl font-semibold bg-dark-lighter text-white hover:bg-dark-border transition-colors ${
                key === '0' ? 'col-span-2' : ''
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Historial de ventas del día */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-dark-card rounded-xl border border-dark-border overflow-hidden"
          >
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Ventas de hoy
              </h3>
              <span className="text-sm text-gray-400">{sales.length} registros</span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Cargando...</div>
            ) : sales.length === 0 ? (
              <div className="p-8 text-center">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No hay ventas registradas hoy</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <div className="divide-y divide-dark-border">
                  {sales.map((sale, index) => (
                    <motion.div
                      key={sale.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 flex items-center justify-between hover:bg-dark-lighter/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-green-500/20 rounded-lg">
                          <DollarSign className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            L {sale.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {sale.notes || 'Venta rápida'}
                            {' • '}
                            {new Date(sale.createdAt).toLocaleTimeString('es-HN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar esta venta?')) {
                            deleteMutation.mutate(sale.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-4 gap-2">
        {[10, 20, 50, 100].map((quickAmount) => (
          <button
            key={quickAmount}
            onClick={() => setAmount(quickAmount.toString())}
            className="p-3 bg-dark-card border border-dark-border rounded-lg text-white hover:border-primary transition-colors"
          >
            <span className="text-xs text-gray-400">L</span>
            <span className="font-bold ml-1">{quickAmount}</span>
          </button>
        ))}
      </div>

      {/* Instrucciones */}
      <p className="text-center text-sm text-gray-500">
        Usa el teclado numérico o tu teclado. Presiona Enter para confirmar.
      </p>
    </div>
  );
};

export default QuickSale;
