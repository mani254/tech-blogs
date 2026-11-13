import * as React from 'react';
import { cn } from '../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-xs font-semibold text-slate-700 tracking-wide select-none',
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-rose-400">*</span>}
    </label>
  ),
);

Label.displayName = 'Label';
