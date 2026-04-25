import { memo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ArchetypeTemplate } from '@/types/identity';
import { getAccent } from '@/constants/accents';

interface IdentityCardProps {
  template: ArchetypeTemplate;
  isBound: boolean;
  isFocused: boolean;
  onSelect: () => void;
}

const IdentityCard = memo(
  ({ template, isBound, isFocused, onSelect }: IdentityCardProps) => {
    const accent = getAccent(template.accent);

    return (
      <motion.button
        type="button"
        onClick={onSelect}
        whileHover={{ scale: isFocused ? 1.03 : 1.05 }}
        whileTap={{ scale: 0.97 }}
        animate={{
          scale: isFocused ? 1 : 0.82,
          opacity: isFocused ? 1 : 0.55,
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`snap-center flex-shrink-0 w-64 sm:w-72 h-[26rem] rounded-3xl p-6 flex flex-col items-center text-center border-2 ${
          isFocused ? accent.borderStrong : accent.border
        } bg-slate-950/70 backdrop-blur-xl relative overflow-hidden transition-colors`}
        style={{
          boxShadow: isFocused
            ? `0 0 40px -10px ${accent.glow}, 0 8px 30px -5px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.08)`
            : '0 4px 20px -5px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.06)',
        }}
        aria-label={`${template.name} archetype`}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.gradientFrom} ${accent.gradientTo} opacity-60`}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)',
          }}
        />

        <div className="relative flex flex-col items-center h-full">
          {/* Bound badge */}
          {isBound && (
            <div
              className="absolute top-0 right-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full border border-emerald-400/70 bg-emerald-500/15 text-emerald-200"
              style={{ boxShadow: '0 0 10px -2px rgba(52,211,153,0.6)' }}
            >
              <Check className="w-3 h-3" />
              Bound
            </div>
          )}

          {/* Glyph */}
          <div
            className={`mt-4 w-28 h-28 rounded-full flex items-center justify-center border-2 ${accent.borderStrong} ${accent.chipBg}`}
            style={{ boxShadow: `0 0 28px -4px ${accent.glow}` }}
          >
            <span
              className={`text-6xl ${accent.textStrong}`}
              style={{ filter: `drop-shadow(0 0 12px ${accent.glow})` }}
            >
              {template.glyph}
            </span>
          </div>

          <h3 className="mt-5 text-2xl font-bold text-white tracking-tight">
            {template.name}
          </h3>
          <p className={`text-[10px] uppercase tracking-[0.28em] ${accent.textSoft} mt-1`}>
            {template.archetype}
          </p>

          <p className="mt-5 text-sm text-slate-300 leading-relaxed px-1">
            {template.tagline}
          </p>

          <div className="flex-1" />

          <p className={`text-[10px] font-mono uppercase tracking-[0.25em] ${accent.textSoft} mt-4`}>
            Tap to inspect
          </p>
        </div>
      </motion.button>
    );
  }
);

IdentityCard.displayName = 'IdentityCard';

export default IdentityCard;
