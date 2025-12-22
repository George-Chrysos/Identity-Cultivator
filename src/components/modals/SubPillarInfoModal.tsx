import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { SubPillarContent } from '@/constants/sealsContent';

interface SubPillarInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  subPillar: SubPillarContent | null;
}

const SubPillarInfoModal = memo(({ isOpen, onClose, subPillar }: SubPillarInfoModalProps) => {
  if (!subPillar) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="relative bg-slate-900/95 backdrop-blur-md border-2 border-purple-500/50 rounded-2xl p-6 max-w-lg w-full shadow-[0_0_30px_rgba(168,85,247,0.4)] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-2 pr-8">
                {subPillar.name}
              </h3>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-purple-500/50 via-purple-500/20 to-transparent mb-4" />

              {/* Focus */}
              <div className="text-slate-300 text-sm leading-relaxed mb-4">
                {subPillar.focus}
              </div>

              {/* Tips (if available) */}
              {subPillar.tips && (
                <>
                  <p className="text-purple-300 text-sm mb-2 font-medium">
                    Tips
                  </p>
                  <div className="text-slate-300 text-sm leading-relaxed">
                    {subPillar.tips}
                  </div>
                </>
              )}

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors font-medium"
                >
                  Got it
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
});

SubPillarInfoModal.displayName = 'SubPillarInfoModal';

export default SubPillarInfoModal;
