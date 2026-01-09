import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-muted', className)}
      {...props}
    />
  );
}

// Pre-built skeleton variants for common use cases
function SkeletonCard({ className, ...props }) {
  return (
    <div className={cn('rounded-2xl border p-4 space-y-3', className)} {...props}>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function SkeletonProductCard({ className, ...props }) {
  return (
    <div className={cn('rounded-2xl border p-3 space-y-2', className)} {...props}>
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonPulperiaCard({ className, ...props }) {
  return (
    <div className={cn('rounded-2xl border overflow-hidden', className)} {...props}>
      <Skeleton className="h-32 w-full" />
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

function SkeletonList({ count = 3, className, children, ...props }) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonText({ lines = 3, className, ...props }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonProductCard,
  SkeletonPulperiaCard,
  SkeletonList,
  SkeletonText,
};
