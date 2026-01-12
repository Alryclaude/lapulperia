import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all border',
  {
    variants: {
      variant: {
        // REVAMP: Vibrant colors for dark theme
        default: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
        secondary: 'bg-dark-100 text-gray-300 border-dark-50',
        destructive: 'bg-red-500/20 text-red-400 border-red-500/30',
        outline: 'border-dark-50 bg-transparent text-gray-300',
        success: 'bg-green-500/20 text-green-400 border-green-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        accent: 'bg-accent-500/20 text-accent-400 border-accent-500/30',
        info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        // Status variants for pulperias - VIBRANT
        open: 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_12px_rgba(34,197,94,0.3)]',
        closing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        closed: 'bg-gray-600/20 text-gray-500 border-gray-600/30',
        vacation: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        // Order status variants - VIBRANT
        pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        accepted: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        preparing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        ready: 'bg-green-500/20 text-green-400 border-green-500/30',
        delivered: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
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

// Badge with dot indicator (for status) - REVAMP: Enhanced glow
const StatusBadge = React.forwardRef(
  ({ className, variant, status, children, ...props }, ref) => {
    const statusColors = {
      open: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
      closing: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]',
      closed: 'bg-gray-500',
      vacation: 'bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.5)]',
      pending: 'bg-amber-500',
      accepted: 'bg-cyan-500',
      preparing: 'bg-purple-500',
      ready: 'bg-green-500',
      delivered: 'bg-gray-500',
      cancelled: 'bg-red-500',
    };

    const dotColor = statusColors[status] || statusColors[variant] || 'bg-gray-400';
    const isAnimated = status === 'open' || variant === 'open';

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant: variant || status }), className)}
        {...props}
      >
        <span
          className={cn(
            'w-2 h-2 rounded-full transition-all',
            dotColor,
            isAnimated && 'animate-pulse'
          )}
        />
        {children}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { Badge, StatusBadge, badgeVariants };
