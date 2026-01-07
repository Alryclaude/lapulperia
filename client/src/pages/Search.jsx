import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, Filter, MapPin, X } from 'lucide-react';
import { productApi, pulperiaApi } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import PulperiaCard from '../components/common/PulperiaCard';
import MiniMap from '../components/map/MiniMap';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [view, setView] = useState(searchParams.get('view') || 'products');
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 14.0818, lng: -87.2068 })
    );
  }, []);

  // Search products
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['search-products', query, location],
    queryFn: () => productApi.search({ q: query, lat: location?.lat, lng: location?.lng }),
    enabled: !!query && view === 'products' && !!location,
  });

  // Search pulperias
  const { data: pulperiasData, isLoading: loadingPulperias } = useQuery({
    queryKey: ['search-pulperias', query, location],
    queryFn: () => pulperiaApi.getAll({ search: query, lat: location?.lat, lng: location?.lng }),
    enabled: view === 'pulperias' && !!location,
  });

  const products = productsData?.data?.products || [];
  const pulperias = pulperiasData?.data?.pulperias || [];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query, view });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos, pulperias..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          autoFocus
        />
      </form>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('products')}
          className={`px-4 py-2 rounded-xl font-medium ${
            view === 'products' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Productos
        </button>
        <button
          onClick={() => setView('pulperias')}
          className={`px-4 py-2 rounded-xl font-medium ${
            view === 'pulperias' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Pulperias
        </button>
        <button
          onClick={() => setShowMap(!showMap)}
          className="ml-auto btn-secondary"
        >
          <MapPin className="w-4 h-4" />
          {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
        </button>
      </div>

      {/* Map */}
      {showMap && location && (
        <MiniMap
          center={[location.lat, location.lng]}
          pulperias={pulperias}
          className="h-64 rounded-2xl"
          showControls
        />
      )}

      {/* Results */}
      {view === 'products' ? (
        loadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card p-3">
                <div className="skeleton aspect-square rounded-xl mb-3" />
                <div className="skeleton h-4 w-3/4 mb-2" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                pulperia={product.pulperia}
                showPulperia
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron productos para "{query}"
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Busca productos cerca de ti
          </div>
        )
      ) : (
        loadingPulperias ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-32 rounded-xl mb-3" />
                <div className="skeleton h-5 w-3/4 mb-2" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : pulperias.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pulperias.map((pulperia) => (
              <PulperiaCard key={pulperia.id} pulperia={pulperia} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No hay pulperias cerca
          </div>
        )
      )}
    </div>
  );
};

export default Search;
