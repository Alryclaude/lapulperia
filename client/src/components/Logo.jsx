import { motion } from 'framer-motion';

// Minimalist Logo - Clean storefront icon
export const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-2xl' },
    xl: { icon: 80, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={icon} />
      {showText && (
        <span className={`font-bold ${text}`}>
          <span className="text-white">La </span>
          <span className="text-primary-500">Pulperia</span>
        </span>
      )}
    </div>
  );
};

// Minimalist storefront icon
export const LogoIcon = ({ size = 40, className = '', animated = true }) => {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle cx="24" cy="24" r="23" fill="#1a1625" stroke="#DC2626" strokeWidth="1.5" />

        {/* Roof - simple triangle */}
        <path
          d="M10 22 L24 10 L38 22"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Roof fill with subtle color */}
        <path
          d="M12 22 L24 12 L36 22 Z"
          fill="#DC2626"
          opacity="0.15"
        />

        {/* House body */}
        <path
          d="M12 22 L12 38 L36 38 L36 22"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Door */}
        <motion.rect
          x="20"
          y="26"
          width="8"
          height="12"
          rx="1"
          fill="#DC2626"
          opacity="0.9"
          animate={animated ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Door knob */}
        <circle cx="26" cy="32" r="1.2" fill="#FFD700" />

        {/* Window left */}
        <rect
          x="14"
          y="26"
          width="4"
          height="4"
          rx="0.5"
          fill="#3B82F6"
          opacity="0.8"
        />

        {/* Window right */}
        <rect
          x="30"
          y="26"
          width="4"
          height="4"
          rx="0.5"
          fill="#3B82F6"
          opacity="0.8"
        />
      </svg>

      {/* Optional sparkle indicator */}
      {animated && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-yellow-400"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};

// Logo for hero/splash screens
export const LogoLarge = ({ className = '' }) => {
  return (
    <motion.div
      className={`flex flex-col items-center gap-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <LogoIcon size={100} />
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          <span className="text-white">La </span>
          <span className="text-primary-500">Pulperia</span>
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Tu tienda de barrio, digital</p>
      </div>
    </motion.div>
  );
};

export default Logo;
