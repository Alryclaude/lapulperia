import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'Todos', emoji: '✨', color: 'from-gray-500/30 to-gray-600/20 border-gray-500/40 text-gray-300' },
  { id: 'comida', label: 'Comer', emoji: '🍽️', color: 'from-amber-500/30 to-amber-600/20 border-amber-500/40 text-amber-300' },
  { id: 'mercado', label: 'Comprar', emoji: '🛒', color: 'from-cyan-500/30 to-cyan-600/20 border-cyan-500/40 text-cyan-300' },
  { id: 'servicios', label: 'Servicios', emoji: '🔧', color: 'from-blue-500/30 to-blue-600/20 border-blue-500/40 text-blue-300' },
  { id: 'oferta', label: 'Ofertas', emoji: '🔥', color: 'from-pink-500/30 to-pink-600/20 border-pink-500/40 text-pink-300' },
];

const CategoryPills = ({ selected = 'all', onChange, counts = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="absolute top-4 left-0 right-0 z-[500] px-4"
    >
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
        {CATEGORIES.map((category) => {
          const isActive = selected === category.id;
          const count = counts[category.id] || 0;

          return (
            <motion.button
              key={category.id}
              onClick={() => onChange(category.id)}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                whitespace-nowrap transition-all duration-200
                backdrop-blur-md border
                ${isActive
                  ? `bg-gradient-to-br ${category.color} shadow-lg`
                  : 'bg-dark-100/80 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }
              `}
            >
              <span>{category.emoji}</span>
              <span>{category.label}</span>
              {count > 0 && isActive && (
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-xs">
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CategoryPills;
