import { memo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  borderColor?: string; // Custom border color (e.g., '#e11d48' for warrior red)
  glowColor?: string;   // Custom glow color for shadow
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
  borderColor = 'rgba(168, 85, 247, 0.5)', // Default purple
  glowColor = 'rgba(76, 29, 149, 0.4)',    // Default purple glow
}: BaseModalProps) => {
  const [isAnimating, setIsAnimating] = useState(true);
  
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);
  
  // Reset animation state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);
  
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
            className={`relative w-full ${MAX_WIDTH_CLASSES[maxWidth]} card-base overflow-hidden ${className}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...GPU_ACCELERATION_STYLES,
              border: `2px solid ${borderColor}`,
              boxShadow: `0 0 12px ${glowColor}, 0 4px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
            }}
          >
            {/* Close button - absolute positioned top-right */}
            {showCloseButton && (
              <button
                onClick={handleCloseClick}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-lg border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 transition-all text-slate-400 hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Header with title - flush to top */}
            {title && (
              <div className="px-6 pt-3 pb-4 pr-14 border-b border-slate-700/50">
                <h2 className="text-xl font-bold text-white m-0 leading-tight">{title}</h2>
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
