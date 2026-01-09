import { motion } from 'framer-motion';

// Logo de La Pulpería - Casita con estrellas
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

// Icono SVG de la casita
export const LogoIcon = ({ size = 48, className = '' }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Base/Piso */}
        <rect x="15" y="85" width="70" height="6" rx="2" fill="#78350F" />

        {/* Paredes */}
        <rect x="20" y="45" width="60" height="42" rx="4" fill="#FEF3C7" />

        {/* Sombra interior paredes */}
        <rect x="20" y="45" width="60" height="42" rx="4" fill="url(#wallGradient)" />

        {/* Techo rojo ondulado */}
        <path
          d="M10 48 C20 38, 35 42, 50 38 C65 34, 80 40, 90 48 L90 52 C80 46, 65 42, 50 46 C35 50, 20 44, 10 52 Z"
          fill="#DC2626"
        />
        <path
          d="M10 48 C20 38, 35 42, 50 38 C65 34, 80 40, 90 48 L90 52 C80 46, 65 42, 50 46 C35 50, 20 44, 10 52 Z"
          fill="url(#roofGradient)"
        />

        {/* Borde del techo */}
        <path
          d="M8 52 C18 44, 35 48, 50 44 C65 40, 82 46, 92 52"
          stroke="#B91C1C"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Ventana izquierda */}
        <rect x="26" y="55" width="16" height="16" rx="2" fill="#1E3A5F" />
        <line x1="34" y1="55" x2="34" y2="71" stroke="#2D4A6F" strokeWidth="2" />
        <line x1="26" y1="63" x2="42" y2="63" stroke="#2D4A6F" strokeWidth="2" />

        {/* Ventana derecha */}
        <rect x="58" y="55" width="16" height="16" rx="2" fill="#1E3A5F" />
        <line x1="66" y1="55" x2="66" y2="71" stroke="#2D4A6F" strokeWidth="2" />
        <line x1="58" y1="63" x2="74" y2="63" stroke="#2D4A6F" strokeWidth="2" />

        {/* Puerta */}
        <rect x="42" y="60" width="16" height="27" rx="8 8 0 0" fill="#92400E" />
        <rect x="42" y="60" width="16" height="27" rx="8 8 0 0" fill="url(#doorGradient)" />

        {/* Perilla de la puerta */}
        <circle cx="54" cy="75" r="2" fill="#F59E0B" />

        {/* Gradientes */}
        <defs>
          <linearGradient id="wallGradient" x1="50" y1="45" x2="50" y2="87" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#92400E" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="roofGradient" x1="50" y1="34" x2="50" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="doorGradient" x1="50" y1="60" x2="50" y2="87" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
      </svg>

      {/* Estrellas animadas */}
      <Stars />
    </div>
  );
};

// Estrellas con animación twinkle
const Stars = () => {
  const starVariants = {
    twinkle: {
      opacity: [0.4, 1, 0.4],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <>
      {/* Estrella grande */}
      <motion.div
        className="absolute -top-1 -right-1"
        variants={starVariants}
        animate="twinkle"
      >
        <StarShape size={16} />
      </motion.div>

      {/* Estrella mediana */}
      <motion.div
        className="absolute top-2 right-3"
        variants={starVariants}
        animate="twinkle"
        style={{ animationDelay: '0.5s' }}
        initial={{ opacity: 0.6 }}
      >
        <StarShape size={10} />
      </motion.div>

      {/* Estrella pequeña */}
      <motion.div
        className="absolute top-0 right-6"
        variants={starVariants}
        animate="twinkle"
        style={{ animationDelay: '1s' }}
        initial={{ opacity: 0.4 }}
      >
        <StarShape size={6} />
      </motion.div>
    </>
  );
};

// Forma de estrella de 4 puntas
const StarShape = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
      fill="#FFD700"
      filter="url(#glow)"
    />
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
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
