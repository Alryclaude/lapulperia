import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, MapPin, MessageCircle, Clock, Eye, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { announcementsApi } from '@/api';

/**
 * AnnouncementDetailModal - Modal de detalle de anuncio con CTA a WhatsApp
 */
const AnnouncementDetailModal = ({ isOpen, onClose, announcement }) => {
  const navigate = useNavigate();

  if (!isOpen || !announcement) return null;

  const { title, description, price, imageUrl, pulperia, distance, viewCount, createdAt } = announcement;

  // Formatear precio
  const priceText = price ? `L. ${price.toLocaleString()}` : null;

  // Formatear distancia
  const distanceText = distance
    ? distance < 1000
      ? `${distance}m`
      : `${(distance / 1000).toFixed(1)}km`
    : null;

  // Calcular días restantes
  const daysRemaining = () => {
    const expires = new Date(announcement.expiresAt);
    const now = new Date();
    const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Generar link de WhatsApp
  const whatsappLink = () => {
    const phone = pulperia?.whatsapp || pulperia?.phone;
    if (!phone) return null;

    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola! Vi tu anuncio "${title}" en La Pulpería y me interesa.`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // Registrar contacto y abrir WhatsApp
  const handleWhatsAppClick = async () => {
    const link = whatsappLink();
    if (!link) return;

    try {
      await announcementsApi.registerContact(announcement.id);
    } catch (e) {
      // Silenciar error, no crítico
    }
    window.open(link, '_blank');
  };

  // Navegar al perfil de la pulpería
  const handleViewPulperia = () => {
    onClose();
    navigate(`/pulperia/${pulperia.id}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100]"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-dark-100 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col sm:m-4 border border-white/10 overflow-hidden"
        >
          {/* Imagen completa */}
          <div className="relative w-full max-h-[40vh] overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Botón cerrar */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
            {/* Overlay gradiente */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-dark-100 to-transparent" />
          </div>

          {/* Contenido */}
          <div className="p-5 flex-1 overflow-y-auto">
            {/* Título y precio */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-white leading-tight">{title}</h2>
              {priceText && (
                <span className="text-accent-400 font-bold text-xl whitespace-nowrap">
                  {priceText}
                </span>
              )}
            </div>

            {/* Descripción */}
            {description && (
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">{description}</p>
            )}

            {/* Métricas */}
            <div className="flex flex-wrap gap-3 mb-5">
              {distanceText && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-200/50 rounded-lg text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  {distanceText}
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-200/50 rounded-lg text-sm text-gray-300">
                <Clock className="w-4 h-4 text-orange-400" />
                {daysRemaining()} días restantes
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-200/50 rounded-lg text-sm text-gray-300">
                <Eye className="w-4 h-4 text-cyan-400" />
                {viewCount || 0} vistas
              </span>
            </div>

            {/* Info de la pulpería */}
            <div
              onClick={handleViewPulperia}
              className="flex items-center gap-3 p-3 bg-dark-200/30 rounded-xl cursor-pointer hover:bg-dark-200/50 transition-colors mb-4"
            >
              {pulperia?.logo ? (
                <img
                  src={pulperia.logo}
                  alt={pulperia.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{pulperia?.name}</h3>
                {pulperia?.address && (
                  <p className="text-gray-400 text-sm truncate">{pulperia.address}</p>
                )}
              </div>
              <span className="text-primary-400 text-sm font-medium">Ver tienda</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div
            className="p-5 border-t border-white/5 bg-dark-100 flex-shrink-0"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex gap-3">
              {/* Botón llamar (si no hay WhatsApp) */}
              {!pulperia?.whatsapp && pulperia?.phone && (
                <motion.a
                  href={`tel:${pulperia.phone}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-dark-200/50 hover:bg-dark-200 border border-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Llamar
                </motion.a>
              )}

              {/* Botón WhatsApp - Principal */}
              {(pulperia?.whatsapp || pulperia?.phone) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppClick}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-600/30"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </motion.button>
              )}

              {/* Si no hay contacto */}
              {!pulperia?.whatsapp && !pulperia?.phone && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleViewPulperia}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
                >
                  <Store className="w-5 h-5" />
                  Ver Tienda
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementDetailModal;
