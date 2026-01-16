import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Celebración sutil - Confeti y animaciones satisfactorias
// Para momentos de logro (venta completada, meta alcanzada, etc.)

// Partícula de confeti individual
const ConfettiPiece = ({ delay, startX, color }) => {
  const randomRotation = Math.random() * 360;
  const randomScale = 0.5 + Math.random() * 0.5;
  const endX = startX + (Math.random() - 0.5) * 100;

  return (
    <motion.div
      initial={{
        opacity: 1,
        y: -20,
        x: startX,
        rotate: 0,
        scale: randomScale,
      }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, 150, 300],
        x: [startX, endX, endX + (Math.random() - 0.5) * 50],
        rotate: randomRotation + 360 * (Math.random() > 0.5 ? 1 : -1),
      }}
      transition={{
        duration: 2 + Math.random(),
        delay,
        ease: 'easeOut',
      }}
      className="absolute top-0 pointer-events-none"
      style={{
        width: 8 + Math.random() * 4,
        height: 8 + Math.random() * 4,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
    />
  );
};

// Animación de pulso de éxito
const SuccessPulse = ({ show, onComplete }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onAnimationComplete={onComplete}
        className="fixed inset-0 m-auto w-20 h-20 rounded-full bg-green-500/30 pointer-events-none z-50"
      />
    )}
  </AnimatePresence>
);

// Checkmark animado
const AnimatedCheckmark = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed inset-0 m-auto w-16 h-16 flex items-center justify-center z-50 pointer-events-none"
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.4 }}
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-white"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            />
          </motion.svg>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Componente principal de celebración
const CelebrationAnimation = ({
  trigger = false,
  type = 'confetti', // 'confetti' | 'pulse' | 'checkmark' | 'full'
  duration = 2000,
  onComplete,
  colors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'],
}) => {
  const [isActive, setIsActive] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const generateConfetti = useCallback(() => {
    const pieces = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      pieces.push({
        id: i,
        delay: Math.random() * 0.3,
        startX: Math.random() * (window.innerWidth || 300),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setConfettiPieces(pieces);
  }, [colors]);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);

      if (type === 'confetti' || type === 'full') {
        generateConfetti();
      }

      const timer = setTimeout(() => {
        setIsActive(false);
        setConfettiPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, isActive, type, duration, onComplete, generateConfetti]);

  // Vibración táctil sutil (si está disponible)
  useEffect(() => {
    if (trigger && navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  }, [trigger]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Confeti */}
      {(type === 'confetti' || type === 'full') && (
        <div className="absolute inset-0">
          {confettiPieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              delay={piece.delay}
              startX={piece.startX}
              color={piece.color}
            />
          ))}
        </div>
      )}

      {/* Pulso */}
      {(type === 'pulse' || type === 'full') && (
        <SuccessPulse show={isActive} />
      )}

      {/* Checkmark */}
      {(type === 'checkmark' || type === 'full') && (
        <AnimatedCheckmark show={isActive} />
      )}
    </div>
  );
};

// Hook para usar celebraciones fácilmente
export const useCelebration = () => {
  const [celebrationState, setCelebrationState] = useState({
    active: false,
    type: 'confetti',
  });

  const celebrate = useCallback((type = 'confetti') => {
    setCelebrationState({ active: true, type });
  }, []);

  const onComplete = useCallback(() => {
    setCelebrationState({ active: false, type: 'confetti' });
  }, []);

  return {
    celebrate,
    CelebrationComponent: () => (
      <CelebrationAnimation
        trigger={celebrationState.active}
        type={celebrationState.type}
        onComplete={onComplete}
      />
    ),
  };
};

export default CelebrationAnimation;
