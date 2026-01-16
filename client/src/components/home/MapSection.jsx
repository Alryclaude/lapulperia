import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Expand, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeInView } from '@/components/ui';
import ConstellationMap from '../map/ConstellationMap';
import CategoryPills from '../map/CategoryPills';

// Ilustración SVG para estado vacío - Estilo "Constelación"
const EmptyMapIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="w-48 h-40 mx-auto">
    {/* Fondo de mapa oscuro */}
    <rect x="20" y="30" width="160" height="100" rx="12" fill="#1E293B" />

    {/* Estrellas tenues */}
    <circle cx="60" cy="60" r="3" fill="#F59E0B" opacity="0.3" />
    <circle cx="140" cy="70" r="2" fill="#06B6D4" opacity="0.2" />
    <circle cx="100" cy="100" r="2" fill="#3B82F6" opacity="0.25" />
    <circle cx="80" cy="85" r="2" fill="#F4F1EA" opacity="0.2" />
    <circle cx="130" cy="50" r="2" fill="#EC4899" opacity="0.2" />

    {/* Pin de ubicación del usuario */}
    <motion.g
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <circle cx="100" cy="80" r="8" fill="#60A5FA" opacity="0.3" />
      <circle cx="100" cy="80" r="4" fill="#60A5FA" />
      <circle cx="100" cy="80" r="2" fill="white" />
    </motion.g>

    {/* Ondas de radar */}
    <motion.circle
      cx="100"
      cy="80"
      r="20"
      stroke="#60A5FA"
      strokeWidth="1"
      fill="none"
      opacity="0.3"
      animate={{ r: [20, 40, 20], opacity: [0.3, 0, 0.3] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </svg>
);

// MapSection "Constelación Urbana" - Mapa como Hero (45% viewport)
const MapSection = ({ location, pulperias, openCount = 0, onOpenFullMap }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const showEmptyState = location && openCount === 0;

  // Calcular conteos por categoría
  const getCategoryCounts = () => {
    const counts = { all: pulperias.length, comida: 0, mercado: 0, servicios: 0, oferta: 0 };
    pulperias.forEach(p => {
      const name = (p.name || '').toLowerCase();
      if (p.hasActivePromotion) counts.oferta++;
      else if (name.includes('baleada') || name.includes('comida')) counts.comida++;
      else if (name.includes('mercado') || name.includes('super')) counts.mercado++;
      else if (name.includes('servicio') || name.includes('taller')) counts.servicios++;
    });
    return counts;
  };

  return (
    <FadeInView>
      <section className="space-y-4">
        {/* Empty State - Cuando no hay pulperías abiertas */}
        {showEmptyState && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-dark-100 border border-dark-50 p-8 text-center"
            style={{ height: '45vh', minHeight: '320px' }}
          >
            <div className="h-full flex flex-col items-center justify-center">
              <EmptyMapIllustration />
              <h3 className="text-lg font-semibold text-white mt-4 mb-2">
                No hay pulperías abiertas cerca
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                Las pulperías de tu zona aún no han abierto. ¡Vuelve más tarde o explora otras áreas!
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
            </div>
          </motion.div>
        )}

        {/* Mapa Constelación - Hero 45% viewport */}
        {location && !showEmptyState && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10"
            style={{ height: '45vh', minHeight: '320px' }}
          >
            {/* Mapa de constelación */}
            <ConstellationMap
              center={[location.lat, location.lng]}
              pulperias={pulperias}
              className="w-full h-full"
              zoom={15}
              selectedCategory={selectedCategory}
            />

            {/* Pills de categoría flotantes */}
            <CategoryPills
              selected={selectedCategory}
              onChange={setSelectedCategory}
              counts={getCategoryCounts()}
            />

            {/* Contador flotante */}
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

            {/* Botón mapa completo */}
            <div className="absolute bottom-4 right-4 z-[500]">
              <button
                onClick={onOpenFullMap}
                className="flex items-center gap-2 px-4 py-2.5 bg-dark-100/90 backdrop-blur-md hover:bg-dark-50 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all shadow-lg"
              >
                <Expand className="w-4 h-4" />
                <span className="hidden sm:inline">Expandir</span>
                <ChevronRight className="w-4 h-4 sm:hidden" />
              </button>
            </div>

            {/* Gradiente inferior para legibilidad */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dark-400/80 to-transparent pointer-events-none" />
          </motion.div>
        )}

        {/* Loading state */}
        {!location && (
          <div
            className="rounded-2xl bg-[#0F172A] border border-white/10 flex items-center justify-center"
            style={{ height: '45vh', minHeight: '320px' }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Buscando tu ubicación...</p>
            </div>
          </div>
        )}

        {/* Feed de negocios cercanos - Título */}
        {location && !showEmptyState && openCount > 0 && (
          <div className="flex items-center gap-3 mt-6">
            <div className="p-2 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-xl border border-primary-500/20">
              <MapPin className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cerca de ti</h2>
              <p className="text-sm text-gray-500">Pulperías en tu zona</p>
            </div>
          </div>
        )}
      </section>
    </FadeInView>
  );
};

export default MapSection;
