import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button variants - Constelacion de Barrio Design System
 *
 * Principios:
 * - Gradientes para CTAs primarios
 * - Glow con propósito (indica interactividad)
 * - Alto contraste para accesibilidad
 * - Touch targets mínimo 44x44px
 */
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]',
  {
    variants: {
      variant: {
        // Primary - Gradiente rojo con glow
        default:
          'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-btn-primary hover:shadow-btn-primary-hover hover:from-primary-400 hover:to-primary-500 hover:-translate-y-0.5',

        // Destructive
        destructive:
          'bg-gradient-to-br from-error-500 to-error-600 text-white shadow-[0_4px_14px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)] hover:from-error-400 hover:to-error-500',

        // Outline - Borde visible
        outline:
          'border border-surface-3 bg-transparent text-gray-200 hover:bg-surface-2 hover:border-surface-4 hover:text-white',

        // Secondary - Surface elevada
        secondary:
          'bg-surface-2 text-gray-200 border border-surface-3 hover:bg-surface-3 hover:border-surface-4 hover:text-white',

        // Ghost - Invisible hasta hover
        ghost:
          'text-gray-400 hover:bg-surface-1 hover:text-white',

        // Link
        link:
          'text-primary-400 underline-offset-4 hover:underline hover:text-primary-300',

        // Accent - Dorado para acciones especiales
        accent:
          'bg-gradient-to-br from-accent-400 to-accent-500 text-surface-0 font-bold shadow-btn-accent hover:shadow-[0_6px_20px_rgba(251,191,36,0.5)] hover:from-accent-300 hover:to-accent-400',

        // Success - Verde
        success:
          'bg-gradient-to-br from-success-500 to-success-600 text-white shadow-btn-success hover:shadow-[0_6px_20px_rgba(34,197,94,0.5)] hover:from-success-400 hover:to-success-500',

        // Cyan
        cyan:
          'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-glow-cyan hover:shadow-[0_6px_20px_rgba(34,211,238,0.5)] hover:from-cyan-400 hover:to-cyan-500',

        // Purple
        purple:
          'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-glow-purple hover:shadow-[0_6px_20px_rgba(139,92,246,0.5)] hover:from-purple-400 hover:to-purple-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-6 text-base',
        xl: 'h-14 rounded-2xl px-8 text-lg',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
        // FAB - Floating Action Button
        fab: 'h-14 w-14 rounded-full shadow-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

/**
 * IconButton - Botón cuadrado para iconos
 */
const IconButton = React.forwardRef(
  ({ className, variant = 'ghost', size = 'icon', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn('p-0', className)}
        {...props}
      />
    );
  }
);
IconButton.displayName = 'IconButton';

/**
 * FAB - Floating Action Button con glow animado
 */
const FAB = React.forwardRef(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size="fab"
        className={cn(
          'fixed bottom-20 right-4 z-40 animate-star-pulse',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
FAB.displayName = 'FAB';

export { Button, IconButton, FAB, buttonVariants };
