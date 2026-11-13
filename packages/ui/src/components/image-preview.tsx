import * as React from 'react';
import { FileImage } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ImagePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
  imageClassName?: string;
}

export function ImagePreview({
  src,
  alt = 'Image preview',
  fallbackIcon,
  fallbackText = 'No preview available',
  imageClassName,
  className,
  children,
  ...props
}: ImagePreviewProps) {
  return (
    <div
      className={cn(
        'relative w-full h-80 rounded-lg border border-zinc-200 overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-zinc-50 flex items-center justify-center p-3',
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'max-w-full max-h-full object-contain drop-shadow-sm transition-all',
            imageClassName,
          )}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          {fallbackIcon || <FileImage className="w-8 h-8" />}
          <span className="text-xs">{fallbackText}</span>
        </div>
      )}
      {children}
    </div>
  );
}
