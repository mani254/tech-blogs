import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  sizeVariant?: 'sm' | 'md';
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value,
      onChange,
      onClear,
      placeholder = 'Search...',
      disabled = false,
      sizeVariant = 'sm',
      ...props
    },
    ref,
  ) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div className={cn('relative w-full', className)}>
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full pl-8 pr-7 text-[12px] bg-zinc-50/60 border border-zinc-200/90 rounded-md text-zinc-900 placeholder:text-zinc-400',
            // Light gray subtle focus highlight instead of heavy black outline
            'transition-colors duration-150 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 focus:bg-white shadow-2xs',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            sizeVariant === 'sm' ? 'h-8 py-1' : 'h-9 py-1.5',
          )}
          {...props}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-0.5 rounded cursor-pointer transition-colors focus:outline-none"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
