import { useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type Toast as ToastType } from '@/store/toastStore';

const ToastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
} as const;

const ToastColors = {
  success: 'bg-gradient-to-r from-violet-900/95 to-cyan-900/95 border-cyan-400/60',
  error: 'bg-red-900/95 border-red-400',
  info: 'bg-slate-900/95 border-cyan-400/60',
  warning: 'bg-yellow-900/95 border-yellow-400',
} as const;

const ToastShadows = {
  success: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]',
  error: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
  info: 'shadow-[0_0_20px_rgba(34,211,238,0.45)]',
  warning: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
} as const;

interface ToastItemProps {
  toast: ToastType;
}

const ToastItem = forwardRef<HTMLDivElement, ToastItemProps>(({ toast }, ref) => {
  const removeToast = useToastStore((state) => state.removeToast);
  const Icon = ToastIcons[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => removeToast(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, removeToast]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm
        ${ToastColors[toast.type]}
        ${ToastShadows[toast.type]}
        max-w-[70vw] w-full
        text-white font-medium text-sm
      `}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
});

ToastItem.displayName = 'ToastItem';

export const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
};
