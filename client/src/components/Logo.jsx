import { motion } from 'framer-motion';

// Logo "La Lámina Zen" - Diseño aprobado por Claude + Gemini
// Isotipo: 3 líneas zigzag suave (láminas acanaladas + wifi/conexión)
// Paleta: Rojo Arcilla #C0392B + Blanco Hueso #F4F1EA

export const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-2xl' },
    xl: { icon: 80, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon size={icon} />
      {showText && (
        <div className={`font-bold ${text} leading-none`}>
          <span className="text-white">La </span>
          <span className="text-primary-500">Pulperia</span>
        </div>
      )}
    </div>
  );
};

// Isotipo "La Lámina Zen" - Squircle con líneas onduladas
export const LogoIcon = ({ size = 40, className = '', animated = true }) => {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Gradientes */}
        <defs>
          <linearGradient id="bgGradientZen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C0392B" />
            <stop offset="100%" stopColor="#922B21" />
          </linearGradient>
        </defs>

        {/* Fondo Squircle - Rojo Arcilla */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          fill="url(#bgGradientZen)"
        />

        {/* Borde sutil */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          stroke="#922B21"
          strokeWidth="1"
          fill="none"
        />

        {/* Líneas "Lámina Zen" - 3 ondas suaves */}
        <g transform="translate(12, 18)">
          {/* Línea superior */}
          <motion.path
            d="M0 10 C6 4, 14 16, 20 10 C26 4, 34 16, 40 10"
            stroke="#F4F1EA"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            animate={animated ? { pathLength: [0.8, 1, 0.8] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Línea media */}
          <motion.path
            d="M0 22 C6 16, 14 28, 20 22 C26 16, 34 28, 40 22"
            stroke="#F4F1EA"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
            animate={animated ? { pathLength: [0.85, 1, 0.85] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          {/* Línea inferior */}
          <motion.path
            d="M0 34 C6 28, 14 40, 20 34 C26 28, 34 40, 40 34"
            stroke="#F4F1EA"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            animate={animated ? { pathLength: [0.9, 1, 0.9] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
        </g>
      </svg>

      {/* Glow effect */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              '0 0 0px rgba(192, 57, 43, 0)',
              '0 0 15px rgba(192, 57, 43, 0.4)',
              '0 0 0px rgba(192, 57, 43, 0)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
    </div>
  );
};

// Logo grande para hero/splash screens
export const LogoLarge = ({ className = '' }) => {
  return (
    <motion.div
      className={`flex flex-col items-center gap-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <LogoIcon size={120} />
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-white">La </span>
          <span className="text-primary-500">Pulperia</span>
        </h1>
        <motion.p
          className="text-gray-400 mt-3 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Tu tienda de barrio, digital
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Logo;
