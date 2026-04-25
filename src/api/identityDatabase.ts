/**
 * Supabase CRUD for the Identity Cultivator schema.
 *
 * Mirrors the three tables in database/identity-schema.sql:
 *  - profiles
 *  - user_identities
 *  - identity_completions
 *
 * All functions return plain JS values and throw on error. Callers
 * (the identity store) decide how to surface errors and may fall back
 * to localStorage cache if the network is unavailable.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import type {
  ProfileRow,
  UserIdentityRow,
  IdentityCompletionRow,
} from '@/types/database';
import type { UserIdentity } from '@/types/identity';

const rowToUserIdentity = (row: UserIdentityRow): UserIdentity => ({
  id: row.id,
  templateId: row.template_id as UserIdentity['templateId'],
  level: row.level,
  xpIntoLevel: row.xp_into_level,
  lastCompletedDate: row.last_completed_date,
  boundAt: row.bound_at,
});

export const identityDB = {
  isReady(): boolean {
    return isSupabaseConfigured();
  },

  async ensureProfile(userId: string, displayName?: string | null): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase
      .from('profiles')
      .upsert(
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

  async listIdentities(userId: string): Promise<UserIdentity[]> {
    if (!this.isReady()) return [];
    const { data, error } = await supabase
      .from('user_identities')
      .select('*')
      .eq('user_id', userId)
      .order('bound_at', { ascending: true });
    if (error) {
      logger.error('listIdentities failed', error);
      throw error;
    }
    return (data as UserIdentityRow[]).map(rowToUserIdentity);
  },

  async bindIdentity(
    userId: string,
    templateId: string
  ): Promise<UserIdentity> {
    if (!this.isReady()) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
      .from('user_identities')
      .insert({
        user_id: userId,
        template_id: templateId,
      })
      .select('*')
      .single();
    if (error) {
      logger.error('bindIdentity failed', error);
      throw error;
    }
    return rowToUserIdentity(data as UserIdentityRow);
  },

  async releaseIdentity(identityId: string): Promise<void> {
    if (!this.isReady()) return;
    const { error } = await supabase
      .from('user_identities')
      .delete()
      .eq('id', identityId);
    if (error) {
      logger.error('releaseIdentity failed', error);
      throw error;
    }
  },

  async recordCompletion(
    identity: UserIdentity,
    newLevel: number,
    newXpIntoLevel: number,
    completedDate: string
  ): Promise<void> {
    if (!this.isReady()) return;

    const updatePromise = supabase
      .from('user_identities')
      .update({
        level: newLevel,
        xp_into_level: newXpIntoLevel,
        last_completed_date: completedDate,
      })
      .eq('id', identity.id);

    const insertPromise = supabase
      .from('identity_completions')
      .insert({
        user_identity_id: identity.id,
        completed_date: completedDate,
      });

    const [updateResult, insertResult] = await Promise.all([
      updatePromise,
      insertPromise,
    ]);

    if (updateResult.error) {
      logger.error('recordCompletion update failed', updateResult.error);
      throw updateResult.error;
    }
    // The unique (user_identity_id, completed_date) constraint means a double
    // submit is benign; we only log and swallow that specific error.
    if (insertResult.error) {
      const msg = insertResult.error.message || '';
      if (!msg.toLowerCase().includes('duplicate')) {
        logger.error('recordCompletion insert failed', insertResult.error);
        throw insertResult.error;
      }
    }
  },

  async listCompletions(identityId: string): Promise<IdentityCompletionRow[]> {
    if (!this.isReady()) return [];
    const { data, error } = await supabase
      .from('identity_completions')
      .select('*')
      .eq('user_identity_id', identityId)
      .order('completed_date', { ascending: false });
    if (error) {
      logger.error('listCompletions failed', error);
      throw error;
    }
    return data as IdentityCompletionRow[];
  },
};
