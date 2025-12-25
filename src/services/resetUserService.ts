import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { storage } from '@/services/storageService';
import { STORE_KEYS } from '@/constants/storage';

/**
 * Resets all user data in the database and local storage
 * This provides a clean slate for the user while maintaining authentication
 * 
 * IMPORTANT: This does NOT delete the user's profile or auth entry.
 * The user will remain logged in after the reset.
 */
export const resetUserData = async (userId: string): Promise<boolean> => {
  try {
    logger.info('Starting user data reset', { userId });

    // Execute database wipe operations in order (respects FK constraints)
    // 1. Delete daily records (if table exists)
    const { error: dailyRecordsError } = await supabase
      .from('daily_records')
      .delete()
      .eq('user_id', userId);

    if (dailyRecordsError) throw dailyRecordsError;

    // 2. Delete task logs (completion history)
    const { error: taskLogsError } = await supabase
      .from('task_logs')
      .delete()
      .eq('user_id', userId);

    if (taskLogsError) throw taskLogsError;

    // 3. Delete player inventory items
    const { error: inventoryError } = await supabase
      .from('player_inventory')
      .delete()
      .eq('user_id', userId);

    if (inventoryError) throw inventoryError;

    // 4. Delete player identities (paths)
    const { error: identitiesError } = await supabase
      .from('player_identities')
      .delete()
      .eq('user_id', userId);

    if (identitiesError) throw identitiesError;

    // 5. Reset profile to initial state (keeps the profile entry intact)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        rank_tier: 'D',
        coins: 100,
        stars: 5,
        body_points: 0,
        mind_points: 0,
        soul_points: 0,
        will_points: 0,
        final_score: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Clear local storage (but NOT auth store - user stays logged in)
    storage.remove(STORE_KEYS.GAME);
    storage.remove(STORE_KEYS.QUEST);
    storage.remove(STORE_KEYS.SHOP);
    storage.remove(STORE_KEYS.TOAST);

    logger.info('User data reset completed successfully', { userId });
    return true;
  } catch (error) {
    logger.error('Failed to reset user data', { error, userId });
    return false;
  }
};
