import { motion } from 'framer-motion';
import { Store, TrendingUp, Star, Sparkles } from 'lucide-react';

// Progresión Visual del Negocio (PRIVADA - Solo el dueño lo ve)
// Nivel basado en actividad, no competencia
const LEVELS = [
  {
    level: 1,
    name: 'Nuevo',
    icon: '📦',
    description: 'Empezando tu camino',
    minActivity: 0,
    color: 'from-gray-500/20 to-gray-600/10',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-400',
  },
  {
    level: 2,
    name: 'Activo',
    icon: '🏪',
    description: 'Tu negocio está tomando forma',
    minActivity: 10,
    color: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
  {
    level: 3,
    name: 'Establecido',
    icon: '🏬',
    description: 'Clientes confían en ti',
    minActivity: 50,
    color: 'from-purple-500/20 to-purple-600/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
  },
  {
    level: 4,
    name: 'Próspero',
    icon: '🌟',
    description: '¡Tu negocio brilla!',
    minActivity: 100,
    color: 'from-amber-500/20 to-amber-600/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
  },
];

const BusinessLevel = ({
  activityCount = 0, // Número de transacciones/órdenes completadas
  showDetails = true,
  compact = false,
}) => {
  // Determinar nivel actual basado en actividad
  const getCurrentLevel = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (activityCount >= LEVELS[i].minActivity) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = LEVELS[currentLevel.level] || null;

  // Calcular progreso hacia el siguiente nivel
  const getProgress = () => {
    if (!nextLevel) return 100;
    const currentMin = currentLevel.minActivity;
    const nextMin = nextLevel.minActivity;
    const progress = ((activityCount - currentMin) / (nextMin - currentMin)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const progress = getProgress();

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${currentLevel.color} border ${currentLevel.borderColor}`}
      >
        <span className="text-lg">{currentLevel.icon}</span>
        <span className={`text-sm font-medium ${currentLevel.textColor}`}>
          {currentLevel.name}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 bg-gradient-to-br ${currentLevel.color} rounded-xl border ${currentLevel.borderColor}`}>
          <Store className={`w-5 h-5 ${currentLevel.textColor}`} />
        </div>
        <div>
          <h3 className="font-semibold text-white">Tu Negocio</h3>
          <p className="text-xs text-gray-500">Progreso privado</p>
        </div>
      </div>

      {/* Nivel actual */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-5xl mb-2"
        >
          {currentLevel.icon}
        </motion.div>
        <h4 className={`text-xl font-bold ${currentLevel.textColor}`}>
          Nivel {currentLevel.level}: {currentLevel.name}
        </h4>
        <p className="text-sm text-gray-500 mt-1">{currentLevel.description}</p>
      </div>

      {/* Barra de progreso */}
      {nextLevel && showDetails && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{activityCount} transacciones</span>
            <span>Siguiente: {nextLevel.minActivity}</span>
          </div>
          <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${currentLevel.color.replace('/20', '/60').replace('/10', '/40')}`}
            />
          </div>
          <p className="text-xs text-gray-600 text-center mt-2">
            {nextLevel.minActivity - activityCount} más para {nextLevel.name}
          </p>
        </div>
      )}

      {/* Logros desbloqueados (si nivel alto) */}
      {currentLevel.level >= 3 && showDetails && (
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-2">Logros desbloqueados</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
              <Sparkles className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">Primeros 50</span>
            </div>
            {currentLevel.level >= 4 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-400">Centenario</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nota de privacidad */}
      <p className="text-xs text-gray-600 text-center mt-4">
        🔒 Solo tú puedes ver esto
      </p>
    </motion.div>
  );
};

export default BusinessLevel;
