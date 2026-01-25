import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Store, Package, Star, ShoppingCart } from 'lucide-react';
import { pulperiaApi, clientFeaturesApi } from '../services/api';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';
import PulperiaCard from '../components/common/PulperiaCard';

const Favorites = () => {
  const [activeTab, setActiveTab] = useState('pulperias');
  const { addItem } = useCartStore();

  // Fetch favorite pulperias
  const { data: pulperiasData, isLoading: loadingPulperias } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => pulperiaApi.getFavorites(),
  });

  // Fetch favorite products
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['favorite-products'],
    queryFn: () => clientFeaturesApi.getFavoriteProducts(),
  });

  const favoritePulperias = pulperiasData?.data?.pulperias || [];
  const favoriteProducts = productsData?.data?.products || [];

  const handleAddToCart = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      pulperiaId: product.pulperiaId,
      pulperiaName: product.pulperia?.name,
    });
    toast.success('Agregado al carrito');
  };

  const isLoading = activeTab === 'pulperias' ? loadingPulperias : loadingProducts;

  return (
    <div className="space-y-6 pb-20">
      {/* Header - Rojo de la paleta */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
          <Heart className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Favoritos</h1>
          <p className="text-gray-400 text-sm">Tus pulperías y productos guardados</p>
        </div>
      </motion.div>

      {/* Tabs - Touch targets >= 44px */}
      <div className="flex gap-2 bg-surface-1 p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveTab('pulperias')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 min-h-[44px] rounded-xl font-medium transition-all ${
            activeTab === 'pulperias'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Store className="w-4 h-4" />
          Pulperías
          {favoritePulperias.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === 'pulperias' ? 'bg-white/20' : 'bg-red-500/20 text-red-400'
            }`}>
              {favoritePulperias.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 min-h-[44px] rounded-xl font-medium transition-all ${
            activeTab === 'products'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Package className="w-4 h-4" />
          Productos
          {favoriteProducts.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === 'products' ? 'bg-white/20' : 'bg-red-500/20 text-red-400'
            }`}>
              {favoriteProducts.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
              <div className="h-32 rounded-xl bg-dark-200 animate-pulse mb-3" />
              <div className="h-5 w-3/4 bg-dark-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Pulperias Tab */}
      <AnimatePresence mode="wait">
        {!isLoading && activeTab === 'pulperias' && (
          <motion.div
            key="pulperias"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {favoritePulperias.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favoritePulperias.map((pulperia, index) => (
                  <motion.div
                    key={pulperia.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PulperiaCard pulperia={pulperia} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Store}
                title="Sin pulperías favoritas"
                description="Guarda tus pulperías favoritas para acceder rápidamente"
                linkTo="/"
                linkText="Explorar Pulperías"
              />
            )}
          </motion.div>
        )}

        {/* Products Tab */}
        {!isLoading && activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {favoriteProducts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favoriteProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden group"
                  >
                    <Link to={`/product/${product.id}`}>
                      <div className="relative h-40 bg-dark-200">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-primary-500/90 text-white text-sm font-semibold rounded-lg">
                            L. {product.price?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <Link
                        to={`/pulperia/${product.pulperia?.id}`}
                        className="text-sm text-gray-400 hover:text-primary-400 transition-colors line-clamp-1"
                      >
                        {product.pulperia?.name}
                      </Link>

                      {/* Out of stock indicator */}
                      {product.outOfStock && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg">
                          Agotado
                        </span>
                      )}

                      {/* Add to cart button */}
                      {!product.outOfStock && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAddToCart(product)}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Agregar
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="Sin productos favoritos"
                description="Guarda productos para encontrarlos fácilmente"
                linkTo="/search"
                linkText="Buscar Productos"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Empty state component
const EmptyState = ({ icon: Icon, title, description, linkTo, linkText }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-primary-400" />
    </div>
    <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
    <p className="text-gray-400 mb-6">{description}</p>
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={linkTo}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
      >
        {linkText}
      </Link>
    </motion.div>
  </motion.div>
);

export default Favorites;
