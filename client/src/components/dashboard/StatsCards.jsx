import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Star, DollarSign, ArrowUpRight } from 'lucide-react';

// REVAMP: Enhanced StatsCards with vibrant gradients and glow effects
const StatsCards = ({ stats, pulperia }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today's Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden group hover:border-green-500/30 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 via-transparent to-transparent" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors duration-300" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/30 to-green-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">Hoy</span>
          </div>
          <p className="text-2xl font-bold text-white">
            L. {(stats.today?.revenue || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {stats.today?.orders || 0} órdenes
          </p>
        </div>
      </motion.div>

      {/* This Week */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-transparent to-transparent" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors duration-300" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Semana</span>
          </div>
          <p className="text-2xl font-bold text-white">
            L. {(stats.week?.revenue || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {stats.week?.orders || 0} órdenes
          </p>
        </div>
      </motion.div>

      {/* Pending Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-transparent to-transparent" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors duration-300" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.2)]">
              <ShoppingBag className="w-5 h-5 text-orange-400" />
            </div>
            {stats.today?.pending > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                {stats.today.pending} nuevas
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.today?.pending || 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">Órdenes pendientes</p>
          {stats.today?.pending > 0 && (
            <Link
              to="/manage/orders"
              className="inline-flex items-center gap-1 text-primary-400 text-sm font-medium hover:text-primary-300 mt-2 transition-colors"
            >
              Ver órdenes
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </motion.div>

      {/* Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden group hover:border-accent-500/30 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/15 via-transparent to-transparent" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl group-hover:bg-accent-500/20 transition-colors duration-300" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500/30 to-accent-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              <Star className="w-5 h-5 text-accent-400 fill-accent-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {pulperia?.reviewCount > 0 ? pulperia?.rating?.toFixed(1) : '—'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {pulperia?.reviewCount > 0
              ? `${pulperia.reviewCount} ${pulperia.reviewCount === 1 ? 'reseña' : 'reseñas'}`
              : 'Sin reseñas aún'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsCards;
