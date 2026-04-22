/**
 * IdentityProclamation — the Mantra ribbon.
 *
 * Two modes:
 *  - 'revealing' (large, animated reveal): fired by IdentityInitializer during
 *    the Aha! sequence.
 *  - 'docked' (compact, subtle): persistent ribbon on the Homepage, visible
 *    all day as a low-opacity anchor.
 *
 * Performance: animation is CSS-only (clip-path), not a Framer Motion spring,
 * so it doesn't block the main thread during startup.
 */
import { memo } from 'react';
import { useIdentityProclamation } from '@/hooks/useIdentityProclamation';

interface IdentityProclamationProps {
  mode?: 'revealing' | 'docked';
  /** Optional explicit override (used by IdentityInitializer to freeze a value). */
  mantra?: string;
  className?: string;
}

const IdentityProclamation = memo(({ mode = 'docked', mantra, className }: IdentityProclamationProps) => {
  const { mantra: hookMantra } = useIdentityProclamation();
  const text = mantra ?? hookMantra;
  if (!text) return null;

  const stateClass =
    mode === 'revealing'
      ? 'identity-proclamation identity-proclamation--revealing'
      : 'identity-proclamation identity-proclamation--docked';

  return (
    <p
      className={[stateClass, 'text-center select-none', className].filter(Boolean).join(' ')}
      aria-live={mode === 'revealing' ? 'polite' : undefined}
    >
      {text}
    </p>
  );
});

IdentityProclamation.displayName = 'IdentityProclamation';

export default IdentityProclamation;
