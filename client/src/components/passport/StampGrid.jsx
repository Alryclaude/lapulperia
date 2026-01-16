import { motion } from 'framer-motion';

const StampGrid = ({ stamps }) => {
  // Rellenar con placeholders vacíos para completar la grid visual
  const minSlots = 12;
  const totalSlots = Math.max(stamps.length + (3 - (stamps.length % 3 || 3)), minSlots);
  const slots = Array(totalSlots).fill(null).map((_, i) => stamps[i] || null);

  const rarityColors = {
    COMMON: 'border-gray-500/30',
    RARE: 'border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    LEGENDARY: 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]',
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {slots.map((stamp, index) => (
        <motion.div
          key={stamp ? stamp.id : `empty-${index}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
          className={`aspect-square rounded-xl border relative overflow-hidden group ${
            stamp
              ? `bg-dark-200/50 ${rarityColors[stamp.rarity] || rarityColors.COMMON}`
              : 'bg-white/[0.02] border-white/[0.05] border-dashed'
          }`}
        >
          {stamp ? (
            <>
              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Stamp Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                <div className="text-2xl mb-1 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  {stamp.icon || '🏪'}
                </div>
                <span className="text-[10px] font-semibold text-gray-300 leading-tight uppercase tracking-wider line-clamp-2">
                  {stamp.pulperiaName}
                </span>
                <span className="text-[8px] text-primary-400/80 font-mono mt-1">
                  {new Date(stamp.collectedAt).toLocaleDateString('es-HN', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Rarity Indicators */}
              {stamp.rarity === 'LEGENDARY' && (
                <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" />
              )}
              {stamp.rarity === 'RARE' && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-2xl text-gray-600">+</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default StampGrid;
