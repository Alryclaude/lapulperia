import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge variants - Constelacion de Barrio Design System
 *
 * Status badges con glow para indicar estado visual
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all border',
  {
    variants: {
      variant: {
        // Base variants
        default: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
        secondary: 'bg-surface-2 text-gray-300 border-surface-3',
        destructive: 'bg-error-500/20 text-error-400 border-error-500/30',
        outline: 'border-surface-3 bg-transparent text-gray-300',
        success: 'bg-success-500/20 text-success-400 border-success-500/30',
        warning: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
        accent: 'bg-accent-500/20 text-accent-400 border-accent-500/30',
        info: 'bg-info-500/20 text-info-400 border-info-500/30',
        gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',

        // Status variants para pulperías - con GLOW
        open: 'bg-success-500/20 text-success-400 border-success-500/30 shadow-[0_0_12px_rgba(34,197,94,0.35)]',
        closing: 'bg-warning-500/20 text-warning-400 border-warning-500/30 animate-pulse',
        closed: 'bg-gray-600/20 text-gray-500 border-gray-600/30',
        vacation: 'bg-info-500/20 text-info-400 border-info-500/30',

        // Order status variants
        pending: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
        accepted: 'bg-info-500/20 text-info-400 border-info-500/30',
        preparing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        ready: 'bg-success-500/20 text-success-400 border-success-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]',
        delivered: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        cancelled: 'bg-error-500/20 text-error-400 border-error-500/30',
      },
      size: {
        default: 'px-2.5 py-1 text-xs',
        sm: 'px-2 py-0.5 text-[11px]',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Badge = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

/**
 * StatusBadge - Badge con dot indicator animado
 */
const StatusBadge = React.forwardRef(
  ({ className, variant, status, children, showDot = true, ...props }, ref) => {
    const dotColors = {
      open: 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
      closing: 'bg-warning-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]',
      closed: 'bg-gray-500',
      vacation: 'bg-info-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]',
      pending: 'bg-warning-500',
      accepted: 'bg-info-500',
      preparing: 'bg-purple-500',
      ready: 'bg-success-500',
      delivered: 'bg-gray-500',
      cancelled: 'bg-error-500',
      // Defaults
      default: 'bg-primary-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
      info: 'bg-info-500',
    };

    const effectiveStatus = status || variant || 'default';
    const dotColor = dotColors[effectiveStatus] || dotColors.default;
    const isAnimated = effectiveStatus === 'open' || effectiveStatus === 'ready';
    const isPulsing = effectiveStatus === 'closing';

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant: effectiveStatus }), className)}
        {...props}
      >
        {showDot && (
          <span
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              dotColor,
              isAnimated && 'animate-pulse-glow',
              isPulsing && 'animate-pulse'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

/**
 * CategoryBadge - Badge para categorías del mapa
 */
const CategoryBadge = React.forwardRef(
  ({ className, category, children, ...props }, ref) => {
    const categoryStyles = {
      food: 'bg-category-food/20 text-category-food border-category-food/30',
      market: 'bg-category-market/20 text-category-market border-category-market/30',
      services: 'bg-category-services/20 text-category-services border-category-services/30',
      offer: 'bg-category-offer/20 text-category-offer border-category-offer/30',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border',
          categoryStyles[category] || categoryStyles.food,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
CategoryBadge.displayName = 'CategoryBadge';

/**
 * CountBadge - Badge numérico (para carrito, notificaciones)
 */
const CountBadge = React.forwardRef(
  ({ className, count, max = 99, ...props }, ref) => {
    const displayCount = count > max ? `${max}+` : count;

    if (!count || count <= 0) return null;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full',
          'bg-primary-500 text-white text-[10px] font-bold',
          'shadow-[0_0_8px_rgba(250,82,82,0.4)]',
          className
        )}
        {...props}
      >
        {displayCount}
      </span>
    );
  }
);
CountBadge.displayName = 'CountBadge';

export { Badge, StatusBadge, CategoryBadge, CountBadge, badgeVariants };
