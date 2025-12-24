import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BaseModal } from '@/components/common';

interface SubtaskInfoModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
}

export const SubtaskInfoModal = memo(({
  isOpen,
  title,
  description,
  onClose,
}: SubtaskInfoModalProps) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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
          Extra Info
        </h3>
        
        {/* Subtitle */}
        <p className="text-purple-300 text-sm mb-4 font-medium">
          {title}
        </p>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-purple-500/50 via-purple-500/20 to-transparent mb-4" />

        {/* Description */}
        <div className="text-slate-300 text-sm leading-relaxed">
          {description || 'No additional information available.'}
        </div>

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

SubtaskInfoModal.displayName = 'SubtaskInfoModal';

export default SubtaskInfoModal;
