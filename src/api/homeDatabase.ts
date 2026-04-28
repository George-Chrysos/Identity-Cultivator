import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import type { HomeCheckinRow } from '@/types/database';
import { todayKey } from '@/utils/leveling';
import { storage } from '@/services/storageService';

const key = (userId: string) => `life.home_checkins.${userId}`;

export const homeDB = {
  isReady(): boolean {
    return isSupabaseConfigured();
  },

  async getTodayCheckin(userId: string): Promise<HomeCheckinRow | null> {
    const day = todayKey();
    if (!this.isReady()) {
      const rows = storage.get<HomeCheckinRow[]>(key(userId)) ?? [];
      return rows.find((r) => r.day === day) ?? null;
    }
    const { data, error } = await supabase
      .from('home_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('day', day)
      .maybeSingle();
    if (error) {
      logger.error('getTodayCheckin failed', error);
      throw error;
    }
    return (data as HomeCheckinRow | null) ?? null;
  },

  async upsertTodayCheckin(params: {
    userId: string;
    cleanliness?: number | null;
    organization?: number | null;
  }): Promise<HomeCheckinRow> {
    const payload = {
      id: crypto?.randomUUID?.() ?? `id-${Date.now()}`,
      user_id: params.userId,
      day: todayKey(),
      cleanliness: params.cleanliness ?? null,
      organization: params.organization ?? null,
      created_at: new Date().toISOString(),
    };
    if (!this.isReady()) {
      const rows = storage.get<HomeCheckinRow[]>(key(params.userId)) ?? [];
      const next = [payload, ...rows.filter((r) => r.day !== payload.day)];
      storage.set(key(params.userId), next);
      return payload as HomeCheckinRow;
    }

    const { data, error } = await supabase
      .from('home_checkins')
      .upsert(payload, { onConflict: 'user_id,day' })
      .select('*')
      .single();

    if (error) {
      logger.error('upsertTodayCheckin failed', error);
      throw error;
    }
    return data as HomeCheckinRow;
  },
};

