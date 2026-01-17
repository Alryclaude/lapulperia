import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Trash2, Edit2, DollarSign, TrendingUp, TrendingDown,
  Package, Truck, UtensilsCrossed, Lightbulb, Home, Users, Wrench,
  Megaphone, MoreHorizontal, Calendar, ChevronLeft, ChevronRight,
  PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { expensesApi } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORY_CONFIG = {
  SUPPLIES: { label: 'Insumos', icon: Package, color: 'blue' },
  TRANSPORT: { label: 'Transporte', icon: Truck, color: 'amber' },
  FOOD: { label: 'Comida', icon: UtensilsCrossed, color: 'orange' },
  UTILITIES: { label: 'Servicios', icon: Lightbulb, color: 'yellow' },
  RENT: { label: 'Alquiler', icon: Home, color: 'purple' },
  SALARIES: { label: 'Sueldos', icon: Users, color: 'green' },
  MAINTENANCE: { label: 'Mantenimiento', icon: Wrench, color: 'gray' },
  MARKETING: { label: 'Publicidad', icon: Megaphone, color: 'pink' },
  OTHER: { label: 'Otros', icon: MoreHorizontal, color: 'slate' }
};

const DailyExpenses = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [formData, setFormData] = useState({
    amount: '',
    category: 'SUPPLIES',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Formatear fecha para display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-HN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  // Navegación de fechas
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
  };

  // Calcular rango de fechas para el query
  const getDateRange = () => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (viewMode === 'day') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (viewMode === 'week') {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const dateRange = getDateRange();

  // Queries
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', dateRange.startDate, dateRange.endDate],
    queryFn: () => expensesApi.list(dateRange),
  });

  const { data: summary } = useQuery({
    queryKey: ['expense-summary', viewMode],
    queryFn: () => expensesApi.getSummary(viewMode),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => expensesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      toast.success('Gasto registrado');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al registrar gasto');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => expensesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      toast.success('Gasto actualizado');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      toast.success('Gasto eliminado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar');
    }
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      amount: '',
      category: 'SUPPLIES',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      date: expense.date.split('T')[0]
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description.trim() || null,
      date: formData.date
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Agrupar gastos por categoría para stats
  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Check if selected date is today
  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Control de Gastos</h1>
          <p className="text-gray-400">Registra y monitorea tus gastos diarios</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Registrar Gasto
        </button>
      </div>

      {/* Profit Summary Card */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-card rounded-xl p-4 border border-dark-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Ventas</p>
                <p className="text-xl font-bold text-green-400">
                  L {summary.totalSales?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-card rounded-xl p-4 border border-dark-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Gastos</p>
                <p className="text-xl font-bold text-red-400">
                  L {summary.totalExpenses?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-card rounded-xl p-4 border border-dark-border"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${summary.profit >= 0 ? 'bg-cyan-500/20' : 'bg-red-500/20'}`}>
                {summary.profit >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400">Ganancia</p>
                <p className={`text-xl font-bold ${summary.profit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                  L {summary.profit?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-card rounded-xl p-4 border border-dark-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <PieChart className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Margen</p>
                <p className="text-xl font-bold text-purple-400">
                  {summary.profitMargin || 0}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Date Navigation */}
      <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* View Mode Selector */}
          <div className="flex gap-2">
            {[
              { value: 'day', label: 'Día' },
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mes' }
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode.value
                    ? 'bg-primary text-white'
                    : 'bg-dark-lighter text-gray-400 hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 bg-dark-lighter rounded-lg hover:bg-dark-border transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-[200px] justify-center">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-white font-medium capitalize">
                {viewMode === 'day' && formatDate(selectedDate)}
                {viewMode === 'week' && `Semana del ${selectedDate.getDate()} de ${selectedDate.toLocaleDateString('es-HN', { month: 'long' })}`}
                {viewMode === 'month' && selectedDate.toLocaleDateString('es-HN', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <button
              onClick={() => navigateDate(1)}
              className="p-2 bg-dark-lighter rounded-lg hover:bg-dark-border transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {!isToday() && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
              >
                Hoy
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Gastos por categoría</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(expensesByCategory).map(([category, amount]) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config?.icon || MoreHorizontal;
              const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;

              return (
                <div
                  key={category}
                  className="flex items-center gap-2 px-3 py-2 bg-dark-lighter rounded-lg"
                >
                  <Icon className={`w-4 h-4 text-${config?.color || 'gray'}-400`} />
                  <span className="text-sm text-gray-300">{config?.label || category}</span>
                  <span className="text-sm font-medium text-white">L {amount.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
        <div className="p-4 border-b border-dark-border flex items-center justify-between">
          <h3 className="font-medium text-white">
            Gastos ({expenses.length})
          </h3>
          <span className="text-lg font-bold text-red-400">
            Total: L {totalExpenses.toLocaleString()}
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            Cargando gastos...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No hay gastos registrados</p>
            <p className="text-sm text-gray-500">para este período</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            <AnimatePresence>
              {expenses.map((expense, index) => {
                const config = CATEGORY_CONFIG[expense.category];
                const Icon = config?.icon || MoreHorizontal;

                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-dark-lighter/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 bg-${config?.color || 'gray'}-500/20 rounded-lg`}>
                          <Icon className={`w-5 h-5 text-${config?.color || 'gray'}-400`} />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {expense.description || config?.label || expense.category}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className={`px-2 py-0.5 rounded text-xs bg-${config?.color || 'gray'}-500/20 text-${config?.color || 'gray'}-400`}>
                              {config?.label || expense.category}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(expense.date).toLocaleDateString('es-HN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-red-400">
                          L {expense.amount.toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(expense)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-border rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar este gasto?')) {
                                deleteMutation.mutate(expense.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-xl w-full max-w-md border border-dark-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-dark-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {editingExpense ? 'Editar Gasto' : 'Registrar Gasto'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Monto *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">L</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Categoría *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: key })}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                            formData.category === key
                              ? 'border-primary bg-primary/20 text-white'
                              : 'border-dark-border bg-dark-lighter text-gray-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none"
                    placeholder="Ej: Compra de verduras"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-dark-lighter text-gray-300 rounded-lg hover:bg-dark-border transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Guardando...'
                      : editingExpense
                      ? 'Actualizar'
                      : 'Registrar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyExpenses;
