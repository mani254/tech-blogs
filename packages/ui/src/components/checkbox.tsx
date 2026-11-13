import { Check, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

export interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  title?: string;
}

export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  className,
  id,
  title,
}: CheckboxProps) {
  return (
    <button
      type="button"
      id={id}
      title={title}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'w-4 h-4 rounded border flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 cursor-pointer select-none shrink-0',
        checked || indeterminate
          ? 'bg-zinc-700 border-zinc-700 text-white'
          : 'bg-white border-zinc-300 hover:border-zinc-400',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
    >
      {indeterminate ? (
        <Minus className="w-3 h-3 stroke-[3]" />
      ) : checked ? (
        <Check className="w-3 h-3 stroke-[3]" />
      ) : null}
    </button>
  );
}
