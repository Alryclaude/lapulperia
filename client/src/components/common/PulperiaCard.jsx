import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Package, BadgeCheck, Store, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { cardHover } from '@/lib/animations';

// REVAMP: Enhanced PulperiaCard with vibrant design
const PulperiaCard = ({ pulperia }) => {
  const statusMap = {
    OPEN: { label: 'Abierto', variant: 'open' },
    CLOSING_SOON: { label: 'Por cerrar', variant: 'closing' },
    CLOSED: { label: 'Cerrado', variant: 'closed' },
    VACATION: { label: 'Vacaciones', variant: 'vacation' },
  };

  const status = statusMap[pulperia.status] || statusMap.CLOSED;

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <Link to={`/pulperia/${pulperia.id}`} className="block">
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        <Card className="overflow-hidden group h-full bg-dark-100/80 backdrop-blur-sm border-white/[0.08] hover:border-primary-500/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_0_1px_rgba(220,38,38,0.15)] transition-all duration-300">
          {/* Banner/Logo - REVAMP: Taller with better gradient */}
          <div className="relative h-36 bg-gradient-to-br from-dark-200 to-dark-300">
            {pulperia.banner ? (
              <img
                src={pulperia.banner}
                alt={pulperia.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : pulperia.logo ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-200 via-dark-300 to-dark-200">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={pulperia.logo}
                  alt={pulperia.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-xl ring-2 ring-white/10"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-200 via-dark-300 to-dark-200">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/30 to-primary-600/20 flex items-center justify-center shadow-xl ring-2 ring-primary-500/30">
                  <Store className="w-9 h-9 text-primary-400" />
                </div>
              </div>
            )}

            {/* Gradient overlay - REVAMP: Better blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-dark-400/40 to-transparent" />

            {/* Status badge - REVAMP: With glow effect */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-3 left-3"
            >
              <StatusBadge status={status.variant} className="shadow-lg">
                {status.label}
              </StatusBadge>
            </motion.div>

            {/* Verified badge */}
            {pulperia.isVerified && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="absolute top-3 right-3"
              >
                <Badge className="bg-dark-100/90 backdrop-blur-sm text-white border-white/10 gap-1 shadow-lg">
                  <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs">Verificado</span>
                </Badge>
              </motion.div>
            )}

            {/* Logo overlay on banner - REVAMP */}
            {pulperia.banner && pulperia.logo && (
              <div className="absolute -bottom-5 left-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden border-3 border-dark-100 shadow-xl">
                  <img
                    src={pulperia.logo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content - REVAMP: Better spacing and typography */}
          <div className={`p-4 ${pulperia.banner && pulperia.logo ? 'pt-7' : ''}`}>
            <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1 text-base">
              {pulperia.name}
            </h3>

            {/* Info row - REVAMP: All info in one line */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {/* Rating */}
              {pulperia.rating > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-accent-500/15 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />
                  <span className="text-sm font-semibold text-accent-300">
                    {pulperia.rating.toFixed(1)}
                  </span>
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

              {/* Reviews count */}
              {pulperia.reviewCount > 0 && (
                <span className="text-xs text-gray-500">
                  ({pulperia.reviewCount})
                </span>
              )}
            </div>

            {/* Closing time hint - REVAMP: New feature */}
            {pulperia.status === 'OPEN' && pulperia.closesAt && (
              <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1.5 bg-dark-200/80 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-400">
                  Cierra a las {pulperia.closesAt}
                </span>
              </div>
            )}

            {/* No reviews state */}
            {(!pulperia.rating || pulperia.rating === 0) && (
              <p className="text-sm text-gray-500 mt-2">Sin reseñas aún</p>
            )}
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};

export default PulperiaCard;
