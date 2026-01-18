import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, ChevronDown, ChevronUp, Star, Package, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Compact card for online stores in the floating panel
 */
const OnlineStoreCardCompact = ({ store, onClose }) => {
  return (
    <Link
      to={`/pulperia/${store.id}`}
      onClick={onClose}
      className="block"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-surface-1/80 border border-purple-500/20 hover:border-purple-500/40 transition-all"
      >
        {/* Logo */}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500/30 to-indigo-500/20 flex items-center justify-center">
          {store.logo ? (
            <img
              src={store.logo}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Globe className="w-5 h-5 text-purple-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate">{store.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            {store.originCity && (
              <span className="text-xs text-gray-500">Desde {store.originCity}</span>
            )}
            {store.rating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-accent-400 fill-accent-400" />
                <span className="text-xs text-accent-300">{store.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping badge */}
        {store.shippingScope && (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs flex-shrink-0">
            <Truck className="w-3 h-3 mr-1" />
            {store.shippingScope === 'NACIONAL' ? 'Nacional' :
             store.shippingScope === 'DIGITAL' ? 'Digital' : 'Local'}
          </Badge>
        )}
      </motion.div>
    </Link>
  );
};

/**
 * Floating panel for online stores, displayed over the map
 */
const OnlineStoresPanel = ({ stores = [], onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!stores || stores.length === 0) return null;

  return (
    <div className="absolute top-20 right-4 z-[1000] w-80 max-w-[calc(100vw-2rem)]">
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="glass rounded-xl border border-purple-500/30 shadow-xl overflow-hidden"
      >
        {/* Header - Always visible */}
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-purple-500/10 rounded-none"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Globe className="w-4 h-4 text-purple-400" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            </div>
            <span className="text-white font-medium text-sm">Tiendas Online</span>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
              {stores.length}
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </Button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2 max-h-72 overflow-y-auto">
                <p className="text-xs text-gray-500 px-1">
                  Compra desde cualquier lugar
                </p>
                {stores.slice(0, 6).map((store) => (
                  <OnlineStoreCardCompact
                    key={store.id}
                    store={store}
                    onClose={onClose}
                  />
                ))}
                {stores.length > 6 && (
                  <Link
                    to="/tiendas-online"
                    onClick={onClose}
                    className="block text-center text-sm text-purple-400 hover:text-purple-300 py-2 transition-colors"
                  >
                    Ver todas las tiendas ({stores.length})
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnlineStoresPanel;
