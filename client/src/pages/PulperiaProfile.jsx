import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin, Phone, Star, Heart, Share2, Clock, MessageCircle,
  ChevronRight, Package, ExternalLink
} from 'lucide-react';
import { pulperiaApi, productApi, reviewApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import ProductCard from '../components/products/ProductCard';
import MiniMap from '../components/map/MiniMap';
import toast from 'react-hot-toast';

const PulperiaProfile = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch pulperia
  const { data: pulperiaData, isLoading } = useQuery({
    queryKey: ['pulperia', id],
    queryFn: () => pulperiaApi.getById(id),
  });

  const pulperia = pulperiaData?.data?.pulperia;
  const isFavorite = pulperiaData?.data?.isFavorite;

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ['pulperia-products', id, selectedCategory],
    queryFn: () => productApi.getByPulperia(id, { category: selectedCategory }),
    enabled: !!id,
  });

  const products = productsData?.data?.products || [];
  const categories = productsData?.data?.categories || [];

  // Toggle favorite
  const favoriteMutation = useMutation({
    mutationFn: () => pulperiaApi.toggleFavorite(id, { notifyOnOpen: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pulperia', id]);
      toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
    },
  });

  // Share
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: pulperia.name,
        text: `Mira ${pulperia.name} en La Pulperia`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado');
    }
  };

  // Open WhatsApp
  const handleWhatsApp = () => {
    const phone = pulperia.whatsapp || pulperia.phone;
    if (phone) {
      window.open(`https://wa.me/504${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-4 w-1/3" />
      </div>
    );
  }

  if (!pulperia) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pulperia no encontrada</p>
      </div>
    );
  }

  const statusColors = {
    OPEN: 'bg-green-500',
    CLOSING_SOON: 'bg-yellow-500',
    CLOSED: 'bg-gray-400',
    VACATION: 'bg-blue-500',
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
        {pulperia.banner && (
          <img src={pulperia.banner} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Status */}
        <div className="absolute top-4 left-4">
          <span className={`badge text-white ${statusColors[pulperia.status]}`}>
            {pulperia.status === 'OPEN' ? 'Abierto' :
             pulperia.status === 'CLOSING_SOON' ? 'Por cerrar' :
             pulperia.status === 'VACATION' ? 'Vacaciones' : 'Cerrado'}
          </span>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isAuthenticated && (
            <button
              onClick={() => favoriteMutation.mutate()}
              className={`p-2.5 rounded-xl backdrop-blur-sm transition-colors ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Logo */}
        <div className="absolute -bottom-10 left-6">
          {pulperia.logo ? (
            <img
              src={pulperia.logo}
              alt={pulperia.name}
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-primary-100 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-600">{pulperia.name.charAt(0)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-8 px-1">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pulperia.name}</h1>
            {pulperia.rating > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-medium">{pulperia.rating.toFixed(1)}</span>
                <span className="text-gray-500">({pulperia.reviewCount} reseñas)</span>
              </div>
            )}
          </div>

          {(pulperia.whatsapp || pulperia.phone) && (
            <button onClick={handleWhatsApp} className="btn-primary">
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </button>
          )}
        </div>

        {pulperia.description && (
          <p className="text-gray-600 mt-3">{pulperia.description}</p>
        )}

        {/* Location */}
        <div className="flex items-start gap-2 mt-4 text-gray-600">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p>{pulperia.address}</p>
            {pulperia.reference && (
              <p className="text-sm text-gray-500">{pulperia.reference}</p>
            )}
          </div>
        </div>

        {/* Mini Map */}
        <div className="mt-4">
          <MiniMap
            center={[pulperia.latitude, pulperia.longitude]}
            pulperias={[pulperia]}
            className="h-40 rounded-xl"
          />
        </div>
      </div>

      {/* Story */}
      {pulperia.story && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-2">
            Nuestra Historia {pulperia.foundedYear && `(Desde ${pulperia.foundedYear})`}
          </h3>
          <p className="text-gray-600">{pulperia.story}</p>
        </div>
      )}

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
          <span className="text-gray-500">{products.length} disponibles</span>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${
                !selectedCategory ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} pulperia={pulperia} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay productos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PulperiaProfile;
