import * as React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-zinc-900 text-white border-transparent',
    secondary: 'bg-zinc-100 text-zinc-800 border-zinc-200/60',
    outline: 'bg-transparent text-zinc-700 border-zinc-300',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    destructive: 'bg-rose-50 text-rose-700 border-rose-200',
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wide border',
        variantClasses,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
