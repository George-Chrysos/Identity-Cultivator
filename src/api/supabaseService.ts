import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Identity, UserProgress, IdentityType, IdentityTier } from '@/models/cultivatorTypes';

export interface SupabaseIdentity {
  id: string;
  user_id: string;
  title: string;
  image_url: string | null;
  tier: IdentityTier;
  level: number;
  days_completed: number;
  required_days_per_level: number;
  is_active: boolean;
  last_completed_date: string | null;
  identity_type: IdentityType;
  created_at: string;
  updated_at: string;
}

export interface SupabaseProgress {
  id: string;
  user_id: string;
  identity_id: string;
  days_completed: number;
  level: number;
  tier: IdentityTier;
  completed_today: boolean;
  last_updated_date: string;
  streak_days: number;
  missed_days: number;
}

export interface SupabaseTaskCompletion {
  id: string;
  user_id: string;
  identity_id: string;
  completion_date: string;
  completed_at: string;
  reversed: boolean;
  reversed_at: string | null;
}

// Transform Supabase data to app models
const toIdentity = (data: SupabaseIdentity, progress?: SupabaseProgress): Identity => ({
  identityID: data.id,
  userID: data.user_id,
  title: data.title,
  imageUrl: data.image_url || '/default-avatar.png',
  tier: data.tier,
  level: progress?.level || data.level,
  daysCompleted: progress?.days_completed || data.days_completed,
  requiredDaysPerLevel: data.required_days_per_level,
  isActive: data.is_active,
  lastCompletedDate: data.last_completed_date ? new Date(data.last_completed_date) : undefined,
  createdAt: new Date(data.created_at),
  identityType: data.identity_type,
});

const toUserProgress = (_identity: SupabaseIdentity, progress: SupabaseProgress): UserProgress => ({
  userProgressID: progress.id,
  userID: progress.user_id,
  identityID: progress.identity_id,
  daysCompleted: progress.days_completed,
  level: progress.level,
  tier: progress.tier,
  completedToday: progress.completed_today,
  lastUpdatedDate: new Date(progress.last_updated_date),
  streakDays: progress.streak_days,
  missedDays: progress.missed_days,
});

// Database operations
export const supabaseDB = {
  // Check if using Supabase or local mode
  isOnline: () => isSupabaseConfigured(),

  // Create or get user in public.users table
  async ensureUser(authUserId: string, name: string): Promise<void> {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUserId)
      .single();

    if (!existingUser) {
      // Create user record
      const { error } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          name: name,
          tier: 'D',
          total_days_active: 0,
          created_at: new Date().toISOString(),
          last_active_date: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }
  },

  // Fetch all active identities with progress for current user
  async fetchUserIdentities(userId: string): Promise<{ identities: Identity[], progress: UserProgress[] }> {
    if (!isSupabaseConfigured()) {
      return { identities: [], progress: [] };
    }

    const { data: identitiesData, error: idError } = await supabase
      .from('identities')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('tier', { ascending: false })
      .order('level', { ascending: false });

    if (idError) throw idError;

    const { data: progressData, error: progError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (progError) throw progError;

    const progressMap = new Map(progressData?.map(p => [p.identity_id, p]) || []);
    const identities: Identity[] = [];
    const progress: UserProgress[] = [];

    identitiesData?.forEach((identity: SupabaseIdentity) => {
      const prog = progressMap.get(identity.id);
      identities.push(toIdentity(identity, prog));
      if (prog) {
        progress.push(toUserProgress(identity, prog));
      }
    });

    return { identities, progress };
  },

  // Create new identity
  async createIdentity(
    userId: string,
    title: string,
    identityType: IdentityType,
    tier: IdentityTier = 'D'
  ): Promise<Identity> {
    const { data, error } = await supabase
      .from('identities')
      .insert({
        user_id: userId,
        title,
        identity_type: identityType,
        tier,
        level: 1,
        days_completed: 0,
        required_days_per_level: 5,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    // Create corresponding progress entry
    await supabase.from('user_progress').insert({
      user_id: userId,
      identity_id: data.id,
      days_completed: 0,
      level: 1,
      tier,
      completed_today: false,
      streak_days: 0,
      missed_days: 0
    });

    return toIdentity(data);
  },

  // Calculate streak from task completions
  async calculateStreak(userId: string, identityId: string): Promise<number> {
    const { data: completions, error } = await supabase
      .from('task_completions')
      .select('completion_date')
      .eq('user_id', userId)
      .eq('identity_id', identityId)
      .eq('reversed', false)
      .order('completion_date', { ascending: false });

    if (error || !completions || completions.length === 0) return 0;

    // Create a Set of completion date strings for fast lookup
    const completionDates = new Set(completions.map(c => c.completion_date));
    
    // Calculate consecutive days UP TO today (not including today if not completed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = today.toISOString().split('T')[0];
    const todayCompleted = completionDates.has(todayStr);
    
    let streak = 0;
    let checkDate = new Date(today);
    
    // If today is not completed, start from yesterday
    if (!todayCompleted) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Count backwards from checkDate
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (completionDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1); // Move back one day
      } else {
        // Gap found, streak is broken
        break;
      }
      
      // Safety check - don't go back more than 1000 days
      if (streak > 1000) break;
    }

    return streak;
  },

  // Toggle task completion
  async toggleTaskCompletion(userId: string, identityId: string): Promise<{ progress: UserProgress, identity: Identity }> {
    const today = new Date().toISOString().split('T')[0];

    // Get current progress
    const { data: currentProgress, error: progError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('identity_id', identityId)
      .single();

    if (progError) throw progError;

    // Check if already completed today - use maybeSingle() to avoid errors if not found
    const { data: existingCompletion, error: checkError } = await supabase
      .from('task_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('identity_id', identityId)
      .eq('completion_date', today)
      .eq('reversed', false)
      .maybeSingle();

    // Log any check errors but don't throw - we'll handle it below
    if (checkError) {
      console.warn('Error checking existing completion:', checkError);
    }

    let updatedProgress;

    if (existingCompletion) {
      // Reverse completion
      await supabase
        .from('task_completions')
        .update({ reversed: true, reversed_at: new Date().toISOString() })
        .eq('id', existingCompletion.id);

      // Recalculate streak after reversal
      const newStreak = await this.calculateStreak(userId, identityId);

      // Update progress
      const { data, error } = await supabase
        .from('user_progress')
        .update({
          days_completed: Math.max(0, currentProgress.days_completed - 1),
          completed_today: false,
          streak_days: newStreak,
          last_updated_date: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('identity_id', identityId)
        .select()
        .single();

      if (error) throw error;
      updatedProgress = data;
    } else {
      // Mark as completed - use upsert to handle conflicts
      const { error: insertError } = await supabase
        .from('task_completions')
        .upsert({
          user_id: userId,
          identity_id: identityId,
          completion_date: today,
          reversed: false,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,identity_id,completion_date',
          ignoreDuplicates: false
        });

      if (insertError) {
        console.error('Error inserting completion:', insertError);
        throw insertError;
      }

      // Recalculate streak after completion
      const newStreak = await this.calculateStreak(userId, identityId);

      // Update progress
      const { data, error } = await supabase
        .from('user_progress')
        .update({
          days_completed: currentProgress.days_completed + 1,
          completed_today: true,
          streak_days: newStreak,
          last_updated_date: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('identity_id', identityId)
        .select()
        .single();

      if (error) throw error;
      updatedProgress = data;

      // Check for level up
      const { data: identity } = await supabase
        .from('identities')
        .select('*')
        .eq('id', identityId)
        .single();

      if (identity && updatedProgress.days_completed >= identity.required_days_per_level) {
        await this.handleLevelUp(userId, identityId, identity, updatedProgress);
      }
    }

    // Fetch updated identity
    const { data: identity } = await supabase
      .from('identities')
      .select('*')
      .eq('id', identityId)
      .single();

    return {
      progress: toUserProgress(identity, updatedProgress),
      identity: toIdentity(identity, updatedProgress)
    };
  },

  // Handle level up and evolution logic
  async handleLevelUp(userId: string, identityId: string, identity: any, progress: any) {
    let newLevel = identity.level;
    let newTier = identity.tier;
    let newRequiredDays = identity.required_days_per_level;
    let newDaysCompleted = progress.days_completed;

    // Calculate how many level-ups we can do
    while (newDaysCompleted >= newRequiredDays) {
      newDaysCompleted -= newRequiredDays;
      
      if (newLevel < 10) {
        newLevel += 1;
      } else if (newLevel === 10) {
        // Evolution!
        newLevel = 1;
        newTier = this.getNextTier(newTier);
        newRequiredDays = this.getRequiredDaysForTier(newTier);
      } else {
        // Cap at max
        break;
      }
    }

    // Update identity (note: identity.days_completed should NOT be used, only progress.days_completed matters)
    await supabase
      .from('identities')
      .update({
        level: newLevel,
        tier: newTier,
        required_days_per_level: newRequiredDays
      })
      .eq('id', identityId);

    // Update progress with remaining days after level-ups
    await supabase
      .from('user_progress')
      .update({
        level: newLevel,
        tier: newTier,
        days_completed: newDaysCompleted
      })
      .eq('user_id', userId)
      .eq('identity_id', identityId);
  },

  // Get progress for a specific identity
  async getProgressForIdentity(identityId: string): Promise<UserProgress | null> {
    const { data: progressData, error: progError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('identity_id', identityId)
      .single();

    if (progError) return null;

    const { data: identityData } = await supabase
      .from('identities')
      .select('*')
      .eq('id', identityId)
      .single();

    if (!identityData || !progressData) return null;

    return toUserProgress(identityData, progressData);
  },

  // Get completion history
  async getCompletionHistory(userId: string, identityId: string): Promise<SupabaseTaskCompletion[]> {
    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('identity_id', identityId)
      .order('completion_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Set specific date completion
  async setDateCompletion(userId: string, identityId: string, date: string, completed: boolean) {
    if (completed) {
      // Insert or update
      const { error } = await supabase
        .from('task_completions')
        .upsert({
          user_id: userId,
          identity_id: identityId,
          completion_date: date,
          reversed: false,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,identity_id,completion_date'
        });
      if (error) throw error;
    } else {
      // Mark as reversed
      const { error } = await supabase
        .from('task_completions')
        .update({ reversed: true, reversed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('identity_id', identityId)
        .eq('completion_date', date);
      if (error) throw error;
    }

    // Recalculate progress from all completions
    await this.recalculateProgressFromCompletions(userId, identityId);
  },

  // Recalculate progress from all task completions
  async recalculateProgressFromCompletions(userId: string, identityId: string) {
    // Get all non-reversed completions
    const { data: completions, error: completionsError } = await supabase
      .from('task_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('identity_id', identityId)
      .eq('reversed', false);

    if (completionsError) throw completionsError;

    const totalDaysCompleted = completions?.length || 0;
    const streak = await this.calculateStreak(userId, identityId);
    
    // Check if today is completed
    const today = new Date().toISOString().split('T')[0];
    const completedToday = completions?.some(c => c.completion_date === today) || false;

    // Get current identity to know required days
    const { data: identity } = await supabase
      .from('identities')
      .select('*')
      .eq('id', identityId)
      .single();

    if (!identity) return;

    // Calculate level and tier from total days
    let currentLevel = 1;
    let currentTier = identity.tier;
    let requiredDays = identity.required_days_per_level;
    let remainingDays = totalDaysCompleted;

    // Simulate level-ups
    while (remainingDays >= requiredDays) {
      remainingDays -= requiredDays;
      
      if (currentLevel < 10) {
        currentLevel += 1;
      } else if (currentLevel === 10) {
        // Evolution
        currentLevel = 1;
        currentTier = this.getNextTier(currentTier);
        requiredDays = this.getRequiredDaysForTier(currentTier);
      } else {
        break;
      }
    }

    // Update identity
    await supabase
      .from('identities')
      .update({
        level: currentLevel,
        tier: currentTier,
        required_days_per_level: requiredDays
      })
      .eq('id', identityId);

    // Update progress
    await supabase
      .from('user_progress')
      .update({
        days_completed: remainingDays,
        level: currentLevel,
        tier: currentTier,
        streak_days: streak,
        completed_today: completedToday,
        last_updated_date: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('identity_id', identityId);
  },

  // Helper functions
  getNextTier(currentTier: IdentityTier): IdentityTier {
    const tierOrder: IdentityTier[] = ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
    const currentIndex = tierOrder.indexOf(currentTier);
    return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : currentTier;
  },

  getRequiredDaysForTier(tier: IdentityTier): number {
    const tierDays: Record<IdentityTier, number> = {
      'D': 5,
      'D+': 6,
      'C': 8,
      'C+': 10,
      'B': 12,
      'B+': 14,
      'A': 17,
      'A+': 19,
      'S': 22,
      'S+': 24,
      'SS': 27,
      'SS+': 30,
      'SSS': 33
    };
    return tierDays[tier] || 5;
  }
};
