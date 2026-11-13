import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';

interface PopoverContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

export function usePopover() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover must be used within a <Popover />');
  }
  return context;
}

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Popover({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const setIsOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const nextOpen = typeof value === 'function' ? value(isOpen) : value;
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, isOpen, onOpenChange],
  );

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  return (
    <PopoverContext.Provider
      value={{ isOpen, setIsOpen, triggerRef, contentRef }}
    >
      <div className={cn('relative inline-block text-left', className)}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export type PopoverTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  PopoverTriggerProps
>(({ className, children, onClick, ...props }, forwardedRef) => {
  const { isOpen, setIsOpen, triggerRef } = usePopover();

  const handleRef = (node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  return (
    <button
      ref={handleRef}
      type="button"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      onClick={(e) => {
        setIsOpen((prev) => !prev);
        onClick?.(e);
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = 'PopoverTrigger';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverContentProps
>(
  (
    { className, align = 'end', sideOffset = 8, children, style, ...props },
    forwardedRef,
  ) => {
    const { isOpen, triggerRef, contentRef } = usePopover();
    const [mounted, setMounted] = React.useState(false);
    const [coords, setCoords] = React.useState<{
      top: number;
      left?: number;
      right?: number;
      transform?: string;
    }>({
      top: 0,
    });

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const updatePosition = React.useCallback(() => {
      if (!triggerRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentEl = contentRef.current;
      const contentHeight = contentEl ? contentEl.offsetHeight : 120;

      // Check if popping downward overflows the bottom of the viewport
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const flipAbove =
        spaceBelow < contentHeight + sideOffset &&
        spaceAbove > contentHeight + sideOffset;

      let top: number;
      if (flipAbove) {
        top = Math.max(8, triggerRect.top - contentHeight - sideOffset);
      } else {
        top = triggerRect.bottom + sideOffset;
      }

      let left: number | undefined;
      let right: number | undefined;
      let transform: string | undefined;

      if (align === 'start') {
        left = Math.max(8, triggerRect.left);
      } else if (align === 'center') {
        left = triggerRect.left + triggerRect.width / 2;
        transform = 'translateX(-50%)';
      } else {
        // align === 'end'
        right = Math.max(8, window.innerWidth - triggerRect.right);
      }

      setCoords({ top, left, right, transform });
    }, [align, sideOffset, triggerRef, contentRef]);

    useIsomorphicLayoutEffect(() => {
      if (!isOpen) return;
      updatePosition();

      const frameId = requestAnimationFrame(updatePosition);

      const handleScrollOrResize = () => {
        updatePosition();
      };

      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);

      return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('resize', handleScrollOrResize);
        window.removeEventListener('scroll', handleScrollOrResize, true);
      };
    }, [isOpen, updatePosition]);

    if (!isOpen || !mounted) return null;

    const handleRef = (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const content = (
      <div
        ref={handleRef}
        style={{
          position: 'fixed',
          top: `${coords.top}px`,
          left: coords.left !== undefined ? `${coords.left}px` : undefined,
          right: coords.right !== undefined ? `${coords.right}px` : undefined,
          transform: coords.transform,
          ...style,
        }}
        className={cn(
          'z-50 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg text-zinc-900 animate-in fade-in zoom-in-95 duration-100',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );

    return createPortal(content, document.body);
  },
);
PopoverContent.displayName = 'PopoverContent';
