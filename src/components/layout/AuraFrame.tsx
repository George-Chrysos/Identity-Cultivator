/**
 * AuraFrame — Vitality Aura viewport-border glow.
 *
 * The Aura is a passive Buff/Debuff indicator: a single fixed element whose
 * appearance is driven entirely by the `data-aura` attribute on <html>. State
 * is computed by `useVitalityAura()` and written once per change; this
 * component itself does not re-render on game state updates.
 *
 * Pointer-events disabled so it never intercepts clicks.
 */
import { memo } from 'react';

const AuraFrame = memo(() => {
  return <div className="aura-frame" aria-hidden="true" />;
});

AuraFrame.displayName = 'AuraFrame';

export default AuraFrame;
