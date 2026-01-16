import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Facebook,
  Twitter,
  Link2,
  X
} from 'lucide-react';

// Botón de Compartir - Con Web Share API y fallback
const ShareButton = ({
  title = '',
  text = '',
  url = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'button', // 'button' | 'icon' | 'menu'
  className = '',
  onShare,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // URL actual si no se especifica
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Verificar si Web Share API está disponible
  const canNativeShare = typeof navigator !== 'undefined' && navigator.share;

  // Tamaños
  const sizes = {
    sm: { padding: 'px-3 py-2', icon: 'w-4 h-4', text: 'text-sm' },
    md: { padding: 'px-4 py-3', icon: 'w-5 h-5', text: 'text-base' },
    lg: { padding: 'px-6 py-4', icon: 'w-6 h-6', text: 'text-lg' },
  };

  const sizeConfig = sizes[size] || sizes.md;

  // Compartir nativo (móvil)
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
      onShare?.('native');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error al compartir:', err);
      }
    }
  };

  // Copiar enlace
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.('copy');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Enlaces de redes sociales
  const getWhatsAppLink = () => {
    const message = encodeURIComponent(`${title}\n${text}\n${shareUrl}`);
    return `https://wa.me/?text=${message}`;
  };

  const getFacebookLink = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  };

  const getTwitterLink = () => {
    const tweet = encodeURIComponent(`${title} ${text}`);
    return `https://twitter.com/intent/tweet?text=${tweet}&url=${encodeURIComponent(shareUrl)}`;
  };

  // Manejar click principal
  const handleClick = () => {
    if (canNativeShare && variant !== 'menu') {
      handleNativeShare();
    } else {
      setShowMenu(true);
    }
  };

  // Variante solo icono
  if (variant === 'icon') {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-flex items-center justify-center p-2 bg-dark-200 hover:bg-dark-300 rounded-xl transition-colors ${className}`}
      >
        <Share2 className={`${sizeConfig.icon} text-gray-400`} />
      </motion.button>
    );
  }

  return (
    <>
      {/* Botón principal */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`inline-flex items-center justify-center gap-2 ${sizeConfig.padding} bg-dark-200 hover:bg-dark-300 rounded-xl font-medium text-gray-300 transition-colors ${className}`}
      >
        <Share2 className={sizeConfig.icon} />
        <span className={sizeConfig.text}>Compartir</span>
      </motion.button>

      {/* Menú de opciones */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-sm bg-dark-100 rounded-2xl border border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-semibold text-white">Compartir</h3>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1 hover:bg-dark-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Opciones */}
              <div className="p-4 space-y-2">
                {/* WhatsApp */}
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setShowMenu(false);
                    onShare?.('whatsapp');
                  }}
                  className="flex items-center gap-4 p-3 hover:bg-dark-200 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-[#25D366]/20 rounded-xl">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <span className="text-white font-medium">WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={getFacebookLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setShowMenu(false);
                    onShare?.('facebook');
                  }}
                  className="flex items-center gap-4 p-3 hover:bg-dark-200 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-[#1877F2]/20 rounded-xl">
                    <Facebook className="w-5 h-5 text-[#1877F2]" />
                  </div>
                  <span className="text-white font-medium">Facebook</span>
                </a>

                {/* Twitter/X */}
                <a
                  href={getTwitterLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setShowMenu(false);
                    onShare?.('twitter');
                  }}
                  className="flex items-center gap-4 p-3 hover:bg-dark-200 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium">X (Twitter)</span>
                </a>

                {/* Copiar enlace */}
                <button
                  onClick={() => {
                    handleCopy();
                    setTimeout(() => setShowMenu(false), 1000);
                  }}
                  className="flex items-center gap-4 p-3 hover:bg-dark-200 rounded-xl transition-colors w-full"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-primary-500/20 rounded-xl">
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Link2 className="w-5 h-5 text-primary-400" />
                    )}
                  </div>
                  <span className="text-white font-medium">
                    {copied ? '¡Copiado!' : 'Copiar enlace'}
                  </span>
                </button>
              </div>

              {/* Preview del enlace */}
              <div className="p-4 pt-2 border-t border-white/5">
                <p className="text-xs text-gray-500 truncate">{shareUrl}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareButton;
