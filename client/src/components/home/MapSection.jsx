import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Expand, Store, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeInView } from '@/components/ui';
import MiniMap from '../map/MiniMap';

// Ilustración SVG para estado vacío - Estilo "La Lámina Zen"
const EmptyMapIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="w-48 h-40 mx-auto">
    {/* Fondo de mapa estilizado */}
    <rect x="20" y="30" width="160" height="100" rx="12" fill="#334155" opacity="0.3" />

    {/* Líneas de calles */}
    <path d="M40 80 H160" stroke="#475569" strokeWidth="2" strokeDasharray="8 4" />
    <path d="M100 50 V110" stroke="#475569" strokeWidth="2" strokeDasharray="8 4" />

    {/* Pin de ubicación animado */}
    <motion.g
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path d="M100 45 C100 35, 115 35, 115 45 C115 55, 100 70, 100 70 C100 70, 85 55, 85 45 C85 35, 100 35, 100 45" fill="#C0392B" />
      <circle cx="100" cy="45" r="5" fill="#F4F1EA" />
    </motion.g>

    {/* Círculos de búsqueda */}
    <motion.circle
      cx="100"
      cy="80"
      r="30"
      stroke="#C0392B"
      strokeWidth="2"
      fill="none"
      opacity="0.3"
      animate={{ r: [30, 50, 30], opacity: [0.3, 0, 0.3] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </svg>
);

// REVAMP: Larger map (300px), no collapse, floating counter + empty state
const MapSection = ({ location, pulperias, openCount = 0, onOpenFullMap }) => {
  // Si hay ubicación pero no hay pulperías abiertas, mostrar estado vacío amigable
  const showEmptyState = location && openCount === 0;

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
              <p className="text-sm text-gray-500">Pulperías en tu zona</p>
            </div>
          </div>
          {!showEmptyState && (
            <button
              onClick={onOpenFullMap}
              className="flex items-center gap-2 px-4 py-2 bg-dark-100 hover:bg-dark-50 border border-dark-50 hover:border-primary-500/30 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200"
            >
              <Expand className="w-4 h-4" />
              <span className="hidden sm:inline">Mapa completo</span>
              <ChevronRight className="w-4 h-4 sm:hidden" />
            </button>
          )}
        </div>

        {/* Empty State - Cuando no hay pulperías abiertas */}
        {showEmptyState && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-dark-100 border border-dark-50 p-8 text-center"
          >
            <EmptyMapIllustration />
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">
              No hay pulperías abiertas cerca
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
              Parece que las pulperías de tu zona aún no han abierto. ¡Vuelve más tarde o explora otras áreas!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onOpenFullMap}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-200 hover:bg-dark-50 border border-dark-50 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all"
              >
                <Expand className="w-4 h-4" />
                Explorar mapa
              </button>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl text-sm font-medium text-white transition-all"
              >
                <Store className="w-4 h-4" />
                Registrar mi pulpería
              </Link>
            </div>
          </motion.div>
        )}

        {/* Map Container - Solo si hay pulperías */}
        {location && !showEmptyState && (
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
              <p className="text-sm text-gray-500">Obteniendo ubicación...</p>
            </div>
          </div>
        )}
      </section>
    </FadeInView>
  );
};

export default MapSection;
