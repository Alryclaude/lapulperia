import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  MapPin,
  Package,
  Store,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
} from 'lucide-react';
import { productApi, pulperiaApi } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import PulperiaCard from '../components/common/PulperiaCard';
import MiniMap from '../components/map/MiniMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  SkeletonProductCard,
  SkeletonPulperiaCard,
  AnimatedList,
  AnimatedListItem,
} from '@/components/ui';

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

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query, view });
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.form
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSearch}
        className="relative"
      >
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos, pulperias..."
            className="pl-12 pr-12 py-6 text-lg rounded-2xl border-border focus:border-primary-500"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.form>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Tabs
          value={view}
          onValueChange={(v) => setView(v)}
          className="flex-1"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="products" className="flex-1 sm:flex-none gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Productos</span>
              {products.length > 0 && (
                <Badge variant="secondary" size="sm">
                  {products.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pulperias" className="flex-1 sm:flex-none gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Pulperias</span>
              {pulperias.length > 0 && (
                <Badge variant="secondary" size="sm">
                  {pulperias.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden sm:flex border rounded-lg p-1">
            <button
              onClick={() => setGridView(true)}
              className={`p-2 rounded ${
                gridView ? 'bg-primary-100 text-primary-600' : 'text-gray-400'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridView(false)}
              className={`p-2 rounded ${
                !gridView ? 'bg-primary-100 text-primary-600' : 'text-gray-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Map toggle */}
          <Button
            variant={showMap ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowMap(!showMap)}
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">
              {showMap ? 'Ocultar' : 'Mapa'}
            </span>
          </Button>

          {/* Filter sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader>
                <SheetTitle>Filtrar resultados</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Categoria</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Todos', 'Abarrotes', 'Bebidas', 'Snacks', 'Lacteos', 'Limpieza'].map(
                      (cat) => (
                        <Badge
                          key={cat}
                          variant={cat === 'Todos' ? 'default' : 'outline'}
                          className="cursor-pointer"
                        >
                          {cat}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Ordenar por</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Relevancia', 'Precio menor', 'Precio mayor', 'Cercania'].map(
                      (opt) => (
                        <Badge
                          key={opt}
                          variant={opt === 'Relevancia' ? 'default' : 'outline'}
                          className="cursor-pointer"
                        >
                          {opt}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </div>
              <Button className="w-full">Aplicar filtros</Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Map */}
      <AnimatePresence>
        {showMap && location && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <MiniMap
              center={[location.lat, location.lng]}
              pulperias={pulperias}
              className="h-64 rounded-2xl border border-border"
              showControls
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {view === 'products' ? (
          <motion.div
            key="products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {loadingProducts ? (
              <div
                className={`grid gap-4 ${
                  gridView
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {[...Array(8)].map((_, i) => (
                  <SkeletonProductCard key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <AnimatedList
                className={`grid gap-4 ${
                  gridView
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {products.map((product) => (
                  <AnimatedListItem key={product.id}>
                    <ProductCard
                      product={product}
                      pulperia={product.pulperia}
                      showPulperia
                    />
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            ) : query ? (
              <EmptyState
                icon={Package}
                title={`No se encontraron productos para "${query}"`}
                description="Intenta con otros terminos o revisa la ortografia"
              />
            ) : (
              <EmptyState
                icon={SearchIcon}
                title="Busca productos cerca de ti"
                description="Escribe el nombre de un producto para comenzar"
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="pulperias"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {loadingPulperias ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <SkeletonPulperiaCard key={i} />
                ))}
              </div>
            ) : pulperias.length > 0 ? (
              <AnimatedList className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pulperias.map((pulperia) => (
                  <AnimatedListItem key={pulperia.id}>
                    <PulperiaCard pulperia={pulperia} />
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            ) : (
              <EmptyState
                icon={Store}
                title="No hay pulperias cerca"
                description="Intenta ampliar tu rango de busqueda"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Empty state component
const EmptyState = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

export default Search;
