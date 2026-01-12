import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, Power } from 'lucide-react';

// REVAMP: Enhanced StatusToggle with vibrant glow effects
const StatusToggle = ({ isOpen, onToggle }) => {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      className={`relative flex items-center gap-3 px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 overflow-hidden ${
        isOpen
          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]'
          : 'bg-dark-100 text-gray-300 border border-white/[0.08] hover:border-red-500/30 hover:bg-dark-50'
      }`}
    >
      {/* Animated background glow */}
      {isOpen && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-transparent to-green-400/20"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      <div className="relative flex items-center gap-3">
        {isOpen ? (
          <>
            <div className="relative">
              <ToggleRight className="w-6 h-6" />
              <div className="absolute inset-0 w-6 h-6 bg-white/30 rounded-full blur-md animate-pulse" />
            </div>
            <span>ABIERTO</span>
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
          </>
        ) : (
          <>
            <Power className="w-5 h-5 text-gray-400" />
            <span>CERRADO</span>
            <div className="w-2.5 h-2.5 bg-gray-500 rounded-full" />
          </>
        )}
      </div>
    </motion.button>
  );
};

export default StatusToggle;
