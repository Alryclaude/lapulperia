import { motion } from 'framer-motion';
import {
  User,
  Star,
  Briefcase,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkGallery from './WorkGallery';

// Perfil de Proveedor de Servicios - Para plomeros, electricistas, etc.
const ServiceProviderProfile = ({
  provider,
  works = [],
  onContact,
  onRequestQuote,
}) => {
  // Calcular nivel de experiencia
  const getExperienceLevel = (completedJobs) => {
    if (completedJobs >= 100) return { level: 'Experto', color: 'text-amber-400' };
    if (completedJobs >= 50) return { level: 'Experimentado', color: 'text-purple-400' };
    if (completedJobs >= 20) return { level: 'Competente', color: 'text-blue-400' };
    if (completedJobs >= 5) return { level: 'Aprendiz', color: 'text-green-400' };
    return { level: 'Nuevo', color: 'text-gray-400' };
  };

  const experience = getExperienceLevel(provider?.completedJobs || 0);

  // Generar enlace WhatsApp
  const getWhatsAppLink = (message = '') => {
    if (!provider?.whatsapp) return null;
    const phone = provider.whatsapp.replace(/\D/g, '');
    const text = encodeURIComponent(message || `Hola ${provider.name}, vi tu perfil en La Pulpería App y me gustaría cotizar un trabajo.`);
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Card principal */}
      <div className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] overflow-hidden">
        {/* Header con foto y nombre */}
        <div className="relative">
          <div className="h-24 bg-gradient-to-br from-primary-500/20 to-purple-500/10" />

          <div className="absolute -bottom-10 left-4">
            <div className="w-20 h-20 rounded-2xl bg-dark-200 border-4 border-dark-100 overflow-hidden shadow-xl">
              {provider?.photo ? (
                <img
                  src={provider.photo}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-500/20">
                  <User className="w-10 h-10 text-primary-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 pt-14">
          {/* Nombre y nivel */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{provider?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-medium ${experience.color}`}>
                  {experience.level}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400">
                  {provider?.completedJobs || 0} trabajos
                </span>
              </div>
            </div>

            {/* Rating */}
            {provider?.rating > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-accent-500/20 rounded-xl">
                <Star className="w-4 h-4 text-accent-400 fill-accent-400" />
                <span className="font-semibold text-accent-400">
                  {provider.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Servicio principal */}
          {provider?.mainService && (
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <span className="text-gray-300">{provider.mainService}</span>
            </div>
          )}

          {/* Validación local */}
          {provider?.localRecommendations > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-4 px-3 py-2 bg-green-500/10 rounded-xl border border-green-500/20"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">
                {provider.localRecommendations} vecinos de tu zona lo recomiendan
              </span>
            </motion.div>
          )}

          {/* Info adicional */}
          <div className="space-y-2 mb-4">
            {provider?.location && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{provider.location}</span>
              </div>
            )}
            {provider?.availability && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{provider.availability}</span>
              </div>
            )}
          </div>

          {/* Habilidades/servicios */}
          {provider?.skills?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Especialidades</p>
              <div className="flex flex-wrap gap-2">
                {provider.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-dark-200 rounded-lg text-xs text-gray-300 border border-white/5"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2">
            {provider?.whatsapp && (
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">WhatsApp</span>
              </a>
            )}
            {provider?.phone && (
              <a
                href={`tel:${provider.phone}`}
                className="px-4 py-3 bg-dark-200 hover:bg-dark-300 rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5 text-gray-400" />
              </a>
            )}
          </div>

          {/* Botón cotización */}
          {onRequestQuote && (
            <Button
              onClick={() => onRequestQuote(provider)}
              className="w-full mt-3 bg-primary-500 hover:bg-primary-600"
            >
              Solicitar cotización
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Galería de trabajos */}
      {works.length > 0 && (
        <WorkGallery works={works} title="Trabajos anteriores" />
      )}
    </motion.div>
  );
};

export default ServiceProviderProfile;
