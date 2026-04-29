import { ArrowLeft } from 'lucide-react';
import type { MysticSectorId } from '@/types/dashboard';
import { EnergySenseWidget } from './EnergySenseWidget';
import { GroundingWidget } from './GroundingWidget';
import { LogosWidget } from './LogosWidget';
import { GratitudeWidget } from './GratitudeWidget';
import { FocusWidget } from './FocusWidget';
import { MysticInsightsPanel } from './MysticInsightsPanel';

const LABEL: Record<MysticSectorId, string> = {
  energySense: 'Energy Sense',
  grounding: 'Grounding',
  logos: 'Logos',
  gratitude: 'Gratitude',
  focus: 'Focus',
};

export const MysticSectorPage = ({
  sector,
  onBack,
}: {
  sector: MysticSectorId;
  onBack: () => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="hud-card p-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-2 rounded-xl border border-white/10 bg-black/20 text-slate-200 text-xs uppercase tracking-[0.22em] font-title hover:border-cyan-400/25 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="sr-only">Back</span>
        </button>
        <div className="text-right">
          <div className="font-title text-sm uppercase tracking-[0.26em] text-slate-300">{LABEL[sector]}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">Mystic sector</div>
        </div>
      </div>

      {sector === 'energySense' && <EnergySenseWidget />}
      {sector === 'grounding' && <GroundingWidget />}
      {sector === 'logos' && <LogosWidget />}
      {sector === 'gratitude' && <GratitudeWidget />}
      {sector === 'focus' && <FocusWidget />}

      <MysticInsightsPanel />
    </div>
  );
};

