/**
 * Database Migration Utility
 * Cleans up legacy PATHWEAVER data and ensures all 4 identity types exist
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { IdentityType } from '@/models/cultivatorTypes';

export const migrateUserData = async (userId: string): Promise<void> => {
  logger.info('Starting user data migration', { userId });

  try {
    // Step 0: Ensure enum values exist (run SQL to add STRATEGIST/JOURNALIST if missing)
    // This uses RPC call to execute raw SQL safely
    try {
      const { error: enumError } = await supabase.rpc('ensure_identity_types');
      if (enumError) {
        logger.warn('Could not ensure enum types via RPC, enum might be missing values', enumError);
        // Continue anyway - the insert will fail with a clear error if enum is missing
      }
    } catch (rpcError) {
      logger.warn('RPC for enum check not available, continuing', rpcError);
    }

    // Step 1: Fetch all user identities
    const { data: identities, error: fetchError } = await supabase
      .from('identities')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (fetchError) {
      logger.error('Failed to fetch identities for migration', fetchError);
      throw fetchError;
    }

    logger.info('Fetched identities for migration', { 
      count: identities?.length || 0,
      types: identities?.map(i => i.identity_type) 
    });

    // Step 2: Check for legacy PATHWEAVER and migrate to STRATEGIST
    const pathweaverIdentity = identities?.find((i: any) => 
      i.identity_type === 'PATHWEAVER' || 
      (typeof i.identity_type === 'string' && i.identity_type.toUpperCase() === 'PATHWEAVER')
    );

    if (pathweaverIdentity) {
      logger.warn('Found legacy PATHWEAVER identity, migrating to STRATEGIST', { 
        identityId: pathweaverIdentity.id 
      });

      // Update the identity_type to STRATEGIST
      const { error: updateError } = await supabase
        .from('identities')
        .update({ 
          identity_type: 'STRATEGIST',
          updated_at: new Date().toISOString()
        })
        .eq('id', pathweaverIdentity.id);

      if (updateError) {
        logger.error('Failed to migrate PATHWEAVER to STRATEGIST', updateError);
        throw updateError;
      }

      logger.info('Successfully migrated PATHWEAVER to STRATEGIST', { 
        identityId: pathweaverIdentity.id 
      });
    }

    // Step 3: Get updated list after migration
    const { data: updatedIdentities } = await supabase
      .from('identities')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    const existingTypes = new Set(
      updatedIdentities?.map((i: any) => i.identity_type as string) || []
    );

    logger.info('Existing identity types after migration', { 
      types: Array.from(existingTypes) 
    });

    // Step 4: Create missing identity types
    const requiredTypes: IdentityType[] = ['CULTIVATOR', 'BODYSMITH', 'JOURNALIST', 'STRATEGIST'];
    const missingTypes = requiredTypes.filter(type => !existingTypes.has(type));

    if (missingTypes.length > 0) {
      logger.info('Creating missing identity types', { missingTypes });

      for (const identityType of missingTypes) {
        // Create identity
        const { data: newIdentity, error: createError } = await supabase
          .from('identities')
          .insert({
            user_id: userId,
            title: `${identityType} Path`,
            identity_type: identityType,
            tier: 'D',
            level: 1,
            days_completed: 0,
            required_days_per_level: 5,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          logger.error(`Failed to create ${identityType} identity`, createError);
          continue; // Don't throw, try to create others
        }

        logger.info(`Created ${identityType} identity`, { identityId: newIdentity.id });

        // Create corresponding progress entry
        const { error: progressError } = await supabase
          .from('user_progress')
          .insert({
            user_id: userId,
            identity_id: newIdentity.id,
            days_completed: 0,
            level: 1,
            tier: 'D',
            completed_today: false,
            last_updated_date: new Date().toISOString(),
            streak_days: 0,
            missed_days: 0
          });

        if (progressError) {
          logger.error(`Failed to create progress for ${identityType}`, progressError);
        } else {
          logger.info(`Created progress entry for ${identityType}`, { identityId: newIdentity.id });
        }
      }
    } else {
      logger.info('All required identity types exist');
    }

    // Step 5: Verify all identities have progress entries
    const { data: finalIdentities } = await supabase
      .from('identities')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    const { data: progressEntries } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    const progressMap = new Map(progressEntries?.map((p: any) => [p.identity_id, p]) || []);

    // Create missing progress entries
    for (const identity of finalIdentities || []) {
      if (!progressMap.has(identity.id)) {
        logger.warn('Identity missing progress, creating', { identityId: identity.id });

        const { error: progressError } = await supabase
          .from('user_progress')
          .insert({
            user_id: userId,
            identity_id: identity.id,
            days_completed: identity.days_completed || 0,
            level: identity.level || 1,
            tier: identity.tier,
            completed_today: false,
            last_updated_date: new Date().toISOString(),
            streak_days: 0,
            missed_days: 0
          });

        if (progressError) {
          logger.error('Failed to create missing progress', progressError);
        } else {
          logger.info('Created missing progress entry', { identityId: identity.id });
        }
      }
    }

    logger.info('User data migration completed successfully', { userId });

  } catch (error) {
    logger.error('Migration failed', error);
    throw error;
  }
};
