import { motion } from 'framer-motion';

// Professional La Pulperia Logo - Honduran storefront style
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

// Professional storefront icon with awning
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
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1625" />
            <stop offset="100%" stopColor="#0d0b11" />
          </linearGradient>
          <linearGradient id="awningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="awningStripe" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FECACA" />
            <stop offset="100%" stopColor="#FCA5A5" />
          </linearGradient>
          <linearGradient id="doorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
        </defs>

        {/* Background */}
        <circle cx="32" cy="32" r="30" fill="url(#bgGradient)" stroke="#DC2626" strokeWidth="2" />

        {/* Store building */}
        <rect x="14" y="28" width="36" height="24" rx="2" fill="#1e1b29" stroke="#3b3555" strokeWidth="1" />

        {/* Awning - striped canopy */}
        <path
          d="M10 28 L32 16 L54 28 L54 32 L10 32 Z"
          fill="url(#awningGradient)"
        />

        {/* Awning stripes */}
        <path d="M14 28 L32 18 L32 22 L18 30 L14 30 Z" fill="url(#awningStripe)" opacity="0.3" />
        <path d="M26 22 L32 18 L38 22 L32 26 Z" fill="url(#awningStripe)" opacity="0.2" />
        <path d="M46 30 L50 28 L50 30 Z" fill="url(#awningStripe)" opacity="0.3" />

        {/* Awning scalloped edge */}
        <path
          d="M10 32 Q14 35, 18 32 Q22 35, 26 32 Q30 35, 34 32 Q38 35, 42 32 Q46 35, 50 32 Q54 35, 54 32"
          fill="none"
          stroke="#B91C1C"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Door frame */}
        <rect x="26" y="36" width="12" height="16" rx="1" fill="#2d2843" stroke="#4a4566" strokeWidth="0.5" />

        {/* Door */}
        <motion.rect
          x="27"
          y="37"
          width="10"
          height="14"
          rx="0.5"
          fill="url(#doorGradient)"
          animate={animated ? {
            opacity: [0.9, 1, 0.9],
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Door handle */}
        <circle cx="35" cy="44" r="1.2" fill="#FFD700" />

        {/* Windows */}
        <g>
          {/* Left window */}
          <rect x="16" y="34" width="8" height="8" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
          <rect x="17" y="35" width="2.5" height="2.5" rx="0.5" fill="#007FFF" opacity="0.7" />
          <rect x="20.5" y="35" width="2.5" height="2.5" rx="0.5" fill="#007FFF" opacity="0.6" />
          <rect x="17" y="38.5" width="2.5" height="2.5" rx="0.5" fill="#007FFF" opacity="0.5" />
          <rect x="20.5" y="38.5" width="2.5" height="2.5" rx="0.5" fill="#007FFF" opacity="0.8" />

          {/* Right window */}
          <rect x="40" y="34" width="8" height="8" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
          <rect x="41" y="35" width="2.5" height="2.5" rx="0.5" fill="#007FFF" opacity="0.6" />
          <rect x="44.5" y="35" width="2.5" height="2.5" rx="0.5" fill="#007FFF" opacity="0.8" />
          <rect x="41" y="38.5" width="2.5" height="2.5" rx="0.5" fill="#007FFF" opacity="0.7" />
          <rect x="44.5" y="38.5" width="2.5" height="2.5" rx="0.5" fill="#007FFF" opacity="0.5" />
        </g>

        {/* Store sign */}
        <rect x="20" y="29" width="24" height="5" rx="1" fill="#2d2843" stroke="#DC2626" strokeWidth="0.5" />
        <motion.text
          x="32"
          y="33"
          textAnchor="middle"
          fill="#DC2626"
          fontSize="4"
          fontWeight="bold"
          fontFamily="system-ui"
          animate={animated ? { opacity: [0.8, 1, 0.8] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          PULPERIA
        </motion.text>

        {/* Welcome mat */}
        <rect x="27" y="51" width="10" height="2" rx="0.5" fill="#8B4513" opacity="0.6" />
      </svg>

      {/* Glow effect */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 0px rgba(220, 38, 38, 0)',
              '0 0 15px rgba(220, 38, 38, 0.3)',
              '0 0 0px rgba(220, 38, 38, 0)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Open indicator */}
      {animated && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-dark-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};

// Large logo for hero/splash screens
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
