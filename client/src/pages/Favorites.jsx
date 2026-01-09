import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { pulperiaApi } from '../services/api';
import PulperiaCard from '../components/common/PulperiaCard';

const Favorites = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => pulperiaApi.getFavorites(),
  });

  // Backend returns { pulperias: [...] } not { favorites: [...] }
  const favorites = data?.data?.pulperias || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
            <div className="h-32 rounded-xl bg-dark-200 animate-pulse mb-3" />
            <div className="h-5 w-3/4 bg-dark-200 animate-pulse rounded mb-2" />
            <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Heart className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Favoritos</h1>
          <p className="text-gray-400 text-sm">Pulperias que has guardado</p>
        </div>
      </motion.div>

      {favorites.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {favorites.map((pulperia, index) => (
            <motion.div
              key={pulperia.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PulperiaCard pulperia={pulperia} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin favoritos</h2>
          <p className="text-gray-400 mb-6">Guarda tus pulperias favoritas para acceder rapidamente</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
            >
              Explorar Pulperias
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Favorites;
