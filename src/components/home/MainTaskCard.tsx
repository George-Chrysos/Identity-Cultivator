import { memo, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Flame, Sparkles } from 'lucide-react';
import type { UserIdentity } from '@/types/identity';
import { getArchetype, getLevelEntry } from '@/constants/archetypes';
import { getAccent } from '@/constants/accents';
import { useIdentityStore } from '@/store/identityStore';
import { levelProgressRatio, xpNeededForNext } from '@/utils/leveling';

interface MainTaskCardProps {
  identity: UserIdentity;
}

const MainTaskCard = memo(({ identity }: MainTaskCardProps) => {
  const template = getArchetype(identity.templateId);
  const levelEntry = getLevelEntry(identity.templateId, identity.level);
  const isCompletedToday = useIdentityStore((s) => s.isCompletedToday(identity.id));
  const completeIdentityToday = useIdentityStore((s) => s.completeIdentityToday);

  const [burst, setBurst] = useState(false);

  const handleComplete = useCallback(async () => {
    if (isCompletedToday) return;
    const result = await completeIdentityToday(identity.id);
    if (!result.alreadyCompleted) {
      setBurst(true);
      setTimeout(() => setBurst(false), 900);
    }
  }, [completeIdentityToday, identity.id, isCompletedToday]);

  if (!template || !levelEntry) return null;

  const accent = getAccent(template.accent);
  const progress = levelProgressRatio(identity.level, identity.xpIntoLevel);
  const threshold = xpNeededForNext(identity.level);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative card-base p-6 border-2 ${accent.border} transition-all`}
      style={{
        boxShadow: `0 0 22px -6px ${accent.glow}, 0 4px 20px -5px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.08)`,
      }}
    >
      {/* Subtle accent gradient wash */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${accent.gradientFrom} ${accent.gradientTo} opacity-40`}
      />

      {/* Completion burst overlay */}
      <AnimatePresence>
        {burst && (
          <motion.div
            key="burst"
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="w-40 h-40 rounded-full"
              style={{
                background: `radial-gradient(circle, ${accent.glow} 0%, transparent 70%)`,
              }}
            />
            <motion.div
              initial={{ y: 0, opacity: 1, scale: 0.8 }}
              animate={{ y: -24, opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute flex items-center gap-1 text-xs font-bold uppercase tracking-[0.25em] text-white"
              style={{ textShadow: `0 0 12px ${accent.glow}` }}
            >
              <Sparkles className="w-3 h-3" />
              +1
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-start gap-4">
        {/* Glyph medallion */}
        <div
          className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border ${accent.borderStrong} ${accent.chipBg} backdrop-blur-sm`}
          style={{ boxShadow: `0 0 18px -4px ${accent.glow}` }}
        >
          <span
            className={`text-3xl ${accent.textStrong}`}
            style={{ filter: `drop-shadow(0 0 6px ${accent.glow})` }}
          >
            {template.glyph}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h3 className="text-xl md:text-2xl font-bold text-white truncate tracking-tight">
              {template.name}
            </h3>
            <span className={`text-xs font-mono uppercase tracking-[0.25em] ${accent.textSoft} flex-shrink-0`}>
              Lv {identity.level}
            </span>
          </div>

          <p className={`text-[11px] uppercase tracking-[0.25em] ${accent.textSoft} mb-3`}>
            {template.archetype}
            {levelEntry.intensity ? ` \u00b7 ${levelEntry.intensity}` : ''}
          </p>

          {/* Level progress bar */}
          <div className="h-1.5 rounded-full bg-slate-800/60 overflow-hidden mb-4">
            <motion.div
              className="h-full"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                background: `linear-gradient(to right, ${accent.glow}, rgba(255,255,255,0.6))`,
                boxShadow: `0 0 10px ${accent.glow}`,
              }}
            />
          </div>
          <p className={`text-[10px] font-mono ${accent.textSoft} mb-4`}>
            {identity.xpIntoLevel} / {threshold} days to Lv {identity.level + 1}
          </p>
        </div>
      </div>

      {/* Tasks list */}
      <ul className="relative mt-2 space-y-3">
        {levelEntry.tasks.map((task, idx) => (
          <li
            key={idx}
            className={`flex gap-3 items-start rounded-xl border ${accent.border} bg-slate-900/50 px-4 py-3`}
          >
            <Flame
              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${accent.textStrong}`}
              style={{ filter: `drop-shadow(0 0 6px ${accent.glow})` }}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-snug">
                {task.title}
              </p>
              {task.detail && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Complete button */}
      <div className="relative mt-5 flex justify-end">
        <motion.button
          type="button"
          onClick={handleComplete}
          disabled={isCompletedToday}
          whileHover={!isCompletedToday ? { scale: 1.03 } : undefined}
          whileTap={!isCompletedToday ? { scale: 0.97 } : undefined}
          className={[
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm uppercase tracking-[0.18em] transition-colors',
            isCompletedToday
              ? 'bg-emerald-500/20 border-2 border-emerald-400/60 text-emerald-200 cursor-default'
              : `border-2 ${accent.borderStrong} ${accent.chipBg} text-white hover:bg-white/10`,
          ].join(' ')}
          style={
            !isCompletedToday
              ? { boxShadow: `0 0 18px -4px ${accent.glow}` }
              : undefined
          }
          aria-label={isCompletedToday ? 'Completed for today' : 'Mark as complete'}
        >
          <Check className="w-4 h-4" />
          {isCompletedToday ? 'Sealed' : 'Complete'}
        </motion.button>
      </div>
    </motion.article>
  );
});

MainTaskCard.displayName = 'MainTaskCard';

export default MainTaskCard;
