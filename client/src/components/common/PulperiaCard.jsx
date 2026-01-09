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
        <Card className="overflow-hidden group h-full">
          {/* Banner/Logo */}
          <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50">
            {pulperia.banner ? (
              <img
                src={pulperia.banner}
                alt={pulperia.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : pulperia.logo ? (
              <div className="w-full h-full flex items-center justify-center">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={pulperia.logo}
                  alt={pulperia.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-md ring-2 ring-background"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center shadow-md ring-2 ring-background">
                  <Store className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            )}

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
                <Badge variant="secondary" className="bg-background/90 gap-1 shadow-sm">
                  <BadgeCheck className="w-3 h-3 text-primary-500" />
                  Verificado
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-foreground group-hover:text-primary-600 transition-colors line-clamp-1">
              {pulperia.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              {pulperia.rating > 0 ? (
                <>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-md">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-amber-700">
                      {pulperia.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({pulperia.reviewCount} reseñas)
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Sin reseñas</span>
              )}
            </div>

            {/* Location */}
            {pulperia.distance !== undefined && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{formatDistance(pulperia.distance)}</span>
              </div>
            )}

            {/* Products count */}
            {pulperia._count?.products > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
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
