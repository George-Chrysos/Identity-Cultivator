import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import type {
  MainQuestStreakRow,
  QuestCompletionRow,
  SectorVisitRow,
  XpLedgerRow,
} from '@/types/database';

interface RecordXpArgs {
  userId: string;
  deltaXp: number;
  reason: string;
  occurredOn: string;
  sectorId?: string;
  questId?: string;
  metadata?: Record<string, unknown>;
}

interface RecordQuestCompletionArgs {
  userId: string;
  questId: string;
  sectorId: string;
  questType: QuestCompletionRow['quest_type'];
  completionDate: string;
}

export const gamificationDB = {
  isReady() {
    return isSupabaseConfigured();
  },

  async recordXpEvent(args: RecordXpArgs): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('xp_ledger').insert({
      user_id: args.userId,
      delta_xp: args.deltaXp,
      reason: args.reason,
      sector_id: args.sectorId ?? null,
      quest_id: args.questId ?? null,
      occurred_on: args.occurredOn,
      metadata: args.metadata ?? {},
    } satisfies Partial<XpLedgerRow>);
    if (error) {
      logger.error('recordXpEvent failed', error);
      throw error;
    }
  },

  async recordSectorVisit(
    userId: string,
    sectorId: string,
    visitDate: string,
    streakCurrent: number,
    streakBest: number
  ): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('sector_visits').insert({
      user_id: userId,
      sector_id: sectorId,
      visit_date: visitDate,
      streak_current: streakCurrent,
      streak_best: streakBest,
      streak_last_date: visitDate,
    } satisfies Partial<SectorVisitRow>);
    if (error) {
      const msg = String(error.message ?? '').toLowerCase();
      if (!msg.includes('duplicate')) {
        logger.error('recordSectorVisit failed', error);
        throw error;
      }
    }
  },

  async recordQuestCompletion(args: RecordQuestCompletionArgs): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('quest_completions').insert({
      user_id: args.userId,
      quest_id: args.questId,
      sector_id: args.sectorId,
      quest_type: args.questType,
      completion_date: args.completionDate,
    } satisfies Partial<QuestCompletionRow>);
    if (error) {
      const msg = String(error.message ?? '').toLowerCase();
      if (!msg.includes('duplicate')) {
        logger.error('recordQuestCompletion failed', error);
        throw error;
      }
    }
  },

  async upsertMainQuestStreak(
    userId: string,
    currentStreak: number,
    bestStreak: number,
    completedDate: string
  ): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase.from('main_quest_streaks').upsert(
      {
        user_id: userId,
        current_streak: currentStreak,
        best_streak: bestStreak,
        last_completed_date: completedDate,
        updated_at: new Date().toISOString(),
      } satisfies Partial<MainQuestStreakRow>,
      { onConflict: 'user_id' }
    );
    if (error) {
      logger.error('upsertMainQuestStreak failed', error);
      throw error;
    }
  },
};
