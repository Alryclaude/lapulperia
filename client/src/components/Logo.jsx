import { motion } from 'framer-motion';

// Logo de La Pulpería - Pulpería hondureña típica con estrellas
export const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 48, text: 'text-xl' },
    lg: { icon: 64, text: 'text-2xl' },
    xl: { icon: 96, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon size={icon} />
      {showText && (
        <span className={`font-bold ${text}`}>
          <span className="text-white">La </span>
          <span className="text-primary-500">Pulpería</span>
        </span>
      )}
    </div>
  );
};

// Icono SVG de pulpería hondureña típica - Versión mejorada
export const LogoIcon = ({ size = 48, className = '' }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Fondo circular oscuro para mejor contraste */}
        <circle cx="50" cy="50" r="48" fill="#0D0B11" />
        <circle cx="50" cy="50" r="48" fill="url(#bgGradient)" />

        {/* Silueta de montañas hondureñas al fondo */}
        <path
          d="M5 65 L20 50 L35 58 L50 42 L65 55 L80 48 L95 60 L95 90 L5 90 Z"
          fill="#1a1722"
          opacity="0.6"
        />

        {/* Base/Piso */}
        <rect x="18" y="84" width="64" height="4" rx="1" fill="#4B5563" />

        {/* Paredes de la pulpería */}
        <rect x="22" y="48" width="56" height="38" rx="2" fill="#FEF3C7" />
        <rect x="22" y="48" width="56" height="38" rx="2" fill="url(#wallGradientHN)" />

        {/* Techo de lámina/zinc corrugado - más limpio */}
        <path
          d="M14 50 L50 28 L86 50 L86 54 L50 34 L14 54 Z"
          fill="url(#zincGradient)"
        />

        {/* Líneas del zinc - simplificadas */}
        <line x1="28" y1="48" x2="40" y2="38" stroke="#52525B" strokeWidth="1" />
        <line x1="50" y1="48" x2="50" y2="34" stroke="#52525B" strokeWidth="1" />
        <line x1="72" y1="48" x2="60" y2="38" stroke="#52525B" strokeWidth="1" />

        {/* Borde inferior del techo */}
        <line x1="14" y1="54" x2="86" y2="54" stroke="#3F3F46" strokeWidth="2" />

        {/* Letrero "PULPERIA" - más grande y legible */}
        <rect x="30" y="56" width="40" height="12" rx="2" fill="url(#signGradient)" />
        <rect x="30" y="56" width="40" height="12" rx="2" stroke="#B91C1C" strokeWidth="0.5" />
        <text
          x="50"
          y="65"
          textAnchor="middle"
          fill="white"
          fontSize="7"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          letterSpacing="0.5"
        >
          PULPERIA
        </text>

        {/* Ventana izquierda (azul hondureño) - simplificada */}
        <rect x="26" y="70" width="12" height="10" rx="1" fill="#1E40AF" />
        <line x1="32" y1="70" x2="32" y2="80" stroke="#3B82F6" strokeWidth="1.5" />
        <line x1="26" y1="75" x2="38" y2="75" stroke="#3B82F6" strokeWidth="1.5" />
        <rect x="27" y="71" width="4" height="3" fill="#60A5FA" opacity="0.5" />

        {/* Ventana derecha */}
        <rect x="62" y="70" width="12" height="10" rx="1" fill="#1E40AF" />
        <line x1="68" y1="70" x2="68" y2="80" stroke="#3B82F6" strokeWidth="1.5" />
        <line x1="62" y1="75" x2="74" y2="75" stroke="#3B82F6" strokeWidth="1.5" />
        <rect x="63" y="71" width="4" height="3" fill="#60A5FA" opacity="0.5" />

        {/* Puerta con textura de madera */}
        <rect x="42" y="72" width="16" height="14" fill="url(#doorGradientHN)" rx="1" />

        {/* Textura de madera en puerta */}
        <line x1="45" y1="72" x2="45" y2="86" stroke="#78350F" strokeWidth="0.5" opacity="0.5" />
        <line x1="50" y1="72" x2="50" y2="86" stroke="#78350F" strokeWidth="0.5" opacity="0.5" />
        <line x1="55" y1="72" x2="55" y2="86" stroke="#78350F" strokeWidth="0.5" opacity="0.5" />

        {/* Marco de puerta */}
        <rect x="41" y="71" width="18" height="1" fill="#5C3D2E" />
        <rect x="41" y="72" width="1" height="14" fill="#5C3D2E" />
        <rect x="58" y="72" width="1" height="14" fill="#5C3D2E" />

        {/* Perilla dorada brillante */}
        <circle cx="55" cy="79" r="2" fill="url(#knobGradient)" />
        <circle cx="54.5" cy="78.5" r="0.5" fill="#FEF3C7" opacity="0.8" />

        {/* Estrellas integradas en SVG */}
        <path d="M82 22 L83 25 L86 26 L83 27 L82 30 L81 27 L78 26 L81 25 Z" fill="#FFD700" />
        <path d="M75 16 L76 18 L78 18 L76 19 L75 21 L74 19 L72 18 L74 18 Z" fill="#FFD700" opacity="0.7" />
        <path d="M88 32 L88.5 34 L90.5 34.5 L88.5 35 L88 37 L87.5 35 L85.5 34.5 L87.5 34 Z" fill="#FFD700" opacity="0.5" />

        {/* Gradientes mejorados */}
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#1a1722" />
            <stop offset="100%" stopColor="#0D0B11" />
          </radialGradient>
          <linearGradient id="wallGradientHN" x1="50" y1="48" x2="50" y2="86" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#92400E" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="zincGradient" x1="50" y1="28" x2="50" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A1A1AA" />
            <stop offset="40%" stopColor="#71717A" />
            <stop offset="100%" stopColor="#52525B" />
          </linearGradient>
          <linearGradient id="signGradient" x1="50" y1="56" x2="50" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="doorGradientHN" x1="50" y1="72" x2="50" y2="86" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="50%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <radialGradient id="knobGradient" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
        </defs>
      </svg>

      {/* Estrellas animadas externas (más brillantes) */}
      <Stars />
    </div>
  );
};

// Estrellas con animación twinkle - más brillantes
const Stars = () => {
  return (
    <>
      {/* Estrella grande - brillante */}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [0.9, 1.3, 0.9],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <StarShape size={18} glow />
      </motion.div>

      {/* Estrella mediana */}
      <motion.div
        className="absolute top-1 right-4"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.6,
        }}
      >
        <StarShape size={12} />
      </motion.div>

      {/* Estrella pequeña */}
      <motion.div
        className="absolute -top-0.5 right-8"
        animate={{
          opacity: [0.4, 0.9, 0.4],
          scale: [0.85, 1.15, 0.85],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.2,
        }}
      >
        <StarShape size={8} />
      </motion.div>
    </>
  );
};

// Forma de estrella de 4 puntas dorada - mejorada
const StarShape = ({ size = 12, glow = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={glow ? 'drop-shadow-[0_0_4px_rgba(255,215,0,0.8)]' : ''}>
    <path
      d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
      fill="url(#starGradient)"
    />
    <defs>
      <linearGradient id="starGradient" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFEA00" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFC107" />
      </linearGradient>
    </defs>
  </svg>
);

// Logo grande para splash/hero
export const LogoLarge = ({ className = '' }) => {
  return (
    <motion.div
      className={`flex flex-col items-center gap-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <LogoIcon size={120} />
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          <span className="text-white">La </span>
          <span className="text-primary-500">Pulpería</span>
        </h1>
        <p className="text-gray-400 mt-2 text-lg">¿Qué deseaba?</p>
      </div>
    </motion.div>
  );
};

export default Logo;
