import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import AnnouncementPoster from './AnnouncementPoster';

/**
 * MuralGrid - Grid tipo Masonry para el mural de anuncios
 * Cada afiche tiene su propio tamaño según el aspect ratio de su imagen
 */
const MuralGrid = ({ announcements, onAnnouncementClick, isLoading }) => {
  // Breakpoints para el grid responsivo
  const breakpointColumns = {
    default: 3,  // Desktop: 3 columnas
    1024: 2,     // Tablet: 2 columnas
    640: 2,      // Mobile: 2 columnas
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div
              className="bg-dark-200/50 rounded-xl"
              style={{ aspectRatio: 0.8 + Math.random() * 0.4 }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!announcements?.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <span className="text-3xl">📢</span>
        </div>
        <h3 className="text-white font-semibold mb-2">No hay anuncios cerca</h3>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Aumenta el radio de búsqueda o revisa más tarde
        </p>
      </motion.div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-3 w-auto"
      columnClassName="pl-3 bg-clip-padding"
    >
      {announcements.map((announcement, index) => (
        <motion.div
          key={announcement.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="mb-3"
        >
          <AnnouncementPoster
            announcement={announcement}
            onClick={() => onAnnouncementClick(announcement)}
          />
        </motion.div>
      ))}
    </Masonry>
  );
};

export default MuralGrid;
