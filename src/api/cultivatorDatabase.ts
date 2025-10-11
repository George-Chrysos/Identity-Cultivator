import { 
  User, 
  Identity, 
  UserProgress, 
  CreateIdentityRequest, 
  UpdateProgressRequest, 
  GetUserDataResponse,
  IdentityTier,
  IdentityType,
  TIER_CONFIGS,
  CULTIVATOR_DEFINITION,
  BODYSMITH_DEFINITION,
  PATHWEAVER_DEFINITION,
  DetailedIdentityDefinition
} from '@/models/cultivatorTypes';
import { supabaseDB } from '@/api/supabaseService';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// Database service using localStorage for now, easily replaceable with real DB
export class CultivatorDatabase {
  private static readonly STORAGE_KEYS = {
    USERS: 'cultivator-users',
    IDENTITIES: 'cultivator-identities', 
    USER_PROGRESS: 'cultivator-user-progress',
  };

  // Local-only helpers (ignore Supabase config)
  private static readLocalUsers(): User[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.USERS);
    if (!stored) return [];
    try {
      return JSON.parse(stored).map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastActiveDate: new Date(user.lastActiveDate),
      }));
    } catch {
      return [];
    }
  }

  private static readLocalIdentities(): Identity[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.IDENTITIES);
    if (!stored) return [];
    try {
      return JSON.parse(stored).map((identity: any) => ({
        ...identity,
        createdAt: new Date(identity.createdAt),
        lastCompletedDate: identity.lastCompletedDate ? new Date(identity.lastCompletedDate) : undefined,
      }));
    } catch {
      return [];
    }
  }

  private static readLocalProgress(): UserProgress[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PROGRESS);
    if (!stored) return [];
    try {
      return JSON.parse(stored).map((progress: any) => ({
        ...progress,
        lastUpdatedDate: new Date(progress.lastUpdatedDate),
      }));
    } catch {
      return [];
    }
  }

  // User Management
  static async createUser(name: string, authUserId?: string): Promise<User> {
    if (isSupabaseConfigured() && authUserId) {
      try {
        // Ensure user exists in Supabase public.users table
        await supabaseDB.ensureUser(authUserId, name);

        const user: User = {
          userID: authUserId,  // Use auth user ID
          name,
          tier: 'D',
          totalDaysActive: 0,
          createdAt: new Date(),
          lastActiveDate: new Date(),
        };
        return user;
      } catch (err) {
        console.error('Supabase ensureUser failed, falling back to local user:', err);
        // Fall through to local creation below
      }
    }

    // Local fallback: use provided authUserId if available to keep IDs consistent across modes
    const user: User = {
      userID: authUserId || this.generateID(),
      name,
      tier: 'D',
      totalDaysActive: 0,
      createdAt: new Date(),
      lastActiveDate: new Date(),
    };

    const users = await this.getUsers();
    users.push(user);
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

    return user;
  }

  static async getUser(userID: string): Promise<User | null> {
    if (isSupabaseConfigured()) {
      try {
        // Try to get user from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userID)
          .single();

        if (!error && data) {
          return {
            userID: data.id,
            name: data.name,
            tier: data.tier,
            totalDaysActive: data.total_days_active,
            createdAt: new Date(data.created_at),
            lastActiveDate: new Date(data.last_active_date),
          };
        }
      } catch (e) {
        // ignore and fall through to local
      }
      // Fallback to local store if Supabase is misconfigured/unavailable
      const localUsers = await this.getUsers();
      const local = localUsers.find(u => u.userID === userID) || null;
      if (local) return local;
      return null;
    }

    const users = await this.getUsers();
    return users.find(u => u.userID === userID) || null;
  }

  static async updateUser(user: User): Promise<User> {
    if (isSupabaseConfigured()) {
      // Update user in Supabase
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.userID,
          name: user.name,
          tier: user.tier,
          total_days_active: user.totalDaysActive,
          last_active_date: user.lastActiveDate.toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating user:', error);
      }
      return user;
    }

    const users = await this.getUsers();
    const index = users.findIndex(u => u.userID === user.userID);
    
    if (index !== -1) {
      users[index] = user; // update existing
    } else {
      users.push(user); // upsert: insert new if not found
    }
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    
    return user;
  }

  private static async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured()) {
      // Users are managed by Supabase auth; return empty list for compatibility
      return [];
    }

    const stored = localStorage.getItem(this.STORAGE_KEYS.USERS);
    if (!stored) return [];
    
    return JSON.parse(stored).map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastActiveDate: new Date(user.lastActiveDate),
    }));
  }

  // Identity Management  
  static async createIdentity(request: CreateIdentityRequest): Promise<Identity> {
    // When Supabase is configured, create there first (DB will enforce uniqueness)
    if (isSupabaseConfigured()) {
      try {
        const definition = this.getIdentityDefinition(request.identityType);
        const startingTier: IdentityTier = 'D';
        const startingLevel = 1;
        const tierDetail = definition.tiers.find(t => t.tier === startingTier);
        const created = await supabaseDB.createIdentity(
          request.userID,
          request.customTitle || `${tierDetail?.title || definition.name} ${startingLevel}`,
          request.identityType,
          startingTier
        );
        return created;
      } catch (err) {
        console.error('Supabase createIdentity failed, falling back to local identity:', err);
        // Fall through to local creation below
      }
    }

    // Local mode or Supabase fallback: prevent duplicates using local storage
    const existingIdentities = await this.getIdentitiesForUser(request.userID);
    const hasType = existingIdentities.some(i => i.identityType === request.identityType);
    if (hasType) {
      throw new Error(`User already has a ${request.identityType} identity. Only one of each type is allowed.`);
    }

    const definition = this.getIdentityDefinition(request.identityType);
    const startingTier: IdentityTier = 'D';
    const startingLevel = 1;
    
    // Get the first sublevel to determine initial days required
    const tierDetail = definition.tiers.find(t => t.tier === startingTier);
    const subLevel = tierDetail?.subLevels[startingLevel - 1];
    const initialDaysRequired = subLevel?.daysToComplete || TIER_CONFIGS[startingTier].requiredDaysPerLevel;
    
    const identity: Identity = {
      identityID: this.generateID(),
      userID: request.userID,
      title: request.customTitle || `${tierDetail?.title || definition.name} ${startingLevel}`,
      imageUrl: request.customImageUrl || `/images/${definition.name.toLowerCase()}-base.png`,
      tier: startingTier,
      level: startingLevel,
      daysCompleted: 0,
      requiredDaysPerLevel: initialDaysRequired,
      isActive: true,
      createdAt: new Date(),
      identityType: request.identityType,
    };

    const identities = await this.getIdentities();
    identities.push(identity);
    localStorage.setItem(this.STORAGE_KEYS.IDENTITIES, JSON.stringify(identities));

    // Store tasks from the detailed definition
    const taskKey = `identity-tasks-${identity.identityID}`;
    const tasks = subLevel?.tasks.map((taskText, idx) => ({
      id: `task-${idx}`,
      title: taskText,
      description: taskText,
      required: true,
    })) || [
      {
        id: 'default-task',
        title: 'Complete daily practice',
        description: 'Complete your daily practice',
        required: true,
      }
    ];
    localStorage.setItem(taskKey, JSON.stringify(tasks));

    // Create initial progress record
    await this.createUserProgress(identity);
    
    return identity;
  }

  static async getIdentitiesForUser(userID: string): Promise<Identity[]> {
    const identities = await this.getIdentities();
    return identities.filter(i => i.userID === userID);
  }

  static async updateIdentity(identity: Identity): Promise<Identity> {
    const identities = await this.getIdentities();
    const index = identities.findIndex(i => i.identityID === identity.identityID);
    
    if (index !== -1) {
      identities[index] = identity;
      localStorage.setItem(this.STORAGE_KEYS.IDENTITIES, JSON.stringify(identities));
    }
    
    return identity;
  }

  static async deleteIdentity(identityID: string): Promise<void> {
    // Remove identity
    const identities = await this.getIdentities();
    const filtered = identities.filter(i => i.identityID !== identityID);
    if (filtered.length !== identities.length) {
      localStorage.setItem(this.STORAGE_KEYS.IDENTITIES, JSON.stringify(filtered));
    }
    // Remove related progress
    const progress = await this.getUserProgress();
    const progressFiltered = progress.filter(p => p.identityID !== identityID);
    if (progressFiltered.length !== progress.length) {
      localStorage.setItem(this.STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progressFiltered));
    }
    // Remove tasks
    localStorage.removeItem(`identity-tasks-${identityID}`);
  }

  static async deleteIdentities(identityIDs: string[]): Promise<void> {
    for (const id of identityIDs) {
      await this.deleteIdentity(id);
    }
  }

  private static async getIdentities(): Promise<Identity[]> {
    const stored = localStorage.getItem(this.STORAGE_KEYS.IDENTITIES);
    if (!stored) return [];
    
    return JSON.parse(stored).map((identity: any) => ({
      ...identity,
      createdAt: new Date(identity.createdAt),
      lastCompletedDate: identity.lastCompletedDate ? new Date(identity.lastCompletedDate) : undefined,
    }));
  }

  private static getIdentityDefinition(type: IdentityType): DetailedIdentityDefinition {
    switch (type) {
      case 'BODYSMITH': return BODYSMITH_DEFINITION;
      case 'PATHWEAVER': return PATHWEAVER_DEFINITION;
      case 'CULTIVATOR':
      default: return CULTIVATOR_DEFINITION;
    }
  }

  // Progress Management
  static async createUserProgress(identity: Identity): Promise<UserProgress> {
    if (isSupabaseConfigured()) {
      // Supabase create is handled when creating an identity (supabaseService.createIdentity creates progress)
      const prog = await supabaseDB.getProgressForIdentity(identity.identityID).catch(() => null);
      return prog || {
        userProgressID: this.generateID(),
        userID: identity.userID,
        identityID: identity.identityID,
        daysCompleted: 0,
        level: 1,
        tier: 'D',
        completedToday: false,
        lastUpdatedDate: new Date(),
        streakDays: 0,
        missedDays: 0,
      };
    }

    const progress: UserProgress = {
      userProgressID: this.generateID(),
      userID: identity.userID,
      identityID: identity.identityID,
      daysCompleted: 0,
      level: 1,
      tier: 'D',
      completedToday: false,
      lastUpdatedDate: new Date(),
      streakDays: 0,
      missedDays: 0,
    };

    const allProgress = await this.getUserProgress();
    allProgress.push(progress);
    localStorage.setItem(this.STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress));
    
    return progress;
  }

  static async getProgressForUser(userID: string): Promise<UserProgress[]> {
    if (isSupabaseConfigured()) {
      const res = await supabaseDB.fetchUserIdentities(userID).catch(() => ({ identities: [], progress: [] }));
      return res.progress || [];
    }

    const allProgress = await this.getUserProgress();
    return allProgress.filter(p => p.userID === userID);
  }

  static async getProgressForIdentity(identityID: string): Promise<UserProgress | null> {
    if (isSupabaseConfigured()) {
      const progress = await supabaseDB.getProgressForIdentity(identityID).catch(() => null);
      return progress;
    }

    const allProgress = await this.getUserProgress();
    return allProgress.find(p => p.identityID === identityID) || null;
  }

  static async updateUserProgress(progress: UserProgress): Promise<UserProgress> {
    if (isSupabaseConfigured()) {
      // Update via supabase
      await supabaseDB.getCompletionHistory(progress.userID, progress.identityID).catch(() => null);
      // Best-effort: return provided progress
      return progress;
    }

    const allProgress = await this.getUserProgress();
    const index = allProgress.findIndex(p => p.userProgressID === progress.userProgressID);
    
    if (index !== -1) {
      allProgress[index] = progress;
      localStorage.setItem(this.STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress));
    }
    
    return progress;
  }

  private static async getUserProgress(): Promise<UserProgress[]> {
    if (isSupabaseConfigured()) {
      // Supabase progress fetched via fetchUserIdentities for a specific user; here return empty
      return [];
    }

    const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PROGRESS);
    if (!stored) return [];
    
    return JSON.parse(stored).map((progress: any) => ({
      ...progress,
      lastUpdatedDate: new Date(progress.lastUpdatedDate),
    }));
  }

  // Combined Data Queries
  static async getUserData(userID: string): Promise<GetUserDataResponse | null> {
    if (isSupabaseConfigured()) {
      try {
        const res = await supabaseDB.fetchUserIdentities(userID);
        // If Supabase returns arrays, use them; otherwise fall back to local
        if (res && Array.isArray(res.identities) && Array.isArray(res.progress)) {
          return {
            user: { userID, name: '', tier: 'D', totalDaysActive: 0, createdAt: new Date(), lastActiveDate: new Date() },
            identities: res.identities,
            progress: res.progress,
          } as unknown as GetUserDataResponse;
        }
        // Fall through to local if malformed
      } catch (err) {
        console.error('Supabase fetchUserIdentities failed, falling back to local data:', err);
        // Fall through to local
      }
    }

  // Local fallback path: read everything from localStorage regardless of Supabase config
  const user = this.readLocalUsers().find(u => u.userID === userID) || null;
  if (!user) return null;
  const identities = this.readLocalIdentities().filter(i => i.userID === userID);
  const progress = this.readLocalProgress().filter(p => p.userID === userID);
  return { user, identities, progress };
  }

  // Progress Update Logic
  static async updateProgress(request: UpdateProgressRequest): Promise<{
    success: boolean;
    identity?: Identity;
    progress?: UserProgress;
    leveledUp?: boolean;
    evolved?: boolean;
    message: string;
  }> {
    if (isSupabaseConfigured()) {
      try {
        // Delegate toggle operation to supabase service
        const result = await supabaseDB.toggleTaskCompletion(request.userID, request.identityID);
        return {
          success: true,
          identity: result.identity as Identity,
          progress: result.progress as UserProgress,
          leveledUp: false,
          evolved: false,
          message: 'Updated via Supabase',
        };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Supabase update failed' };
      }
    }

    const identity = (await this.getIdentities()).find(i => i.identityID === request.identityID);
    const progress = await this.getProgressForIdentity(request.identityID);

    if (!identity || !progress) {
      return { success: false, message: 'Identity or progress not found' };
    }

    const today = new Date();
    const lastUpdate = new Date(progress.lastUpdatedDate);
    const isToday = this.isSameDay(today, lastUpdate);

    let newDaysCompleted = progress.daysCompleted;
    let completedToday = progress.completedToday;
    let leveledUp = false;
    let evolved = false;
    let message = '';

    // Apply decay if needed
    const daysSinceUpdate = this.getDaysDifference(lastUpdate, today);
    if (daysSinceUpdate >= 3) {
      const decayDays = Math.min(daysSinceUpdate, progress.daysCompleted);
      newDaysCompleted = Math.max(0, progress.daysCompleted - decayDays);
      message += `Lost ${decayDays} days due to inactivity. `;
    }

    if (request.action === 'COMPLETE') {
      if (!completedToday) {
        newDaysCompleted += 1;
        completedToday = true;
        message += 'Task completed! ';
        
        // Check for level up
        if (newDaysCompleted >= identity.requiredDaysPerLevel) {
          const levelUpResult = this.calculateLevelUp(identity, newDaysCompleted);
          leveledUp = levelUpResult.leveledUp;
          evolved = levelUpResult.evolved;

          // Update identity using the calculated result
          identity.level = levelUpResult.newLevel;
          identity.tier = levelUpResult.newTier;
          identity.requiredDaysPerLevel = levelUpResult.newRequiredDaysPerLevel;

          // Use remainingDays returned from calculation for the current level's progress
          identity.daysCompleted = levelUpResult.remainingDays;

          if (evolved) {
            message += `Evolved to ${identity.tier} tier! `;
          }
          if (leveledUp) {
            message += `Level up to ${identity.level}! `;
          }

          await this.updateIdentity(identity);
        }
      } else {
        return { success: false, message: 'Already completed today' };
      }
    } else if (request.action === 'REVERSE') {
      if (completedToday && isToday) {
        newDaysCompleted = Math.max(0, newDaysCompleted - 1);
        completedToday = false;
        message = 'Task completion reversed';
      } else {
        return { success: false, message: 'Cannot reverse task from previous days' };
      }
    }

  // Update progress - if identity was leveled up, progress should reflect the remaining days for the new level
  progress.daysCompleted = leveledUp ? identity.daysCompleted : newDaysCompleted;
    progress.completedToday = completedToday;
    progress.level = identity.level;
    progress.tier = identity.tier;
    progress.lastUpdatedDate = today;
    
    await this.updateUserProgress(progress);

    return {
      success: true,
      identity,
      progress,
      leveledUp,
      evolved,
      message: message.trim(),
    };
  }

  // Utility Methods
  private static calculateLevelUp(identity: Identity, daysCompleted: number): {
    leveledUp: boolean;
    evolved: boolean;
    newLevel: number;
    newTier: IdentityTier;
    newRequiredDaysPerLevel: number;
    remainingDays: number;
  } {
    let leveledUp = false;
    let evolved = false;
    let newLevel = identity.level;
    let newTier = identity.tier;
    let newRequiredDaysPerLevel = identity.requiredDaysPerLevel;

    // Use a working copy of daysCompleted and consume required days as we level
    let remaining = daysCompleted;
    let required = identity.requiredDaysPerLevel;

    // Loop to allow multiple level-ups if enough days are present
    while (remaining >= required) {
      leveledUp = true;
      remaining -= required;
      newLevel += 1;

      // Check for evolution (at level 10)
      if (newLevel > 10) {
        evolved = true;
        newLevel = 1;

        // Evolve tier
        const tierOrder: IdentityTier[] = ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
        const currentIndex = tierOrder.indexOf(newTier);
        const nextIndex = Math.min(currentIndex + 1, tierOrder.length - 1);
        newTier = tierOrder[nextIndex];
      }

      // Determine required days for the new level/tier
      const definition = this.getIdentityDefinition(identity.identityType);
      const tierDetail = definition.tiers.find(t => t.tier === newTier);
      const subLevel = tierDetail?.subLevels[newLevel - 1];
      required = subLevel?.daysToComplete || TIER_CONFIGS[newTier]?.requiredDaysPerLevel || 10;
      newRequiredDaysPerLevel = required;
    }

    return { leveledUp, evolved, newLevel, newTier, newRequiredDaysPerLevel, remainingDays: remaining };
  }

  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private static getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static generateID(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Initialize with dummy data
  static async initializeWithDummyData(userID: string): Promise<void> {
    const existingData = await this.getUserData(userID);
    if (existingData && existingData.identities.length > 0) {
      // Remove duplicate identities - keep only one of each type
      const identitiesByType = new Map<IdentityType, Identity>();
      
      for (const identity of existingData.identities) {
        if (!identitiesByType.has(identity.identityType)) {
          identitiesByType.set(identity.identityType, identity);
        }
      }
      
      // Delete duplicates
      const idsToKeep = new Set(Array.from(identitiesByType.values()).map(i => i.identityID));
      const idsToDelete = existingData.identities
        .filter(i => !idsToKeep.has(i.identityID))
        .map(i => i.identityID);
      
      if (idsToDelete.length > 0) {
        await this.deleteIdentities(idsToDelete);
      }
      
      return; // Already has data
    }

    // Create baseline three identities
    await this.createIdentity({ userID, identityType: 'CULTIVATOR' });
    await this.createIdentity({ userID, identityType: 'BODYSMITH' });
    await this.createIdentity({ userID, identityType: 'PATHWEAVER' });
  }

  // Check if user already has an identity of a given type
  static async hasIdentityType(userID: string, identityType: IdentityType): Promise<boolean> {
    const identities = await this.getIdentitiesForUser(userID);
    return identities.some(i => i.identityType === identityType);
  }

  // Manual cleanup for duplicate identities (call this once to fix existing data)
  static async cleanupDuplicateIdentities(userID: string): Promise<number> {
    const identities = await this.getIdentitiesForUser(userID);
    
    if (identities.length === 0) return 0;
    
    // Keep only one of each type
    const identitiesByType = new Map<IdentityType, Identity>();
    
    for (const identity of identities) {
      if (!identitiesByType.has(identity.identityType)) {
        identitiesByType.set(identity.identityType, identity);
      }
    }
    
    // Delete duplicates
    const idsToKeep = new Set(Array.from(identitiesByType.values()).map(i => i.identityID));
    const idsToDelete = identities
      .filter(i => !idsToKeep.has(i.identityID))
      .map(i => i.identityID);
    
    if (idsToDelete.length > 0) {
      await this.deleteIdentities(idsToDelete);
    }
    
    return idsToDelete.length;
  }
}
