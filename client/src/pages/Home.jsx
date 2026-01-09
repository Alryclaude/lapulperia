import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Briefcase,
  ChevronRight,
  Store,
  ShoppingBag,
  Coffee,
  Utensils,
  Pill,
  Sparkles,
  Download,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { pulperiaApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { usePulperiaStatusUpdates } from '../hooks/useSocket';
import MiniMap from '../components/map/MiniMap';
import FullscreenMap from '../components/map/FullscreenMap';
import PulperiaCard from '../components/common/PulperiaCard';
import { LogoLarge, LogoIcon } from '../components/Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SkeletonPulperiaCard,
  AnimatedList,
  AnimatedListItem,
  FadeInView,
} from '@/components/ui';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

// Quick category filters
const categories = [
  { id: 'all', label: 'Todos', icon: Store },
  { id: 'food', label: 'Comida', icon: Utensils },
  { id: 'drinks', label: 'Bebidas', icon: Coffee },
  { id: 'pharmacy', label: 'Farmacia', icon: Pill },
  { id: 'groceries', label: 'Abarrotes', icon: ShoppingBag },
];

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const [location, setLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const { isInstallable, promptInstall, dismissPrompt } = useInstallPrompt();

  // Subscribe to real-time pulperia status updates
  usePulperiaStatusUpdates((data) => {
    toast(data.message, {
      icon: data.status === 'OPEN' ? '🟢' : '🔴',
      duration: 4000,
    });
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Tegucigalpa
          setLocation({ lat: 14.0818, lng: -87.2068 });
        }
      );
    }
  }, []);

  // Fetch nearby pulperias
  const { data: pulperiasData, isLoading } = useQuery({
    queryKey: ['pulperias', location],
    queryFn: () =>
      pulperiaApi.getAll({
        lat: location?.lat,
        lng: location?.lng,
        radius: 5000,
        limit: 12,
      }),
    enabled: !!location,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const pulperias = pulperiasData?.data?.pulperias || [];
  const openPulperias = pulperias.filter((p) => p.status === 'OPEN');

  return (
    <div className="space-y-8">
      {/* PWA Install Banner */}
      <AnimatePresence>
        {isInstallable && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-2xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Instala La Pulperia</p>
                <p className="text-xs text-white/80">Acceso rapido desde tu pantalla</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={dismissPrompt}
                className="text-white/70 hover:text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                onClick={promptInstall}
                className="bg-white text-accent-600 hover:bg-white/90 text-sm"
                size="sm"
              >
                Instalar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Dark theme with logo */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-dark-100 via-dark-200 to-dark-100 border border-white/5 text-white p-8 md:p-12"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-shrink-0"
          >
            <LogoIcon size={120} />
          </motion.div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="mb-4 bg-accent-500/20 text-accent-300 border-accent-500/30">
                <Sparkles className="w-3 h-3" />
                Tu tienda de barrio
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
            >
              <span className="text-white">La </span>
              <span className="text-primary-500">Pulpería</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-lg mb-6 max-w-lg"
            >
              ¿Qué deseaba? Encuentra productos, compara precios y apoya a los negocios de tu comunidad
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-3 justify-center md:justify-start"
            >
              <Button asChild size="lg" className="shadow-primary">
                <Link to="/search">
                  <Search className="w-5 h-5" />
                  Buscar Productos
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
              >
                <Link to="/jobs">
                  <Briefcase className="w-5 h-5" />
                  Ver Empleos
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-2xl" />
      </motion.section>

      {/* Category Quick Filters */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-gray-400 px-1">
          Categorias populares
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-primary-500 text-white shadow-primary'
                    : 'bg-dark-100 border border-white/5 text-gray-300 hover:border-primary-500/30 hover:bg-dark-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.label}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Map Section */}
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
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10"
                title={isMapExpanded ? 'Contraer mapa' : 'Expandir mapa'}
              >
                {isMapExpanded ? (
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
                height: isMapExpanded ? 400 : 192,
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="relative rounded-2xl overflow-hidden shadow-lg border border-white/10"
            >
              <MiniMap
                center={[location.lat, location.lng]}
                pulperias={pulperias}
                className="w-full h-full"
                showControls={isMapExpanded}
                dragging={true}
                touchZoom={true}
              />
              {/* Expand hint when collapsed */}
              {!isMapExpanded && (
                <button
                  onClick={() => setIsMapExpanded(true)}
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

      {/* Open Now Section */}
      <AnimatePresence>
        {openPulperias.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
                </div>
                <h2 className="text-lg font-semibold text-white">Abiertas ahora</h2>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {openPulperias.length}
                </Badge>
              </div>
            </div>

            <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {openPulperias.slice(0, 6).map((pulperia) => (
                <AnimatedListItem key={pulperia.id}>
                  <PulperiaCard pulperia={pulperia} />
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </motion.section>
        )}
      </AnimatePresence>

      {/* All Pulperias */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-dark-50 rounded-lg">
              <Store className="w-4 h-4 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Pulperias cerca</h2>
          </div>
          <Link
            to="/search"
            className="text-primary-400 text-sm font-medium hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonPulperiaCard key={i} />
            ))}
          </div>
        ) : pulperias.length > 0 ? (
          <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pulperias.map((pulperia) => (
              <AnimatedListItem key={pulperia.id}>
                <PulperiaCard pulperia={pulperia} />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-dark-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">
              No hay pulperias cerca de tu ubicacion
            </p>
            <Button asChild variant="secondary" className="mt-4">
              <Link to="/search">Buscar en otra zona</Link>
            </Button>
          </motion.div>
        )}
      </section>

      {/* CTA for non-authenticated users */}
      {!isAuthenticated && (
        <FadeInView>
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900/50 via-dark-100 to-dark-200 border border-primary-500/20 text-white p-8 md:p-12">
            <div className="relative z-10 text-center max-w-xl mx-auto">
              <LogoIcon size={64} className="mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                ¿Tienes una pulperia?
              </h3>
              <p className="text-gray-400 mb-8">
                Digitaliza tu negocio, recibe pedidos en tiempo real y haz crecer
                tu comunidad de clientes
              </p>
              <Button asChild size="lg">
                <Link to="/register">
                  Registrar mi Pulperia
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />
          </section>
        </FadeInView>
      )}

      {/* Fullscreen Map Modal */}
      <FullscreenMap
        isOpen={isMapFullscreen}
        onClose={() => setIsMapFullscreen(false)}
        center={location ? [location.lat, location.lng] : null}
        pulperias={pulperias}
        userLocation={location ? [location.lat, location.lng] : null}
      />
    </div>
  );
};

export default Home;
