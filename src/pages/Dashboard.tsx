import { useEffect, useState } from 'react';
import ParticleBackground from '@/components/layout/ParticleBackground';
import Header from '@/components/layout/Header';
import { MetricStrip } from '@/components/dashboard/MetricStrip';
import { MetricLogModal } from '@/components/dashboard/MetricLogModal';
import { MetricHelpModal } from '@/components/dashboard/MetricHelpModal';
import { MainTaskCard } from '@/components/dashboard/MainTaskCard';
import { DailiesPanel } from '@/components/dashboard/DailiesPanel';
import { CalendarModal, type HistoryTab } from '@/components/dashboard/CalendarModal';
import { FinancialPulseCard } from '@/components/finance/FinancialPulseCard';
import { NetWorthCard } from '@/components/finance/NetWorthCard';
import { QuickAddExpense } from '@/components/finance/QuickAddExpense';
import { RecentExpenses } from '@/components/finance/RecentExpenses';
import { FinanceSettingsModal } from '@/components/finance/FinanceSettingsModal';
import { Link } from 'react-router-dom';
import { useDashboardStore } from '@/store/dashboardStore';

const PAGE_BG =
  'min-h-screen relative overflow-hidden bg-[radial-gradient(1000px_500px_at_20%_10%,rgba(0,245,212,0.10),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(168,85,247,0.14),transparent_60%),linear-gradient(180deg,#060610_0%,#070716_35%,#070717_100%)] text-white';

const Dashboard = () => {
  const [logOpen, setLogOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<HistoryTab>('stats');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const applyQuestCarryover = useDashboardStore((s) => s.applyQuestCarryover);
  const refreshRank = useDashboardStore((s) => s.refreshRank);

  useEffect(() => {
    const afterHydrate = () => {
      applyQuestCarryover();
      refreshRank();
    };
    const persistApi = useDashboardStore.persist;
    if (persistApi.hasHydrated()) {
      afterHydrate();
      return;
    }
    return persistApi.onFinishHydration(afterHydrate);
  }, [applyQuestCarryover, refreshRank]);

  const openHistory = (tab: HistoryTab) => {
    setHistoryTab(tab);
    setCalendarOpen(true);
  };

  return (
    <div className={PAGE_BG}>
      <ParticleBackground />
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative z-10 flex flex-col gap-[var(--space-lg)]">
        <Link
          to="/concord"
          className="block rounded-2xl border border-purple-500/30 bg-slate-950/50 px-5 py-4 transition-colors hover:border-cyan-400/50"
        >
          <span className="font-section text-xs uppercase tracking-[0.16em] text-cyan-300">Register</span>
          <span className="mt-1 block font-title text-lg text-white">Concord</span>
          <span className="mt-1 block text-sm text-slate-300">
            Charge, Current, and Mind/Will, read across neidan, the Hermetic art, and the Qabalah.
          </span>
        </Link>
        <MetricStrip
          onOpenLog={() => setLogOpen(true)}
          onOpenHistory={() => openHistory('stats')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-lg)] items-stretch">
          <div className="lg:col-span-2">
            <MainTaskCard />
          </div>
          <div className="lg:col-span-1">
            <DailiesPanel />
          </div>
        </div>

        <FinancialPulseCard
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenInsights={() => openHistory('insights')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-lg)]">
          <QuickAddExpense />
          <RecentExpenses onViewAll={() => openHistory('finance')} />
        </div>

        <NetWorthCard />
      </main>

      <MetricLogModal
        isOpen={logOpen}
        onClose={() => setLogOpen(false)}
        onOpenHelp={() => setHelpOpen(true)}
        closeOnEscape={!helpOpen}
      />
      <CalendarModal
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onOpenHelp={() => setHelpOpen(true)}
        closeOnEscape={!helpOpen}
        initialTab={historyTab}
      />
      <MetricHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <FinanceSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Dashboard;
