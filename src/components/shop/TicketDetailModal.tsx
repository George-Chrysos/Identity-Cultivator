import { memo, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatTimeRemaining } from '@/utils/inflationCalculator';
import { BaseModal } from '@/components/common';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon: LucideIcon;
  name: string;
  fullDescription?: string;
  activeDuration: number; // hours
  inflationImpact: number; // percentage
  isActive: boolean;
  remainingTime?: number; // milliseconds
  onUse?: () => void;
}

export const TicketDetailModal = memo(({
  isOpen,
  onClose,
  icon: Icon,
  name,
  fullDescription,
  activeDuration,
  inflationImpact,
  isActive,
  remainingTime,
  onUse,
}: TicketDetailModalProps) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime || 0);

  // Update countdown timer
  useEffect(() => {
    if (!isActive || !remainingTime) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(remainingTime);
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, remainingTime]);

  const progressPercent = isActive && activeDuration
    ? ((activeDuration * 3600000 - timeLeft) / (activeDuration * 3600000)) * 100
    : 0;

  const handleUse = useCallback(() => {
    if (onUse && !isActive) {
      onUse();
    }
  }, [onUse, isActive]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={true}
      className="bg-gradient-to-br from-slate-900/95 to-violet-950/95"
      overlayClassName="bg-black/70"
    >
      <div className="p-6">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-500/50"
            style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}
          >
            <Icon className="w-12 h-12 text-pink-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          {name}
        </h2>

        {/* Description */}
        {fullDescription && (
          <p className="text-slate-300 text-center mb-6 leading-relaxed">
            {fullDescription}
          </p>
        )}

        {/* Inflation Impact */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">Shop Inflation</span>
            </div>
            <span className="text-amber-400 font-semibold">
              +{(inflationImpact * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Each active instance increases this ticket's market price
          </p>
        </div>

        {/* Active Progress or Use Button */}
        {isActive ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-cyan-400">
                <Clock className="w-4 h-4" />
                <span>Active Duration</span>
              </div>
              <span className="text-cyan-300 font-semibold">
                {formatTimeRemaining(timeLeft)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-10 bg-slate-800/50 rounded-xl overflow-hidden border-2 border-cyan-500/50">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
                style={{
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm z-10">
                  ACTIVE: {progressPercent.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUse}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white border-2 border-purple-500/50 hover:border-purple-400/70 transition-all"
            style={{
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>USE ITEM</span>
            </div>
          </motion.button>
        )}

        {/* Info */}
        <p className="text-xs text-slate-500 text-center mt-4">
          Duration: {activeDuration}h after use
        </p>
      </div>
    </BaseModal>
  );
});

TicketDetailModal.displayName = 'TicketDetailModal';

export default TicketDetailModal;
