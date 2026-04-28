import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { selfCareDB } from '@/api/selfCareDatabase';
import { ArrowLeft, Save, Clock } from 'lucide-react';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const SelfCarePage = ({ onBack }: { onBack: () => void }) => {
  const userId = useAuthStore((s) => s.currentUser?.id ?? null);
  const canUseDb = Boolean(userId) && selfCareDB.isReady();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sleepQuality, setSleepQuality] = useState<number>(0);
  const [mealsCount, setMealsCount] = useState<number>(0);
  const [mealsQuality, setMealsQuality] = useState<number>(0);
  const [activated, setActivated] = useState<boolean>(false);
  const [stretched, setStretched] = useState<boolean>(false);

  const [lastShower, setLastShower] = useState<string | null>(null);
  const [lastBrush, setLastBrush] = useState<string | null>(null);

  const refresh = async () => {
    if (!userId) return;
    const [checkin, shower, brush] = await Promise.all([
      selfCareDB.getTodayCheckin(userId),
      selfCareDB.getLatestHygieneEvent(userId, 'shower'),
      selfCareDB.getLatestHygieneEvent(userId, 'brush_teeth'),
    ]);
    setSleepQuality(checkin?.sleep_quality ?? 0);
    setMealsCount(checkin?.meals_count ?? 0);
    setMealsQuality(checkin?.meals_quality ?? 0);
    setActivated(Boolean(checkin?.activated));
    setStretched(Boolean(checkin?.stretched));
    setLastShower(shower?.created_at ?? null);
    setLastBrush(brush?.created_at ?? null);
  };

  useEffect(() => {
    if (!canUseDb) return;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const saveCheckin = () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        await selfCareDB.upsertTodayCheckin({
          userId,
          sleepQuality: clamp(sleepQuality, 0, 100),
          mealsCount: clamp(mealsCount, 0, 10),
          mealsQuality: clamp(mealsQuality, 0, 100),
          activated,
          stretched,
        });
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  };

  const oneTap = (type: 'shower' | 'brush_teeth') => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        await selfCareDB.addHygieneEvent(userId, type);
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  };

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
          <div className="font-title text-sm uppercase tracking-[0.26em] text-slate-300">Self‑Care</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Today check-in • Hygiene taps
          </div>
        </div>
      </div>

      {!canUseDb && (
        <section className="hud-card p-4 border-amber-400/20 bg-black/20">
          <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/80 font-title">
            DB not connected
          </div>
          <div className="mt-1 text-sm text-slate-300">
            The Self‑Care UI is visible, but actions are disabled until you sign in and Supabase is configured.
          </div>
        </section>
      )}

      <section className="hud-card p-5 md:p-6">
            <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title mb-3">
              Today
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Sleep quality (0–100)">
                <input
                  type="number"
                  value={sleepQuality}
                  min={0}
                  max={100}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  disabled={!canUseDb}
                  className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30 font-data disabled:opacity-50"
                />
              </Field>
              <Field label="Meals count (0–10)">
                <input
                  type="number"
                  value={mealsCount}
                  min={0}
                  max={10}
                  onChange={(e) => setMealsCount(Number(e.target.value))}
                  disabled={!canUseDb}
                  className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30 font-data disabled:opacity-50"
                />
              </Field>
              <Field label="Meals quality (0–100)">
                <input
                  type="number"
                  value={mealsQuality}
                  min={0}
                  max={100}
                  onChange={(e) => setMealsQuality(Number(e.target.value))}
                  disabled={!canUseDb}
                  className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30 font-data disabled:opacity-50"
                />
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Toggle label="Activated today" value={activated} onChange={setActivated} disabled={!canUseDb} />
              <Toggle label="Stretched today" value={stretched} onChange={setStretched} disabled={!canUseDb} />
              <button
                type="button"
                disabled={!canUseDb || loading}
                onClick={saveCheckin}
                className="ml-auto px-4 py-2 rounded-xl bg-[#00f5d4]/15 border border-[#00f5d4]/30 text-[#00f5d4] text-xs uppercase tracking-[0.22em] font-title hover:bg-[#00f5d4]/20 disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </div>
              </button>
            </div>
          </section>

          <section className="hud-card p-5 md:p-6">
            <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title mb-3">
              Hygiene
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <OneTap
                title="Shower"
                last={lastShower}
                onTap={() => oneTap('shower')}
                disabled={!canUseDb || loading}
              />
              <OneTap
                title="Brush teeth"
                last={lastBrush}
                onTap={() => oneTap('brush_teeth')}
                disabled={!canUseDb || loading}
              />
            </div>

            {error && <div className="mt-3 text-sm text-rose-300">{error}</div>}
          </section>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-title mb-1">{label}</div>
    {children}
  </div>
);

const Toggle = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChange(!value)}
    className={`px-3 py-2 rounded-xl border text-xs uppercase tracking-[0.22em] font-title transition-colors disabled:opacity-50 ${
      value ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-200' : 'border-white/10 bg-black/20 text-slate-300 hover:text-white'
    }`}
  >
    {label}
  </button>
);

const OneTap = ({
  title,
  last,
  onTap,
  disabled,
}: {
  title: string;
  last: string | null;
  onTap: () => void;
  disabled: boolean;
}) => (
  <div className="rounded-2xl border border-white/10 bg-black/15 p-4 flex items-center justify-between gap-4">
    <div className="min-w-0">
      <div className="text-sm text-slate-100 font-semibold">{title}</div>
      <div className="mt-1 text-[11px] text-slate-500 font-data">
        Last: {last ? new Date(last).toLocaleString() : '—'}
      </div>
    </div>
    <button
      type="button"
      disabled={disabled}
      onClick={onTap}
      className="px-3 py-2 rounded-xl bg-[#00f5d4]/15 border border-[#00f5d4]/30 text-[#00f5d4] text-xs uppercase tracking-[0.22em] font-title hover:bg-[#00f5d4]/20 disabled:opacity-50"
    >
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>Now</span>
      </div>
    </button>
  </div>
);

