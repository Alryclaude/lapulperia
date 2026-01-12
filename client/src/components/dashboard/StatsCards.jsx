import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Star, DollarSign } from 'lucide-react';

const StatsCards = ({ stats, pulperia }) => {
  return (
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
            {pulperia?.reviewCount || 0} resenas
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsCards;
