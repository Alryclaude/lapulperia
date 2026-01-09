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
} from 'lucide-react';
import { pulperiaApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import MiniMap from '../components/map/MiniMap';
import PulperiaCard from '../components/common/PulperiaCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SkeletonPulperiaCard,
  AnimatedList,
  AnimatedListItem,
  FadeInView,
} from '@/components/ui';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import {
  staggerContainer,
  staggerItem,
  fadeInOnScroll,
} from '@/lib/animations';

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
  const { isInstallable, promptInstall, dismissPrompt } = useInstallPrompt();

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

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white p-8 md:p-12"
      >
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="accent" className="mb-4">
              <Sparkles className="w-3 h-3" />
              Nuevo en tu zona
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
          >
            Tu pulperia de confianza,{' '}
            <span className="text-primary-200">ahora digital</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-primary-100 text-lg mb-8 max-w-lg"
          >
            Encuentra productos, compara precios y apoya a los negocios de tu comunidad
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            <Button asChild variant="secondary" size="lg" className="shadow-lg">
              <Link to="/search">
                <Search className="w-5 h-5" />
                Buscar Productos
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10"
            >
              <Link to="/jobs">
                <Briefcase className="w-5 h-5" />
                Ver Empleos
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-20 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-500/20 rounded-full blur-2xl" />
      </motion.section>

      {/* Category Quick Filters */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground px-1">
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
                    : 'bg-card border border-border hover:border-primary-200 hover:bg-primary-50'
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
              <div className="p-2 bg-primary-100 rounded-lg">
                <MapPin className="w-4 h-4 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold">Cerca de ti</h2>
            </div>
            <Link
              to="/search?view=map"
              className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1"
            >
              Ver mapa completo
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {location && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <MiniMap
                center={[location.lat, location.lng]}
                pulperias={pulperias}
                className="h-48 md:h-64 rounded-2xl overflow-hidden shadow-sm border border-border"
              />
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
                  <div className="w-3 h-3 bg-success-500 rounded-full" />
                  <div className="absolute inset-0 w-3 h-3 bg-success-500 rounded-full animate-ping opacity-75" />
                </div>
                <h2 className="text-lg font-semibold">Abiertas ahora</h2>
                <Badge variant="success" size="sm">
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
            <div className="p-2 bg-gray-100 rounded-lg">
              <Store className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold">Pulperias cerca</h2>
          </div>
          <Link
            to="/search"
            className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1"
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
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground">
              No hay pulperias cerca de tu ubicacion
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/search">Buscar en otra zona</Link>
            </Button>
          </motion.div>
        )}
      </section>

      {/* CTA for non-authenticated users */}
      {!isAuthenticated && (
        <FadeInView>
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 md:p-12">
            <div className="relative z-10 text-center max-w-xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Tienes una pulperia?
              </h3>
              <p className="text-gray-300 mb-8">
                Digitaliza tu negocio, recibe pedidos en tiempo real y haz crecer
                tu comunidad de clientes
              </p>
              <Button asChild size="lg" variant="secondary">
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
    </div>
  );
};

export default Home;
