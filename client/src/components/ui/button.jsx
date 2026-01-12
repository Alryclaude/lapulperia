import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-dark-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]',
  {
    variants: {
      variant: {
        // REVAMP: Vibrant with glow effects
        default:
          'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-[0_4px_14px_rgba(220,38,38,0.4)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.5)] hover:from-primary-400 hover:to-primary-500',
        destructive:
          'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm hover:from-red-400 hover:to-red-500',
        outline:
          'border border-dark-50 bg-transparent text-gray-200 hover:bg-dark-100 hover:border-gray-600 hover:text-white',
        secondary:
          'bg-dark-100 text-gray-200 border border-dark-50 hover:bg-dark-50 hover:border-gray-600 hover:text-white',
        ghost:
          'text-gray-400 hover:bg-dark-100 hover:text-white',
        link:
          'text-primary-400 underline-offset-4 hover:underline hover:text-primary-300',
        accent:
          'bg-gradient-to-br from-accent-400 to-accent-500 text-dark-400 font-bold shadow-[0_4px_14px_rgba(234,179,8,0.4)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.5)] hover:from-accent-300 hover:to-accent-400',
        success:
          'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_4px_14px_rgba(34,197,94,0.4)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.5)] hover:from-green-400 hover:to-green-500',
        // NEW: Cyan variant
        cyan:
          'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-[0_4px_14px_rgba(6,182,212,0.4)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.5)] hover:from-cyan-400 hover:to-cyan-500',
        // NEW: Purple variant
        purple:
          'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-[0_4px_14px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.5)] hover:from-purple-400 hover:to-purple-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-6 text-base',
        xl: 'h-14 rounded-2xl px-8 text-lg',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
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

export { Button, buttonVariants };
