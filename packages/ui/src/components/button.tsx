import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      // Lighter dark gray (charcoal/slate) instead of black or harsh dark
      primary:
        'bg-zinc-700 text-white hover:bg-zinc-600 active:bg-zinc-800 border border-zinc-600/70 shadow-2xs',
      secondary:
        'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:bg-zinc-300 border border-zinc-200/80',
      outline:
        'border border-zinc-200/90 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 active:bg-zinc-100 shadow-2xs',
      ghost:
        'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200/70',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-2xs border border-rose-600/50',
    };

    const sizes = {
      xs: 'h-7 px-2 text-[11px] gap-1',
      sm: 'h-8 px-2.5 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-xs gap-2',
      lg: 'h-10 px-4 text-sm gap-2.5',
      icon: 'h-8 w-8 p-0 shrink-0',
      'icon-sm': 'h-7 w-7 p-0 shrink-0',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current shrink-0" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
