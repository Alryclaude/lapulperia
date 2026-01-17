import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { AnimatedList, AnimatedListItem } from '@/components/ui';
import { Link } from 'react-router-dom';
import { Globe, Star, Package, Truck, Store, ArrowRight } from 'lucide-react';
import { CardGlow } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * OnlineStoreCard - Card especializada para tiendas online
 */
const OnlineStoreCard = ({ pulperia }) => {
  const shippingInfo = pulperia.shippingMethods?.[0];

  return (
    <Link to={`/pulperia/${pulperia.id}`} className="block">
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <CardGlow
          status="default"
          className="overflow-hidden group h-full border-purple-500/20"
        >
          {/* Banner/Logo Section */}
          <div className="relative h-32 bg-gradient-to-br from-purple-900/40 to-indigo-900/40">
            {pulperia.banner ? (
              <img
                src={pulperia.banner}
                alt={pulperia.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : pulperia.logo ? (
              <div className="w-full h-full flex items-center justify-center">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={pulperia.logo}
                  alt={pulperia.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-xl ring-2 ring-purple-500/30"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 flex items-center justify-center shadow-xl ring-2 ring-purple-500/30">
                  <Globe className="w-7 h-7 text-purple-400" />
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/40 to-transparent" />

            {/* Online badge - Top left */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-3 left-3"
            >
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 gap-1 shadow-lg backdrop-blur-sm">
                <Globe className="w-3 h-3" />
                Online
              </Badge>
            </motion.div>

            {/* Shipping scope - Top right */}
            {pulperia.shippingScope && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="absolute top-3 right-3"
              >
                <Badge className="bg-surface-1/90 backdrop-blur-sm text-white border-white/10 gap-1 shadow-lg text-xs">
                  <Truck className="w-3 h-3" />
                  {pulperia.shippingScope === 'NACIONAL' ? 'Nacional' :
                   pulperia.shippingScope === 'DIGITAL' ? 'Digital' : 'Local'}
                </Badge>
              </motion.div>
            )}

            {/* Logo overlay when has banner */}
            {pulperia.banner && pulperia.logo && (
              <div className="absolute -bottom-4 left-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-[3px] border-surface-1 shadow-xl ring-2 ring-purple-500/30">
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
          <div className={cn('p-4', pulperia.banner && pulperia.logo ? 'pt-6' : '')}>
            {/* Name */}
            <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1 text-base">
              {pulperia.name}
            </h3>

            {/* Origin city */}
            {pulperia.originCity && (
              <p className="text-xs text-gray-500 mt-0.5">
                Desde {pulperia.originCity}
              </p>
            )}

            {/* Info row */}
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

              {/* Products count */}
              {pulperia._count?.products > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Package className="w-3.5 h-3.5" />
                  <span>{pulperia._count.products}</span>
                </div>
              )}
            </div>

            {/* Shipping info */}
            {shippingInfo && (
              <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Truck className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-purple-300">
                  {shippingInfo.name}
                  {shippingInfo.estimatedDays && ` - ${shippingInfo.estimatedDays}`}
                </span>
              </div>
            )}
          </div>
        </CardGlow>
      </motion.div>
    </Link>
  );
};

const OnlineStoresSection = ({ pulperias, isLoading }) => {
  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500/50 rounded-full" />
          <div className="h-6 w-32 bg-surface-2 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-surface-1/80 border border-purple-500/10 overflow-hidden">
              <div className="h-32 bg-surface-2 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-surface-2 rounded animate-pulse w-3/4" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-surface-2 rounded-lg animate-pulse" />
                  <div className="h-6 w-12 bg-surface-2 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!pulperias || pulperias.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Tiendas Online</h2>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {pulperias.length}
            </Badge>
          </div>

          {pulperias.length > 6 && (
            <Link
              to="/tiendas-online"
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Compra desde cualquier lugar y recibe en tu puerta
        </p>

        <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pulperias.slice(0, 6).map((pulperia) => (
            <AnimatedListItem key={pulperia.id}>
              <OnlineStoreCard pulperia={pulperia} />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </motion.section>
    </AnimatePresence>
  );
};

export default OnlineStoresSection;
