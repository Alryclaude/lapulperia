import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Status colors configuration
const STATUS_COLORS = {
  OPEN: {
    border: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.4)',
    dot: 'bg-green-500',
    dotGlow: 'shadow-[0_0_8px_rgba(34,197,94,0.6)]',
  },
  CLOSED: {
    border: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.3)',
    dot: 'bg-red-500',
    dotGlow: '',
  },
};

// Custom marker icon with enhanced status indicators
const createMarkerIcon = (pulperia) => {
  const isOpen = pulperia.status === 'OPEN';
  const colors = isOpen ? STATUS_COLORS.OPEN : STATUS_COLORS.CLOSED;
  const borderWidth = isOpen ? '3' : '2';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden"
             style="border: ${borderWidth}px solid ${colors.border};
                    box-shadow: 0 0 12px ${colors.glow}, 0 4px 6px rgba(0,0,0,0.1);">
          ${pulperia.logo
            ? `<img src="${pulperia.logo}" alt="${pulperia.name}" class="w-full h-full object-cover" />`
            : `<span class="text-sm font-bold" style="color: ${colors.border}">${pulperia.name.charAt(0)}</span>`
          }
        </div>
        <div class="absolute -bottom-1 -right-1 w-4 h-4 ${colors.dot} rounded-full border-2 border-white ${colors.dotGlow}"
             style="${!isOpen ? 'opacity: 0.8' : ''}"></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });
};

// Component to handle map center updates
const MapCenterHandler = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

const MiniMap = ({
  center,
  pulperias = [],
  className = '',
  zoom = 15,
  showControls = false,
  dragging = false,
  touchZoom = false,
}) => {
  if (!center) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground text-sm">Cargando mapa...</p>
      </div>
    );
  }

  // Enable dragging if explicitly set or if controls are shown
  const enableDragging = dragging || showControls;
  const enableTouchZoom = touchZoom || showControls;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      zoomControl={showControls}
      scrollWheelZoom={false}
      dragging={enableDragging}
      touchZoom={enableTouchZoom}
      tap={enableTouchZoom}
      style={{ zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <MapCenterHandler center={center} />

      {/* User location marker */}
      <Marker
        position={center}
        icon={L.divIcon({
          className: 'user-marker',
          html: `
            <div class="relative">
              <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
              <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })}
      />

      {/* Pulperia markers */}
      {pulperias.map((pulperia) => (
        <Marker
          key={pulperia.id}
          position={[pulperia.latitude, pulperia.longitude]}
          icon={createMarkerIcon(pulperia)}
        >
          <Popup className="pulperia-popup">
            <div className="popup-content">
              <div className="popup-header">
                {pulperia.logo ? (
                  <img
                    src={pulperia.logo}
                    alt={pulperia.name}
                    className="popup-logo"
                  />
                ) : (
                  <div className="popup-logo popup-logo-placeholder">
                    {pulperia.name.charAt(0)}
                  </div>
                )}
                <div className="popup-info">
                  <h3 className="popup-name">{pulperia.name}</h3>
                  <div className="popup-meta">
                    <span className={`popup-status ${pulperia.status === 'OPEN' ? 'open' : 'closed'}`}>
                      <span className={`popup-status-dot ${pulperia.status === 'OPEN' ? 'open' : 'closed'}`} />
                      {pulperia.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
                    </span>
                    {pulperia.distance && (
                      <>
                        <span className="popup-divider">•</span>
                        <span className="popup-distance">
                          {pulperia.distance < 1000
                            ? `${Math.round(pulperia.distance)}m`
                            : `${(pulperia.distance / 1000).toFixed(1)}km`
                          }
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Link
                to={`/pulperia/${pulperia.id}`}
                className="popup-btn"
              >
                Ver tienda →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MiniMap;
