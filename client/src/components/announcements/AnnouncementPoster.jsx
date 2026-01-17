import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Store, Sparkles } from 'lucide-react';

/**
 * AnnouncementPoster - Tarjeta tipo "afiche" para el mural de anuncios
 * Diseño: La imagen ES el contenedor (sin espacios vacíos)
 */
const AnnouncementPoster = ({ announcement, onClick }) => {
  const { title, price, imageUrl, imageAspectRatio = 1, distance, createdAt, pulperia } = announcement;

  // Rotación sutil aleatoria para efecto "afiche pegado"
  const rotation = useMemo(() => {
    const seed = announcement.id.charCodeAt(0) + announcement.id.charCodeAt(1);
    return ((seed % 3) - 1) * 0.8; // Entre -0.8 y +0.8 grados
  }, [announcement.id]);

  // Verificar si es nuevo (menos de 24 horas)
  const isNew = useMemo(() => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = (now - created) / (1000 * 60 * 60);
    return diffHours < 24;
  }, [createdAt]);

  // Formatear distancia
  const distanceText = useMemo(() => {
    if (!distance) return null;
    if (distance < 1000) return `${distance}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  }, [distance]);

  // Formatear precio
  const priceText = price ? `L. ${price.toLocaleString()}` : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, rotate: 0 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ transform: `rotate(${rotation}deg)` }}
      onClick={onClick}
      className="relative overflow-hidden rounded-xl cursor-pointer group"
    >
      {/* Sombra cálida para efecto "pegado al corcho" */}
      <div className="absolute inset-0 rounded-xl shadow-lg shadow-orange-900/20 group-hover:shadow-xl group-hover:shadow-orange-900/30 transition-shadow duration-300" />

      {/* Contenedor de imagen - aspect ratio dinámico */}
      <div
        className="relative w-full bg-dark-200"
        style={{ aspectRatio: imageAspectRatio }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay gradiente inferior para texto legible */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Badge NUEVO */}
        {isNew && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full shadow-lg"
          >
            <Sparkles className="w-2.5 h-2.5" />
            NUEVO
          </motion.span>
        )}

        {/* Info superpuesta sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {/* Título */}
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-lg">
            {title}
          </h3>

          {/* Precio y distancia */}
          <div className="flex items-center justify-between mt-1.5">
            {priceText && (
              <span className="text-accent-400 font-bold text-sm drop-shadow-lg">
                {priceText}
              </span>
            )}
            {distanceText && (
              <span className="flex items-center gap-1 text-white/80 text-xs drop-shadow-lg">
                <Store className="w-3 h-3" />
                {distanceText}
              </span>
            )}
          </div>

          {/* Nombre de la pulpería */}
          {pulperia?.name && (
            <p className="text-white/60 text-[10px] mt-1 truncate drop-shadow-lg">
              {pulperia.name}
            </p>
          )}
        </div>
      </div>

      {/* Borde sutil */}
      <div className="absolute inset-0 rounded-xl border border-white/10 pointer-events-none" />
    </motion.div>
  );
};

export default AnnouncementPoster;
