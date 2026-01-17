import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Delete, CheckCircle, Trash2, Clock, X,
  Calculator, Plus, History, TrendingUp, TrendingDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { orderApi } from '../../services/api';
import toast from 'react-hot-toast';
import LempiraIcon from '../../components/icons/LempiraIcon';
import CelebrationAnimation, { useCelebration } from '../../components/feedback/CelebrationAnimation';

const QuickSale = () => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { celebrate, CelebrationComponent } = useCelebration();

  // Query para ventas del día
  const { data: todayData, isLoading } = useQuery({
    queryKey: ['quick-sales-today'],
    queryFn: () => orderApi.getQuickSalesToday(),
    refetchInterval: 30000, // Refetch cada 30 segundos
  });

  // Query para ventas de ayer (comparación)
  const { data: yesterdayData } = useQuery({
    queryKey: ['quick-sales-yesterday'],
    queryFn: () => orderApi.getQuickSalesYesterday?.() || Promise.resolve({ data: { total: 0, sales: [] } }),
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
      // Celebración visual
      setShowSuccess(true);
      celebrate('checkmark');
      setTimeout(() => setShowSuccess(false), 1500);
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
  const totalYesterday = yesterdayData?.data?.total || 0;
  const comparison = totalYesterday > 0 ? ((totalToday - totalYesterday) / totalYesterday) * 100 : 0;
  const isUp = comparison >= 0;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Componente de celebración */}
      <CelebrationComponent />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            Venta Rápida
          </h1>
          <p className="text-gray-400">Registra ventas sin crear productos</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHistory(!showHistory)}
          className={`p-2 rounded-lg transition-colors ${
            showHistory
              ? 'bg-primary text-white'
              : 'bg-dark-card text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Resumen del día mejorado */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Ventas de hoy</p>
              <div className="flex items-center gap-2">
                <LempiraIcon className="w-5 h-5 text-white" />
                <p className="text-2xl font-bold text-white">
                  {totalToday.toLocaleString()}
                </p>
              </div>
              {/* Comparativa vs ayer */}
              {totalYesterday > 0 && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  <span>{Math.abs(comparison).toFixed(0)}% vs ayer</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{sales.length}</p>
            <p className="text-sm text-gray-400">transacciones</p>
          </div>
        </div>
      </motion.div>

      {/* Calculadora */}
      <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
        {/* Display mejorado */}
        <div className="p-6 bg-gradient-to-br from-dark-lighter to-dark-card">
          <motion.div
            key={amount}
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-right flex items-center justify-end gap-2"
          >
            <LempiraIcon className="w-10 h-10 text-primary" strokeWidth={2.5} />
            <span className="text-6xl font-bold text-white tracking-tight">
              {parseFloat(amount).toLocaleString('es-HN', {
                minimumFractionDigits: amount.includes('.') ? amount.split('.')[1]?.length || 0 : 0,
                maximumFractionDigits: 2
              })}
            </span>
          </motion.div>
        </div>

        {/* Descripción opcional */}
        <div className="px-4 pt-4">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full px-4 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Teclado numérico con animaciones */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {['7', '8', '9', 'C'].map((key) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              whileHover={{ brightness: 1.1 }}
              onClick={() => handleKeyPress(key)}
              className={`p-4 rounded-xl text-xl font-semibold transition-all ${
                key === 'C'
                  ? 'bg-red-500/30 text-red-400 hover:bg-red-500/40 border border-red-500/20'
                  : 'bg-dark-lighter text-white hover:bg-primary/20 hover:text-primary'
              }`}
            >
              {key}
            </motion.button>
          ))}
          {['4', '5', '6', 'backspace'].map((key) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress(key)}
              className={`p-4 rounded-xl text-xl font-semibold transition-all ${
                key === 'backspace'
                  ? 'bg-amber-500/30 text-amber-400 hover:bg-amber-500/40 border border-amber-500/20'
                  : 'bg-dark-lighter text-white hover:bg-primary/20 hover:text-primary'
              }`}
            >
              {key === 'backspace' ? <Delete className="w-6 h-6 mx-auto" /> : key}
            </motion.button>
          ))}
          {['1', '2', '3'].map((key) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress(key)}
              className="p-4 rounded-xl text-xl font-semibold bg-dark-lighter text-white hover:bg-primary/20 hover:text-primary transition-all"
            >
              {key}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleSubmit}
            disabled={createMutation.isPending || parseFloat(amount) <= 0}
            className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all row-span-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
          >
            {showSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 mx-auto"
              >
                <CheckCircle className="w-8 h-8" />
              </motion.div>
            ) : (
              <CheckCircle className="w-8 h-8 mx-auto" />
            )}
          </motion.button>
          {['0', '.'].map((key) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress(key)}
              className={`p-4 rounded-xl text-xl font-semibold bg-dark-lighter text-white hover:bg-primary/20 hover:text-primary transition-all ${
                key === '0' ? 'col-span-2' : ''
              }`}
            >
              {key}
            </motion.button>
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
