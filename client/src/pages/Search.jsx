import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { productApi, pulperiaApi } from '../services/api';
import {
  SearchBar,
  SearchControls,
  SearchMap,
  ProductResults,
  PulperiaResults,
} from '../components/search';

// Animaciones slide-up para "Vibrancia de Barrio"
const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [view, setView] = useState(searchParams.get('view') || 'products');
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);
  const [gridView, setGridView] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 14.0818, lng: -87.2068 })
    );
  }, []);

  // Search products
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['search-products', query, location],
    queryFn: () =>
      productApi.search({ q: query, lat: location?.lat, lng: location?.lng }),
    enabled: !!query && view === 'products' && !!location,
  });

  // Search pulperias
  const { data: pulperiasData, isLoading: loadingPulperias } = useQuery({
    queryKey: ['search-pulperias', query, location],
    queryFn: () =>
      pulperiaApi.getAll({
        search: query,
        lat: location?.lat,
        lng: location?.lng,
      }),
    enabled: view === 'pulperias' && !!location,
  });

  const products = productsData?.data?.products || [];
  const pulperias = pulperiasData?.data?.pulperias || [];

  const handleSearch = () => {
    setSearchParams({ q: query, view });
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
  };

  return (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Barra de búsqueda con min-h para touch targets */}
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSearch}
        onClear={clearSearch}
      />

      {/* Controles con mejor espaciado móvil */}
      <SearchControls
        view={view}
        onViewChange={setView}
        gridView={gridView}
        onGridViewChange={setGridView}
        showMap={showMap}
        onToggleMap={() => setShowMap(!showMap)}
        productsCount={products.length}
        pulperiasCount={pulperias.length}
      />

      {/* Mapa con feedback de ubicación */}
      <SearchMap
        showMap={showMap}
        location={location}
        pulperias={pulperias}
      />

      {/* Resultados con animaciones slide-up */}
      <AnimatePresence mode="wait">
        {view === 'products' ? (
          <motion.div
            key="products"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ProductResults
              products={products}
              isLoading={loadingProducts}
              query={query}
              gridView={gridView}
            />
          </motion.div>
        ) : (
          <motion.div
            key="pulperias"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <PulperiaResults
              pulperias={pulperias}
              isLoading={loadingPulperias}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Search;
