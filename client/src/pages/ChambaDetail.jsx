import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Wrench,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Store,
  Phone,
  MessageCircle,
  Zap,
  DollarSign,
  User,
  Eye,
  HelpCircle
} from 'lucide-react';
import { chambasApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  EMPLOYMENT: {
    label: 'Empleo',
    icon: Briefcase,
    color: 'primary',
    actionLabel: 'Aplicar a este empleo',
    respondedLabel: 'Ya aplicaste a este empleo'
  },
  SERVICE: {
    label: 'Servicio',
    icon: Wrench,
    color: 'green',
    actionLabel: 'Solicitar este servicio',
    respondedLabel: 'Ya contactaste este servicio'
  },
  REQUEST: {
    label: 'Solicitud',
    icon: HelpCircle,
    color: 'amber',
    actionLabel: 'Ofrecer mi servicio',
    respondedLabel: 'Ya ofreciste tu servicio'
  }
};

const ChambaDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['chamba', id],
    queryFn: () => chambasApi.getById(id),
  });

  const chamba = data?.data;
  const hasResponded = chamba?.responses?.length > 0;
  const config = TYPE_CONFIG[chamba?.type] || TYPE_CONFIG.SERVICE;
  const TypeIcon = config.icon;

  const respondMutation = useMutation({
    mutationFn: (data) => chambasApi.respond(id, data),
    onSuccess: () => {
      toast.success(chamba.type === 'EMPLOYMENT'
        ? 'Aplicación enviada exitosamente'
        : 'Mensaje enviado exitosamente'
      );
      setShowForm(false);
      queryClient.invalidateQueries(['chamba', id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al enviar');
    },
  });

  const handleRespond = (e) => {
    e.preventDefault();
    respondMutation.mutate({
      message,
      proposedPrice: proposedPrice ? parseFloat(proposedPrice) : null
    });
  };

  const openWhatsApp = () => {
    const phone = chamba.contactWhatsapp || chamba.pulperia?.whatsapp || chamba.contactPhone;
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const msg = encodeURIComponent(`Hola, vi tu chamba "${chamba.title}" en La Pulpería`);
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-dark-200 animate-pulse rounded" />
        <div className="bg-dark-100/60 rounded-2xl border border-white/5 p-6">
          <div className="h-6 w-3/4 bg-dark-200 animate-pulse rounded mb-4" />
          <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded mb-6" />
          <div className="h-32 w-full bg-dark-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!chamba) {
    return (
      <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center">
        <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Chamba no encontrada</p>
      </div>
    );
  }

  const isOwner = user?.id === chamba.userId;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link to="/chambas" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Ver todas las chambas
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-start gap-4">
          {chamba.pulperia?.logo ? (
            <img src={chamba.pulperia.logo} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
          ) : chamba.user?.avatar ? (
            <img src={chamba.user.avatar} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
          ) : (
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center border ${config.color === 'primary'
                ? 'bg-primary-500/20 border-primary-500/30'
                : config.color === 'green'
                  ? 'bg-green-500/20 border-green-500/30'
                  : 'bg-amber-500/20 border-amber-500/30'
              }`}>
              <TypeIcon className={`w-8 h-8 ${config.color === 'primary'
                  ? 'text-primary-400'
                  : config.color === 'green'
                    ? 'text-green-400'
                    : 'text-amber-400'
                }`} />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {chamba.isUrgent && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs border border-red-500/30">
                  <Zap className="w-3 h-3" />
                  Urgente
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs border ${config.color === 'primary'
                  ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                  : config.color === 'green'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                {config.label}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{chamba.title}</h1>
            {chamba.pulperia ? (
              <Link
                to={`/pulperia/${chamba.pulperia.id}`}
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                {chamba.pulperia.name}
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <User className="w-4 h-4" />
                {chamba.user?.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          {/* Precio */}
          {(chamba.priceMin || chamba.priceMax || chamba.salary) && (
            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 font-medium border border-green-500/30 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              {chamba.salary || (
                chamba.priceMin && chamba.priceMax
                  ? `L ${chamba.priceMin} - L ${chamba.priceMax}`
                  : chamba.priceMin
                    ? `Desde L ${chamba.priceMin}`
                    : `Hasta L ${chamba.priceMax}`
              )}
            </span>
          )}

          {chamba.isPartTime && (
            <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Medio tiempo
            </span>
          )}

          <span className="px-3 py-1.5 rounded-lg bg-dark-200/80 text-gray-400 border border-white/5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {new Date(chamba.createdAt).toLocaleDateString('es-HN')}
          </span>

          <span className="px-3 py-1.5 rounded-lg bg-dark-200/80 text-gray-400 border border-white/5 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            {chamba.viewCount} vistas
          </span>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        <h2 className="font-semibold text-white mb-3">Descripción</h2>
        <p className="text-gray-400 whitespace-pre-line">{chamba.description || 'Sin descripción adicional.'}</p>
      </motion.div>

      {/* Requirements (for EMPLOYMENT) */}
      {chamba.requirements && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
        >
          <h2 className="font-semibold text-white mb-3">Requisitos</h2>
          <p className="text-gray-400 whitespace-pre-line">{chamba.requirements}</p>
        </motion.div>
      )}

      {/* Duration & Service Area (for SERVICE) */}
      {(chamba.duration || chamba.serviceArea) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
        >
          <h2 className="font-semibold text-white mb-3">Detalles del servicio</h2>
          {chamba.duration && (
            <p className="text-gray-400 flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary-400" />
              Duración: {chamba.duration}
            </p>
          )}
          {chamba.serviceArea && (
            <p className="text-gray-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-400" />
              Área de servicio: {chamba.serviceArea}
            </p>
          )}
        </motion.div>
      )}

      {/* Images Gallery */}
      {chamba.images?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
        >
          <h2 className="font-semibold text-white mb-3">Galería</h2>
          <div className="grid grid-cols-2 gap-3">
            {chamba.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Imagen ${i + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-white/10"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Location */}
      {(chamba.pulperia?.address || chamba.latitude) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
        >
          <h2 className="font-semibold text-white mb-3">Ubicación</h2>
          <div className="flex items-start gap-2 text-gray-400">
            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary-400" />
            <div>
              {chamba.pulperia?.address && <p>{chamba.pulperia.address}</p>}
              {chamba.pulperia?.reference && (
                <p className="text-sm text-gray-500 mt-1">{chamba.pulperia.reference}</p>
              )}
              {!chamba.pulperia?.address && chamba.serviceArea && (
                <p>{chamba.serviceArea}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Contact Section */}
      {!isOwner && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
        >
          {!isAuthenticated ? (
            <div className="text-center">
              <p className="text-gray-400 mb-4">Inicia sesión para contactar</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          ) : hasResponded ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-green-400 py-2">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">{config.respondedLabel}</span>
              </div>
              {/* Quick contact buttons */}
              <div className="flex gap-3">
                {(chamba.contactWhatsapp || chamba.pulperia?.whatsapp) && (
                  <button
                    onClick={openWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-medium transition-colors border border-green-500/30"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </button>
                )}
                {(chamba.contactPhone || chamba.pulperia?.phone) && (
                  <a
                    href={`tel:${chamba.contactPhone || chamba.pulperia?.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-dark-200/50 hover:bg-dark-200 text-gray-300 rounded-xl font-medium transition-colors border border-white/5"
                  >
                    <Phone className="w-5 h-5" />
                    Llamar
                  </a>
                )}
              </div>
            </div>
          ) : showForm ? (
            <form onSubmit={handleRespond} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mensaje
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={chamba.type === 'EMPLOYMENT'
                    ? 'Cuéntale al empleador por qué eres ideal para este puesto...'
                    : chamba.type === 'REQUEST'
                      ? 'Describe cómo puedes ayudar con esta solicitud...'
                      : 'Describe lo que necesitas...'
                  }
                  className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[120px] resize-none"
                  required
                />
              </div>

              {chamba.type !== 'EMPLOYMENT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {chamba.type === 'REQUEST' ? 'Tu precio propuesto (L)' : 'Precio acordado (L)'} <span className="text-gray-500">(opcional)</span>
                  </label>
                  <input
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={respondMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                >
                  {respondMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(true)}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${config.color === 'primary'
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : config.color === 'green'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-black'
                  }`}
              >
                <TypeIcon className="w-5 h-5" />
                {config.actionLabel}
              </motion.button>

              {/* Quick contact */}
              <div className="flex gap-3">
                {(chamba.contactWhatsapp || chamba.pulperia?.whatsapp) && (
                  <button
                    onClick={openWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-sm transition-colors border border-green-500/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp directo
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Owner view - show responses count */}
      {isOwner && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-primary-500/10 backdrop-blur-sm rounded-2xl border border-primary-500/20 p-6 text-center"
        >
          <p className="text-primary-400 font-medium">Esta es tu chamba</p>
          <p className="text-gray-400 text-sm mt-1">
            Tienes {chamba._count?.responses || 0} respuestas
          </p>
          <Link
            to="/manage/chambas"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg transition-colors"
          >
            Ver respuestas en el panel
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default ChambaDetail;
