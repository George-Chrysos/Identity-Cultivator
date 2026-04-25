import { LifeSectorsPanel } from './LifeSectorsPanel';
import { PriorityMatrix } from './PriorityMatrix';
import { UpgradesPanel } from './UpgradesPanel';

export const SovereignPanel = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[210px,1fr] gap-4 items-start">
        <LifeSectorsPanel />
        <PriorityMatrix />
      </div>
      <UpgradesPanel />
    </>
  );
};
