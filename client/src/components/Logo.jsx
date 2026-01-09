import { motion } from 'framer-motion';

// Logo de La Pulpería - Estilo 3D casita hondureña
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

// Icono SVG de pulpería estilo 3D - Casita hondureña
export const LogoIcon = ({ size = 48, className = '' }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Fondo circular oscuro */}
        <circle cx="50" cy="50" r="48" fill="#1a1625" />

        {/* Sombra de la casa */}
        <ellipse cx="50" cy="88" rx="28" ry="5" fill="#0d0a12" opacity="0.5" />

        {/* Pared principal - crema/beige con efecto 3D */}
        <path
          d="M24 45 L24 82 L76 82 L76 45 L50 28 Z"
          fill="url(#wallGradient3D)"
        />

        {/* Lado derecho de la pared (sombra 3D) */}
        <path
          d="M76 45 L76 82 L82 78 L82 42 Z"
          fill="#C4A574"
        />

        {/* Techo rojo/terracota con efecto 3D */}
        <path
          d="M18 48 L50 22 L82 48 L76 48 L50 28 L24 48 Z"
          fill="url(#roofGradient3D)"
        />

        {/* Borde superior del techo */}
        <path
          d="M16 50 L50 20 L84 50 L82 48 L50 22 L18 48 Z"
          fill="#8B2323"
        />

        {/* Lado derecho del techo (sombra) */}
        <path
          d="M82 48 L84 50 L88 47 L85 44 Z"
          fill="#6B1A1A"
        />

        {/* Ventana izquierda - azul */}
        <rect x="30" y="52" width="14" height="12" rx="1" fill="#1E3A5F" />
        <rect x="31" y="53" width="12" height="10" rx="1" fill="url(#windowGradient)" />
        {/* Marco de ventana */}
        <line x1="37" y1="53" x2="37" y2="63" stroke="#87CEEB" strokeWidth="1.5" />
        <line x1="31" y1="58" x2="43" y2="58" stroke="#87CEEB" strokeWidth="1.5" />
        {/* Reflejo de ventana */}
        <rect x="32" y="54" width="4" height="3" fill="white" opacity="0.3" rx="0.5" />

        {/* Ventana derecha - azul */}
        <rect x="56" y="52" width="14" height="12" rx="1" fill="#1E3A5F" />
        <rect x="57" y="53" width="12" height="10" rx="1" fill="url(#windowGradient)" />
        {/* Marco de ventana */}
        <line x1="63" y1="53" x2="63" y2="63" stroke="#87CEEB" strokeWidth="1.5" />
        <line x1="57" y1="58" x2="69" y2="58" stroke="#87CEEB" strokeWidth="1.5" />
        {/* Reflejo de ventana */}
        <rect x="58" y="54" width="4" height="3" fill="white" opacity="0.3" rx="0.5" />

        {/* Puerta - marrón con efecto madera */}
        <rect x="40" y="58" width="20" height="24" rx="2" fill="url(#doorGradient3D)" />

        {/* Detalles de puerta (paneles) */}
        <rect x="43" y="61" width="6" height="8" rx="1" fill="#5D3A1A" opacity="0.5" />
        <rect x="51" y="61" width="6" height="8" rx="1" fill="#5D3A1A" opacity="0.5" />
        <rect x="43" y="71" width="6" height="8" rx="1" fill="#5D3A1A" opacity="0.5" />
        <rect x="51" y="71" width="6" height="8" rx="1" fill="#5D3A1A" opacity="0.5" />

        {/* Perilla de puerta */}
        <circle cx="56" cy="70" r="2" fill="url(#knobGradient3D)" />
        <circle cx="55.5" cy="69.5" r="0.5" fill="#FFF8DC" opacity="0.8" />

        {/* Línea de base/piso */}
        <rect x="22" y="82" width="60" height="3" rx="1" fill="#2D2D2D" />

        {/* Gradientes */}
        <defs>
          <linearGradient id="wallGradient3D" x1="24" y1="28" x2="24" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5E6C8" />
            <stop offset="50%" stopColor="#E8D4B0" />
            <stop offset="100%" stopColor="#D4C4A0" />
          </linearGradient>

          <linearGradient id="roofGradient3D" x1="50" y1="22" x2="50" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CD5C5C" />
            <stop offset="30%" stopColor="#B94545" />
            <stop offset="70%" stopColor="#A33030" />
            <stop offset="100%" stopColor="#8B2323" />
          </linearGradient>

          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A90B8" />
            <stop offset="50%" stopColor="#3A7CA5" />
            <stop offset="100%" stopColor="#2E6B94" />
          </linearGradient>

          <linearGradient id="doorGradient3D" x1="40" y1="58" x2="60" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="30%" stopColor="#7A5C12" />
            <stop offset="70%" stopColor="#6B4F10" />
            <stop offset="100%" stopColor="#5C420E" />
          </linearGradient>

          <radialGradient id="knobGradient3D" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </radialGradient>
        </defs>
      </svg>

      {/* Estrellas animadas */}
      <Stars />
    </div>
  );
};

// Estrellas con animación twinkle
const Stars = () => {
  return (
    <>
      {/* Estrella grande */}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{
          opacity: [0.7, 1, 0.7],
          scale: [0.95, 1.15, 0.95],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <StarShape size={16} glow />
      </motion.div>

      {/* Estrella pequeña */}
      <motion.div
        className="absolute top-2 right-4"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.9, 1.1, 0.9],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      >
        <StarShape size={10} />
      </motion.div>
    </>
  );
};

// Forma de estrella de 4 puntas dorada con sparkle
const StarShape = ({ size = 12, glow = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={glow ? 'drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]' : 'drop-shadow-[0_0_3px_rgba(255,215,0,0.5)]'}
  >
    <path
      d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
      fill="url(#starGradientNew)"
    />
    {/* Sparkle central */}
    <circle cx="12" cy="12" r="2" fill="#FFFACD" opacity="0.9" />
    <defs>
      <linearGradient id="starGradientNew" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE55C" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
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
        <p className="text-gray-400 mt-2 text-lg">Tu tienda de barrio, digital</p>
      </div>
    </motion.div>
  );
};

export default Logo;
