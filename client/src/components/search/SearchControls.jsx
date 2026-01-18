import { useState } from 'react';
import { Package, Store, MapPin, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BUSINESS_CATEGORIES } from '@/constants/categories';
import { motion, AnimatePresence } from 'framer-motion';

// REVAMP: Enhanced SearchControls with vibrant styling
const SearchControls = ({
  view,
  onViewChange,
  gridView,
  onGridViewChange,
  showMap,
  onToggleMap,
  productsCount,
  pulperiasCount,
  selectedCategories = [],
  onCategoriesChange,
  storeType = 'all',
  onStoreTypeChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (categoryId) => {
    if (!onCategoriesChange) return;
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(c => c !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoriesChange(newCategories);
  };

  const clearFilters = () => {
    onCategoriesChange?.([]);
    onStoreTypeChange?.('all');
  };

  const hasActiveFilters = selectedCategories.length > 0 || storeType !== 'all';
  return (
    <div className="flex items-center gap-3">
      {/* Tabs - REVAMP: Better styling */}
      <Tabs
        value={view}
        onValueChange={onViewChange}
        className="flex-1"
      >
        <TabsList className="w-full sm:w-auto bg-dark-100/80 border border-white/[0.08] p-1">
          <TabsTrigger
            value="products"
            className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary-500 data-[state=active]:to-primary-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Productos</span>
            {productsCount > 0 && (
              <Badge variant="secondary" size="sm" className="bg-white/20 text-white border-0">
                {productsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="pulperias"
            className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Negocios</span>
            {pulperiasCount > 0 && (
              <Badge variant="secondary" size="sm" className="bg-white/20 text-white border-0">
                {pulperiasCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        {/* View toggle - REVAMP: Better dark mode styling */}
        <div className="hidden sm:flex bg-dark-100/80 border border-white/[0.08] rounded-xl p-1">
          <button
            onClick={() => onGridViewChange(true)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              gridView
                ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGridViewChange(false)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              !gridView
                ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Map toggle - REVAMP */}
        <Button
          variant={showMap ? 'cyan' : 'outline'}
          size="sm"
          onClick={onToggleMap}
          className={!showMap ? 'border-white/[0.08] text-gray-300 hover:text-white hover:border-cyan-500/50' : ''}
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">
            {showMap ? 'Ocultar' : 'Mapa'}
          </span>
        </Button>

        {/* Filtros */}
        <Button
          variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`relative ${!showFilters && !hasActiveFilters ? 'border-white/[0.08] text-gray-300 hover:text-white hover:border-primary-500/50' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
              {selectedCategories.length + (storeType !== 'all' ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Panel de filtros expandible */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute left-0 right-0 top-full mt-2 z-50"
          >
            <div className="bg-surface-1/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">Filtrar por</span>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-400 hover:text-white text-xs"
                    >
                      Limpiar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                    className="w-6 h-6 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tipo de tienda */}
              {onStoreTypeChange && (
                <div className="mb-4">
                  <span className="text-xs text-gray-500 mb-2 block">Tipo</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'local', label: 'Locales' },
                      { id: 'online', label: 'Online' },
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => onStoreTypeChange(type.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          storeType === type.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-surface-2 text-gray-400 hover:text-white'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorías */}
              {onCategoriesChange && (
                <div>
                  <span className="text-xs text-gray-500 mb-2 block">Categoria</span>
                  <div className="flex flex-wrap gap-2">
                    {BUSINESS_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          selectedCategories.includes(cat.id)
                            ? 'bg-primary-500 text-white'
                            : 'bg-surface-2 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchControls;
