import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-700',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-error-100 text-error-700',
        outline: 'border border-input bg-background text-foreground',
        success: 'bg-success-100 text-success-700',
        warning: 'bg-warning-100 text-warning-700',
        accent: 'bg-accent-100 text-accent-700',
        info: 'bg-info-100 text-info-700',
        gray: 'bg-gray-100 text-gray-600',
        // Status variants for pulperias
        open: 'bg-success-100 text-success-700',
        closing: 'bg-warning-100 text-warning-700',
        closed: 'bg-gray-100 text-gray-500',
        vacation: 'bg-info-100 text-info-700',
        // Order status variants
        pending: 'bg-warning-100 text-warning-700',
        accepted: 'bg-info-100 text-info-700',
        preparing: 'bg-purple-100 text-purple-700',
        ready: 'bg-success-100 text-success-700',
        delivered: 'bg-gray-100 text-gray-600',
        cancelled: 'bg-error-100 text-error-700',
      },
      size: {
        default: 'px-2.5 py-1 text-xs',
        sm: 'px-2 py-0.5 text-xs',
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

// Badge with dot indicator (for status)
const StatusBadge = React.forwardRef(
  ({ className, variant, status, children, ...props }, ref) => {
    const statusColors = {
      open: 'bg-status-open',
      closing: 'bg-status-closing',
      closed: 'bg-status-closed',
      vacation: 'bg-status-vacation',
      pending: 'bg-status-pending',
      accepted: 'bg-status-accepted',
      preparing: 'bg-status-preparing',
      ready: 'bg-status-ready',
      delivered: 'bg-status-delivered',
      cancelled: 'bg-status-cancelled',
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
            'w-2 h-2 rounded-full',
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
