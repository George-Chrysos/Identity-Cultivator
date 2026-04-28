import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import type { HygieneEventRow, SelfCareCheckinRow } from '@/types/database';
import { todayKey } from '@/utils/leveling';

export type HygieneEventType = 'shower' | 'brush_teeth';

export const selfCareDB = {
  isReady(): boolean {
    return isSupabaseConfigured();
  },

  async getTodayCheckin(userId: string): Promise<SelfCareCheckinRow | null> {
    if (!this.isReady()) return null;
    const day = todayKey();
    const { data, error } = await supabase
      .from('selfcare_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('day', day)
      .maybeSingle();
    if (error) {
      logger.error('getTodayCheckin failed', error);
      throw error;
    }
    return (data as SelfCareCheckinRow | null) ?? null;
  },

  async upsertTodayCheckin(params: {
    userId: string;
    sleepQuality?: number | null;
    mealsCount?: number | null;
    mealsQuality?: number | null;
    activated?: boolean;
    stretched?: boolean;
  }): Promise<SelfCareCheckinRow> {
    if (!this.isReady()) throw new Error('Supabase not configured');
    const payload = {
      user_id: params.userId,
      day: todayKey(),
      sleep_quality: params.sleepQuality ?? null,
      meals_count: params.mealsCount ?? null,
      meals_quality: params.mealsQuality ?? null,
      activated: params.activated ?? false,
      stretched: params.stretched ?? false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('selfcare_checkins')
      .upsert(payload, { onConflict: 'user_id,day' })
      .select('*')
      .single();

    if (error) {
      logger.error('upsertTodayCheckin failed', error);
      throw error;
    }
    return data as SelfCareCheckinRow;
  },

  async addHygieneEvent(userId: string, type: HygieneEventType): Promise<HygieneEventRow> {
    if (!this.isReady()) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('hygiene_events')
      .insert({ user_id: userId, type })
      .select('*')
      .single();
    if (error) {
      logger.error('addHygieneEvent failed', error);
      throw error;
    }
    return data as HygieneEventRow;
  },

  async getLatestHygieneEvent(userId: string, type: HygieneEventType): Promise<HygieneEventRow | null> {
    if (!this.isReady()) return null;
    const { data, error } = await supabase
      .from('hygiene_events')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      logger.error('getLatestHygieneEvent failed', error);
      throw error;
    }
    return (data as HygieneEventRow | null) ?? null;
  },
};

