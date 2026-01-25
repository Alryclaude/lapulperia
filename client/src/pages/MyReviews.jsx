import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Store, MessageSquare } from 'lucide-react';
import { reviewApi } from '../services/api';

const MyReviews = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewApi.getMyReviews(),
  });

  const reviews = data?.data?.reviews || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
            <div className="h-6 w-1/3 bg-dark-200 animate-pulse rounded mb-2" />
            <div className="h-4 w-1/4 bg-dark-200 animate-pulse rounded mb-3" />
            <div className="h-16 w-full bg-dark-200 animate-pulse rounded" />
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
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
          <Star className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Reseñas</h1>
          <p className="text-gray-400 text-sm">Reseñas que has dejado en pulperías</p>
        </div>
      </motion.div>

      {reviews.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4"
            >
              <div className="flex items-start gap-4">
                {review.pulperia?.logo ? (
                  <img
                    src={review.pulperia.logo}
                    alt={review.pulperia.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                    <Store className="w-6 h-6 text-primary-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Link
                    to={`/pulperia/${review.pulperia?.id}`}
                    className="font-semibold text-white hover:text-primary-400 transition-colors"
                  >
                    {review.pulperia?.name || 'Pulperia'}
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(review.createdAt).toLocaleDateString('es-HN')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-400 mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin resenas</h2>
          <p className="text-gray-400 mb-6">
            Aun no has dejado resenas. Comparte tu experiencia con las pulperias que visites.
          </p>
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

export default MyReviews;
