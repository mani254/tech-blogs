import * as React from 'react';
import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export function Card({
  title,
  description,
  footer,
  children,
  className,
  ...props
}: CardProps) {
  if (title || description || footer) {
    return (
      <div
        className={cn(
          'w-full bg-white border border-zinc-200/90 rounded-xl p-6 shadow-2xs text-zinc-900',
          className,
        )}
        {...props}
      >
        {(title || description) && (
          <div className="mb-4 space-y-1">
            {title && (
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-zinc-500 font-normal">{description}</p>
            )}
          </div>
        )}
        <div>{children}</div>
        {footer && (
          <div className="mt-4 pt-4 border-t border-zinc-100">{footer}</div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white border border-zinc-200/90 rounded-xl shadow-2xs text-zinc-900',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-5 pb-3', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-sm font-semibold text-zinc-900 leading-none tracking-tight',
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs text-zinc-500 font-normal', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center p-5 pt-0 border-t border-zinc-100 mt-4',
        className,
      )}
      {...props}
    />
  );
}
