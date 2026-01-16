import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import BusinessPreviewCard from './BusinessPreviewCard';

// Colores de categoría para las "estrellas"
const CATEGORY_COLORS = {
  comida: { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.6)' }, // Ámbar/Naranja
  mercado: { color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.6)' }, // Verde Cian
  servicios: { color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)' }, // Blanco/Azul
  oferta: { color: '#EC4899', glow: 'rgba(236, 72, 153, 0.8)' }, // Magenta
  default: { color: '#F4F1EA', glow: 'rgba(244, 241, 234, 0.5)' }, // Blanco Hueso
};

// Determinar categoría por nombre/tipo de negocio
const getCategoryFromPulperia = (pulperia) => {
  const name = (pulperia.name || '').toLowerCase();
  const hasPromo = pulperia.hasActivePromotion;

  if (hasPromo) return 'oferta';
  if (name.includes('baleada') || name.includes('comida') || name.includes('pupusa') || name.includes('soda')) return 'comida';
  if (name.includes('mercado') || name.includes('super') || name.includes('abarrote')) return 'mercado';
  if (name.includes('servicio') || name.includes('mecanica') || name.includes('taller')) return 'servicios';
  return 'default';
};

// Crear icono de "estrella" para el marcador
const createStarIcon = (pulperia, isOpen) => {
  const category = getCategoryFromPulperia(pulperia);
  const colors = CATEGORY_COLORS[category];
  const size = isOpen ? 12 : 8;
  const opacity = isOpen ? 1 : 0.5;

  return L.divIcon({
    className: 'constellation-star',
    html: `
      <div class="star-container" style="opacity: ${opacity}">
        <div class="star-core"
             style="width: ${size}px; height: ${size}px;
                    background: ${colors.color};
                    box-shadow: 0 0 ${size}px ${colors.glow}, 0 0 ${size * 2}px ${colors.glow};
                    border-radius: 50%;">
        </div>
        ${isOpen ? `
          <div class="star-pulse"
               style="position: absolute; inset: -4px;
                      border: 1px solid ${colors.color};
                      border-radius: 50%;
                      opacity: 0.3;
                      animation: starPulse 2s ease-out infinite;">
          </div>
        ` : ''}
      </div>
    `,
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  });
};

// Marcador de ubicación del usuario con efecto radar
const createUserMarker = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="relative">
        <div class="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg"
             style="box-shadow: 0 0 12px rgba(96, 165, 250, 0.8);">
        </div>
        <div class="absolute inset-0 rounded-full animate-ping"
             style="background: rgba(96, 165, 250, 0.4);">
        </div>
        <div class="radar-wave absolute -inset-8 rounded-full border border-blue-400/30"
             style="animation: radarWave 3s ease-out infinite;">
        </div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Componente para manejar centro del mapa
const MapCenterHandler = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

const ConstellationMap = ({
  center,
  pulperias = [],
  className = '',
  zoom = 15,
  onBusinessClick,
  selectedCategory = 'all',
}) => {
  const [selectedPulperia, setSelectedPulperia] = useState(null);

  // Filtrar por categoría si está seleccionada
  const filteredPulperias = selectedCategory === 'all'
    ? pulperias
    : pulperias.filter(p => getCategoryFromPulperia(p) === selectedCategory);

  const handleMarkerClick = (pulperia) => {
    setSelectedPulperia(pulperia);
    if (onBusinessClick) onBusinessClick(pulperia);
  };

  if (!center) {
    return (
      <div className={`bg-[#0F172A] flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Buscando tu ubicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes starPulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes radarWave {
          0% { transform: scale(0.5); opacity: 0.5; }
          100% { transform: scale(3); opacity: 0; }
        }
        .constellation-star {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .constellation-star:hover {
          transform: scale(1.3);
        }
        .star-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* Tile filter para tema oscuro */
        .leaflet-tile-pane {
          filter: brightness(0.6) saturate(0.8) hue-rotate(10deg);
        }
        .leaflet-container {
          background: #0F172A;
        }
      `}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        style={{ zIndex: 1, background: '#0F172A' }}
      >
        {/* Capa de tiles con tema oscuro */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapCenterHandler center={center} />

        {/* Marcador de usuario */}
        <Marker
          position={center}
          icon={createUserMarker()}
        />

        {/* Marcadores de pulperías como "estrellas" */}
        {filteredPulperias.map((pulperia) => (
          <Marker
            key={pulperia.id}
            position={[pulperia.latitude, pulperia.longitude]}
            icon={createStarIcon(pulperia, pulperia.status === 'OPEN')}
            eventHandlers={{
              click: () => handleMarkerClick(pulperia),
            }}
          />
        ))}
      </MapContainer>

      {/* Preview Card flotante */}
      {selectedPulperia && (
        <BusinessPreviewCard
          pulperia={selectedPulperia}
          onClose={() => setSelectedPulperia(null)}
        />
      )}
    </div>
  );
};

export default ConstellationMap;
