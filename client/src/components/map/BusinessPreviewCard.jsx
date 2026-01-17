import { motion } from 'framer-motion';
import { X, Star, MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessPreviewCard = ({ pulperia, onClose }) => {
  if (!pulperia) return null;

  const isOpen = pulperia.status === 'OPEN';

  // Formatear distancia
  const formatDistance = (meters) => {
    if (!meters) return null;
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Generar enlace de WhatsApp
  const getWhatsAppLink = () => {
    if (!pulperia.whatsapp) return null;
    const phone = pulperia.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${phone}?text=Hola, vi tu pulpería en La Pulpería App`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.3 }}
      className="absolute bottom-4 left-4 right-4 z-[1000] max-w-sm mx-auto"
    >
      <div className="bg-dark-100/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header con foto/logo */}
        <div className="relative">
          {pulperia.banner ? (
            <img
              src={pulperia.banner}
              alt={pulperia.name}
              className="w-full h-24 object-cover"
            />
          ) : (
            <div className="w-full h-24 bg-gradient-to-br from-primary-500/20 to-purple-500/20" />
          )}

          {/* Logo flotante */}
          <div className="absolute -bottom-6 left-4">
            <div className={`w-14 h-14 rounded-xl bg-dark-200 border-2 ${isOpen ? 'border-green-500' : 'border-gray-500'} overflow-hidden shadow-lg`}>
              {pulperia.logo ? (
                <img src={pulperia.logo} alt={pulperia.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-500/20">
                  <span className="text-xl font-bold text-primary-400">
                    {pulperia.name?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 bg-dark-400/80 rounded-full hover:bg-dark-300 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>

          {/* Badges de estado y tipo */}
          <div className="absolute top-2 left-2 flex items-center gap-2">
            {/* Badge estado */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOpen
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                {isOpen ? 'Abierto' : 'Cerrado'}
              </div>
            </div>

            {/* Badge físico/online */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              pulperia.isOnlineOnly
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}>
              {pulperia.isOnlineOnly ? '🌐 Online' : '🏪 Físico'}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 pt-8">
          {/* Nombre y rating */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">
                {pulperia.name}
              </h3>
              {pulperia.address && (
                <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                  {pulperia.address}
                </p>
              )}
            </div>
            {pulperia.rating > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-accent-500/20 rounded-lg">
                <Star className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />
                <span className="text-sm font-semibold text-accent-400">
                  {pulperia.rating?.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            {pulperia.distance && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{formatDistance(pulperia.distance)}</span>
              </div>
            )}
            {pulperia.productCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{pulperia.productCount} productos</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Link
              to={`/pulperia/${pulperia.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl text-sm font-medium text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver catálogo
            </Link>
            {getWhatsAppLink() && (
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-400" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessPreviewCard;
