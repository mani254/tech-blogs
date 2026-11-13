import * as React from 'react';
import { cn } from '../lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full px-2.5 py-1.5 text-[12px] bg-white text-zinc-800 placeholder-zinc-400 border border-zinc-200/90 rounded-md shadow-2xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed resize-y min-h-[60px]',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
