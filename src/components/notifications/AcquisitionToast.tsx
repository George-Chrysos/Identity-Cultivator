import { useEffect, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Toast } from '@/store/toastStore';

interface AcquisitionToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const AcquisitionToast = forwardRef<HTMLDivElement, AcquisitionToastProps>(
  ({ toast, onRemove }, ref) => {
    useEffect(() => {
    // Auto-remove toast
    if (toast.duration && toast.duration > 0) {
      const removeTimer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);

      return () => {
        clearTimeout(removeTimer);
      };
    }
    }, [toast.id, toast.duration, onRemove]);

    return (
      <motion.div
        ref={ref}
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        duration: 0.3
      }}
      className="max-w-lg w-full"
    >
      {/* Outer Wrapper - Glowing Gradient Border */}
      <div 
        className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 p-[2px] rounded-xl shadow-[0_0_20px_-5px_rgba(251,191,36,0.7)]"
      >
        {/* Inner Container - Dark Glass Card */}
        <div className="bg-slate-950/90 backdrop-blur-md rounded-[10px] p-4 flex items-center gap-4">
          
          {/* Icon Container - Left Side */}
          <div className="bg-amber-500/20 rounded-full p-2 flex-shrink-0">
            <Sparkles 
              className="w-6 h-6 text-amber-100"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 1))'
              }}
            />
          </div>

          {/* Text Content - Center */}
          <div className="flex-1 min-w-0">
            {/* Item Name */}
            <div className="text-xs font-medium text-purple-200/80 tracking-wider uppercase mb-1">
              {toast.itemName || 'ITEM'}
            </div>
            
            {/* Success State */}
            <div 
              className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent"
              style={{ 
                fontFamily: 'Rajdhani, system-ui, sans-serif',
                textShadow: '0 0 20px rgba(251, 191, 36, 0.3)'
              }}
            >
              {toast.message}
            </div>

            {/* Price Display */}
            {toast.price !== undefined && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span className="opacity-70">-</span>
                <span className="text-amber-400/80 font-semibold">{toast.price}</span>
                <span className="opacity-70">coins</span>
              </div>
            )}
          </div>

          {/* Close Button - Right Side */}
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-white/10"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      </motion.div>
    );
  }
);

AcquisitionToast.displayName = 'AcquisitionToast';

