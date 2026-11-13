'use client';

import toast, { Toast, Toaster } from 'react-hot-toast';
import { AlertCircle, AlertTriangle, Check, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ToastCardProps {
  t: Toast;
  type: NotificationType;
  title: string;
  message?: string;
}

export function ToastCard({ t, type, title, message }: ToastCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-3 h-3 text-white stroke-[2.5]" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-white stroke-[2.5]" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-white stroke-[2.5]" />;
      case 'info':
      default:
        return <Info className="w-3 h-3 text-white stroke-[2.5]" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        ${t.visible ? 'animate-in fade-in-0 slide-in-from-top-2' : 'animate-out fade-out-0'}
        flex items-start gap-2.5 w-full max-w-[340px] p-3 rounded-lg
        bg-white border border-zinc-900/15 shadow-xl shadow-zinc-950/5
        text-zinc-900 pointer-events-auto select-none transition-all duration-200
      `}
    >
      <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs font-semibold text-zinc-900 leading-tight truncate">
          {title}
        </p>
        {message && (
          <p className="text-[11px] text-zinc-500 leading-snug mt-0.5 break-words">
            {message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        className="p-0.5 rounded text-zinc-400 hover:text-zinc-800 transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function renderToast(
  type: NotificationType,
  title: string,
  message?: string,
  duration = 4000,
) {
  return toast.custom(
    (t) => <ToastCard t={t} type={type} title={title} message={message} />,
    { duration },
  );
}

export const notify = {
  success: (title: string, message?: string, duration?: number) =>
    renderToast('success', title, message, duration),

  error: (title: string, message?: string, duration?: number) =>
    renderToast('error', title, message, duration || 5000),

  warning: (title: string, message?: string, duration?: number) =>
    renderToast('warning', title, message, duration),

  info: (title: string, message?: string, duration?: number) =>
    renderToast('info', title, message, duration),

  apiError: (error: unknown, fallbackTitle = 'Action Failed') => {
    let msg = 'An unexpected error occurred. Please try again.';

    if (error && typeof error === 'object') {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };

      if (err.response?.data?.message) {
        const backendMsg = err.response.data.message;
        msg = Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg;
      } else if (err.message) {
        msg = err.message;
      }
    } else if (typeof error === 'string') {
      msg = error;
    }

    renderToast('error', fallbackTitle, msg, 5000);
  },
};

export { Toaster, toast };
