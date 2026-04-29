import { useEffect, useState } from 'react';
import ParticleBackground from '@/components/layout/ParticleBackground';
import Header from '@/components/layout/Header';
import { IdentityHeader } from '@/components/dashboard/IdentityHeader';
import { MainQuestCard } from '@/components/dashboard/MainQuestCard';
import { CenterViewToggle } from '@/components/dashboard/CenterViewToggle';
import { SovereignPanel } from '@/components/dashboard/SovereignPanel';
import { MysticPanel } from '@/components/dashboard/MysticPanel';
import { TricksterPanel } from '@/components/dashboard/TricksterPanel';
import { DailyXpSummaryCard } from '@/components/dashboard/DailyXpSummaryCard';
import { useDashboardStore } from '@/store/dashboardStore';
import type { SectorId } from '@/types/dashboard';
import { FinancePage } from './FinancePage';
import { SelfCarePage } from './SelfCarePage';
import { HomeSectorPage } from './HomeSectorPage';
import { MotorcyclePage } from './MotorcyclePage';

const Dashboard = () => {
  const activeCenter = useDashboardStore((s) => s.dashboard.activeCenter);
  const recordSectorVisit = useDashboardStore((s) => s.recordSectorVisit);
  const [sectorPage, setSectorPage] = useState<SectorId | null>(null);

  // Switching centers should always return you to that center's main view.
  useEffect(() => {
    setSectorPage(null);
  }, [activeCenter]);

  useEffect(() => {
    if (activeCenter === 'mystic') recordSectorVisit('focus');
    if (activeCenter === 'trickster') recordSectorVisit('play');
  }, [activeCenter, recordSectorVisit]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(1000px_500px_at_20%_10%,rgba(0,245,212,0.10),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(168,85,247,0.14),transparent_60%),linear-gradient(180deg,#060610_0%,#070716_35%,#070717_100%)] text-white">
      <ParticleBackground />
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 relative z-10 space-y-4">
        <IdentityHeader />
        <MainQuestCard />

        <CenterViewToggle />

        {sectorPage === 'finance' && <FinancePage onBack={() => setSectorPage(null)} />}
        {sectorPage === 'selfCare' && <SelfCarePage onBack={() => setSectorPage(null)} />}
        {sectorPage === 'home' && <HomeSectorPage onBack={() => setSectorPage(null)} />}
        {sectorPage === 'motorcycle' && <MotorcyclePage onBack={() => setSectorPage(null)} />}

        {!sectorPage && (
          <>
            {activeCenter === 'sovereign' && (
              <SovereignPanel
                onOpenSector={(s) => {
                  recordSectorVisit(s);
                  setSectorPage(s);
                }}
              />
            )}
            {activeCenter === 'mystic' && <MysticPanel />}
            {activeCenter === 'trickster' && <TricksterPanel />}
            <DailyXpSummaryCard />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

