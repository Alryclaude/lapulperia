import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wrench, Search, Star, MessageCircle, ChevronRight } from 'lucide-react';
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
          <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-dark-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-1/2 bg-dark-200 animate-pulse rounded mb-2" />
                <div className="h-4 w-1/3 bg-dark-200 animate-pulse rounded mb-2" />
                <div className="h-4 w-2/3 bg-dark-200 animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Wrench className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Servicios</h1>
          <p className="text-gray-400 text-sm">Encuentra profesionales para tus necesidades</p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSearch}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar servicios..."
          className="w-full pl-12 pr-4 py-3 bg-dark-100/60 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
        />
      </motion.form>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4"
      >
        <button
          onClick={() => setCategory('')}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
            !category
              ? 'bg-primary-500 text-white'
              : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-primary-500 text-white'
                : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Services List */}
      {services.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all"
            >
              <div className="flex gap-4">
                {service.user.avatar ? (
                  <img
                    src={service.user.avatar}
                    alt={service.user.name}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                    <span className="text-xl font-bold text-primary-400">
                      {service.user.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{service.user.name}</h3>
                  <p className="text-primary-400 font-medium">{service.profession}</p>
                  {service.rating > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-yellow-400 font-medium">{service.rating.toFixed(1)}</span>
                      {service.reviewCount > 0 && (
                        <span className="text-sm text-gray-500">({service.reviewCount})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {service.description && (
                <p className="text-gray-400 mt-3 line-clamp-2 text-sm">{service.description}</p>
              )}

              {/* Portfolio Preview */}
              {service.images?.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                  {service.images.slice(0, 3).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-white/5"
                    />
                  ))}
                  {service.images.length > 3 && (
                    <div className="w-20 h-20 rounded-lg bg-dark-200/80 flex items-center justify-center flex-shrink-0 border border-white/5">
                      <span className="text-gray-400 font-medium">+{service.images.length - 3}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Contact */}
              <div className="flex gap-2 mt-4">
                {service.user.phone && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleWhatsApp(service.user.phone)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </motion.button>
                )}
                <Link
                  to={`/service/${service.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors"
                >
                  Ver Perfil
                  <ChevronRight className="w-4 h-4" />
                </Link>
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
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No hay servicios</h2>
          <p className="text-gray-400 mb-6">Se el primero en ofrecer tus servicios</p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/my-services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
            >
              <Wrench className="w-5 h-5" />
              Ofrecer mis Servicios
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Services;
