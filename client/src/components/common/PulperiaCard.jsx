import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Package, BadgeCheck, Store } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { cardHover } from '@/lib/animations';

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
        <Card className="overflow-hidden group h-full bg-dark-100/60 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all duration-300">
          {/* Banner/Logo */}
          <div className="relative h-32 bg-gradient-to-br from-dark-200 to-dark-100">
            {pulperia.banner ? (
              <img
                src={pulperia.banner}
                alt={pulperia.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : pulperia.logo ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-200 via-dark-100 to-dark-200">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={pulperia.logo}
                  alt={pulperia.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-2 ring-white/10"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-200 via-dark-100 to-dark-200">
                <div className="w-20 h-20 rounded-2xl bg-primary-500/20 flex items-center justify-center shadow-lg ring-2 ring-primary-500/30">
                  <Store className="w-8 h-8 text-primary-400" />
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-400/80 via-transparent to-transparent" />

            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-3 left-3"
            >
              <StatusBadge status={status.variant} className="shadow-lg">
                {status.label}
              </StatusBadge>
            </motion.div>

            {/* Verified badge */}
            {pulperia.isVerified && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-3 right-3"
              >
                <Badge className="bg-dark-100/90 text-white border-white/10 gap-1 shadow-sm">
                  <BadgeCheck className="w-3 h-3 text-primary-400" />
                  Verificado
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
              {pulperia.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              {pulperia.rating > 0 ? (
                <>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-accent-500/20 rounded-md">
                    <Star className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />
                    <span className="text-sm font-semibold text-accent-300">
                      {pulperia.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ({pulperia.reviewCount} reseñas)
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">Sin reseñas</span>
              )}
            </div>

            {/* Location */}
            {pulperia.distance !== undefined && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-400">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{formatDistance(pulperia.distance)}</span>
              </div>
            )}

            {/* Products count */}
            {pulperia._count?.products > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-400">
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span>{pulperia._count.products} productos</span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};

export default PulperiaCard;
