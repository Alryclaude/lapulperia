import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search, Briefcase, TrendingUp, ChevronRight, Store } from 'lucide-react';
import { pulperiaApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import MiniMap from '../components/map/MiniMap';
import PulperiaCard from '../components/common/PulperiaCard';
import ProductCard from '../components/products/ProductCard';

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const [location, setLocation] = useState(null);

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
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Tu pulperia de confianza, ahora digital
          </h1>
          <p className="text-primary-100 text-lg mb-6">
            Encuentra productos, compara precios y apoya a los negocios de tu comunidad
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/search" className="btn bg-white text-primary-700 hover:bg-gray-100">
              <Search className="w-5 h-5" />
              Buscar Productos
            </Link>
            <Link to="/jobs" className="btn bg-primary-700/50 text-white hover:bg-primary-700/70">
              <Briefcase className="w-5 h-5" />
              Ver Empleos
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-primary-400/20 rounded-full blur-2xl" />
      </section>

      {/* Map Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-semibold text-gray-900">Cerca de ti</h2>
          </div>
          <Link to="/search?view=map" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
            Ver mapa completo
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {location && (
          <MiniMap
            center={[location.lat, location.lng]}
            pulperias={pulperias}
            className="h-48 md:h-64 rounded-2xl overflow-hidden"
          />
        )}
      </section>

      {/* Open Now Section */}
      {openPulperias.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <h2 className="text-xl font-semibold text-gray-900">Abiertas ahora</h2>
            </div>
            <span className="text-sm text-gray-500">{openPulperias.length} disponibles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {openPulperias.slice(0, 6).map((pulperia) => (
              <PulperiaCard key={pulperia.id} pulperia={pulperia} />
            ))}
          </div>
        </section>
      )}

      {/* All Pulperias */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Pulperias cerca</h2>
          </div>
          <Link to="/search" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="skeleton h-32 rounded-xl" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : pulperias.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pulperias.map((pulperia) => (
              <PulperiaCard key={pulperia.id} pulperia={pulperia} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay pulperias cerca de tu ubicacion</p>
          </div>
        )}
      </section>

      {/* CTA for non-authenticated users */}
      {!isAuthenticated && (
        <section className="card p-8 text-center bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <h3 className="text-2xl font-bold mb-3">Tienes una pulperia?</h3>
          <p className="text-gray-300 mb-6">
            Digitaliza tu negocio, recibe pedidos y haz crecer tu comunidad
          </p>
          <Link to="/register" className="btn bg-white text-gray-900 hover:bg-gray-100">
            Registrar mi Pulperia
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home;
