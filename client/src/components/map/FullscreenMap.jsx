import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Navigation, Filter, Store } from 'lucide-react';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Status colors configuration (same as MiniMap)
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

// Custom marker icon
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

// User location marker
const createUserMarkerIcon = () => {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div class="relative">
        <div class="w-5 h-5 bg-blue-500 rounded-full border-3 border-white shadow-lg"></div>
        <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to handle map center changes
const MapController = ({ center, onMove }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  useEffect(() => {
    const handleMoveEnd = () => {
      const newCenter = map.getCenter();
      onMove?.([newCenter.lat, newCenter.lng]);
    };

    map.on('moveend', handleMoveEnd);
    return () => map.off('moveend', handleMoveEnd);
  }, [map, onMove]);

  return null;
};

const FullscreenMap = ({
  isOpen,
  onClose,
  center,
  pulperias = [],
  userLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(center);
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  // Handle Escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Filter pulperias based on search and status
  const filteredPulperias = pulperias.filter((p) => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !showOpenOnly || p.status === 'OPEN';
    return matchesSearch && matchesStatus;
  });

  const openCount = filteredPulperias.filter((p) => p.status === 'OPEN').length;

  // Locate user
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-dark-400"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-[1000] glass border-b border-white/10 p-4 pb-safe">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar pulperia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-dark-100 border-white/10"
              />
            </div>

            <Button
              variant={showOpenOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowOpenOnly(!showOpenOnly)}
              className={showOpenOnly ? '' : 'border-white/20 text-white hover:bg-white/10'}
            >
              <Filter className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Solo abiertas</span>
            </Button>
          </div>
        </div>

        {/* Map */}
        <MapContainer
          center={mapCenter || center || [14.0818, -87.2068]}
          zoom={15}
          className="w-full h-full"
          zoomControl={false}
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
          touchZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          <MapController center={mapCenter} onMove={setMapCenter} />

          {/* User location marker */}
          {(userLocation || center) && (
            <Marker
              position={userLocation || center}
              icon={createUserMarkerIcon()}
            />
          )}

          {/* Pulperia markers */}
          {filteredPulperias.map((pulperia) => (
            <Marker
              key={pulperia.id}
              position={[pulperia.latitude, pulperia.longitude]}
              icon={createMarkerIcon(pulperia)}
            >
              <Popup className="pulperia-popup">
                <div className="p-1 min-w-[200px]">
                  <Link
                    to={`/pulperia/${pulperia.id}`}
                    className="block hover:opacity-80 transition-opacity"
                    onClick={onClose}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {pulperia.logo ? (
                        <img
                          src={pulperia.logo}
                          alt={pulperia.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-lg">
                            {pulperia.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {pulperia.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`w-2 h-2 rounded-full ${pulperia.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-xs ${pulperia.status === 'OPEN' ? 'text-green-600' : 'text-red-500'}`}>
                            {pulperia.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {pulperia.distance && (
                      <p className="text-xs text-gray-500">
                        A {pulperia.distance < 1000
                          ? `${Math.round(pulperia.distance)}m`
                          : `${(pulperia.distance / 1000).toFixed(1)}km`
                        }
                      </p>
                    )}
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating controls */}
        <div className="absolute bottom-28 right-4 z-[1000] flex flex-col gap-2">
          <Button
            size="icon"
            className="rounded-full shadow-lg bg-primary-500 hover:bg-primary-600"
            onClick={handleLocateMe}
          >
            <Navigation className="w-5 h-5" />
          </Button>
        </div>

        {/* Results count */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] pb-safe">
          <div className="glass rounded-xl px-4 py-3 flex items-center justify-between max-w-sm mx-auto border border-white/10">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-primary-400" />
              <span className="text-white font-medium">
                {filteredPulperias.length} pulperia{filteredPulperias.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {openCount} abierta{openCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullscreenMap;
