import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Star,
  Zap,
  Trophy,
  Target,
  DollarSign,
  Award,
  Flame,
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
    refetchInterval: 30000,
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
    FIRST_SALE: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    STREAK_7: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    HUNDRED_CUSTOMERS: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    FIVE_STARS: { icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    TOP_SELLER: { icon: Award, color: 'text-green-400', bg: 'bg-green-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Centro de Comando</h1>
          <p className="text-gray-400">Bienvenido, {user?.name}</p>
        </div>

        {/* Status Toggle */}
        <button
          onClick={handleToggleStatus}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-medium transition-all ${
            isOpen
              ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-green-600'
              : 'bg-dark-100 text-gray-300 border border-white/10 hover:bg-dark-50'
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
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Hoy</span>
            </div>
            <p className="text-2xl font-bold text-white">
              L. {(stats.today?.revenue || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {stats.today?.orders || 0} ordenes
            </p>
          </div>
        </motion.div>

        {/* This Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">Semana</span>
            </div>
            <p className="text-2xl font-bold text-white">
              L. {(stats.week?.revenue || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {stats.week?.orders || 0} ordenes
            </p>
          </div>
        </motion.div>

        {/* Pending Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
              </div>
              {stats.today?.pending > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 animate-pulse">
                  {stats.today.pending} nuevas
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.today?.pending || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">Ordenes pendientes</p>
            {stats.today?.pending > 0 && (
              <Link
                to="/manage/orders"
                className="text-primary-400 text-sm font-medium hover:text-primary-300 mt-2 inline-block transition-colors"
              >
                Ver ordenes →
              </Link>
            )}
          </div>
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {pulperia?.rating?.toFixed(1) || '0.0'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {pulperia?.reviewCount || 0} reseñas
            </p>
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      {stats.achievements?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Tus Logros
          </h3>
          <div className="flex flex-wrap gap-3">
            {stats.achievements.map((achievement) => {
              const config = achievementIcons[achievement.type] || {
                icon: Award,
                color: 'text-gray-400',
                bg: 'bg-gray-500/20',
              };
              const Icon = config.icon;
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${config.bg} border border-white/5`}
                >
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="font-medium text-gray-300">
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
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-primary-500/30 transition-all group"
        >
          <ShoppingBag className="w-8 h-8 text-primary-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-white">Ordenes</h3>
          <p className="text-sm text-gray-400">Gestiona tus pedidos</p>
        </Link>

        <Link
          to="/manage/products"
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-blue-500/30 transition-all group"
        >
          <Package className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-white">Productos</h3>
          <p className="text-sm text-gray-400">Agrega y edita</p>
        </Link>

        <Link
          to="/manage/jobs"
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-purple-500/30 transition-all group"
        >
          <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-white">Empleos</h3>
          <p className="text-sm text-gray-400">Publica vacantes</p>
        </Link>

        <Link
          to="/pulperia/settings"
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-green-500/30 transition-all group"
        >
          <Target className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-white">Perfil</h3>
          <p className="text-sm text-gray-400">Configura tu negocio</p>
        </Link>
      </div>

      {/* Top Products & Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
          <h3 className="font-semibold text-white mb-4">Productos Top</h3>
          {stats.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-500/20 text-gray-400' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-dark-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{product.name}</p>
                    <p className="text-sm text-gray-400">{product.quantity} vendidos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos aun</p>
          )}
        </div>

        {/* Insights */}
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Radar de Ventas
          </h3>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-gradient-to-r from-primary-500/10 to-blue-500/10 border border-primary-500/20"
                >
                  <p className="text-gray-300">{insight.message}</p>
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
      <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
        <h3 className="font-semibold text-white mb-4">Exportar Datos</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-50 text-gray-300 border border-white/10 rounded-xl hover:bg-dark-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-50 text-gray-300 border border-white/10 rounded-xl hover:bg-dark-200 transition-colors"
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
