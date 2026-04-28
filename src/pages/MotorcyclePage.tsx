import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motorcycleDB, type MotorcycleEventType } from '@/api/motorcycleDatabase';
import { ArrowLeft, Clock, Save, Fuel } from 'lucide-react';

const clampInt = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

export const MotorcyclePage = ({ onBack }: { onBack: () => void }) => {
  const userId = useAuthStore((s) => s.currentUser?.id ?? null);
  const effectiveUserId = userId ?? 'offline';
  const offline = !motorcycleDB.isReady() || !userId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [km, setKm] = useState<number>(0);
  const [kmDraft, setKmDraft] = useState<string>('');

  const [lastService, setLastService] = useState<string | null>(null);
  const [lastTyres, setLastTyres] = useState<string | null>(null);
  const [lastWash, setLastWash] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [fuelLiters, setFuelLiters] = useState<string>('');
  const [fuelTotal, setFuelTotal] = useState<string>(''); // optional
  const [fuelKm, setFuelKm] = useState<string>(''); // optional
  const [fuelLogs, setFuelLogs] = useState<
    Array<{ liters: number | null; total_cents: number | null; km_at_fill: number | null; recorded_at: string }>
  >([]);

  const refresh = async () => {
    const [odo, service, tyres, wash, check, logs] = await Promise.all([
      motorcycleDB.getLatestOdometer(effectiveUserId),
      motorcycleDB.getLatestEvent(effectiveUserId, 'service'),
      motorcycleDB.getLatestEvent(effectiveUserId, 'tyre_pressure_check'),
      motorcycleDB.getLatestEvent(effectiveUserId, 'wash'),
      motorcycleDB.getLatestEvent(effectiveUserId, 'check'),
      motorcycleDB.listFuelLogs(effectiveUserId, 20),
    ]);
    setKm(odo?.km ?? 0);
    setLastService(service?.recorded_at ?? null);
    setLastTyres(tyres?.recorded_at ?? null);
    setLastWash(wash?.recorded_at ?? null);
    setLastCheck(check?.recorded_at ?? null);
    setFuelLogs(logs);
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

  const oneTap = (type: MotorcycleEventType) => {
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        await motorcycleDB.addEvent(effectiveUserId, type);
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  };

  const saveKm = () => {
    const parsed = Number(kmDraft);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        await motorcycleDB.addOdometer(effectiveUserId, clampInt(parsed, 0, 9_999_999));
        setKmDraft('');
        await refresh();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  };

  const addFuel = () => {
    const liters = fuelLiters ? Number(fuelLiters) : null;
    const total = fuelTotal ? Math.round(Number(fuelTotal) * 100) : null;
    const kmAtFill = fuelKm ? clampInt(Number(fuelKm), 0, 9_999_999) : null;
    if (liters !== null && (!Number.isFinite(liters) || liters <= 0)) return;
    if (total !== null && (!Number.isFinite(total) || total < 0)) return;

    setLoading(true);
    setError(null);
    void (async () => {
      try {
        await motorcycleDB.addFuelLog({
          userId: effectiveUserId,
          liters,
          totalCents: total,
          kmAtFill,
        });
        setFuelLiters('');
        setFuelTotal('');
        setFuelKm('');
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
          <div className="font-title text-sm uppercase tracking-[0.26em] text-slate-300">Motorcycle</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">One‑tap maintenance</div>
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
            <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title mb-3">KM</div>
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-title">Current</div>
                <div className="mt-1 font-data text-2xl text-slate-100">{km}</div>
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-title mb-1">New reading</div>
                  <input
                    value={kmDraft}
                    onChange={(e) => setKmDraft(e.target.value)}
                    inputMode="numeric"
                    className="w-28 rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30 font-data text-right"
                    placeholder="e.g. 42150"
                  />
                </div>
                <button
                  type="button"
                  disabled={loading || !kmDraft}
                  onClick={saveKm}
                  className="px-3 py-2 rounded-xl bg-[#00f5d4]/15 border border-[#00f5d4]/30 text-[#00f5d4] text-xs uppercase tracking-[0.22em] font-title hover:bg-[#00f5d4]/20 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </div>
                </button>
              </div>
            </div>
          </section>

          <section className="hud-card p-5 md:p-6">
            <div className="text-[11px] uppercase tracking-[0.34em] text-slate-300 font-title mb-3">Last time</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <OneTap title="Service / Check" last={lastService} onTap={() => oneTap('service')} disabled={loading} />
              <OneTap title="Tyre pressure" last={lastTyres} onTap={() => oneTap('tyre_pressure_check')} disabled={loading} />
              <OneTap title="Wash" last={lastWash} onTap={() => oneTap('wash')} disabled={loading} />
              <OneTap title="Quick check" last={lastCheck} onTap={() => oneTap('check')} disabled={loading} />
            </div>
            {error && <div className="mt-3 text-sm text-rose-300">{error}</div>}
          </section>

          <section className="hud-card p-5 md:p-6">
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-title mb-2 flex items-center gap-2">
              <Fuel className="w-4 h-4" />
              <span>Fuel</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr,auto] gap-3 items-end">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-title mb-1">Liters</div>
                <input
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(e.target.value)}
                  inputMode="decimal"
                  placeholder="e.g. 12.4"
                  className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30 font-data"
                />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-title mb-1">Total cost (optional)</div>
                <input
                  value={fuelTotal}
                  onChange={(e) => setFuelTotal(e.target.value)}
                  inputMode="decimal"
                  placeholder="e.g. 18.90"
                  className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30 font-data"
                />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-title mb-1">KM at fill (optional)</div>
                <input
                  value={fuelKm}
                  onChange={(e) => setFuelKm(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 42180"
                  className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/30 font-data"
                />
              </div>
              <button
                type="button"
                disabled={loading || !fuelLiters}
                onClick={addFuel}
                className="px-3 py-2 rounded-xl bg-[#00f5d4]/15 border border-[#00f5d4]/30 text-[#00f5d4] text-xs uppercase tracking-[0.22em] font-title hover:bg-[#00f5d4]/20 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {fuelLogs.slice(0, 10).map((l, idx) => (
                <div
                  key={`${l.recorded_at}-${idx}`}
                  className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-slate-100">
                      {l.liters ?? '—'} L{l.total_cents != null ? ` • $${(l.total_cents / 100).toFixed(2)}` : ''}
                      {l.km_at_fill != null ? ` • ${l.km_at_fill} km` : ''}
                    </div>
                    <div className="text-[10px] text-slate-500 font-data">{new Date(l.recorded_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {fuelLogs.length === 0 && <div className="text-sm text-slate-500">No fuel logs yet.</div>}
            </div>
          </section>
    </div>
  );
};

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

