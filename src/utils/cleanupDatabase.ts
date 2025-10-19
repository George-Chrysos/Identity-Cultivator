/**
 * Manual Database Cleanup Script
 * 
 * HOW TO USE:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Run: await cleanupDatabase()
 * 4. Wait for confirmation message
 * 5. Refresh the page
 */

import { supabase } from '@/lib/supabase';
import { migrateUserData } from '@/utils/migrateUserData';

export const cleanupDatabase = async () => {
  console.log('🔧 Starting database cleanup...');

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Not authenticated:', authError);
      return;
    }

    console.log('✅ Found user:', user.id);

    // Step 1: Show current state
    const { data: beforeIdentities, error: fetchError } = await supabase
      .from('identities')
      .select('id, title, identity_type, tier, level, is_active')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('❌ Failed to fetch identities:', fetchError);
      return;
    }

    console.log('📊 Current identities:', beforeIdentities);

    // Step 2: Run migration
    console.log('🔄 Running migration...');
    await migrateUserData(user.id);

    // Step 3: Show updated state
    const { data: afterIdentities } = await supabase
      .from('identities')
      .select('id, title, identity_type, tier, level, is_active')
      .eq('user_id', user.id);

    console.log('✅ Updated identities:', afterIdentities);

    // Step 4: Verify progress entries exist
    const { data: progressEntries } = await supabase
      .from('user_progress')
      .select('identity_id')
      .eq('user_id', user.id);

    console.log('✅ Progress entries:', progressEntries?.length || 0);

    // Step 5: Summary
    const identityTypes = new Set(afterIdentities?.map(i => i.identity_type));
    const requiredTypes = ['CULTIVATOR', 'BODYSMITH', 'JOURNALIST', 'STRATEGIST'];
    const missingTypes = requiredTypes.filter(t => !identityTypes.has(t));

    if (missingTypes.length === 0) {
      console.log('✅ All 4 identity types present!');
    } else {
      console.warn('⚠️ Missing types:', missingTypes);
    }

    console.log('✅ Cleanup complete! Please refresh the page.');
    return { beforeIdentities, afterIdentities };

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
};

// Auto-expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).cleanupDatabase = cleanupDatabase;
}
