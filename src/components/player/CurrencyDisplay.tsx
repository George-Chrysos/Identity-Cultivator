import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Star } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useRef } from 'react';
import { shallow } from 'zustand/shallow';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // Animation duration in seconds
}

const AnimatedNumber = ({ value, duration = 0.3 }: AnimatedNumberProps) => {
  const motionValue = useMotionValue(value);
  const display = useTransform(motionValue, (latest) => Math.floor(latest).toLocaleString());
  const prevValue = useRef(value);

  useEffect(() => {
    // Only animate if value actually changed
    if (prevValue.current !== value) {
      // Use direct animation with linear easing
      const controls = animate(motionValue, value, {
        duration,
        ease: 'easeOut',
      });
      prevValue.current = value;
      return () => controls.stop();
    }
  }, [motionValue, value, duration]);

  return <motion.span>{display}</motion.span>;
};

const CurrencyDisplay = () => {
  // Use selector with shallow comparison to ensure re-render on coin/star changes
  const { coins, stars, setCurrentPage } = useGameStore(
    (state) => ({
      coins: state.userProfile?.coins ?? 0,
      stars: state.userProfile?.stars ?? 0,
      setCurrentPage: state.setCurrentPage,
    }),
    shallow
  );

  // Return null only if we have no data at all
  if (coins === 0 && stars === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border-2 border-purple-500/50 rounded-lg px-4 py-2 shadow-[0_0_8px_rgba(192,132,252,0.3)]"
    >
      {/* Coins */}
      <motion.div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setCurrentPage('tavern')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-xl drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]">🪙</div>
        <div className="text-lg font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
          <AnimatedNumber value={coins} />
        </div>
      </motion.div>

      {/* Vertical Divider */}
      <div className="h-8 w-px bg-gradient-to-b from-transparent via-dark-border to-transparent" />

      {/* Stars - with slower animation for small values */}
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]" strokeWidth={2.5} />
        <div className="text-lg font-black bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
          <AnimatedNumber value={stars} duration={0.8} />
        </div>
      </div>
    </motion.div>
  );
};

export default CurrencyDisplay;
