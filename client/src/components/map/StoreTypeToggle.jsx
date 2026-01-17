import { motion } from 'framer-motion';

const STORE_TYPES = [
  { id: 'all', label: 'Todos', emoji: '✨' },
  { id: 'local', label: 'Físico', emoji: '🏪' },
  { id: 'online', label: 'Online', emoji: '🌐' },
];

const StoreTypeToggle = ({ selected = 'all', onChange, counts = {} }) => {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-dark-100/90 backdrop-blur-md rounded-xl border border-white/10">
      {STORE_TYPES.map((type) => {
        const isActive = selected === type.id;
        const count = counts[type.id] || 0;

        return (
          <motion.button
            key={type.id}
            onClick={() => onChange(type.id)}
            whileTap={{ scale: 0.95 }}
            className={`
              relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <span>{type.emoji}</span>
            <span className="hidden sm:inline">{type.label}</span>
            {count > 0 && isActive && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-xs">
                {count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="storeTypeIndicator"
                className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default StoreTypeToggle;
