import { useEffect } from 'react';
import ParticleBackground from '@/components/layout/ParticleBackground';
import Header from '@/components/layout/Header';
import { MetricTriad } from '@/components/dashboard/MetricTriad';
import { MainTaskCard } from '@/components/dashboard/MainTaskCard';
import { DailiesPanel } from '@/components/dashboard/DailiesPanel';
import { useDashboardStore } from '@/store/dashboardStore';

const PAGE_BG =
  'min-h-screen relative overflow-hidden bg-[radial-gradient(1000px_500px_at_20%_10%,rgba(0,245,212,0.10),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(168,85,247,0.14),transparent_60%),linear-gradient(180deg,#060610_0%,#070716_35%,#070717_100%)] text-white';

const Dashboard = () => {
  const ensureDailyRollover = useDashboardStore((s) => s.ensureDailyRollover);

  useEffect(() => {
    ensureDailyRollover();
  }, [ensureDailyRollover]);

  return (
    <div className={PAGE_BG}>
      <ParticleBackground />
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 relative z-10 space-y-4">
        <MetricTriad />
        <MainTaskCard />
        <DailiesPanel />
      </main>
    </div>
  );
};

export default Dashboard;
