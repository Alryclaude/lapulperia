import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Wrench, Search, Star, MapPin, Phone, MessageCircle } from 'lucide-react';
import { serviceApi } from '../services/api';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || '');

  const { data, isLoading } = useQuery({
    queryKey: ['services', search, category],
    queryFn: () => serviceApi.getAll({ search, category }),
  });

  const services = data?.data?.services || [];
  const categories = data?.data?.categories || [
    'Carpinteria',
    'Electricidad',
    'Plomeria',
    'Albanileria',
    'Pintura',
    'Mecanica',
    'Jardineria',
    'Limpieza',
    'Computadoras',
    'Otros',
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: search, cat: category });
  };

  const handleWhatsApp = (phone) => {
    window.open(`https://wa.me/504${phone.replace(/\D/g, '')}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-4">
            <div className="flex gap-4">
              <div className="skeleton w-20 h-20 rounded-xl" />
              <div className="flex-1">
                <div className="skeleton h-5 w-1/2 mb-2" />
                <div className="skeleton h-4 w-1/3 mb-2" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
        <p className="text-gray-500 mt-1">Encuentra profesionales para tus necesidades</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar servicios..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        />
      </form>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setCategory('')}
          className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${!category ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${category === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services List */}
      {services.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <div key={service.id} className="card p-5">
              <div className="flex gap-4">
                {service.user.avatar ? (
                  <img
                    src={service.user.avatar}
                    alt={service.user.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-600">
                      {service.user.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{service.user.name}</h3>
                  <p className="text-primary-600 font-medium">{service.profession}</p>
                  {service.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm text-gray-600">{service.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {service.description && (
                <p className="text-gray-600 mt-3 line-clamp-2">{service.description}</p>
              )}

              {/* Portfolio Preview */}
              {service.images?.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {service.images.slice(0, 3).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ))}
                  {service.images.length > 3 && (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 font-medium">+{service.images.length - 3}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Contact */}
              <div className="flex gap-2 mt-4">
                {service.user.phone && (
                  <button
                    onClick={() => handleWhatsApp(service.user.phone)}
                    className="btn-primary flex-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                )}
                <Link to={`/service/${service.id}`} className="btn-secondary flex-1">
                  Ver Perfil
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay servicios</h2>
          <p className="text-gray-500 mb-6">Se el primero en ofrecer tus servicios</p>
          <Link to="/my-services" className="btn-primary">
            Ofrecer mis Servicios
          </Link>
        </div>
      )}
    </div>
  );
};

export default Services;
