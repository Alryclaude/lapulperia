import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Wrench,
  Search,
  Clock,
  ChevronRight,
  MapPin,
  Filter,
  Zap,
  HandCoins
} from 'lucide-react';
import { chambasApi } from '../services/api';

const TYPE_LABELS = {
  EMPLOYMENT: { label: 'Empleos', icon: Briefcase, color: 'primary' },
  SERVICE: { label: 'Servicios', icon: Wrench, color: 'green' },
  REQUEST: { label: 'Solicitudes', icon: HandCoins, color: 'amber' }
};

const Chambas = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeType, setActiveType] = useState(searchParams.get('type') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['chamba-categories'],
    queryFn: () => chambasApi.getCategories(),
    staleTime: 1000 * 60 * 60 // 1 hora
  });

  const categories = categoriesData?.data || [];

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['chambas', search, activeType, activeCategory],
    queryFn: () => chambasApi.list({
      search: search || undefined,
      type: activeType || undefined,
      category: activeCategory || undefined
    }),
  });

  const chambas = data?.data || [];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (activeType) params.set('type', activeType);
    if (activeCategory) params.set('category', activeCategory);
    setSearchParams(params);
    refetch();
  };

  const clearFilters = () => {
    setActiveType('');
    setActiveCategory('');
    setSearch('');
    setSearchParams({});
  };

  const getTypeStyle = (type) => {
    const config = TYPE_LABELS[type] || TYPE_LABELS.SERVICE;
    return config.color === 'primary'
      ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
      : config.color === 'green'
        ? 'bg-green-500/20 text-green-400 border-green-500/30'
        : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
            <div className="h-6 w-3/4 bg-dark-200 animate-pulse rounded mb-2" />
            <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded mb-4" />
            <div className="h-4 w-1/3 bg-dark-200 animate-pulse rounded" />
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
          <Briefcase className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Chambas</h1>
          <p className="text-gray-400 text-sm">Empleos, servicios y oportunidades</p>
        </div>
      </motion.div>

      {/* Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        <button
          onClick={() => setActiveType('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${!activeType
              ? 'bg-primary-500 text-white'
              : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
            }`}
        >
          Todos
        </button>
        {Object.entries(TYPE_LABELS).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={type}
              onClick={() => setActiveType(activeType === type ? '' : type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 ${activeType === type
                  ? `${getTypeStyle(type)} border`
                  : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
                }`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </motion.div>

      {/* Search + Filter */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onSubmit={handleSearch}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar chambas..."
            className="w-full pl-12 pr-4 py-3 bg-dark-100/60 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl transition-all ${showFilters
              ? 'bg-primary-500 text-white'
              : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
            }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </motion.form>

      {/* Category Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Categorías</span>
            {activeCategory && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(activeCategory === cat.value ? '' : cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat.value
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-200/60 text-gray-400 hover:text-white border border-white/5'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chambas List */}
      {chambas.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {chambas.map((chamba, index) => {
            const TypeIcon = TYPE_LABELS[chamba.type]?.icon || Briefcase;
            return (
              <motion.div
                key={chamba.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/chamba/${chamba.id}`}
                  className="block bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-white/10 hover:bg-dark-100/80 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {chamba.isUrgent && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs border border-red-500/30">
                            <Zap className="w-3 h-3" />
                            Urgente
                          </span>
                        )}
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getTypeStyle(chamba.type)}`}>
                          <TypeIcon className="w-3 h-3" />
                          {TYPE_LABELS[chamba.type]?.label || chamba.type}
                        </span>
                      </div>

                      <h3 className="font-semibold text-white text-lg group-hover:text-primary-400 transition-colors">
                        {chamba.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-1">
                        {chamba.pulperia ? (
                          <span className="font-medium text-primary-400">{chamba.pulperia.name}</span>
                        ) : (
                          <span className="font-medium text-gray-400">{chamba.user?.name}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:text-primary-400 transition-colors" />
                  </div>

                  {chamba.description && (
                    <p className="text-gray-400 mt-3 line-clamp-2">{chamba.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                    {/* Precio */}
                    {(chamba.priceMin || chamba.priceMax || chamba.salary) && (
                      <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 font-medium border border-green-500/30">
                        {chamba.salary || (
                          chamba.priceMin && chamba.priceMax
                            ? `L ${chamba.priceMin} - L ${chamba.priceMax}`
                            : chamba.priceMin
                              ? `Desde L ${chamba.priceMin}`
                              : `Hasta L ${chamba.priceMax}`
                        )}
                      </span>
                    )}

                    {/* Categoría */}
                    <span className="px-3 py-1 rounded-lg bg-dark-200/80 text-gray-300 border border-white/5">
                      {categories.find(c => c.value === chamba.category)?.label || chamba.category}
                    </span>

                    {/* Distancia o ubicación */}
                    {chamba.distance !== undefined && chamba.distance !== null && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {chamba.distance.toFixed(1)} km
                      </div>
                    )}

                    {/* Fecha */}
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {new Date(chamba.createdAt).toLocaleDateString('es-HN')}
                    </div>

                    {/* Respuestas */}
                    {chamba._count?.responses > 0 && (
                      <span className="text-gray-500">
                        {chamba._count.responses} {chamba._count.responses === 1 ? 'respuesta' : 'respuestas'}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No hay chambas disponibles</h2>
          <p className="text-gray-400">
            {activeType || activeCategory
              ? 'Intenta con otros filtros'
              : 'Vuelve pronto para nuevas oportunidades'}
          </p>
          {(activeType || activeCategory) && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Chambas;
