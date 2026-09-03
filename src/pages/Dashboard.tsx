import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import ParticleBackground from '@/components/layout/ParticleBackground';
import Header from '@/components/layout/Header';
import { MetricStrip } from '@/components/dashboard/MetricStrip';
import { MetricLogModal } from '@/components/dashboard/MetricLogModal';
import { MainTaskCard } from '@/components/dashboard/MainTaskCard';
import { DailiesPanel } from '@/components/dashboard/DailiesPanel';
import { CalendarModal } from '@/components/dashboard/CalendarModal';

const PAGE_BG =
  'min-h-screen relative overflow-hidden bg-[radial-gradient(1000px_500px_at_20%_10%,rgba(0,245,212,0.10),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(168,85,247,0.14),transparent_60%),linear-gradient(180deg,#060610_0%,#070716_35%,#070717_100%)] text-white';

const Dashboard = () => {
  const [logOpen, setLogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className={PAGE_BG}>
      <ParticleBackground />
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 relative z-10 space-y-4">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/50 border border-white/10 text-xs uppercase tracking-widest font-section text-cyan-200 hover:border-cyan-400/40"
          >
            <CalendarDays className="h-4 w-4" />
            History
          </button>
        </div>

        <MetricStrip onOpenLog={() => setLogOpen(true)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <div className="lg:col-span-2">
            <MainTaskCard />
          </div>
          <div className="lg:col-span-1">
            <DailiesPanel />
          </div>
        </div>
      </main>

      <MetricLogModal isOpen={logOpen} onClose={() => setLogOpen(false)} />
      <CalendarModal isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </div>
  );
};

export default Dashboard;
