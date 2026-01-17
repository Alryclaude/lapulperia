import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Star, Heart, Share2, Clock, MessageCircle,
  Package, MessageSquare, Store, Info, ShoppingBag, Navigation, Maximize2, Minimize2,
  CheckCircle, Calendar, Globe, Tag,
} from 'lucide-react';
import SocialButtons from '../components/profile/SocialButtons';
import PaymentMethodsDisplay from '../components/profile/PaymentMethodsDisplay';

// Configuración de categorías para badges
const CATEGORY_CONFIG = {
  COMER: { label: 'Comer', emoji: '🍽️', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  COMPRAR: { label: 'Comprar', emoji: '🛒', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  SERVICIOS: { label: 'Servicios', emoji: '🔧', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};
import { pulperiaApi, productApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import ProductCard from '../components/products/ProductCard';
import ProductDetailModal from '../components/products/ProductDetailModal';
import MiniMap from '../components/map/MiniMap';
import ReviewForm from '../components/ReviewForm';
import { ShareButtons } from '../components/share';
import toast from 'react-hot-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Format phone number for display
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const { data: pulperiaData, isLoading, error } = useQuery({
    queryKey: ['pulperia', id],
    queryFn: () => pulperiaApi.getById(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });

  // Debug: log para ver qué devuelve la API
  console.log('PulperiaProfile debug:', { id, pulperiaData, error });

  const pulperia = pulperiaData?.data?.pulperia;
  const isFavorite = pulperiaData?.data?.isFavorite;

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['pulperia-products', id, selectedCategory],
    queryFn: () => productApi.getByPulperia(id, { category: selectedCategory }),
    enabled: !!id,
  });

  const products = productsData?.data?.products || [];
  const categories = productsData?.data?.categories || [];

  const favoriteMutation = useMutation({
    mutationFn: () => pulperiaApi.toggleFavorite(id, { notifyOnOpen: true }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['pulperia', id] });
      toast.success(response.data.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos');
    },
  });

  const handleWhatsApp = () => {
    const phone = pulperia.whatsapp || pulperia.phone;
    if (phone) {
      window.open(`https://wa.me/504${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleDirections = () => {
    if (pulperia.latitude && pulperia.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${pulperia.latitude},${pulperia.longitude}`,
        '_blank'
      );
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-0">
        <div className="h-48 md:h-56 bg-dark-100/60 animate-pulse" />
        <div className="px-4 -mt-16 relative z-10">
          <div className="flex items-end gap-4">
            <div className="w-28 h-28 rounded-full bg-dark-200 animate-pulse border-4 border-dark-400" />
            <div className="flex-1 pb-3">
              <div className="h-6 w-48 bg-dark-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-32 bg-dark-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found
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
    <div className="pb-24">
      {/* ===== TWITTER/X STYLE HEADER ===== */}

      {/* Banner - Full width on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-48 md:h-56 -mx-4 sm:mx-0"
      >
        {pulperia.banner ? (
          <img src={pulperia.banner} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-transparent to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => favoriteMutation.mutate()}
              className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all border border-white/20 ${
                isFavorite
                  ? 'bg-red-500/80 text-white'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </motion.button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md shadow-lg transition-colors border border-white/20"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto bg-dark-100 border-white/10">
              <SheetHeader>
                <SheetTitle className="text-white">Compartir {pulperia.name}</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <ShareButtons title={pulperia.name} text={`Mira ${pulperia.name} en La Pulperia`} variant="icons" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.div>

      {/* Profile Header - Twitter/X Style */}
      <div className="px-4 sm:px-6">
        <div className="relative">
          {/* Logo - Overlapping Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -top-16 left-0"
          >
            {pulperia.logo ? (
              <img
                src={pulperia.logo}
                alt={pulperia.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-dark-400 shadow-2xl object-cover"
              />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-dark-400 shadow-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {pulperia.name.charAt(0)}
                </span>
              </div>
            )}
          </motion.div>

          {/* Contact Buttons - Right Aligned */}
          <div className="flex justify-end gap-2 pt-3 pb-2">
            {pulperia.phone && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(`tel:+504${pulperia.phone.replace(/\D/g, '')}`, '_self')}
                className="px-4 py-2 rounded-full bg-dark-100/80 border border-white/10 text-white font-medium hover:bg-dark-100 transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Llamar</span>
              </motion.button>
            )}
            {(pulperia.whatsapp || pulperia.phone) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsApp}
                className="px-4 py-2 rounded-full bg-green-500 text-white font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </motion.button>
            )}
          </div>

          {/* Name & Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-8 md:pt-10"
          >
            {/* Name & Verified */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{pulperia.name}</h1>
              {pulperia.isVerified && (
                <CheckCircle className="w-6 h-6 text-blue-400 fill-blue-400/20" />
              )}
            </div>

            {/* Badges de tipo y categorías */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Badge Físico/Online */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                pulperia.isOnlineOnly
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
              }`}>
                {pulperia.isOnlineOnly ? (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    Tienda Online
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5" />
                    Tienda Física
                  </>
                )}
              </div>

              {/* Badges de categoría */}
              {pulperia.categories?.map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                if (!config) return null;
                return (
                  <div
                    key={cat}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
                  >
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Meta Info Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-gray-400">
              {/* Rating */}
              {pulperia.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-yellow-400">{pulperia.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({pulperia.reviewCount})</span>
                </div>
              )}

              {/* Status */}
              <div className={`flex items-center gap-1.5 ${status.text}`}>
                <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                <span className="font-medium">{status.label}</span>
              </div>

              {/* Founded Year */}
              {pulperia.foundedYear && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Desde {pulperia.foundedYear}</span>
                </div>
              )}
            </div>

            {/* Location */}
            {pulperia.address && (
              <button
                onClick={handleDirections}
                disabled={!pulperia.latitude || !pulperia.longitude}
                className="flex items-center gap-1.5 mt-2 text-gray-400 hover:text-blue-400 transition-colors disabled:hover:text-gray-400"
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{pulperia.address}</span>
              </button>
            )}

            {/* Phone Display */}
            {pulperia.phone && (
              <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{formatPhoneNumber(pulperia.phone)}</span>
              </div>
            )}
          </motion.div>

          {/* Bio/Description */}
          {pulperia.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-gray-300 leading-relaxed"
            >
              {pulperia.description}
            </motion.p>
          )}

          {/* Story */}
          {pulperia.story && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-4 bg-dark-100/40 rounded-xl border border-white/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Nuestra Historia</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{pulperia.story}</p>
            </motion.div>
          )}

          {/* Social Links */}
          {pulperia.socialLinks && Object.keys(pulperia.socialLinks).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-4"
            >
              <SocialButtons socialLinks={pulperia.socialLinks} />
            </motion.div>
          )}

          {/* Payment Methods */}
          {pulperia.paymentMethods && pulperia.paymentMethods.length > 0 && (
            <PaymentMethodsDisplay
              paymentMethods={pulperia.paymentMethods}
              whatsapp={pulperia.whatsapp}
              phone={pulperia.phone}
            />
          )}

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-6 mt-4 py-3 border-t border-white/5"
          >
            <div className="text-center">
              <span className="block text-lg font-bold text-white">{products.length}</span>
              <span className="text-xs text-gray-500">Productos</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-white">{pulperia.reviewCount || 0}</span>
              <span className="text-xs text-gray-500">Resenas</span>
            </div>
            {pulperia._count?.favorites > 0 && (
              <div className="text-center">
                <span className="block text-lg font-bold text-white">{pulperia._count.favorites}</span>
                <span className="text-xs text-gray-500">Favoritos</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Mini Map */}
        {pulperia.latitude && pulperia.longitude && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 150 }}
            animate={{ opacity: 1, y: 0, height: isMapExpanded ? 300 : 150 }}
            transition={{ delay: 0.6 }}
            className="relative rounded-xl overflow-hidden border border-white/5 mt-4"
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
              className="absolute top-2 right-2 p-2 bg-dark-100/80 backdrop-blur-md rounded-lg border border-white/10 text-white hover:bg-dark-100 transition-colors"
            >
              {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDirections}
              className="absolute bottom-2 left-2 right-2 py-2 bg-blue-500/90 backdrop-blur-md rounded-lg text-white text-sm font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Obtener direcciones
            </button>
          </motion.div>
        )}

        {/* ===== TABS - Twitter/X Style Underline ===== */}
        <div className="mt-6 border-b border-white/5">
          <div className="flex">
            <button
              onClick={() => setActiveTab('products')}
              className={`relative flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'products' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Productos
                {products.length > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/10">{products.length}</span>
                )}
              </span>
              {activeTab === 'products' && (
                <motion.div
                  layoutId="tabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`relative flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'reviews' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Resenas
                {pulperia.reviewCount > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/10">{pulperia.reviewCount}</span>
                )}
              </span>
              {activeTab === 'reviews' && (
                <motion.div
                  layoutId="tabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full"
                />
              )}
            </button>
          </div>
        </div>

        {/* ===== TAB CONTENT ===== */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-6"
            >
              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                      !selectedCategory
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-100/60 text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Products Grid */}
              {loadingProducts ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-dark-100/60 rounded-xl overflow-hidden">
                      <div className="aspect-square bg-dark-200 animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-dark-200 rounded animate-pulse" />
                        <div className="h-4 w-1/2 bg-dark-200 rounded animate-pulse" />
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
                      <ProductCard
                        product={product}
                        pulperia={pulperia}
                        onClick={handleProductClick}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-dark-100/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No hay productos disponibles</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-6 space-y-4"
            >
              <ReviewForm pulperiaId={id} />

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
                            <span className="font-medium text-white truncate">{review.user.name}</span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-400 mt-2 text-sm leading-relaxed">{review.comment}</p>
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
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-dark-100/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="font-medium text-white mb-1">Aun no hay resenas</p>
                  <p className="text-sm text-gray-400">Se el primero en dejar una resena</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating WhatsApp - Mobile Only */}
      {(pulperia.whatsapp || pulperia.phone) && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleWhatsApp}
          className="sm:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        pulperia={pulperia}
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
      />
    </div>
  );
};

export default PulperiaProfile;
