import * as React from 'react';
import { cn } from '@/lib/utils';

// REVAMP: Enhanced glass effect card
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-white/[0.08] bg-dark-100/80 backdrop-blur-sm text-card-foreground shadow-lg transition-all duration-300',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// REVAMP: Interactive card with vibrant hover effect
const CardInteractive = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-white/[0.08] bg-dark-100/80 backdrop-blur-sm text-card-foreground shadow-lg transition-all duration-300 cursor-pointer',
      'hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_0_1px_rgba(220,38,38,0.1)] hover:border-primary-500/20 hover:-translate-y-1',
      'active:scale-[0.98]',
      className
    )}
    {...props}
  />
));
CardInteractive.displayName = 'CardInteractive';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardInteractive,
};
