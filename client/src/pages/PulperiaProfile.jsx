import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Star, Heart, Share2, Clock, MessageCircle,
  ChevronRight, Package, ExternalLink, MessageSquare, X,
  Store, Calendar, Info, ShoppingBag, Navigation,
} from 'lucide-react';
import { pulperiaApi, productApi, reviewApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import ProductCard from '../components/products/ProductCard';
import MiniMap from '../components/map/MiniMap';
import ReviewForm from '../components/ReviewForm';
import ShareButtons from '../components/ShareButtons';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton, SkeletonProductCard, SkeletonText } from '@/components/ui/skeleton';
import {
  AnimatedList,
  AnimatedListItem,
  FadeInView,
} from '@/components/ui';

const PulperiaProfile = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

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
        <Skeleton className="h-48 md:h-64 rounded-2xl" />
        <div className="pt-12 px-1 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <SkeletonText lines={2} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonProductCard key={i} />
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
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Pulperia no encontrada</h2>
        <p className="text-muted-foreground mb-6">No pudimos encontrar esta pulperia</p>
        <Button asChild variant="outline">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </motion.div>
    );
  }

  const statusMap = {
    OPEN: { label: 'Abierto', variant: 'open' },
    CLOSING_SOON: { label: 'Por cerrar', variant: 'closing' },
    CLOSED: { label: 'Cerrado', variant: 'closed' },
    VACATION: { label: 'Vacaciones', variant: 'vacation' },
  };

  const status = statusMap[pulperia.status] || statusMap.CLOSED;

  return (
    <div className="space-y-6 pb-6">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800"
      >
        {pulperia.banner && (
          <img src={pulperia.banner} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 left-4"
        >
          <StatusBadge status={status.variant} className="shadow-lg">
            {status.label}
          </StatusBadge>
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
              className={`p-2.5 rounded-xl backdrop-blur-md shadow-lg transition-all ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
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
                className="p-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 backdrop-blur-md shadow-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle>Compartir {pulperia.name}</SheetTitle>
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

        {/* Logo */}
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
              className="w-24 h-24 rounded-2xl border-4 border-background shadow-xl object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl border-4 border-background shadow-xl bg-primary-100 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-600">
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
        className="pt-14 px-1"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground break-words leading-tight line-clamp-2">{pulperia.name}</h1>
            {pulperia.rating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-500/30 rounded-lg border border-accent-500/40">
                  <Star className="w-4 h-4 text-accent-400 fill-accent-400" />
                  <span className="font-semibold text-accent-300">
                    {pulperia.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({pulperia.reviewCount} reseñas)
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 shrink-0">
            {pulperia.latitude && pulperia.longitude && (
              <Button variant="outline" size="icon" onClick={handleDirections}>
                <Navigation className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {pulperia.description && (
          <p className="text-muted-foreground mt-3 leading-relaxed">
            {pulperia.description}
          </p>
        )}

        {/* Location */}
        <div className="flex items-start gap-3 mt-4 p-3 bg-card rounded-xl border border-border">
          <div className="p-2 bg-primary-500/20 rounded-lg shrink-0">
            <MapPin className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <p className="text-foreground font-medium">{pulperia.address}</p>
            {pulperia.reference && (
              <p className="text-sm text-muted-foreground mt-0.5">{pulperia.reference}</p>
            )}
          </div>
        </div>

        {/* Mini Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <MiniMap
            center={[pulperia.latitude, pulperia.longitude]}
            pulperias={[pulperia]}
            className="h-48 md:h-56 rounded-xl border border-border overflow-hidden"
          />
        </motion.div>
      </motion.div>

      {/* Story Card */}
      <AnimatePresence>
        {pulperia.story && (
          <FadeInView>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent-500/20 rounded-lg">
                    <Info className="w-4 h-4 text-accent-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Nuestra Historia
                  </h3>
                  {pulperia.foundedYear && (
                    <Badge variant="outline" className="ml-auto">
                      <Calendar className="w-3 h-3 mr-1" />
                      Desde {pulperia.foundedYear}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{pulperia.story}</p>
              </CardContent>
            </Card>
          </FadeInView>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger
            value="products"
            className="flex-1 sm:flex-none gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <ShoppingBag className="w-4 h-4" />
            Productos
            {products.length > 0 && (
              <Badge variant="secondary" size="sm">
                {products.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="flex-1 sm:flex-none gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <MessageSquare className="w-4 h-4" />
            Reseñas
            {pulperia.reviewCount > 0 && (
              <Badge variant="secondary" size="sm">
                {pulperia.reviewCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-6">
          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 mb-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  !selectedCategory
                    ? 'bg-primary-500 text-white shadow-primary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                      ? 'bg-primary-500 text-white shadow-primary'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                <SkeletonProductCard key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <AnimatedList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <AnimatedListItem key={product.id}>
                  <ProductCard product={product} pulperia={pulperia} />
                </AnimatedListItem>
              ))}
            </AnimatedList>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No hay productos disponibles</p>
            </motion.div>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6 space-y-6">
          {/* Review Form */}
          <ReviewForm pulperiaId={id} />

          {/* Existing Reviews */}
          {pulperia.reviews && pulperia.reviews.length > 0 ? (
            <AnimatedList className="space-y-4">
              {pulperia.reviews.map((review) => (
                <AnimatedListItem key={review.id}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {review.user.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt={review.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {review.user.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-foreground truncate">
                              {review.user.name}
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < review.rating
                                      ? 'text-accent-400 fill-accent-400'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                          <span className="text-xs text-muted-foreground mt-2 block">
                            {new Date(review.createdAt).toLocaleDateString('es-HN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedListItem>
              ))}
            </AnimatedList>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground mb-1">Aun no hay reseñas</p>
              <p className="text-sm text-muted-foreground">Se el primero en dejar una reseña</p>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Floating WhatsApp Button */}
      {(pulperia.whatsapp || pulperia.phone) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40"
        >
          <Button
            onClick={handleWhatsApp}
            size="lg"
            className="rounded-full shadow-lg gap-2 px-6 bg-green-500 hover:bg-green-600"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default PulperiaProfile;
