import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Megaphone, MapPinOff, Loader2 } from 'lucide-react';
import { announcementsApi } from '@/api';
import {
  MuralGrid,
  LocationHeader,
  AnnouncementDetailModal,
} from '@/components/announcements';

/**
 * Announcements - Feed de anuncios locales (mural de ofertas del barrio)
 * Filtrado por geolocalización obligatoria
 */
const Announcements = () => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [radius, setRadius] = useState(2); // km
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Obtener geolocalización del usuario
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Necesitamos tu ubicación para mostrarte ofertas cercanas');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('No pudimos obtener tu ubicación');
            break;
          case error.TIMEOUT:
            setLocationError('Tiempo de espera agotado');
            break;
          default:
            setLocationError('Error al obtener ubicación');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache de 5 minutos
      }
    );
  }, []);

  // Query para obtener anuncios
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['announcements', location?.lat, location?.lng, radius],
    queryFn: () =>
      announcementsApi.getFeed({
        lat: location.lat,
        lng: location.lng,
        radius,
        limit: 50,
      }),
    enabled: !!location,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Refetch cada minuto
  });

  const announcements = data?.data?.announcements || [];

  // Cambiar radio
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
  };

  // Ver detalle de anuncio
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  // Estado: Sin ubicación
  if (!location && !locationError) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">
            Obteniendo tu ubicación
          </h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Necesitamos tu ubicación para mostrarte las ofertas más cercanas
          </p>
        </motion.div>
      </div>
    );
  }

  // Estado: Error de ubicación
  if (locationError) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <MapPinOff className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">
            Ubicación requerida
          </h2>
          <p className="text-gray-400 text-sm mb-6">{locationError}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            Intentar de nuevo
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-40 md:pb-24">
      {/* Header con ubicación y selector de radio */}
      <div className="sticky top-0 z-40 bg-dark-100/95 backdrop-blur-lg border-b border-white/5 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="px-0">
          <LocationHeader
            location={location}
            radius={radius}
            onRadiusChange={handleRadiusChange}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-0 py-4">
        {/* Header decorativo - Vibrancia de Barrio */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Mural de Ofertas</h1>
            <p className="text-gray-400 text-sm">
              {announcements.length > 0
                ? `${announcements.length} ofertas en tu zona`
                : 'Descubre lo que ofrecen tus vecinos'}
            </p>
          </div>
        </motion.div>

        {/* Grid de anuncios */}
        <MuralGrid
          announcements={announcements}
          onAnnouncementClick={handleAnnouncementClick}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de detalle */}
      <AnnouncementDetailModal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        announcement={selectedAnnouncement}
      />
    </div>
  );
};

export default Announcements;
