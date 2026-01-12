import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/components/ui';
import MiniMap from '../map/MiniMap';

const MapSection = ({ location, pulperias, isExpanded, onToggleExpand }) => {
  return (
    <FadeInView>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <MapPin className="w-4 h-4 text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Cerca de ti</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleExpand}
              className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10"
              title={isExpanded ? 'Contraer mapa' : 'Expandir mapa'}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Link
              to="/search?view=map"
              className="text-primary-400 text-sm font-medium hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              Mapa completo
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {location && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: 1,
              height: isExpanded ? 400 : 192,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative rounded-2xl overflow-hidden shadow-lg border border-white/10"
          >
            <MiniMap
              center={[location.lat, location.lng]}
              pulperias={pulperias}
              className="w-full h-full"
              showControls={isExpanded}
              dragging={true}
              touchZoom={true}
            />
            {/* Expand hint when collapsed */}
            {!isExpanded && (
              <button
                onClick={onToggleExpand}
                className="absolute inset-0 bg-transparent cursor-pointer group"
                aria-label="Expandir mapa"
              >
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-dark-400/80 backdrop-blur-sm rounded-full text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                  <Maximize2 className="w-3 h-3" />
                  Toca para expandir
                </div>
              </button>
            )}
          </motion.div>
        )}
      </section>
    </FadeInView>
  );
};

export default MapSection;
