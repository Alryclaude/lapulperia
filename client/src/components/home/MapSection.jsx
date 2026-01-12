import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Expand } from 'lucide-react';
import { FadeInView } from '@/components/ui';
import MiniMap from '../map/MiniMap';

// REVAMP: Larger map (300px), no collapse, floating counter
const MapSection = ({ location, pulperias, openCount = 0, onOpenFullMap }) => {
  return (
    <FadeInView>
      <section className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-xl border border-primary-500/20">
              <MapPin className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cerca de ti</h2>
              <p className="text-sm text-gray-500">Pulper&iacute;as en tu zona</p>
            </div>
          </div>
          <button
            onClick={onOpenFullMap}
            className="flex items-center gap-2 px-4 py-2 bg-dark-100 hover:bg-dark-50 border border-dark-50 hover:border-primary-500/30 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200"
          >
            <Expand className="w-4 h-4" />
            <span className="hidden sm:inline">Mapa completo</span>
            <ChevronRight className="w-4 h-4 sm:hidden" />
          </button>
        </div>

        {/* Map Container - REVAMP: Fixed 300px height */}
        {location && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10"
            style={{ height: '300px' }}
          >
            <MiniMap
              center={[location.lat, location.lng]}
              pulperias={pulperias}
              className="w-full h-full"
              showControls={true}
              dragging={true}
              touchZoom={true}
              zoom={14}
            />

            {/* Floating counter - REVAMP */}
            <div className="absolute bottom-4 left-4 z-[500]">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-dark-100/90 backdrop-blur-md rounded-xl border border-white/10 shadow-lg"
              >
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-50" />
                </div>
                <span className="text-sm font-semibold text-white">
                  {openCount} {openCount === 1 ? 'abierta' : 'abiertas'}
                </span>
              </motion.div>
            </div>

            {/* Gradient overlay at bottom for better text visibility */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-dark-400/60 to-transparent pointer-events-none" />
          </motion.div>
        )}

        {/* Loading state */}
        {!location && (
          <div className="h-[300px] rounded-2xl bg-dark-100 border border-white/10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Obteniendo ubicaci&oacute;n...</p>
            </div>
          </div>
        )}
      </section>
    </FadeInView>
  );
};

export default MapSection;
