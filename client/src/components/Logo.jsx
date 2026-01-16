import { motion } from 'framer-motion';

// Logo "La Casita" - Pulpería Hondureña
// Isotipo: Casita minimalista con ventana con barrotes (característica pulpería)
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
          <span className="text-primary-500">Pulpería</span>
        </div>
      )}
    </div>
  );
};

// Isotipo "La Casita" - Squircle con casita monoline
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
        {/* Gradiente de fondo */}
        <defs>
          <linearGradient id="bgGradientCasita" x1="0%" y1="0%" x2="100%" y2="100%">
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
          fill="url(#bgGradientCasita)"
        />

        {/* Casita Monoline */}
        <g
          transform="translate(12, 12)"
          stroke="#F4F1EA"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {/* Techo a dos aguas */}
          <motion.path
            d="M20 10 L4 22 L20 22"
            animate={animated ? { pathLength: [0.9, 1, 0.9] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M20 10 L36 22 L20 22"
            animate={animated ? { pathLength: [0.9, 1, 0.9] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
          />

          {/* Paredes de la casa */}
          <motion.rect
            x="6"
            y="22"
            width="28"
            height="18"
            rx="1"
            animate={animated ? { opacity: [0.95, 1, 0.95] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />

          {/* Ventana con barrotes */}
          <rect x="12" y="26" width="16" height="10" />
          {/* Barrotes verticales */}
          <line x1="17" y1="26" x2="17" y2="36" />
          <line x1="23" y1="26" x2="23" y2="36" />
          {/* Barrote horizontal */}
          <line x1="12" y1="31" x2="28" y2="31" />
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
          <span className="text-primary-500">Pulpería</span>
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
