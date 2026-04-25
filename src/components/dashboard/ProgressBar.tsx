interface ProgressBarProps {
  value: number; // 0..100
  accent?: 'cyan' | 'purple' | 'amber' | 'pink' | 'danger' | 'muted';
  showDanger?: boolean;
}

const ACCENTS: Record<NonNullable<ProgressBarProps['accent']>, string> = {
  cyan: 'bg-[linear-gradient(90deg,#00f5d4,rgba(0,245,212,0.55))]',
  purple: 'bg-[linear-gradient(90deg,#a855f7,rgba(168,85,247,0.55))]',
  amber: 'bg-[linear-gradient(90deg,#f9c74f,rgba(249,199,79,0.55))]',
  pink: 'bg-[linear-gradient(90deg,#f72585,rgba(247,37,133,0.55))]',
  danger: 'bg-[linear-gradient(90deg,#f72585,rgba(247,37,133,0.55))]',
  muted: 'bg-[linear-gradient(90deg,rgba(148,163,184,0.35),rgba(148,163,184,0.15))]',
};

export const ProgressBar = ({ value, accent = 'cyan', showDanger }: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  const isDanger = showDanger && clamped < 40;
  const fillClass = isDanger ? ACCENTS.danger : ACCENTS[accent];

  return (
    <div className="h-2.5 w-full rounded-full bg-black/40 border border-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full ${fillClass} transition-[width] duration-500 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

