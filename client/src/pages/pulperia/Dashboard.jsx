import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Star,
  Zap,
  Trophy,
  Target,
  ArrowUp,
  ArrowDown,
  Clock,
  DollarSign,
  Eye,
  Award,
  Flame,
  ChevronRight,
  Download,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { statsApi, pulperiaApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, refreshUser } = useAuthStore();
  const pulperia = user?.pulperia;

  const [isOpen, setIsOpen] = useState(pulperia?.status === 'OPEN');

  // Sync isOpen state when pulperia data changes
  useEffect(() => {
    if (pulperia?.status) {
      setIsOpen(pulperia.status === 'OPEN');
    }
  }, [pulperia?.status]);

  // Fetch stats
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsApi.getDashboard(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = statsData?.data || {};

  // Fetch insights
  const { data: insightsData } = useQuery({
    queryKey: ['insights'],
    queryFn: () => statsApi.getInsights(),
  });

  const insights = insightsData?.data?.insights || [];

  // Toggle open/closed status
  const handleToggleStatus = async () => {
    try {
      const newStatus = isOpen ? 'CLOSED' : 'OPEN';
      await pulperiaApi.updateStatus({ status: newStatus });
      setIsOpen(!isOpen);
      await refreshUser();
      toast.success(isOpen ? 'Pulperia cerrada' : 'Pulperia abierta!');
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  // Export data
  const handleExport = async (format) => {
    try {
      const response = await statsApi.export({ format });
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ventas.csv';
        a.click();
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'datos.json';
        a.click();
      }
      toast.success('Datos exportados');
    } catch (error) {
      toast.error('Error al exportar');
    }
  };

  // Achievement icons
  const achievementIcons = {
    FIRST_SALE: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    STREAK_7: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100' },
    HUNDRED_CUSTOMERS: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    FIVE_STARS: { icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-100' },
    TOP_SELLER: { icon: Award, color: 'text-green-500', bg: 'bg-green-100' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Comando</h1>
          <p className="text-gray-500">Bienvenido, {user?.name}</p>
        </div>

        {/* Status Toggle */}
        <button
          onClick={handleToggleStatus}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-medium transition-all ${
            isOpen
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isOpen ? (
            <>
              <ToggleRight className="w-6 h-6" />
              Abierto
            </>
          ) : (
            <>
              <ToggleLeft className="w-6 h-6" />
              Cerrado
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="badge-success">Hoy</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            L. {(stats.today?.revenue || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.today?.orders || 0} ordenes
          </p>
        </motion.div>

        {/* This Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="badge bg-blue-100 text-blue-700">Semana</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            L. {(stats.week?.revenue || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.week?.orders || 0} ordenes
          </p>
        </motion.div>

        {/* Pending Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            {stats.today?.pending > 0 && (
              <span className="badge-warning animate-pulse">
                {stats.today.pending} nuevas
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.today?.pending || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Ordenes pendientes</p>
          {stats.today?.pending > 0 && (
            <Link
              to="/manage/orders"
              className="text-primary-600 text-sm font-medium hover:underline mt-2 inline-block"
            >
              Ver ordenes →
            </Link>
          )}
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {pulperia?.rating?.toFixed(1) || '0.0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {pulperia?.reviewCount || 0} reseñas
          </p>
        </motion.div>
      </div>

      {/* Achievements */}
      {stats.achievements?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Tus Logros
          </h3>
          <div className="flex flex-wrap gap-3">
            {stats.achievements.map((achievement) => {
              const config = achievementIcons[achievement.type] || {
                icon: Award,
                color: 'text-gray-500',
                bg: 'bg-gray-100',
              };
              const Icon = config.icon;
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${config.bg}`}
                >
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="font-medium text-gray-700">
                    {achievement.type.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/manage/orders"
          className="card p-5 hover:shadow-md transition-shadow group"
        >
          <ShoppingBag className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900">Ordenes</h3>
          <p className="text-sm text-gray-500">Gestiona tus pedidos</p>
        </Link>

        <Link
          to="/manage/products"
          className="card p-5 hover:shadow-md transition-shadow group"
        >
          <Package className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900">Productos</h3>
          <p className="text-sm text-gray-500">Agrega y edita</p>
        </Link>

        <Link
          to="/manage/jobs"
          className="card p-5 hover:shadow-md transition-shadow group"
        >
          <Users className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900">Empleos</h3>
          <p className="text-sm text-gray-500">Publica vacantes</p>
        </Link>

        <Link
          to="/pulperia/settings"
          className="card p-5 hover:shadow-md transition-shadow group"
        >
          <Target className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900">Perfil</h3>
          <p className="text-sm text-gray-500">Configura tu negocio</p>
        </Link>
      </div>

      {/* Top Products & Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Productos Top</h3>
          {stats.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} vendidos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos aun</p>
          )}
        </div>

        {/* Insights */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Radar de Ventas
          </h3>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100"
                >
                  <p className="text-gray-700">{insight.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Las predicciones apareceran cuando tengas mas datos
            </p>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Exportar Datos</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" />
            Descargar CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" />
            Descargar JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
