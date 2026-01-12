import * as React from 'react';
import { cn } from '@/lib/utils';

// REVAMP: Enhanced input with better dark mode styling
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-dark-50 bg-dark-100 px-4 py-3 text-sm text-white ring-offset-dark-400 transition-all duration-200',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white',
        'placeholder:text-gray-500',
        'focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:shadow-[0_0_0_4px_rgba(220,38,38,0.1)]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-dark-200',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

// REVAMP: Search input with enhanced styling
const SearchInput = React.forwardRef(
  ({ className, icon: Icon, ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          type="search"
          className={cn(
            'flex h-11 w-full rounded-xl border border-dark-50 bg-dark-100 py-3 text-sm text-white ring-offset-dark-400 transition-all duration-200',
            'placeholder:text-gray-500',
            'focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            Icon ? 'pl-10 pr-4' : 'px-4',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

// REVAMP: Textarea with enhanced styling
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-xl border border-dark-50 bg-dark-100 px-4 py-3 text-sm text-white ring-offset-dark-400 transition-all duration-200',
        'placeholder:text-gray-500',
        'focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'resize-none',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Input, SearchInput, Textarea };
