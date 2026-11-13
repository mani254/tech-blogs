import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  label?: string;
  copiedLabel?: string;
  onCopied?: () => void;
}

export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  onCopied,
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors shrink-0 cursor-pointer shadow-2xs font-sans',
        copied &&
          'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700',
        className,
      )}
      {...props}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-zinc-500" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
