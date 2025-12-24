import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { SubPillarContent } from '@/constants/sealsContent';
import { BaseModal } from '@/components/common';

interface SubPillarInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  subPillar: SubPillarContent | null;
}

const SubPillarInfoModal = memo(({ isOpen, onClose, subPillar }: SubPillarInfoModalProps) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!subPillar) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      showCloseButton={true}
    >
      <div className="p-6">
        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-2">
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
            onClick={handleClose}
            className="px-6 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors font-medium"
          >
            Got it
          </motion.button>
        </div>
      </div>
    </BaseModal>
  );
});

SubPillarInfoModal.displayName = 'SubPillarInfoModal';

export default SubPillarInfoModal;
