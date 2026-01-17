import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import RadiusSelector from './RadiusSelector';

/**
 * LocationHeader - Header con ubicación actual y selector de radio
 */
const LocationHeader = ({ location, radius, onRadiusChange, isLoading }) => {
  const [locationName, setLocationName] = useState(null);
  const [isReversing, setIsReversing] = useState(false);

  // Reverse geocoding para obtener nombre de la ubicación
  useEffect(() => {
    const reverseGeocode = async () => {
      if (!location?.lat || !location?.lng) return;

      setIsReversing(true);
      try {
        // Usar Nominatim (gratuito) para reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json&addressdetails=1`
        );
        const data = await response.json();

        if (data.address) {
          // Priorizar: colonia/barrio > ciudad > municipio
          const name =
            data.address.suburb ||
            data.address.neighbourhood ||
            data.address.quarter ||
            data.address.city ||
            data.address.town ||
            data.address.municipality ||
            'Ubicación actual';
          setLocationName(name);
        }
      } catch (e) {
        console.error('Error reverse geocoding:', e);
        setLocationName('Ubicación actual');
      } finally {
        setIsReversing(false);
      }
    };

    reverseGeocode();
  }, [location?.lat, location?.lng]);

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
          {isLoading || isReversing ? (
            <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 text-primary-400" />
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-white font-semibold text-sm truncate">
            Ofertas cerca de ti
          </h2>
          <p className="text-gray-400 text-xs truncate">
            {isReversing ? 'Obteniendo ubicación...' : locationName || 'Ubicación desconocida'}
          </p>
        </div>
      </div>

      <RadiusSelector value={radius} onChange={onRadiusChange} />
    </div>
  );
};

export default LocationHeader;
