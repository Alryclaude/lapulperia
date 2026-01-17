import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Timeline visual para mostrar el progreso de una orden
 */
const OrderTimelineVisual = ({ currentStatus, compact = false }) => {
  const steps = [
    { key: 'PENDING', label: 'Recibida' },
    { key: 'ACCEPTED', label: 'Aceptada' },
    { key: 'PREPARING', label: 'Preparando' },
    { key: 'READY', label: 'Lista' },
    { key: 'DELIVERED', label: 'Entregada' },
  ];

  // Cancelado muestra estado especial
  if (currentStatus === 'CANCELLED') {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-red-400 font-medium">Cancelada</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex(s => s.key === currentStatus);

  if (compact) {
    // Versión compacta: solo puntos
    return (
      <div className="flex items-center gap-1">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <motion.div
              key={step.key}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`w-2 h-2 rounded-full transition-colors ${
                isCompleted
                  ? 'bg-green-500'
                  : isCurrent
                  ? 'bg-primary-500 animate-pulse'
                  : 'bg-gray-600'
              }`}
              title={step.label}
            />
          );
        })}
      </div>
    );
  }

  // Versión completa con etiquetas
  return (
    <div className="flex flex-col gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3"
          >
            {/* Círculo del paso */}
            <div
              className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isCompleted
                  ? 'bg-green-500 border-green-500'
                  : isCurrent
                  ? 'bg-primary-500 border-primary-500 animate-pulse'
                  : 'bg-transparent border-gray-600'
              }`}
            >
              {isCompleted && <Check className="w-3 h-3 text-white" />}
              {isCurrent && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>

            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-2.5 top-5 w-0.5 h-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-600'
                }`}
                style={{ transform: 'translateX(-50%)' }}
              />
            )}

            {/* Etiqueta */}
            <span
              className={`text-sm ${
                isCompleted
                  ? 'text-green-400'
                  : isCurrent
                  ? 'text-white font-medium'
                  : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OrderTimelineVisual;
