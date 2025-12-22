import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, Toast as ToastType } from '@/store/toastStore';
import { AcquisitionToast } from './AcquisitionToast';

const ToastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const ToastColors = {
  success: 'bg-gradient-to-r from-purple-900/95 to-pink-900/95 border-purple-400/70',
  error: 'bg-red-900/95 border-red-400',
  info: 'bg-blue-900/95 border-blue-400',
  warning: 'bg-yellow-900/95 border-yellow-400',
};

const ToastShadows = {
  success: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
  error: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
  info: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  warning: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
};

interface ToastItemProps {
  toast: ToastType;
}

const ToastItem = ({ toast }: ToastItemProps) => {
  const removeToast = useToastStore((state) => state.removeToast);
  
  // Skip rendering acquisition toasts (handled by AcquisitionToast component)
  if (toast.type === 'acquisition') return null;
  
  const Icon = ToastIcons[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, removeToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm
        ${ToastColors[toast.type]}
        ${ToastShadows[toast.type]}
        max-w-sm w-full
        text-white font-medium text-sm
      `}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          toast.type === 'acquisition' ? (
            <AcquisitionToast key={toast.id} toast={toast} onRemove={removeToast} />
          ) : (
            <ToastItem key={toast.id} toast={toast} />
          )
        ))}
      </AnimatePresence>
    </div>
  );
};
