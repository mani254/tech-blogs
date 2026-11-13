import * as React from 'react';
import { cn } from '../lib/utils';

export function TableContainer({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border border-zinc-200/80 rounded-lg overflow-hidden bg-white shadow-xs',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        'w-full caption-bottom text-[12px] text-zinc-900',
        className,
      )}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'border-b border-zinc-100 bg-white text-[11px] font-medium text-zinc-500',
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-zinc-100 transition-colors hover:bg-zinc-50/60 data-[state=selected]:bg-zinc-100',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-9 px-4 text-left align-middle font-medium text-zinc-500 [&:has([role=checkbox])]:pr-0',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 align-middle text-[12px] [&:has([role=checkbox])]:pr-0',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-zinc-100 bg-zinc-50/50 font-medium text-zinc-900',
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

export interface TableEmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function TableEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: TableEmptyStateProps) {
  return (
    <div className={cn('px-4 py-16 text-center bg-white', className)}>
      {Icon && (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 mb-2">
          <Icon className="w-4 h-4 stroke-[1.6]" />
        </div>
      )}
      <div className="text-[13px] font-medium text-zinc-800">{title}</div>
      {description && (
        <p className="text-[11px] text-zinc-400 mt-0.5 max-w-xs mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export interface TablePaginationProps {
  totalResults?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function TablePagination({
  totalResults = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  className,
}: TablePaginationProps) {
  return (
    <div
      className={cn(
        'px-4 py-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 bg-white select-none',
        className,
      )}
    >
      <span>{totalResults} results</span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(currentPage - 1)}
            className="px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 disabled:text-zinc-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            ‹
          </button>
          <button
            type="button"
            disabled={currentPage * pageSize >= totalResults}
            onClick={() => onPageChange?.(currentPage + 1)}
            className="px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 disabled:text-zinc-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
        <span>{pageSize} / page</span>
      </div>
    </div>
  );
}
