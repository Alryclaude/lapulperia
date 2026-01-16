import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { stampsApi } from '../services/api';
import StampGrid from '../components/passport/StampGrid';
import { User, Shield, Star, Hexagon, MapPin, Trophy } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';

const Passport = () => {
  const { user } = useAuthStore();

  const { data: stampsData, isLoading: loadingStamps } = useQuery({
    queryKey: ['user-stamps'],
    queryFn: () => stampsApi.getMyStamps(),
  });

  const { data: statsData } = useQuery({
    queryKey: ['stamp-stats'],
    queryFn: () => stampsApi.getStats(),
  });

  const stamps = stampsData?.data || [];
  const stats = statsData?.data || { totalStamps: 0, level: 1, progress: 0, legendaryCount: 0, uniqueBusinesses: 0 };

  return (
    <div className="min-h-screen pb-24 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.08),transparent_50%)] pointer-events-none" />

      <div className="max-w-md mx-auto px-4 pt-6 relative z-10">

        {/* Header Identidad */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`}
              alt="Avatar"
              className="w-full h-full rounded-full border-2 border-primary-500/50 object-cover relative z-10"
            />
            <div className="absolute -bottom-1 -right-1 bg-dark-200 border border-primary-500 text-primary-400 text-xs px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
              <Shield size={10} /> LVL {stats.level}
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">{user?.name || 'Explorador'}</h1>
          <p className="text-gray-500 text-xs font-mono tracking-widest uppercase">
            PASAPORTE DIGITAL
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-dark-100/80 backdrop-blur-sm rounded-xl border border-white/[0.08] p-3 text-center">
            <Hexagon className="w-5 h-5 text-primary-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stats.totalStamps}</p>
            <p className="text-[10px] text-gray-500 uppercase">Sellos</p>
          </div>
          <div className="bg-dark-100/80 backdrop-blur-sm rounded-xl border border-white/[0.08] p-3 text-center">
            <MapPin className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stats.uniqueBusinesses}</p>
            <p className="text-[10px] text-gray-500 uppercase">Negocios</p>
          </div>
          <div className="bg-dark-100/80 backdrop-blur-sm rounded-xl border border-white/[0.08] p-3 text-center">
            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stats.legendaryCount}</p>
            <p className="text-[10px] text-gray-500 uppercase">Legendarios</p>
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-4 mb-6"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent-400" />
              <span className="text-sm text-gray-300">Progreso al Nivel {stats.level + 1}</span>
            </div>
            <span className="text-primary-400 font-mono font-bold text-sm">{stats.progress}%</span>
          </div>
          <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            {5 - (stats.totalStamps % 5)} sellos más para subir de nivel
          </p>
        </motion.div>

        {/* Colección de Sellos */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Hexagon size={16} className="text-primary-400" />
              Colección de Sellos
            </h2>
            <Link
              to="/search"
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              Explorar negocios
            </Link>
          </div>

          {loadingStamps ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
          ) : stamps.length > 0 ? (
            <StampGrid stamps={stamps} />
          ) : (
            <div className="text-center py-10 px-4">
              <Hexagon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">Sin sellos aún</h3>
              <p className="text-gray-500 text-sm mb-4">
                Visita negocios y haz compras para coleccionar sellos
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-500/30 transition-colors"
              >
                <MapPin size={16} />
                Explorar
              </Link>
            </div>
          )}
        </motion.div>

        {/* Leyenda de Rareza */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex justify-center gap-4 text-[10px] text-gray-500"
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            Común
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            Raro
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Legendario
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Passport;
