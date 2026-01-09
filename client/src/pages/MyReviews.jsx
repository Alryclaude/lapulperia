import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
          <div key={i} className="card p-4">
            <div className="skeleton h-6 w-1/3 mb-2" />
            <div className="skeleton h-4 w-1/4 mb-3" />
            <div className="skeleton h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Reseñas</h1>
        <p className="text-gray-500 mt-1">Reseñas que has dejado en pulperías</p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-start gap-4">
                {review.pulperia?.logo ? (
                  <img
                    src={review.pulperia.logo}
                    alt={review.pulperia.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <Store className="w-6 h-6 text-primary-600" />
                  </div>
                )}
                <div className="flex-1">
                  <Link
                    to={`/pulperia/${review.pulperia?.id}`}
                    className="font-semibold text-gray-900 hover:text-primary-600"
                  >
                    {review.pulperia?.name || 'Pulpería'}
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(review.createdAt).toLocaleDateString('es-HN')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin reseñas</h2>
          <p className="text-gray-500 mb-6">
            Aún no has dejado reseñas. Comparte tu experiencia con las pulperías que visites.
          </p>
          <Link to="/" className="btn-primary">
            Explorar Pulperías
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyReviews;
