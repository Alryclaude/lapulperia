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

// Icono SVG de pulpería hondureña típica
export const LogoIcon = ({ size = 48, className = '' }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Base/Piso de cemento */}
        <rect x="12" y="88" width="76" height="5" rx="1" fill="#6B7280" />

        {/* Paredes de la pulpería */}
        <rect x="15" y="42" width="70" height="48" rx="2" fill="#FEF3C7" />
        <rect x="15" y="42" width="70" height="48" rx="2" fill="url(#wallGradientHN)" />

        {/* Techo de lámina/zinc corrugado */}
        <path
          d="M8 44 L50 22 L92 44 L92 48 L50 28 L8 48 Z"
          fill="#71717A"
        />
        <path
          d="M8 44 L50 22 L92 44 L92 48 L50 28 L8 48 Z"
          fill="url(#zincGradient)"
        />

        {/* Líneas del zinc corrugado */}
        <line x1="20" y1="42" x2="35" y2="30" stroke="#52525B" strokeWidth="0.8" />
        <line x1="32" y1="42" x2="43" y2="32" stroke="#52525B" strokeWidth="0.8" />
        <line x1="44" y1="42" x2="50" y2="35" stroke="#52525B" strokeWidth="0.8" />
        <line x1="56" y1="42" x2="50" y2="35" stroke="#52525B" strokeWidth="0.8" />
        <line x1="68" y1="42" x2="57" y2="32" stroke="#52525B" strokeWidth="0.8" />
        <line x1="80" y1="42" x2="65" y2="30" stroke="#52525B" strokeWidth="0.8" />

        {/* Borde inferior del techo */}
        <line x1="8" y1="48" x2="92" y2="48" stroke="#52525B" strokeWidth="2" />

        {/* Letrero "PULPERIA" */}
        <rect x="28" y="50" width="44" height="10" rx="1" fill="#DC2626" />
        <rect x="28" y="50" width="44" height="10" rx="1" fill="url(#signGradient)" />
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="white"
          fontSize="6"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          PULPERIA
        </text>

        {/* Ventana izquierda (azul hondureño) */}
        <rect x="20" y="63" width="14" height="12" rx="1" fill="#1E40AF" />
        <line x1="27" y1="63" x2="27" y2="75" stroke="#3B82F6" strokeWidth="1.5" />
        <line x1="20" y1="69" x2="34" y2="69" stroke="#3B82F6" strokeWidth="1.5" />
        {/* Brillo de ventana */}
        <rect x="21" y="64" width="5" height="4" fill="#60A5FA" opacity="0.4" />

        {/* Ventana derecha */}
        <rect x="66" y="63" width="14" height="12" rx="1" fill="#1E40AF" />
        <line x1="73" y1="63" x2="73" y2="75" stroke="#3B82F6" strokeWidth="1.5" />
        <line x1="66" y1="69" x2="80" y2="69" stroke="#3B82F6" strokeWidth="1.5" />
        {/* Brillo de ventana */}
        <rect x="67" y="64" width="5" height="4" fill="#60A5FA" opacity="0.4" />

        {/* Mostrador/Counter */}
        <rect x="36" y="77" width="28" height="3" rx="0.5" fill="#78350F" />

        {/* Productos en el mostrador */}
        {/* Baleada (tortilla doblada) */}
        <ellipse cx="42" cy="75" rx="4" ry="2" fill="#D97706" />
        <path d="M38 75 Q42 73 46 75" stroke="#92400E" strokeWidth="0.5" fill="none" />

        {/* Tajadas (plátanos fritos) */}
        <rect x="48" y="73" width="2" height="4" rx="0.5" fill="#EAB308" transform="rotate(-10 49 75)" />
        <rect x="51" y="73" width="2" height="4" rx="0.5" fill="#CA8A04" transform="rotate(5 52 75)" />
        <rect x="54" y="73" width="2" height="4" rx="0.5" fill="#EAB308" transform="rotate(-5 55 75)" />

        {/* Botellas de refresco */}
        {/* Botella roja (Coca) */}
        <rect x="59" y="71" width="3" height="6" rx="0.5" fill="#DC2626" />
        <rect x="59.5" y="70" width="2" height="2" rx="0.3" fill="#7F1D1D" />

        {/* Botella verde (fresco) */}
        <rect x="63" y="71" width="3" height="6" rx="0.5" fill="#16A34A" />
        <rect x="63.5" y="70" width="2" height="2" rx="0.3" fill="#14532D" />

        {/* Puerta café */}
        <rect x="40" y="80" width="20" height="10" fill="#92400E" />
        <rect x="40" y="80" width="20" height="10" fill="url(#doorGradientHN)" />

        {/* Marco de puerta */}
        <rect x="39" y="79" width="22" height="1" fill="#78350F" />
        <rect x="39" y="80" width="1" height="10" fill="#78350F" />
        <rect x="60" y="80" width="1" height="10" fill="#78350F" />

        {/* Perilla dorada */}
        <circle cx="57" cy="85" r="1.5" fill="#F59E0B" />
        <circle cx="57" cy="85" r="0.8" fill="#FCD34D" />

        {/* Gradientes */}
        <defs>
          <linearGradient id="wallGradientHN" x1="50" y1="42" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#92400E" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="zincGradient" x1="50" y1="22" x2="50" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A1A1AA" />
            <stop offset="50%" stopColor="#71717A" />
            <stop offset="100%" stopColor="#52525B" />
          </linearGradient>
          <linearGradient id="signGradient" x1="50" y1="50" x2="50" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="doorGradientHN" x1="50" y1="80" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
      </svg>

      {/* Estrellas animadas doradas */}
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

// Forma de estrella de 4 puntas dorada
const StarShape = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
      fill="#FFD700"
      filter="url(#starGlow)"
    />
    <defs>
      <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
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
