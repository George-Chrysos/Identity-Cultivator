/**
 * IdentityInitializer — the "Aha!" moment on app open.
 *
 * Once per session, when the user first reaches the authenticated Homepage,
 * we run a short ritual:
 *
 *   Phase 1 (0ms):        html[data-aura="initializing"] — shrouded darkness
 *   Phase 2 (160ms):      show full-screen overlay with the daily mantra
 *                         (IdentityProclamation in "revealing" mode)
 *   Phase 3 (~900ms):     trigger haptic pulse (if available)
 *   Phase 4 (1700ms):     dissolve overlay; aura transitions to its real state
 *                         (neon-steady / neon-ascendant / shrouded)
 *
 * After dismissal (tap or auto-fade), useVitalityAura is free to take over
 * and set the true aura state.
 *
 * Runs only once per session (sessionStorage key). Reduced-motion users
 * skip the full animation — the overlay appears already revealed and
 * dismisses on the first tap.
 */
import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IdentityProclamation from '@/components/trinity/IdentityProclamation';
import { logger } from '@/utils/logger';

const SESSION_KEY = 'grimoire.initialized.session';
const REVEAL_MS = 1700;

interface IdentityInitializerProps {
  /** Whether the parent considers the user "ready" for the ritual (authed + initialized). */
  isReady: boolean;
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const triggerHaptic = () => {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    // Short double-tap to signal "you're back; remember who you are."
    navigator.vibrate([40, 60, 40]);
  } catch (e) {
    logger.debug('IdentityInitializer: haptic unavailable', { error: e });
  }
};

const IdentityInitializer = memo(({ isReady }: IdentityInitializerProps) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (typeof window === 'undefined') return;

    // One ritual per session — don't re-show on every route change.
    const already = sessionStorage.getItem(SESSION_KEY);
    if (already) return;
    sessionStorage.setItem(SESSION_KEY, '1');

    const reduced = prefersReducedMotion();

    setVisible(true);
    logger.info('IdentityInitializer: ritual begin', { reduced });

    // Haptic at ~900ms when the mantra is fully revealed.
    const hapticTimer = window.setTimeout(triggerHaptic, reduced ? 50 : 900);

    // Dissolve after REVEAL_MS. Users can also tap to dismiss.
    const dismissTimer = window.setTimeout(() => {
      setDismissed(true);
    }, reduced ? 900 : REVEAL_MS);

    return () => {
      window.clearTimeout(hapticTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [isReady]);

  const handleDismiss = () => {
    if (!visible) return;
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <AnimatePresence onExitComplete={() => setVisible(false)}>
      {!dismissed && (
        <motion.div
          key="identity-initializer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Daily identity invocation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[80] flex items-center justify-center px-6 cursor-pointer"
          style={{
            background:
              'radial-gradient(circle at center, rgba(15,7,40,0.88) 0%, rgba(6,2,20,0.96) 75%)',
            backdropFilter: 'blur(18px) saturate(120%)',
            WebkitBackdropFilter: 'blur(18px) saturate(120%)',
          }}
        >
          <div className="max-w-2xl text-center">
            <IdentityProclamation mode="revealing" className="text-2xl md:text-3xl" />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.1, duration: 0.35 }}
              className="mt-6 text-[11px] font-mono tracking-[0.24em] uppercase text-slate-500"
            >
              Tap to proceed
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

IdentityInitializer.displayName = 'IdentityInitializer';

export default IdentityInitializer;
