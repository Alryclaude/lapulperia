import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Store, Star, MapPin } from 'lucide-react';
import { pulperiaApi } from '../services/api';
import PulperiaCard from '../components/common/PulperiaCard';

const Favorites = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => pulperiaApi.getFavorites(),
  });

  const favorites = data?.data?.favorites || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4">
            <div className="skeleton h-32 rounded-xl mb-3" />
            <div className="skeleton h-5 w-3/4 mb-2" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Favoritos</h1>
        <p className="text-gray-500 mt-1">Pulperias que has guardado</p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <PulperiaCard key={fav.pulperia.id} pulperia={fav.pulperia} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin favoritos</h2>
          <p className="text-gray-500 mb-6">Guarda tus pulperias favoritas para acceder rapidamente</p>
          <Link to="/" className="btn-primary">
            Explorar Pulperias
          </Link>
        </div>
      )}
    </div>
  );
};

export default Favorites;
