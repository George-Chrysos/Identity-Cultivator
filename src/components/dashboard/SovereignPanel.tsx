import type { SectorId } from '@/types/dashboard';
import { LifeSectorsPanel } from './LifeSectorsPanel';
import { PriorityMatrix } from './PriorityMatrix';
import { UpgradesPanel } from './UpgradesPanel';

export const SovereignPanel = ({ onOpenSector }: { onOpenSector?: (sector: SectorId) => void }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[210px,1fr] gap-4 items-start">
        <LifeSectorsPanel onOpenSector={onOpenSector} />
        <PriorityMatrix />
      </div>
      <UpgradesPanel />
    </>
  );
};
