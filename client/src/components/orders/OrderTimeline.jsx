import { motion } from 'framer-motion';
import {
  ClipboardList,
  CheckCircle2,
  ChefHat,
  Package,
  Home,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OrderTimeline - Constelacion de Barrio Design System
 *
 * Timeline visual horizontal para estados de pedido
 * Los estados completados brillan, el actual pulsa
 */

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Pendiente', icon: ClipboardList },
  { key: 'ACCEPTED', label: 'Aceptado', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Preparando', icon: ChefHat },
  { key: 'READY', label: 'Listo', icon: Package },
  { key: 'DELIVERED', label: 'Entregado', icon: Home },
];

const statusColors = {
  PENDING: {
    bg: 'bg-warning-500',
    text: 'text-warning-400',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    line: 'bg-warning-500',
  },
  ACCEPTED: {
    bg: 'bg-info-500',
    text: 'text-info-400',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.5)]',
    line: 'bg-info-500',
  },
  PREPARING: {
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    glow: 'shadow-[0_0_12px_rgba(139,92,246,0.5)]',
    line: 'bg-purple-500',
  },
  READY: {
    bg: 'bg-success-500',
    text: 'text-success-400',
    glow: 'shadow-[0_0_12px_rgba(34,197,94,0.5)]',
    line: 'bg-success-500',
  },
  DELIVERED: {
    bg: 'bg-gray-500',
    text: 'text-gray-400',
    glow: '',
    line: 'bg-gray-500',
  },
  CANCELLED: {
    bg: 'bg-error-500',
    text: 'text-error-400',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.5)]',
    line: 'bg-error-500',
  },
};

/**
 * Timeline horizontal completo
 */
export const OrderTimeline = ({ currentStatus, className }) => {
  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className={cn('flex items-center justify-center py-4', className)}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-3 px-4 py-2 bg-error-500/20 rounded-xl border border-error-500/30"
        >
          <XCircle className="w-5 h-5 text-error-400" />
          <span className="text-error-400 font-medium">Pedido Cancelado</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn('px-4 py-6', className)}>
      {/* Timeline */}
      <div className="relative flex items-center justify-between">
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const StepIcon = step.icon;
          const colors = statusColors[step.key];

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              {/* Step circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  isCompleted && `${colors.bg} text-white`,
                  isCurrent && `${colors.bg} text-white ${colors.glow} animate-pulse`,
                  isPending && 'bg-surface-2 text-gray-500 border-2 border-surface-3'
                )}
              >
                <StepIcon className="w-5 h-5" />
              </motion.div>

              {/* Label */}
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
                className={cn(
                  'text-xs font-medium mt-2 text-center max-w-[60px]',
                  isCompleted && colors.text,
                  isCurrent && `${colors.text} font-semibold`,
                  isPending && 'text-gray-500'
                )}
              >
                {step.label}
              </motion.span>

              {/* Connecting line */}
              {index < ORDER_STEPS.length - 1 && (
                <div className="absolute top-5 left-10 w-[calc(100%-40px)] h-0.5 -z-10">
                  <div className="relative w-full h-full bg-surface-3 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: isCompleted || isCurrent ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.5, delay: index * 0.15 }}
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full',
                        isCompleted && colors.line,
                        isCurrent && colors.line
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Timeline compacto (solo iconos)
 */
export const OrderTimelineCompact = ({ currentStatus, className }) => {
  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <XCircle className="w-4 h-4 text-error-400" />
        <span className="text-xs text-error-400">Cancelado</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {ORDER_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const StepIcon = step.icon;
        const colors = statusColors[step.key];

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center',
                isCompleted && `${colors.bg} text-white`,
                isCurrent && `${colors.bg} text-white ${colors.glow}`,
                !isCompleted && !isCurrent && 'bg-surface-3 text-gray-500'
              )}
            >
              <StepIcon className="w-3.5 h-3.5" />
            </div>
            {index < ORDER_STEPS.length - 1 && (
              <div
                className={cn(
                  'w-4 h-0.5 mx-0.5',
                  isCompleted ? colors.line : 'bg-surface-3'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Timeline vertical (para mobile o detalle)
 */
export const OrderTimelineVertical = ({ currentStatus, timestamps = {}, className }) => {
  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className={cn('p-4', className)}>
        <div className="flex items-center gap-3 p-3 bg-error-500/10 rounded-xl border border-error-500/20">
          <div className="w-10 h-10 rounded-full bg-error-500/20 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-error-400" />
          </div>
          <div>
            <p className="font-medium text-error-400">Pedido Cancelado</p>
            {timestamps.CANCELLED && (
              <p className="text-xs text-gray-500">{timestamps.CANCELLED}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-4 space-y-0', className)}>
      {ORDER_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        const isLast = index === ORDER_STEPS.length - 1;
        const StepIcon = step.icon;
        const colors = statusColors[step.key];

        return (
          <div key={step.key} className="flex gap-4">
            {/* Icon and line */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  isCompleted && `${colors.bg} text-white`,
                  isCurrent && `${colors.bg} text-white ${colors.glow} animate-pulse`,
                  isPending && 'bg-surface-2 text-gray-500 border-2 border-surface-3'
                )}
              >
                <StepIcon className="w-5 h-5" />
              </motion.div>
              {!isLast && (
                <div className="w-0.5 h-12 my-1 bg-surface-3 relative overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className={cn('absolute top-0 left-0 w-full', colors.line)}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p
                className={cn(
                  'font-medium',
                  isCompleted && colors.text,
                  isCurrent && `${colors.text} font-semibold`,
                  isPending && 'text-gray-500'
                )}
              >
                {step.label}
              </p>
              {timestamps[step.key] && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {timestamps[step.key]}
                </p>
              )}
              {isCurrent && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-400 mt-1"
                >
                  Estado actual
                </motion.p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Badge de estado simple
 */
export const OrderStatusBadge = ({ status }) => {
  const colors = statusColors[status];
  const step = ORDER_STEPS.find((s) => s.key === status) || {
    label: status,
    icon: ClipboardList,
  };
  const StepIcon = status === 'CANCELLED' ? XCircle : step.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        `${colors.bg}/20 ${colors.text} border border-current/30`
      )}
    >
      <StepIcon className="w-3.5 h-3.5" />
      {status === 'CANCELLED' ? 'Cancelado' : step.label}
    </div>
  );
};

export default OrderTimeline;
