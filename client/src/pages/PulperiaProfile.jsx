import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Star, Heart, Share2, Clock, MessageCircle,
  Package, MessageSquare, Store, Calendar, Info, ShoppingBag, Navigation, Maximize2, Minimize2,
} from 'lucide-react';
import { pulperiaApi, productApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import ProductCard from '../components/products/ProductCard';
import MiniMap from '../components/map/MiniMap';
import ReviewForm from '../components/ReviewForm';
import ShareButtons from '../components/ShareButtons';
import toast from 'react-hot-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Format phone number for display (e.g., "9999-9999")
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return phone;
};

const PulperiaProfile = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Fetch pulperia
  const { data: pulperiaData, isLoading } = useQuery({
    queryKey: ['pulperia', id],
    queryFn: () => pulperiaApi.getById(id),
  });

  const pulperia = pulperiaData?.data?.pulperia;
  const isFavorite = pulperiaData?.data?.isFavorite;

  // Fetch products
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['pulperia-products', id, selectedCategory],
    queryFn: () => productApi.getByPulperia(id, { category: selectedCategory }),
    enabled: !!id,
  });

  const products = productsData?.data?.products || [];
  const categories = productsData?.data?.categories || [];

  // Toggle favorite
  const favoriteMutation = useMutation({
    mutationFn: () => pulperiaApi.toggleFavorite(id, { notifyOnOpen: true }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['pulperia', id]);
      toast.success(response.data.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos');
    },
  });

  // Open WhatsApp
  const handleWhatsApp = () => {
    const phone = pulperia.whatsapp || pulperia.phone;
    if (phone) {
      window.open(`https://wa.me/504${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  // Open Google Maps
  const handleDirections = () => {
    if (pulperia.latitude && pulperia.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${pulperia.latitude},${pulperia.longitude}`,
        '_blank'
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-56 rounded-2xl bg-dark-100/60 animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded-lg bg-dark-100/60 animate-pulse" />
          <div className="h-5 w-1/3 rounded-lg bg-dark-100/60 animate-pulse" />
          <div className="h-20 rounded-xl bg-dark-100/60 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-dark-100/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Not found state
  if (!pulperia) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 bg-dark-100/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Pulperia no encontrada</h2>
        <p className="text-gray-400 mb-6">No pudimos encontrar esta pulperia</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-dark-100/60 border border-white/10 rounded-xl text-white hover:bg-dark-100/80 transition-colors"
        >
          Volver al inicio
        </Link>
      </motion.div>
    );
  }

  const statusConfig = {
    OPEN: { label: 'Abierto', bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-500' },
    CLOSING_SOON: { label: 'Por cerrar', bg: 'bg-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-500' },
    CLOSED: { label: 'Cerrado', bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
    VACATION: { label: 'Vacaciones', bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-500' },
  };

  const status = statusConfig[pulperia.status] || statusConfig.CLOSED;

  return (
    <div className="space-y-6 pb-6">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-56 md:h-72 rounded-2xl overflow-hidden"
      >
        {pulperia.banner ? (
          <img src={pulperia.banner} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 left-4"
        >
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} backdrop-blur-md border border-white/10`}>
            <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
            <span className={`text-sm font-medium ${status.text}`}>{status.label}</span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 right-4 flex gap-2"
        >
          {isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => favoriteMutation.mutate()}
              className={`p-2.5 rounded-xl backdrop-blur-md shadow-lg transition-all border border-white/10 ${
                isFavorite
                  ? 'bg-red-500/80 text-white'
                  : 'bg-dark-100/60 text-white hover:bg-dark-100/80'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </motion.button>
          )}

          {/* Share Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl bg-dark-100/60 text-white hover:bg-dark-100/80 backdrop-blur-md shadow-lg transition-colors border border-white/10"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto bg-dark-100 border-white/10">
              <SheetHeader>
                <SheetTitle className="text-white">Compartir {pulperia.name}</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <ShareButtons
                  title={pulperia.name}
                  text={`Mira ${pulperia.name} en La Pulperia`}
                  variant="icons"
                />
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>

        {/* Logo - Bottom positioned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-12 left-6"
        >
          {pulperia.logo ? (
            <img
              src={pulperia.logo}
              alt={pulperia.name}
              className="w-24 h-24 rounded-2xl border-4 border-dark-50 shadow-xl object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl border-4 border-dark-50 shadow-xl bg-primary-500/20 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-400">
                {pulperia.name.charAt(0)}
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-14 space-y-4"
      >
        {/* Name & Rating */}
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
          <h1 className="text-2xl font-bold text-white break-words leading-tight">{pulperia.name}</h1>

          {pulperia.rating > 0 && (
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-yellow-400">{pulperia.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-400">({pulperia.reviewCount} resenas)</span>
            </div>
          )}

          {pulperia.description && (
            <p className="text-gray-400 mt-4 leading-relaxed">{pulperia.description}</p>
          )}
        </div>

        {/* Contact Section - Enhanced */}
        <div className="space-y-3">
          {/* Location Card - Full Width */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleDirections}
            disabled={!pulperia.latitude || !pulperia.longitude}
            className="w-full bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4 text-left hover:border-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">Direccion</h3>
                <p className="text-sm text-gray-400 mt-1">{pulperia.address || 'Direccion no disponible'}</p>
                {pulperia.reference && (
                  <p className="text-xs text-gray-500 mt-1">Ref: {pulperia.reference}</p>
                )}
              </div>
              <Navigation className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
            </div>
          </motion.button>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp Card */}
            {(pulperia.whatsapp || pulperia.phone) && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsApp}
                className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4 text-left hover:border-green-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">WhatsApp</h3>
                    <p className="text-sm text-green-400 font-medium truncate">
                      {formatPhoneNumber(pulperia.whatsapp || pulperia.phone)}
                    </p>
                  </div>
                </div>
              </motion.button>
            )}

            {/* Phone Call Card */}
            {pulperia.phone && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open(`tel:+504${pulperia.phone.replace(/\D/g, '')}`, '_self')}
                className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4 text-left hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">Llamar</h3>
                    <p className="text-sm text-primary-400 font-medium truncate">
                      {formatPhoneNumber(pulperia.phone)}
                    </p>
                  </div>
                </div>
              </motion.button>
            )}
          </div>
        </div>

        {/* Mini Map - Expandable */}
        {pulperia.latitude && pulperia.longitude && (
          <motion.div
            animate={{ height: isMapExpanded ? 350 : 180 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative rounded-2xl overflow-hidden border border-white/5"
          >
            <MiniMap
              center={[pulperia.latitude, pulperia.longitude]}
              pulperias={[pulperia]}
              className="w-full h-full"
              showControls={isMapExpanded}
              dragging={true}
              touchZoom={true}
            />
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="absolute top-3 right-3 p-2 bg-dark-100/80 backdrop-blur-md rounded-lg border border-white/10 text-white hover:bg-dark-100 transition-colors"
            >
              {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {pulperia.reference && (
              <div className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-dark-100/80 backdrop-blur-md rounded-lg border border-white/10">
                <p className="text-xs text-gray-300 truncate">{pulperia.reference}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Story Card */}
        <AnimatePresence>
          {pulperia.story && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Nuestra Historia</h3>
                </div>
                {pulperia.foundedYear && (
                  <span className="px-3 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                    Desde {pulperia.foundedYear}
                  </span>
                )}
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">{pulperia.story}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tabs - Glass Morphism Style */}
      <div className="space-y-4">
        {/* Tab Buttons */}
        <div className="flex gap-2 p-1.5 bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('products')}
            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'products' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {activeTab === 'products' && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-primary-500/20 rounded-lg border border-primary-500/30"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <ShoppingBag className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Productos</span>
            {products.length > 0 && (
              <motion.span
                animate={{ scale: activeTab === 'products' ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className={`relative z-10 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === 'products' ? 'bg-primary-500 text-white' : 'bg-white/10 text-gray-400'
                }`}
              >
                {products.length}
              </motion.span>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('reviews')}
            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'reviews' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {activeTab === 'reviews' && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-primary-500/20 rounded-lg border border-primary-500/30"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <MessageSquare className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Resenas</span>
            {pulperia.reviewCount > 0 && (
              <motion.span
                animate={{ scale: activeTab === 'reviews' ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className={`relative z-10 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === 'reviews' ? 'bg-primary-500 text-white' : 'bg-white/10 text-gray-400'
                }`}
              >
                {pulperia.reviewCount}
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Categories Filter */}
              {categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                      !selectedCategory
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                        : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    Todos
                  </motion.button>
                  {categories.map((cat) => (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                          : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Products Grid */}
              {loadingProducts ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-dark-100/60 rounded-xl overflow-hidden">
                      <div className="aspect-square bg-dark-100 animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-dark-100 rounded animate-pulse" />
                        <div className="h-4 w-1/2 bg-dark-100 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard product={product} pulperia={pulperia} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 bg-dark-100/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No hay productos disponibles</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Review Form */}
              <ReviewForm pulperiaId={id} />

              {/* Existing Reviews */}
              {pulperia.reviews && pulperia.reviews.length > 0 ? (
                <div className="space-y-4">
                  {pulperia.reviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4"
                    >
                      <div className="flex items-start gap-3">
                        {review.user.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt={review.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <span className="text-primary-400 font-semibold">
                              {review.user.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-white truncate">
                              {review.user.name}
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                          <span className="text-xs text-gray-500 mt-2 block">
                            {new Date(review.createdAt).toLocaleDateString('es-HN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 bg-dark-100/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="font-medium text-white mb-1">Aun no hay resenas</p>
                  <p className="text-sm text-gray-400">Se el primero en dejar una resena</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating WhatsApp Button */}
      {(pulperia.whatsapp || pulperia.phone) && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleWhatsApp}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full shadow-lg shadow-green-500/30 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </motion.button>
      )}
    </div>
  );
};

export default PulperiaProfile;
