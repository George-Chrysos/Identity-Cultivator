import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { homeDB } from '@/api/homeDatabase';
import { ArrowLeft, Home as HomeIcon } from 'lucide-react';

const CHIPS = [0, 25, 50, 75, 100] as const;
const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

export const HomeSectorPage = ({ onBack }: { onBack: () => void }) => {
  const userId = useAuthStore((s) => s.currentUser?.id ?? null);
  const effectiveUserId = userId ?? 'offline';
  const offline = !homeDB.isReady() || !userId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cleanliness, setCleanliness] = useState<number>(0);
  const [organization, setOrganization] = useState<number>(0);

  const refresh = async () => {
    const row = await homeDB.getTodayCheckin(effectiveUserId);
    setCleanliness(row?.cleanliness ?? 0);
    setOrganization(row?.organization ?? 0);
  };

  useEffect(() => {
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
  }, [effectiveUserId]);

  const save = (next: { cleanliness?: number; organization?: number }) => {
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        await homeDB.upsertTodayCheckin({
          userId: effectiveUserId,
          cleanliness: next.cleanliness ?? cleanliness,
          organization: next.organization ?? organization,
        });
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
          <div className="font-title text-sm uppercase tracking-[0.26em] text-slate-300 flex items-center justify-end gap-2">
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">Clarity meters</div>
        </div>
      </div>

      {offline && (
        <section className="hud-card p-4 border-amber-400/20 bg-black/20">
          <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/80 font-title">
            Offline mode
          </div>
          <div className="mt-1 text-sm text-slate-300">
            Changes are saved locally on this device. Sign in + configure Supabase to sync across devices.
          </div>
        </section>
      )}

      <section className="hud-card p-5 md:p-6">
            <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title mb-3">
              Today
            </div>

            <Meter
              label="Cleanliness"
              value={cleanliness}
              onSet={(v) => {
                setCleanliness(v);
                save({ cleanliness: v });
              }}
              disabled={loading}
            />

            <div className="mt-4" />

            <Meter
              label="Organization"
              value={organization}
              onSet={(v) => {
                setOrganization(v);
                save({ organization: v });
              }}
              disabled={loading}
            />

            {error && <div className="mt-3 text-sm text-rose-300">{error}</div>}
          </section>

          <section className="hud-card p-5 md:p-6">
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-title mb-2">
              Easy tracking tips
            </div>
            <ul className="text-sm text-slate-400 space-y-1 list-disc pl-5">
              <li>Cleanliness: surfaces, floors, dishes, trash.</li>
              <li>Organization: items returned, desk clear, laundry handled.</li>
              <li>Don’t overthink: pick the number that matches “how it feels”.</li>
            </ul>
          </section>
    </div>
  );
};

const Meter = ({
  label,
  value,
  onSet,
  disabled,
}: {
  label: string;
  value: number;
  onSet: (v: number) => void;
  disabled: boolean;
}) => (
  <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-slate-100 font-semibold">{label}</div>
      <div className="font-data text-slate-100">{value}</div>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      {CHIPS.map((c) => (
        <button
          key={c}
          type="button"
          disabled={disabled}
          onClick={() => onSet(c)}
          className={`px-3 py-2 rounded-xl border text-xs font-title uppercase tracking-[0.22em] disabled:opacity-50 ${
            value === c
              ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-200'
              : 'border-white/10 bg-black/20 text-slate-300 hover:text-white'
          }`}
        >
          {c}
        </button>
      ))}
      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSet(clamp(value - 5))}
          className="px-3 py-2 rounded-xl border border-white/10 bg-black/20 text-slate-300 hover:text-white text-xs font-title uppercase tracking-[0.22em] disabled:opacity-50"
        >
          −
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSet(clamp(value + 5))}
          className="px-3 py-2 rounded-xl border border-white/10 bg-black/20 text-slate-300 hover:text-white text-xs font-title uppercase tracking-[0.22em] disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  </div>
);

