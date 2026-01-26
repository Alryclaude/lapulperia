import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Wrench,
  Search,
  Clock,
  ChevronRight,
  MapPin,
  Filter,
  Zap,
  Plus,
  X,
  Star,
  MessageCircle
} from 'lucide-react';
import { chambasApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

const TABS = [
  {
    key: 'EMPLOYMENT',
    label: 'Empleos',
    icon: Briefcase,
    color: 'purple',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    activeBg: 'bg-purple-500',
    description: 'Vacantes de trabajo'
  },
  {
    key: 'SERVICE',
    label: 'Servicios',
    icon: Wrench,
    color: 'green',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    activeBg: 'bg-green-500',
    description: 'Profesionales disponibles'
  },
  {
    key: 'REQUEST',
    label: 'Oportunidades',
    icon: Zap,
    color: 'amber',
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    activeBg: 'bg-amber-500',
    description: 'Gente buscando ayuda'
  }
];

const FAB_ACTIONS = [
  {
    key: 'EMPLOYMENT',
    icon: Briefcase,
    title: 'Publicar Vacante',
    description: 'Busco empleado',
    color: 'purple',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400'
  },
  {
    key: 'SERVICE',
    icon: Wrench,
    title: 'Ofrecer mis Servicios',
    description: 'Soy plomero, electricista...',
    color: 'green',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400'
  },
  {
    key: 'REQUEST',
    icon: Zap,
    title: 'Publicar Oportunidad',
    description: 'Necesito ayuda con...',
    color: 'amber',
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400'
  }
];

const Chambas = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'EMPLOYMENT');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [showFAB, setShowFAB] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['chamba-categories'],
    queryFn: () => chambasApi.getCategories(),
    staleTime: 1000 * 60 * 60
  });

  const categories = categoriesData?.data || [];

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['chambas', search, activeTab, activeCategory],
    queryFn: () => chambasApi.list({
      search: search || undefined,
      type: activeTab || undefined,
      category: activeCategory || undefined
    }),
  });

  const chambas = data?.data || [];

  // Filtrar por categorías relevantes según el tab
  const filteredCategories = categories.filter(cat => {
    if (activeTab === 'EMPLOYMENT') {
      return ['retail', 'hospitality', 'delivery', 'office', 'other'].includes(cat.value);
    }
    return true;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (activeTab) params.set('type', activeTab);
    if (activeCategory) params.set('category', activeCategory);
    setSearchParams(params);
    refetch();
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setActiveCategory('');
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    params.set('type', tabKey);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setActiveCategory('');
    setSearch('');
    const params = new URLSearchParams();
    params.set('type', activeTab);
    setSearchParams(params);
  };

  const handleFABAction = (actionKey) => {
    setShowFAB(false);
    if (!user) {
      navigate('/login');
      return;
    }
    // Navegar a la página de creación según el tipo
    navigate(`/manage/chambas?create=${actionKey}`);
  };

  const getTabConfig = (type) => {
    return TABS.find(t => t.key === type) || TABS[0];
  };

  const currentTab = getTabConfig(activeTab);

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
    <div className="space-y-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className={`w-12 h-12 rounded-xl ${currentTab.bgColor} flex items-center justify-center`}>
          <currentTab.icon className={`w-6 h-6 ${currentTab.textColor}`} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Chambas</h1>
          <p className="text-gray-400 text-sm">{currentTab.description}</p>
        </div>
      </motion.div>

      {/* Tabs - 3 pestañas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-2 p-1 bg-dark-200/50 rounded-2xl border border-white/5"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? `${tab.activeBg} text-white shadow-lg`
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: 'transparent' }}
                />
              )}
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
            placeholder={`Buscar ${currentTab.label.toLowerCase()}...`}
            className="w-full pl-12 pr-4 py-3 bg-dark-100/60 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl transition-all ${
            showFilters || activeCategory
              ? `${currentTab.bgColor} ${currentTab.textColor} border ${currentTab.borderColor}`
              : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </motion.form>

      {/* Category Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-300">Categorías</span>
              {activeCategory && (
                <button
                  onClick={clearFilters}
                  className={`text-xs ${currentTab.textColor} hover:opacity-80`}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(activeCategory === cat.value ? '' : cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === cat.value
                      ? `${currentTab.bgColor} ${currentTab.textColor} border ${currentTab.borderColor}`
                      : 'bg-dark-200/60 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chambas List */}
      {chambas.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {chambas.map((chamba, index) => {
            const tabConfig = getTabConfig(chamba.type);
            const TypeIcon = tabConfig.icon;

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
                      <div className="flex items-center gap-2 mb-2">
                        {chamba.isUrgent && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs border border-red-500/30">
                            <Zap className="w-3 h-3" />
                            Urgente
                          </span>
                        )}
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${tabConfig.bgColor} ${tabConfig.textColor} ${tabConfig.borderColor}`}>
                          <TypeIcon className="w-3 h-3" />
                          {tabConfig.label}
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
                        {/* Rating para servicios */}
                        {chamba.type === 'SERVICE' && chamba.rating && (
                          <span className="flex items-center gap-1 text-amber-400 text-sm">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {chamba.rating.toFixed(1)}
                          </span>
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

                    {/* Distancia */}
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
                      <span className="flex items-center gap-1 text-gray-500">
                        <MessageCircle className="w-4 h-4" />
                        {chamba._count.responses}
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
          <div className={`w-16 h-16 rounded-2xl ${currentTab.bgColor} flex items-center justify-center mx-auto mb-4`}>
            <currentTab.icon className={`w-8 h-8 ${currentTab.textColor}`} />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No hay {currentTab.label.toLowerCase()} disponibles
          </h2>
          <p className="text-gray-400">
            {activeCategory
              ? 'Intenta con otra categoría'
              : 'Vuelve pronto para nuevas oportunidades'}
          </p>
          {activeCategory && (
            <button
              onClick={clearFilters}
              className={`mt-4 px-4 py-2 ${currentTab.bgColor} ${currentTab.textColor} rounded-lg hover:opacity-80 transition-colors`}
            >
              Limpiar filtros
            </button>
          )}
        </motion.div>
      )}

      {/* FAB */}
      <div className="fixed bottom-20 right-4 z-40">
        <AnimatePresence>
          {showFAB && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowFAB(false)}
              />

              {/* Action Sheet */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute bottom-16 right-0 w-72 bg-dark-200 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/5">
                  <h3 className="text-white font-semibold">¿Qué quieres hacer?</h3>
                </div>
                <div className="p-2">
                  {FAB_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.key}
                        onClick={() => handleFABAction(action.key)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                      >
                        <div className={`w-10 h-10 rounded-xl ${action.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${action.textColor}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{action.title}</p>
                          <p className="text-gray-500 text-sm">{action.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFAB(!showFAB)}
          className={`w-14 h-14 rounded-full ${
            showFAB ? 'bg-gray-600' : 'bg-primary-500'
          } text-white shadow-lg shadow-primary-500/30 flex items-center justify-center transition-colors`}
        >
          <motion.div
            animate={{ rotate: showFAB ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {showFAB ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
};

export default Chambas;
