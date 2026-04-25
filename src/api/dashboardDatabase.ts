import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import type { ProfileRow } from '@/types/database';
import type { DashboardStateShape } from '@/types/dashboard';

type DashboardColumns = Pick<
  ProfileRow,
  'id' | 'dashboard_state' | 'dashboard_updated_at'
>;

export const dashboardDB = {
  isReady(): boolean {
    return isSupabaseConfigured();
  },

  async fetchDashboard(userId: string): Promise<{
    state: DashboardStateShape | null;
    updatedAt: string | null;
  }> {
    if (!this.isReady()) return { state: null, updatedAt: null };

    const { data, error } = await supabase
      .from('profiles')
      .select('id,dashboard_state,dashboard_updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      logger.error('fetchDashboard failed', error);
      throw error;
    }

    const row = data as DashboardColumns | null;
    return {
      state: (row?.dashboard_state as DashboardStateShape | null) ?? null,
      updatedAt: row?.dashboard_updated_at ?? null,
    };
  },

  async upsertDashboard(userId: string, state: DashboardStateShape): Promise<void> {
    if (!this.isReady()) return;

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          dashboard_state: state,
          dashboard_updated_at: new Date().toISOString(),
        } satisfies Partial<ProfileRow>,
        { onConflict: 'id' }
      );

    if (error) {
      logger.error('upsertDashboard failed', error);
      throw error;
    }
  },
};

