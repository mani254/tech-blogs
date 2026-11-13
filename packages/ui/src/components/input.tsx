import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  error?: string;
  label?: string;
  hint?: string;
  sizeVariant?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      error,
      label,
      hint,
      id,
      sizeVariant = 'sm',
      leftIcon,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-zinc-700 tracking-normal"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-2.5 flex items-center pointer-events-none text-zinc-400">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            className={cn(
              'flex w-full rounded-md border bg-white text-[12px] text-zinc-900 placeholder:text-zinc-400 shadow-2xs',
              // Light gray focus highlight instead of black ring
              'transition-colors duration-150 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50',
              sizeVariant === 'sm' ? 'h-8 px-2.5 py-1' : 'h-9 px-3 py-1.5',
              leftIcon && 'pl-8',
              rightIcon && 'pr-8',
              error
                ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-zinc-200/90 hover:border-zinc-300',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-2.5 flex items-center text-zinc-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] text-rose-600 font-medium">{error}</p>
        ) : hint ? (
          <p className="text-[11px] text-zinc-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
