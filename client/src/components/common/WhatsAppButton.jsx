import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

// Botón de WhatsApp - Para contacto directo
const WhatsAppButton = ({
  phone,
  message = '',
  label = 'WhatsApp',
  showLabel = true,
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'default', // 'default' | 'floating' | 'icon'
  className = '',
}) => {
  if (!phone) return null;

  // Limpiar número de teléfono
  const cleanPhone = phone.replace(/\D/g, '');

  // Generar enlace
  const getWhatsAppLink = () => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
  };

  // Tamaños
  const sizes = {
    sm: {
      padding: 'px-3 py-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      floatingSize: 'w-12 h-12',
    },
    md: {
      padding: 'px-4 py-3',
      icon: 'w-5 h-5',
      text: 'text-base',
      floatingSize: 'w-14 h-14',
    },
    lg: {
      padding: 'px-6 py-4',
      icon: 'w-6 h-6',
      text: 'text-lg',
      floatingSize: 'w-16 h-16',
    },
  };

  const sizeConfig = sizes[size] || sizes.md;

  // Botón flotante (para esquina de pantalla)
  if (variant === 'floating') {
    return (
      <motion.a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-40 ${sizeConfig.floatingSize} flex items-center justify-center bg-[#25D366] hover:bg-[#20BD5A] rounded-full shadow-lg shadow-[#25D366]/30 transition-colors ${className}`}
      >
        <MessageCircle className={`${sizeConfig.icon} text-white`} />
      </motion.a>
    );
  }

  // Solo icono
  if (variant === 'icon') {
    return (
      <motion.a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-flex items-center justify-center ${sizeConfig.padding} bg-[#25D366] hover:bg-[#20BD5A] rounded-xl transition-colors ${className}`}
      >
        <MessageCircle className={`${sizeConfig.icon} text-white`} />
      </motion.a>
    );
  }

  // Botón normal
  return (
    <motion.a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 ${sizeConfig.padding} bg-[#25D366] hover:bg-[#20BD5A] rounded-xl font-medium text-white transition-colors ${className}`}
    >
      <MessageCircle className={sizeConfig.icon} />
      {showLabel && <span className={sizeConfig.text}>{label}</span>}
    </motion.a>
  );
};

// Variante con borde transparente (para fondos oscuros)
export const WhatsAppButtonOutline = ({
  phone,
  message = '',
  label = 'WhatsApp',
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  if (!phone) return null;

  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  const link = `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;

  const sizes = {
    sm: { padding: 'px-3 py-2', icon: 'w-4 h-4', text: 'text-sm' },
    md: { padding: 'px-4 py-3', icon: 'w-5 h-5', text: 'text-base' },
    lg: { padding: 'px-6 py-4', icon: 'w-6 h-6', text: 'text-lg' },
  };

  const sizeConfig = sizes[size] || sizes.md;

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 ${sizeConfig.padding} bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/30 rounded-xl font-medium text-[#25D366] transition-colors ${className}`}
    >
      <MessageCircle className={sizeConfig.icon} />
      {showLabel && <span className={sizeConfig.text}>{label}</span>}
    </motion.a>
  );
};

export default WhatsAppButton;
