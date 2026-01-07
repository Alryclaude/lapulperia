import { Link } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';

const PulperiaCard = ({ pulperia }) => {
  const statusColors = {
    OPEN: 'bg-green-500',
    CLOSING_SOON: 'bg-yellow-500',
    CLOSED: 'bg-gray-400',
    VACATION: 'bg-blue-500',
  };

  const statusLabels = {
    OPEN: 'Abierto',
    CLOSING_SOON: 'Por cerrar',
    CLOSED: 'Cerrado',
    VACATION: 'Vacaciones',
  };

  return (
    <Link
      to={`/pulperia/${pulperia.id}`}
      className="card card-hover block overflow-hidden group"
    >
      {/* Banner/Logo */}
      <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
        {pulperia.banner ? (
          <img
            src={pulperia.banner}
            alt={pulperia.name}
            className="w-full h-full object-cover"
          />
        ) : pulperia.logo ? (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={pulperia.logo}
              alt={pulperia.name}
              className="w-20 h-20 rounded-2xl object-cover shadow-md"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-600">
                {pulperia.name.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${statusColors[pulperia.status]}`}>
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            {statusLabels[pulperia.status]}
          </span>
        </div>

        {/* Verified badge */}
        {pulperia.isVerified && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-white/90 text-primary-600">
              Verificado
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
          {pulperia.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-1.5">
          {pulperia.rating > 0 ? (
            <>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium text-gray-900">
                  {pulperia.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-400">
                ({pulperia.reviewCount})
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400">Sin reseñas</span>
          )}
        </div>

        {/* Location */}
        {pulperia.distance !== undefined && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>
              {pulperia.distance < 1000
                ? `${Math.round(pulperia.distance)}m`
                : `${(pulperia.distance / 1000).toFixed(1)}km`}
            </span>
          </div>
        )}

        {/* Products count */}
        {pulperia._count?.products > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {pulperia._count.products} productos
          </p>
        )}
      </div>
    </Link>
  );
};

export default PulperiaCard;
