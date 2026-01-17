import { motion } from 'framer-motion';
import { Facebook, Instagram, Music2, Twitter, Youtube, Send, ExternalLink } from 'lucide-react';

// Configuración de redes sociales con estilos
const SOCIAL_CONFIG = {
  facebook: {
    icon: Facebook,
    label: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white',
  },
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    textColor: 'text-white',
  },
  tiktok: {
    icon: Music2,
    label: 'TikTok',
    color: 'bg-black hover:bg-gray-900 border border-white/20',
    textColor: 'text-white',
  },
  twitter: {
    icon: Twitter,
    label: 'X',
    color: 'bg-sky-500 hover:bg-sky-600',
    textColor: 'text-white',
  },
  youtube: {
    icon: Youtube,
    label: 'YouTube',
    color: 'bg-red-600 hover:bg-red-700',
    textColor: 'text-white',
  },
  telegram: {
    icon: Send,
    label: 'Telegram',
    color: 'bg-sky-400 hover:bg-sky-500',
    textColor: 'text-white',
  },
};

// Normalizar URL de red social
const normalizeUrl = (network, value) => {
  if (!value) return null;

  // Si ya es una URL completa
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  // Limpiar @ inicial si existe
  const cleanValue = value.startsWith('@') ? value.slice(1) : value;

  // Generar URL según la red
  switch (network) {
    case 'facebook':
      return `https://facebook.com/${cleanValue}`;
    case 'instagram':
      return `https://instagram.com/${cleanValue}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanValue}`;
    case 'twitter':
      return `https://x.com/${cleanValue}`;
    case 'youtube':
      return cleanValue.includes('youtube.com') ? `https://${cleanValue}` : `https://youtube.com/@${cleanValue}`;
    case 'telegram':
      return `https://t.me/${cleanValue}`;
    default:
      return value;
  }
};

const SocialButtons = ({ socialLinks = {}, variant = 'default' }) => {
  // Filtrar solo las redes que tienen valor
  const activeNetworks = Object.entries(socialLinks || {})
    .filter(([_, value]) => value && value.trim())
    .map(([key, value]) => ({
      key,
      url: normalizeUrl(key, value),
      config: SOCIAL_CONFIG[key],
    }))
    .filter(n => n.config); // Solo redes conocidas

  if (activeNetworks.length === 0) return null;

  // Variante compacta (solo iconos)
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {activeNetworks.map(({ key, url, config }) => {
          const Icon = config.icon;
          return (
            <motion.a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-9 h-9 rounded-full ${config.color} flex items-center justify-center shadow-lg transition-all`}
              title={config.label}
            >
              <Icon className={`w-4 h-4 ${config.textColor}`} />
            </motion.a>
          );
        })}
      </div>
    );
  }

  // Variante default (botones con labels)
  return (
    <div className="flex flex-wrap gap-2">
      {activeNetworks.map(({ key, url, config }) => {
        const Icon = config.icon;
        return (
          <motion.a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${config.color} ${config.textColor} font-medium text-sm shadow-lg transition-all`}
          >
            <Icon className="w-4 h-4" />
            <span>{config.label}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </motion.a>
        );
      })}
    </div>
  );
};

export default SocialButtons;
