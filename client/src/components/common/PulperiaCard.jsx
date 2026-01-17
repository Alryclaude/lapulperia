import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Package, BadgeCheck, Store, Clock } from 'lucide-react';
import { CardGlow } from '@/components/ui/card';
import { StatusBadge, Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * PulperiaCard - Constelacion de Barrio Design System
 *
 * Card de pulpería con glow de estado:
 * - OPEN: Glow verde pulsante (estrella brillante)
 * - CLOSING_SOON: Glow ámbar intermitente
 * - CLOSED: Sin glow, opacidad reducida
 */
const PulperiaCard = ({ pulperia, className }) => {
  const statusMap = {
    OPEN: { label: 'Abierto', variant: 'open', glow: 'open' },
    CLOSING_SOON: { label: 'Por cerrar', variant: 'closing', glow: 'closing' },
    CLOSED: { label: 'Cerrado', variant: 'closed', glow: 'closed' },
    VACATION: { label: 'Vacaciones', variant: 'vacation', glow: 'default' },
  };

  const status = statusMap[pulperia.status] || statusMap.CLOSED;
  const isOpen = pulperia.status === 'OPEN';
  const isClosed = pulperia.status === 'CLOSED';

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  // Card hover animation variants
  const cardVariants = {
    rest: { y: 0, scale: 1 },
    hover: { y: -4, scale: 1.01 },
    tap: { scale: 0.98 },
  };

  return (
    <Link to={`/pulperia/${pulperia.id}`} className="block">
      <motion.div
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <CardGlow
          status={status.glow}
          className={cn(
            'overflow-hidden group h-full',
            isClosed && 'opacity-75',
            className
          )}
        >
          {/* Banner/Logo Section */}
          <div className="relative h-36 bg-gradient-to-br from-surface-2 to-surface-3">
            {pulperia.banner ? (
              <img
                src={pulperia.banner}
                alt={pulperia.name}
                className={cn(
                  'w-full h-full object-cover transition-all duration-500',
                  'group-hover:scale-105',
                  isClosed && 'brightness-50'
                )}
                loading="lazy"
              />
            ) : pulperia.logo ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-2 via-surface-3 to-surface-2">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={pulperia.logo}
                  alt={pulperia.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-xl ring-2 ring-white/10"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-2 via-surface-3 to-surface-2">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/30 to-primary-600/20 flex items-center justify-center shadow-xl ring-2 ring-primary-500/30">
                  <Store className="w-9 h-9 text-primary-400" />
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/40 to-transparent" />

            {/* Status badge - Top left */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-3 left-3"
            >
              <StatusBadge status={status.variant} className="shadow-lg backdrop-blur-sm">
                {status.label}
              </StatusBadge>
            </motion.div>

            {/* Verified badge - Top right */}
            {pulperia.isVerified && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="absolute top-3 right-3"
              >
                <Badge className="bg-surface-1/90 backdrop-blur-sm text-white border-white/10 gap-1 shadow-lg">
                  <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs">Verificado</span>
                </Badge>
              </motion.div>
            )}

            {/* Logo overlay when has banner */}
            {pulperia.banner && pulperia.logo && (
              <div className="absolute -bottom-5 left-4">
                <div className={cn(
                  'w-14 h-14 rounded-xl overflow-hidden border-[3px] border-surface-1 shadow-xl',
                  isOpen && 'ring-2 ring-success-500/50'
                )}>
                  <img
                    src={pulperia.logo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className={cn('p-4', pulperia.banner && pulperia.logo ? 'pt-7' : '')}>
            {/* Name */}
            <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1 text-base">
              {pulperia.name}
            </h3>

            {/* Info row - Compact */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {/* Rating */}
              {pulperia.rating > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-accent-500/15 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />
                  <span className="text-sm font-semibold text-accent-300">
                    {pulperia.rating.toFixed(1)}
                  </span>
                  {pulperia.reviewCount > 0 && (
                    <span className="text-xs text-gray-500">
                      ({pulperia.reviewCount})
                    </span>
                  )}
                </div>
              )}

              {/* Distance */}
              {pulperia.distance !== undefined && (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{formatDistance(pulperia.distance)}</span>
                </div>
              )}

              {/* Products count */}
              {pulperia._count?.products > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Package className="w-3.5 h-3.5" />
                  <span>{pulperia._count.products}</span>
                </div>
              )}
            </div>

            {/* Closing time hint - Only when open */}
            {isOpen && pulperia.closesAt && (
              <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1.5 bg-surface-2/80 rounded-lg border border-surface-3/50">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-400">
                  Cierra a las {pulperia.closesAt}
                </span>
              </div>
            )}

            {/* Opens at hint - Only when closed */}
            {isClosed && pulperia.opensAt && (
              <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1.5 bg-surface-2/60 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-xs text-gray-500">
                  Abre a las {pulperia.opensAt}
                </span>
              </div>
            )}

            {/* No reviews state */}
            {(!pulperia.rating || pulperia.rating === 0) && (
              <p className="text-sm text-gray-500 mt-2">Sin reseñas</p>
            )}
          </div>
        </CardGlow>
      </motion.div>
    </Link>
  );
};

/**
 * PulperiaCardSkeleton - Loading state
 */
export const PulperiaCardSkeleton = () => (
  <div className="rounded-2xl bg-surface-1/80 border border-white/[0.06] overflow-hidden">
    <div className="h-36 bg-surface-2 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-surface-2 rounded animate-pulse w-3/4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-surface-2 rounded-lg animate-pulse" />
        <div className="h-6 w-12 bg-surface-2 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);

/**
 * PulperiaCardCompact - Versión más pequeña para listas horizontales
 */
export const PulperiaCardCompact = ({ pulperia }) => {
  const isOpen = pulperia.status === 'OPEN';

  return (
    <Link
      to={`/pulperia/${pulperia.id}`}
      className="block flex-shrink-0 w-40"
    >
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'rounded-xl overflow-hidden bg-surface-1/80 border border-white/[0.06]',
          isOpen && 'border-success-500/20 shadow-[0_0_12px_rgba(34,197,94,0.1)]'
        )}
      >
        {/* Image */}
        <div className="relative h-24 bg-surface-2">
          {pulperia.logo ? (
            <img
              src={pulperia.logo}
              alt={pulperia.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-8 h-8 text-primary-400/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-0/80 to-transparent" />

          {/* Status dot */}
          <div className="absolute top-2 right-2">
            <span
              className={cn(
                'w-2.5 h-2.5 rounded-full block',
                isOpen
                  ? 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse'
                  : 'bg-gray-500'
              )}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5">
          <h4 className="font-semibold text-sm text-white line-clamp-1">
            {pulperia.name}
          </h4>
          {pulperia.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-accent-400 fill-accent-400" />
              <span className="text-xs text-gray-400">
                {pulperia.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default PulperiaCard;
