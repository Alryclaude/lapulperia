import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import BusinessPreviewCard from './BusinessPreviewCard';

// Colores de categoría para las "estrellas" - IDs alineados con enum BD
const CATEGORY_COLORS = {
  COMER: { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.6)' }, // Ámbar/Naranja
  COMPRAR: { color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.6)' }, // Verde Cian
  SERVICIOS: { color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)' }, // Blanco/Azul
  oferta: { color: '#EC4899', glow: 'rgba(236, 72, 153, 0.8)' }, // Magenta
  default: { color: '#F4F1EA', glow: 'rgba(244, 241, 234, 0.5)' }, // Blanco Hueso
};

// Determinar categoría usando campo de BD (categories[]) o fallback a nombre
const getCategoryFromPulperia = (pulperia) => {
  // Promoción activa siempre tiene prioridad
  if (pulperia.hasActivePromotion) return 'oferta';

  // Usar categoría de BD si existe
  if (pulperia.categories && pulperia.categories.length > 0) {
    return pulperia.categories[0]; // Primera categoría asignada
  }

  // Fallback: inferir de nombre (compatibilidad con datos existentes)
  const name = (pulperia.name || '').toLowerCase();
  if (name.includes('baleada') || name.includes('comida') || name.includes('pupusa') || name.includes('soda')) return 'COMER';
  if (name.includes('mercado') || name.includes('super') || name.includes('abarrote')) return 'COMPRAR';
  if (name.includes('servicio') || name.includes('mecanica') || name.includes('taller')) return 'SERVICIOS';
  return 'default';
};

// Componente para rastrear nivel de zoom
const ZoomHandler = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => setZoomLevel(e.target.getZoom()),
  });
  return null;
};

// ZOOM SEMÁNTICO: Crear icono según nivel de zoom
// Zoom < 13: Estrellas (puntos de luz)
// Zoom 13-15: Avatares orbitales (fotos con glow)
// Zoom > 15: Tarjetas (manejado por BusinessPreviewCard al clic)
const createSemanticIcon = (pulperia, isOpen, zoomLevel) => {
  const category = getCategoryFromPulperia(pulperia);
  const colors = CATEGORY_COLORS[category];
  const opacity = isOpen ? 1 : 0.6;

  // NIVEL 1: ESTRELLAS (Zoom Lejano < 13)
  if (zoomLevel < 13) {
    const size = isOpen ? 14 : 10; // Más visible que antes
    return L.divIcon({
      className: 'constellation-star',
      html: `
        <div class="star-container" style="opacity: ${opacity}">
          <div class="star-core"
               style="width: ${size}px; height: ${size}px;
                      background: ${colors.color};
                      box-shadow: 0 0 ${size}px ${colors.glow}, 0 0 ${size * 2}px ${colors.glow};
                      border: 1px solid rgba(255,255,255,0.3);
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
  }

  // NIVEL 2 & 3: AVATARES ORBITALES (Zoom Medio/Cercano >= 13)
  const statusColor = isOpen ? '#10b981' : '#ef4444'; // Verde o Rojo
  const statusGlow = isOpen ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.4)';

  return L.divIcon({
    className: 'orbital-marker',
    html: `
      <div class="orbital-container" style="opacity: ${opacity}">
        ${isOpen ? '<div class="orbital-ring"></div>' : ''}
        <div class="orbital-avatar"
             style="border-color: ${statusColor};
                    box-shadow: 0 0 15px ${statusGlow};">
          ${pulperia.logo
            ? `<img src="${pulperia.logo}" alt="${pulperia.name}" />`
            : `<div class="avatar-fallback">${(pulperia.name || 'P')[0].toUpperCase()}</div>`
          }
        </div>
        <div class="category-dot" style="background: ${colors.color}; box-shadow: 0 0 6px ${colors.glow};"></div>
      </div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
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
  const [zoomLevel, setZoomLevel] = useState(zoom);

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
      {/* Estilos CSS para animaciones y avatares orbitales */}
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
        @keyframes orbitalPulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .constellation-star, .orbital-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .constellation-star:hover, .orbital-marker:hover {
          transform: scale(1.2);
        }
        .star-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* AVATAR ORBITAL STYLES */
        .orbital-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .orbital-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid #10b981;
          background: #0f172a;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .orbital-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .orbital-avatar .avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: white;
          background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
        }
        .orbital-ring {
          position: absolute;
          top: -6px;
          left: -6px;
          right: -6px;
          bottom: -6px;
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 50%;
          animation: orbitalPulse 2s infinite;
          pointer-events: none;
        }
        .category-dot {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #0f172a;
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
        <ZoomHandler setZoomLevel={setZoomLevel} />

        {/* Marcador de usuario */}
        <Marker
          position={center}
          icon={createUserMarker()}
        />

        {/* Marcadores de pulperías con ZOOM SEMÁNTICO */}
        {filteredPulperias.map((pulperia) => (
          <Marker
            key={pulperia.id}
            position={[pulperia.latitude, pulperia.longitude]}
            icon={createSemanticIcon(pulperia, pulperia.status === 'OPEN', zoomLevel)}
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
