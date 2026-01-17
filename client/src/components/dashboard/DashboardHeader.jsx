import { motion } from 'framer-motion';
import { MapPin, Star, Flame, TrendingUp } from 'lucide-react';
import StatusToggle from './StatusToggle';

/**
 * Header mejorado del Dashboard con saludo contextual y métricas destacadas
 */
const DashboardHeader = ({
  pulperia,
  isOpen,
  onToggleStatus,
  streak = 0,
  stats = {},
}) => {
  // Saludo contextual según hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Obtener nombre corto del dueño (primer nombre)
  const ownerFirstName = pulperia?.ownerName?.split(' ')[0] || 'amigo';

  // Calcular comparativa con ayer
  const todayRevenue = stats.today?.revenue || 0;
  const yesterdayRevenue = stats.yesterday?.revenue || 0;
  const revenueChange = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(0)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100/80 via-dark-100/60 to-transparent backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-500/5 rounded-full blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Greeting and Store Info */}
        <div className="flex items-start gap-4">
          {/* Logo */}
          {pulperia?.logo ? (
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={pulperia.logo}
              alt={pulperia.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 shadow-lg"
            />
          ) : (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center border-2 border-white/10 shadow-lg"
            >
              <span className="text-2xl font-bold text-white">
                {pulperia?.name?.charAt(0) || 'P'}
              </span>
            </motion.div>
          )}

          <div>
            {/* Greeting */}
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-sm"
            >
              {getGreeting()}, <span className="text-white font-medium">{ownerFirstName}!</span>
            </motion.p>

            {/* Store Name */}
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xl sm:text-2xl font-bold text-white mt-0.5"
            >
              {pulperia?.name || 'Mi Pulpería'}
            </motion.h1>

            {/* Meta info */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-3 mt-2"
            >
              {/* Location */}
              {pulperia?.address && (
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{pulperia.address}</span>
                </div>
              )}

              {/* Rating */}
              {pulperia?.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-medium text-sm">
                    {pulperia.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({pulperia.reviewCount})
                  </span>
                </div>
              )}

              {/* Streak */}
              {streak > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-orange-400 text-xs font-medium">
                    {streak} días vendiendo
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Right: Status and Quick Stats */}
        <div className="flex flex-col items-end gap-3">
          <StatusToggle isOpen={isOpen} onToggle={onToggleStatus} />

          {/* Today's performance mini */}
          {todayRevenue > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-200/50 border border-white/5"
            >
              <span className="text-gray-400 text-xs">Hoy:</span>
              <span className="text-white font-bold text-sm">L. {todayRevenue.toFixed(0)}</span>
              {revenueChange !== 0 && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${
                  revenueChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${revenueChange < 0 ? 'rotate-180' : ''}`} />
                  {revenueChange > 0 ? '+' : ''}{revenueChange}%
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
