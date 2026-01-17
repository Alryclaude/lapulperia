import { motion } from 'framer-motion';

/**
 * Logo "El Pin Catacho" - Constelación de Barrio
 * Fusión de pin de ubicación + techo de pulpería + ventana con barrotes
 *
 * Concepto: Las pulperías son estrellas en el barrio, el pin las ubica en la constelación
 */

// Tamaños predefinidos
const sizes = {
  xs: { icon: 24, text: 'text-sm' },
  sm: { icon: 32, text: 'text-base' },
  md: { icon: 40, text: 'text-xl' },
  lg: { icon: 56, text: 'text-2xl' },
  xl: { icon: 80, text: 'text-3xl' },
  '2xl': { icon: 120, text: 'text-4xl' },
};

/**
 * Logo completo con icono y texto
 */
export const Logo = ({ size = 'md', showText = true, className = '' }) => {
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

/**
 * Isotipo "El Pin Catacho"
 * Pin de mapa con casita integrada y ventana con barrotes
 */
export const LogoIcon = ({
  size = 40,
  className = '',
  animated = true,
  variant = 'default' // 'default' | 'mono' | 'light'
}) => {
  const colors = {
    default: {
      gradientStart: '#FA5252',
      gradientEnd: '#DC2626',
      house: '#FFFBF5',
      accent: '#FBBF24',
    },
    mono: {
      gradientStart: '#FFFFFF',
      gradientEnd: '#E5E7EB',
      house: '#1F2937',
      accent: '#6B7280',
    },
    light: {
      gradientStart: '#FA5252',
      gradientEnd: '#DC2626',
      house: '#FFFFFF',
      accent: '#FBBF24',
    },
  };

  const c = colors[variant] || colors.default;

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={false}
      animate={animated ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 64 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Gradiente principal del pin */}
          <linearGradient id={`pinGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.gradientStart} />
            <stop offset="100%" stopColor={c.gradientEnd} />
          </linearGradient>

          {/* Sombra interior */}
          <filter id={`innerShadow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.15"/>
          </filter>

          {/* Glow exterior */}
          <filter id={`outerGlow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feFlood floodColor={c.gradientStart} floodOpacity="0.4"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Pin shape - Forma de gota/marcador */}
        <motion.path
          d="M32 0C14.327 0 0 14.327 0 32c0 17.673 32 48 32 48s32-30.327 32-48C64 14.327 49.673 0 32 0z"
          fill={`url(#pinGradient-${variant})`}
          filter={animated ? `url(#outerGlow-${variant})` : undefined}
          initial={false}
          animate={animated ? {
            filter: [
              `url(#outerGlow-${variant})`,
              `url(#outerGlow-${variant})`,
            ]
          } : {}}
        />

        {/* Círculo interior (área de la casita) */}
        <circle
          cx="32"
          cy="28"
          r="20"
          fill={c.house}
          filter={`url(#innerShadow-${variant})`}
        />

        {/* Casita dentro del círculo */}
        <g transform="translate(18, 16)">
          {/* Techo */}
          <motion.path
            d="M14 4L2 14H26L14 4Z"
            fill={c.gradientStart}
            initial={false}
            animate={animated ? { y: [0, -0.5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Cuerpo de la casa */}
          <rect x="4" y="14" width="20" height="12" fill={c.gradientStart} rx="1" />

          {/* Ventana con barrotes (icónico de Honduras) */}
          <rect x="8" y="17" width="12" height="7" fill={c.house} rx="0.5" />

          {/* Barrotes verticales */}
          <line x1="12" y1="17" x2="12" y2="24" stroke={c.gradientEnd} strokeWidth="1.2" />
          <line x1="16" y1="17" x2="16" y2="24" stroke={c.gradientEnd} strokeWidth="1.2" />

          {/* Barrote horizontal */}
          <line x1="8" y1="20.5" x2="20" y2="20.5" stroke={c.gradientEnd} strokeWidth="1.2" />
        </g>

        {/* Punto brillante (estrella) - representa la pulpería como estrella */}
        {animated && (
          <motion.circle
            cx="32"
            cy="10"
            r="2"
            fill={c.accent}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </svg>

      {/* Glow effect animado */}
      {animated && (
        <motion.div
          className="absolute inset-0"
          style={{ borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' }}
          animate={{
            boxShadow: [
              '0 0 0px rgba(250, 82, 82, 0)',
              '0 0 20px rgba(250, 82, 82, 0.3)',
              '0 0 0px rgba(250, 82, 82, 0)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

/**
 * Logo grande para hero/splash screens
 */
export const LogoLarge = ({ className = '', animated = true }) => {
  return (
    <motion.div
      className={`flex flex-col items-center gap-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <LogoIcon size={120} animated={animated} />
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-white">La </span>
          <span className="text-gradient">Pulperia</span>
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

/**
 * Logo minimalista solo texto
 */
export const LogoText = ({ className = '', size = 'md' }) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`font-bold ${textSizes[size] || textSizes.md} ${className}`}>
      <span className="text-white">La </span>
      <span className="text-primary-500">Pulperia</span>
    </div>
  );
};

/**
 * Logo para loading/splash screen con animación completa
 */
export const LogoSplash = ({ onComplete }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1] // spring
        }}
      >
        <LogoIcon size={120} />
      </motion.div>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="text-white">La </span>
          <span className="text-primary-500">Pulperia</span>
        </h1>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="flex gap-1.5 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-500"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Logo;
