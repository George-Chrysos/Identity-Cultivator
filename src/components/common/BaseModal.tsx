import { memo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { GPU_ACCELERATION_STYLES } from './usePerformanceStyles';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  overlayClassName?: string;
  borderColor?: string;
  glowColor?: string;
}

const MAX_WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
} as const;

const PANEL_WASH =
  'relative w-full overflow-hidden rounded-2xl bg-[radial-gradient(1000px_500px_at_20%_10%,rgba(0,245,212,0.10),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(168,85,247,0.14),transparent_60%),linear-gradient(180deg,#060610_0%,#070716_35%,#070717_100%)]';

/**
 * BaseModal - Shared modal. Panel wash matches the dashboard; page starfield shows through the dim overlay.
 */
export const BaseModal = memo(({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  maxWidth = 'lg',
  className = '',
  overlayClassName = '',
  borderColor = 'rgba(168, 85, 247, 0.5)',
  glowColor = 'rgba(76, 29, 149, 0.4)',
}: BaseModalProps) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [allowDrag, setAllowDrag] = useState(false);
  const dragControls = useDragControls();

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 640px)');
    const sync = () => setAllowDrag(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ${overlayClassName}`}
          onClick={handleBackdropClick}
          style={{
            backdropFilter: isAnimating ? 'none' : 'blur(4px)',
            WebkitBackdropFilter: isAnimating ? 'none' : 'blur(4px)',
            transition: 'backdrop-filter 200ms ease-out',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            onAnimationComplete={handleAnimationComplete}
            drag={allowDrag ? 'y' : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.55 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 96 || info.velocity.y > 700) onClose();
            }}
            className={`${PANEL_WASH} ${MAX_WIDTH_CLASSES[maxWidth]} ${className}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...GPU_ACCELERATION_STYLES,
              border: `2px solid ${borderColor}`,
              boxShadow: `0 0 12px ${glowColor}, 0 4px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
            }}
          >
            {allowDrag && (
              <div
                className="flex justify-center pt-2 pb-1 touch-none cursor-grab"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <span className="h-1 w-10 rounded-full bg-white/25" />
              </div>
            )}

            {showCloseButton && (
              <button
                type="button"
                onClick={handleCloseClick}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 transition-all text-slate-400 hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {title && (
              <div className="px-6 pt-3 pb-4 pr-14 border-b border-white/10">
                <h2 className="text-xl font-bold text-white m-0 leading-tight">{title}</h2>
              </div>
            )}

            <div className="relative max-h-[calc(100vh-8rem)] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
});

BaseModal.displayName = 'BaseModal';

export default BaseModal;
