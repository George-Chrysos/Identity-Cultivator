import { memo, useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
}

const MAX_WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
} as const;

/**
 * BaseModal - Shared modal component with portal, backdrop, and animations
 * 
 * Usage:
 * ```tsx
 * <BaseModal isOpen={isOpen} onClose={handleClose} title="My Modal">
 *   <div>Modal content here</div>
 * </BaseModal>
 * ```
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
}: BaseModalProps) => {
  // Handle escape key
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

  // Prevent body scroll when modal is open
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
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm ${overlayClassName}`}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className={`relative w-full ${MAX_WIDTH_CLASSES[maxWidth]} bg-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with title and close button */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                {title && (
                  <h2 className="text-lg font-bold text-white">{title}</h2>
                )}
                {!title && <div />}
                {showCloseButton && (
                  <button
                    onClick={handleCloseClick}
                    className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-white"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Modal content */}
            <div className="relative">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Portal to body
  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
});

BaseModal.displayName = 'BaseModal';

export default BaseModal;
