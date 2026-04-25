import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link2, Unlink, Lock, Flame } from 'lucide-react';
import type { ArchetypeTemplate, UserIdentity } from '@/types/identity';
import { getAccent } from '@/constants/accents';
import { BaseModal } from '@/components/common';
import { IDENTITY_LIMITS } from '@/constants/limits';
import { toast } from '@/store/toastStore';
import { useIdentityStore } from '@/store/identityStore';

interface IdentityDetailSheetProps {
  template: ArchetypeTemplate | null;
  binding: UserIdentity | null; // the user's binding to this template, if any
  boundCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const IdentityDetailSheet = memo(
  ({ template, binding, boundCount, isOpen, onClose }: IdentityDetailSheetProps) => {
    const bindIdentity = useIdentityStore((s) => s.bindIdentity);
    const releaseIdentity = useIdentityStore((s) => s.releaseIdentity);

    const accent = template ? getAccent(template.accent) : null;

    // Preview a subset of the ladder: 1, 5, 10, 25, 50, 100
    const previewLevels = useMemo(() => {
      if (!template) return [];
      const picks = [1, 5, 10, 25, 50, 100];
      return picks
        .map((lvl) => template.levels.find((entry) => entry.level === lvl))
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    }, [template]);

    if (!template || !accent) return null;

    const atCap =
      !binding && boundCount >= IDENTITY_LIMITS.MAX_ACTIVE;

    const handleBind = async () => {
      const result = await bindIdentity(template.id);
      if (result.ok) {
        toast.success(`${template.name} bound as an anchor`);
        onClose();
      } else {
        toast.warning(result.reason || 'Could not bind this identity');
      }
    };

    const handleRelease = async () => {
      if (!binding) return;
      await releaseIdentity(binding.id);
      toast.info(`${template.name} released`);
      onClose();
    };

    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="xl"
        borderColor={accent.glow}
        glowColor={accent.glow}
      >
        <div className="px-6 pt-6 pb-7">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={`w-20 h-20 flex-shrink-0 rounded-full flex items-center justify-center border-2 ${accent.borderStrong} ${accent.chipBg}`}
              style={{ boxShadow: `0 0 24px -6px ${accent.glow}` }}
            >
              <span
                className={`text-4xl ${accent.textStrong}`}
                style={{ filter: `drop-shadow(0 0 8px ${accent.glow})` }}
              >
                {template.glyph}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {template.name}
              </h2>
              <p className={`text-[11px] uppercase tracking-[0.3em] ${accent.textSoft} mt-1`}>
                {template.archetype}
              </p>
              <p className="mt-2 text-sm italic text-slate-300">{template.tagline}</p>
            </div>
          </div>

          {/* Lore */}
          <p className="mt-5 text-sm text-slate-300 leading-relaxed">
            {template.description}
          </p>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">{template.lore}</p>

          {/* Binding status */}
          {binding && (
            <div
              className="mt-5 rounded-xl border-2 border-emerald-400/50 bg-emerald-500/10 px-4 py-3 flex items-center gap-3"
              style={{ boxShadow: '0 0 18px -6px rgba(52,211,153,0.5)' }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Link2 className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-200/80">
                  Currently bound
                </p>
                <p className="text-sm text-white">
                  Level {binding.level} &middot; {binding.xpIntoLevel} day
                  {binding.xpIntoLevel === 1 ? '' : 's'} toward Lv {binding.level + 1}
                </p>
              </div>
            </div>
          )}

          {/* Level ladder preview */}
          <div className="mt-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">
              Level Ladder
            </h3>
            <ul className="space-y-2">
              {previewLevels.map((entry) => (
                <motion.li
                  key={entry.level}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-xl border ${accent.border} bg-slate-900/50 px-4 py-3`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className={`text-sm font-bold ${accent.textStrong}`}>
                      Lv {entry.level}
                    </span>
                    {entry.intensity && (
                      <span className={`text-[10px] uppercase tracking-[0.25em] ${accent.textSoft}`}>
                        {entry.intensity}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {entry.tasks.map((task, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-xs text-slate-300">
                        <Flame
                          className={`w-3 h-3 mt-0.5 flex-shrink-0 ${accent.textStrong}`}
                        />
                        <span>{task.title}</span>
                      </li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Action row */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            {binding ? (
              <button
                type="button"
                onClick={handleRelease}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-red-400/60 bg-red-500/15 text-red-200 font-semibold text-sm uppercase tracking-[0.2em] hover:bg-red-500/25 transition-colors"
              >
                <Unlink className="w-4 h-4" />
                Release
              </button>
            ) : atCap ? (
              <div
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-600 bg-slate-800/60 text-slate-400 font-semibold text-sm uppercase tracking-[0.2em] cursor-not-allowed"
                aria-disabled
              >
                <Lock className="w-4 h-4" />
                Already bound to {IDENTITY_LIMITS.MAX_ACTIVE}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleBind}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 ${accent.borderStrong} ${accent.chipBg} text-white font-semibold text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-colors`}
                style={{ boxShadow: `0 0 20px -5px ${accent.glow}` }}
              >
                <Link2 className="w-4 h-4" />
                Bind this Identity
              </button>
            )}
          </div>
        </div>
      </BaseModal>
    );
  }
);

IdentityDetailSheet.displayName = 'IdentityDetailSheet';

export default IdentityDetailSheet;
