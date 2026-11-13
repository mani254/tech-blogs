import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, options, icon, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full h-8 px-2.5 pr-8 text-[12px] bg-white text-zinc-800 border border-zinc-200/90 rounded-md shadow-2xs appearance-none focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer',
            className,
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-zinc-400">
          {icon || <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>
    );
  },
);
Select.displayName = 'Select';
