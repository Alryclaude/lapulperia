import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card - Constelacion de Barrio Design System
 *
 * Glass morphism con bordes sutiles y glow por estado
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-white/[0.06] text-card-foreground transition-all duration-300',
      'bg-surface-1/80 backdrop-blur-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

/**
 * CardInteractive - Card con hover effects
 */
const CardInteractive = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-white/[0.06] text-card-foreground transition-all duration-300 cursor-pointer',
      'bg-surface-1/80 backdrop-blur-sm',
      'hover:shadow-card-hover hover:border-primary-500/20 hover:-translate-y-1',
      'active:scale-[0.98]',
      className
    )}
    {...props}
  />
));
CardInteractive.displayName = 'CardInteractive';

/**
 * CardGlow - Card con glow de estado (abierto/cerrado)
 */
const CardGlow = React.forwardRef(({ className, status = 'default', ...props }, ref) => {
  const glowStyles = {
    default: '',
    open: 'border-success-500/20 shadow-glow-open',
    closing: 'border-warning-500/20 shadow-glow-closing',
    closed: 'border-gray-500/20 opacity-75',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-white/[0.06] text-card-foreground transition-all duration-300',
        'bg-surface-1/80 backdrop-blur-sm',
        glowStyles[status],
        className
      )}
      {...props}
    />
  );
});
CardGlow.displayName = 'CardGlow';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight text-white', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

/**
 * CardImage - Banner/imagen de card
 */
const CardImage = React.forwardRef(({ className, src, alt, overlay = true, ...props }, ref) => (
  <div ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
    {src ? (
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-surface-2 to-surface-3" />
    )}
    {overlay && (
      <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/40 to-transparent" />
    )}
  </div>
));
CardImage.displayName = 'CardImage';

/**
 * StatCard - Card para KPIs/estadísticas
 */
const StatCard = React.forwardRef(({ className, icon, label, value, trend, ...props }, ref) => (
  <Card ref={ref} className={cn('p-5 relative overflow-hidden', className)} {...props}>
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p className={cn(
            'text-sm mt-1 font-medium',
            trend > 0 ? 'text-success-400' : trend < 0 ? 'text-error-400' : 'text-gray-400'
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </p>
        )}
      </div>
      {icon && (
        <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400">
          {icon}
        </div>
      )}
    </div>
  </Card>
));
StatCard.displayName = 'StatCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardInteractive,
  CardGlow,
  CardImage,
  StatCard,
};
