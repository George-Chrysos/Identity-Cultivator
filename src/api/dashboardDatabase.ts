import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { clampMetric } from '@/utils/metrics';
import type { DailyEntryRow, ProfileRow } from '@/types/database';
import type { DailyEntry } from '@/types/dashboard';

export const emptyEntry = (date: string): DailyEntry => ({
  date,
  body: null,
  mind: null,
  soul: null,
  mainTaskText: '',
  mainTaskDone: false,
  carriedOver: false,
  morningActivation: false,
  ritual: false,
  nightProtocol: false,
  updatedAt: Date.now(),
});

export const rowToEntry = (row: DailyEntryRow): DailyEntry => ({
  date: row.entry_date,
  body: clampMetric(row.body),
  mind: clampMetric(row.mind),
  soul: clampMetric(row.soul),
  mainTaskText: row.main_task_text ?? '',
  mainTaskDone: Boolean(row.main_task_done),
  carriedOver: Boolean(row.main_task_carried_over),
  morningActivation: Boolean(row.morning_activation),
  ritual: Boolean(row.ritual),
  nightProtocol: Boolean(row.night_protocol),
  updatedAt: Date.parse(row.updated_at) || Date.now(),
});

const entryToUpsert = (userId: string, entry: DailyEntry) => ({
  user_id: userId,
  entry_date: entry.date,
  body: entry.body,
  mind: entry.mind,
  soul: entry.soul,
  main_task_text: entry.mainTaskText,
  main_task_done: entry.mainTaskDone,
  main_task_carried_over: entry.carriedOver,
  morning_activation: entry.morningActivation,
  ritual: entry.ritual,
  night_protocol: entry.nightProtocol,
  updated_at: new Date(entry.updatedAt).toISOString(),
} satisfies Partial<DailyEntryRow>);

export const dashboardDB = {
  isReady(): boolean {
    return isSupabaseConfigured();
  },

  async ensureProfile(userId: string, displayName?: string | null): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('profiles').upsert(
      {
        id: userId,
        display_name: displayName ?? null,
      } satisfies Partial<ProfileRow>,
      { onConflict: 'id' }
    );
    if (error) {
      logger.error('ensureProfile failed', error);
      throw error;
    }
  },

  async fetchRange(userId: string, from: string, to: string): Promise<DailyEntry[]> {
    if (!this.isReady()) return [];
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', from)
      .lte('entry_date', to)
      .order('entry_date', { ascending: true });

    if (error) {
      logger.error('fetchRange failed', error);
      throw error;
    }

    return ((data as DailyEntryRow[]) ?? []).map(rowToEntry);
  },

  async upsertEntry(userId: string, entry: DailyEntry): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('daily_entries').upsert(entryToUpsert(userId, entry), {
      onConflict: 'user_id,entry_date',
    });
    if (error) {
      logger.error('upsertEntry failed', error);
      throw error;
    }
  },
};
