import { logger } from '@/utils/logger';
import { calculateOverallRank } from '@/utils/overallRank';
import {
  UserProfile,
  PlayerIdentity,
  PlayerIdentityWithDetails,
  IdentityTemplate,
  TaskTemplate,
  TaskLog,
  CompleteTaskRequest,
  CompleteTaskResponse,
  ActivateIdentityRequest,
  ItemTemplate,
  PlayerInventoryItem,
  PurchaseItemRequest,
  LevelProgress,
  DEFAULT_PROFILE_VALUES,
  STAT_COLUMN_MAPPING,
} from '@/types/database';
import { TICKET_DATA } from '@/constants/tickets';

// Inline the constant to avoid circular dependency on temperingPath.ts
// This value must match TEMPERING_TEMPLATE_ID in temperingPath.ts
const TEMPERING_TEMPLATE_ID = 'tempering-warrior-trainee';

// Lazy import for tempering path functions - loaded on demand to avoid circular dependency
type TemperingModule = typeof import('@/constants/temperingPath');
let _temperingModule: TemperingModule | null = null;

const loadTemperingModule = async (): Promise<TemperingModule> => {
  if (!_temperingModule) {
    _temperingModule = await import('@/constants/temperingPath');
  }
  return _temperingModule;
};

// Helper to get tempering level config (returns null if module not loaded yet)
const getTemperingLevelSync = (level: number) => {
  if (!_temperingModule) return null;
  return _temperingModule.getTemperingLevel(level);
};

/**
 * Mock database for local development without Supabase
 * Initializes with demo user and templates
 */

// Demo user ID
const DEMO_USER_ID = 'demo-user-123';

// Gate type for level progress
type GateType = 'rooting' | 'foundation' | 'core' | 'flow' | 'breath';

// In-memory storage
const mockProfiles = new Map<string, UserProfile>();
const mockIdentityTemplates = new Map<string, IdentityTemplate>();
const mockTaskTemplates = new Map<string, TaskTemplate>();
const mockPlayerIdentities = new Map<string, PlayerIdentity>();
const mockTaskLogs: TaskLog[] = [];
const mockItemTemplates = new Map<string, ItemTemplate>();
const mockPlayerInventory = new Map<string, PlayerInventoryItem[]>();
// Level progress tracking for progressive stat rewards (userId -> identityId -> LevelProgress[])
const mockLevelProgress = new Map<string, Map<string, LevelProgress[]>>();

/**
 * Get or create level progress for a user's identity
 */
const getLevelProgress = (userId: string, identityId: string, level: number): LevelProgress => {
  if (!mockLevelProgress.has(userId)) {
    mockLevelProgress.set(userId, new Map());
  }
  const userProgress = mockLevelProgress.get(userId)!;
  
  if (!userProgress.has(identityId)) {
    userProgress.set(identityId, []);
  }
  const identityProgress = userProgress.get(identityId)!;
  
  let levelProg = identityProgress.find(p => p.level === level);
  if (!levelProg) {
    levelProg = {
      level,
      gateProgress: { rooting: 0, foundation: 0, core: 0, flow: 0, breath: 0 },
      totalPointsEarned: 0,
    };
    identityProgress.push(levelProg);
  }
  return levelProg;
};

/**
 * Calculate progressive stat points for task completion
 * Returns points to award based on current progress vs caps
 */
const calculateProgressiveStatPoints = (
  userId: string,
  identityId: string,
  level: number,
  gate: GateType,
  pathId?: string
): { pointsToAward: number; newGateProgress: number; newTotalProgress: number } => {
  // Only apply progressive logic to tempering path
  if (pathId !== TEMPERING_TEMPLATE_ID) {
    return { pointsToAward: 0, newGateProgress: 0, newTotalProgress: 0 };
  }

  const levelConfig = getTemperingLevelSync(level);
  if (!levelConfig) {
    return { pointsToAward: 0, newGateProgress: 0, newTotalProgress: 0 };
  }

  const { mainStatLimit, gateStatCap, daysRequired } = levelConfig;
  const pointsPerTask = gateStatCap / daysRequired;
  
  const progress = getLevelProgress(userId, identityId, level);
  const currentGatePoints = progress.gateProgress[gate];
  const currentTotalPoints = progress.totalPointsEarned;

  // Check caps: total level cap AND individual gate cap
  // Use small tolerance (0.0001) to handle floating point precision issues
  const EPSILON = 0.0001;
  if (currentTotalPoints >= mainStatLimit - EPSILON || currentGatePoints >= gateStatCap - EPSILON) {
    return { pointsToAward: 0, newGateProgress: currentGatePoints, newTotalProgress: currentTotalPoints };
  }

  // Calculate points to award (capped to not exceed limits)
  let pointsToAward = pointsPerTask;
  
  // Cap by gate limit
  if (currentGatePoints + pointsToAward > gateStatCap) {
    pointsToAward = gateStatCap - currentGatePoints;
  }
  
  // Cap by total level limit
  if (currentTotalPoints + pointsToAward > mainStatLimit) {
    pointsToAward = mainStatLimit - currentTotalPoints;
  }

  const newGateProgress = currentGatePoints + pointsToAward;
  const newTotalProgress = currentTotalPoints + pointsToAward;

  // Update progress tracking
  progress.gateProgress[gate] = newGateProgress;
  progress.totalPointsEarned = newTotalProgress;

  logger.debug('Progressive stat calculation', {
    level,
    gate,
    pointsPerTask,
    currentGatePoints,
    currentTotalPoints,
    pointsToAward,
    gateStatCap,
    mainStatLimit,
  });

  return { pointsToAward, newGateProgress, newTotalProgress };
};

// Track initialization state
let _isInitialized = false;
let _initPromise: Promise<void> | null = null;

// Initialize demo data (async to support lazy loading of tempering path)
const initializeDemoData = async (): Promise<void> => {
  if (_isInitialized) return;
  
  // Create demo user profile
  const demoProfile: UserProfile = {
    id: DEMO_USER_ID,
    display_name: 'Demo Cultivator',
    ...DEFAULT_PROFILE_VALUES,
    coins: 200,
    stars: 100,
    body_points: 0,
    mind_points: 0,
    soul_points: 0,
    will_points: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockProfiles.set(DEMO_USER_ID, demoProfile);

  // Create identity templates
  const identities: IdentityTemplate[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      name: 'MORNING WARRIOR',
      primary_stat: 'BODY',
      tier: 'D',
      unlock_cost_stars: 0,
      description: 'Rise with the sun and forge discipline through morning rituals. The warrior\'s path begins at dawn.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'template-1',
      name: 'Morning Warrior',
      primary_stat: 'BODY',
      tier: 'D',
      unlock_cost_stars: 0,
      description: 'Rise early and conquer the day',
      created_at: new Date().toISOString(),
    },
    {
      id: 'template-2',
      name: 'Scholar',
      primary_stat: 'MIND',
      tier: 'D',
      unlock_cost_stars: 0,
      description: 'Expand your knowledge daily',
      created_at: new Date().toISOString(),
    },
    {
      id: 'template-3',
      name: 'Meditator',
      primary_stat: 'SOUL',
      tier: 'D+',
      unlock_cost_stars: 3,
      description: 'Find inner peace and balance',
      created_at: new Date().toISOString(),
    },
  ];

  identities.forEach((template) => {
    mockIdentityTemplates.set(template.id, template);
  });

  // Add Tempering Path templates (Levels 1-10) - loaded lazily
  const temperingModule = await loadTemperingModule();
  const temperingData = temperingModule.getAllTemperingData();
  temperingData.templates.forEach((template) => {
    mockIdentityTemplates.set(template.id, template);
  });

  // Create task templates
  const tasks: TaskTemplate[] = [
    // MORNING WARRIOR tasks (550e8400-e29b-41d4-a716-446655440007)
    {
      id: '650e8400-e29b-41d4-a716-446655440701',
      identity_template_id: '550e8400-e29b-41d4-a716-446655440007',
      name: 'Dawn Training',
      target_stat: 'BODY',
      base_points_reward: 10,
      coin_reward: 15,
      xp_reward: 25,
      description: 'Rise at dawn and train your body',
      created_at: new Date().toISOString(),
      subtasks: [
        {
          id: 'subtask-mw-1-1',
          task_template_id: '650e8400-e29b-41d4-a716-446655440701',
          name: 'Wake before sunrise',
          description: 'Rise with discipline',
        },
        {
          id: 'subtask-mw-1-2',
          task_template_id: '650e8400-e29b-41d4-a716-446655440701',
          name: 'Physical training',
          description: '30 minutes of strength or cardio',
        },
      ],
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440702',
      identity_template_id: '550e8400-e29b-41d4-a716-446655440007',
      name: 'Warrior Meditation',
      target_stat: 'SOUL',
      base_points_reward: 8,
      coin_reward: 12,
      xp_reward: 20,
      description: 'Center yourself before the battle of the day',
      created_at: new Date().toISOString(),
      subtasks: [
        {
          id: 'subtask-mw-2-1',
          task_template_id: '650e8400-e29b-41d4-a716-446655440702',
          name: 'Breathing exercises',
          description: '5 minutes of focused breathing',
        },
        {
          id: 'subtask-mw-2-2',
          task_template_id: '650e8400-e29b-41d4-a716-446655440702',
          name: 'Mindful presence',
          description: 'Be present in the moment',
        },
      ],
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440703',
      identity_template_id: '550e8400-e29b-41d4-a716-446655440007',
      name: 'Evening Review',
      target_stat: 'MIND',
      base_points_reward: 8,
      coin_reward: 12,
      xp_reward: 20,
      description: 'Reflect on the day like a true warrior',
      created_at: new Date().toISOString(),
      subtasks: [
        {
          id: 'subtask-mw-3-1',
          task_template_id: '650e8400-e29b-41d4-a716-446655440703',
          name: 'Journal victories',
          description: 'Write down your wins',
        },
        {
          id: 'subtask-mw-3-2',
          task_template_id: '650e8400-e29b-41d4-a716-446655440703',
          name: 'Plan tomorrow',
          description: 'Set intentions for the next battle',
        },
      ],
    },
    // Morning Warrior tasks (legacy template-1)
    {
      id: 'task-1',
      identity_template_id: 'template-1',
      name: 'Wake up at 6 AM',
      target_stat: 'BODY',
      base_points_reward: 10,
      coin_reward: 5,
      xp_reward: 25,
      description: 'Start your day early',
      created_at: new Date().toISOString(),
      subtasks: [
        {
          id: 'subtask-1-1',
          task_template_id: 'task-1',
          name: 'Set alarm for 6 AM',
          description: 'Prepare your alarm the night before',
        },
        {
          id: 'subtask-1-2',
          task_template_id: 'task-1',
          name: 'Get out of bed immediately',
          description: 'No snoozing - feet on the floor',
        },
        {
          id: 'subtask-1-3',
          task_template_id: 'task-1',
          name: 'Make your bed',
          description: 'Complete your first task of the day',
        },
      ],
    },
    {
      id: 'task-2',
      identity_template_id: 'template-1',
      name: 'Morning Exercise',
      target_stat: 'BODY',
      base_points_reward: 15,
      coin_reward: 8,
      xp_reward: 30,
      description: '30 minutes of physical activity',
      created_at: new Date().toISOString(),
      subtasks: [
        {
          id: 'subtask-2-1',
          task_template_id: 'task-2',
          name: 'Warm up (5 min)',
          description: 'Light stretching and mobility work',
        },
        {
          id: 'subtask-2-2',
          task_template_id: 'task-2',
          name: 'Main workout (20 min)',
          description: 'Cardio, strength, or flexibility training',
        },
        {
          id: 'subtask-2-3',
          task_template_id: 'task-2',
          name: 'Cool down (5 min)',
          description: 'Gentle stretching and breathing',
        },
      ],
    },
    // Scholar tasks
    {
      id: 'task-3',
      identity_template_id: 'template-2',
      name: 'Read for 30 minutes',
      target_stat: 'MIND',
      base_points_reward: 12,
      coin_reward: 6,
      xp_reward: 28,
      description: 'Expand your mind through reading',
      created_at: new Date().toISOString(),
    },
    {
      id: 'task-4',
      identity_template_id: 'template-2',
      name: 'Practice a skill',
      target_stat: 'MIND',
      base_points_reward: 18,
      coin_reward: 10,
      xp_reward: 35,
      description: 'Deliberate practice on your craft',
      created_at: new Date().toISOString(),
    },
    // Meditator tasks
    {
      id: 'task-5',
      identity_template_id: 'template-3',
      name: 'Meditate',
      target_stat: 'SOUL',
      base_points_reward: 15,
      coin_reward: 7,
      xp_reward: 30,
      description: '15 minutes of mindfulness',
      created_at: new Date().toISOString(),
    },
    {
      id: 'task-6',
      identity_template_id: 'template-3',
      name: 'Journal',
      target_stat: 'SOUL',
      base_points_reward: 10,
      coin_reward: 5,
      xp_reward: 25,
      description: 'Reflect on your day',
      created_at: new Date().toISOString(),
    },
  ];

  tasks.forEach((task) => {
    mockTaskTemplates.set(task.id, task);
  });

  // Add Tempering Path tasks (Levels 1-10)
  temperingData.tasks.forEach((task) => {
    mockTaskTemplates.set(task.id, task);
  });

  // Create initial player identity for demo user
  const demoIdentity: PlayerIdentity = {
    id: 'player-identity-1',
    user_id: DEMO_USER_ID,
    template_id: 'template-1',
    is_active: true,
    current_level: 1,
    current_xp: 0,
    current_streak: 0,
    will_contribution: 0,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockPlayerIdentities.set(demoIdentity.id, demoIdentity);

  // Create shop items
  const items: ItemTemplate[] = [
    {
      id: 'item-1',
      name: 'XP Boost',
      description: 'Double XP for next task',
      cost_coins: 50,
      cost_stars: undefined,
      effect_type: 'xp_multiplier',
      effect_value: 2,
      is_available: true,
      created_at: new Date().toISOString(),
      category: 'buffs',
    },
    {
      id: 'item-2',
      name: 'Stat Elixir',
      description: '+20 to all stats',
      cost_coins: 100,
      cost_stars: 2,
      effect_type: 'stat_boost',
      effect_value: 20,
      is_available: true,
      created_at: new Date().toISOString(),
      category: 'buffs',
    },
    // Add all ticket items
    ...TICKET_DATA,
  ];

  items.forEach((item) => {
    mockItemTemplates.set(item.id, item);
  });

  // Initialize empty inventory for demo user
  mockPlayerInventory.set(DEMO_USER_ID, []);

  _isInitialized = true;
  
  logger.info('Mock database initialized with demo data', {
    profiles: mockProfiles.size,
    identityTemplates: mockIdentityTemplates.size,
    taskTemplates: mockTaskTemplates.size,
    playerIdentities: mockPlayerIdentities.size,
    shopItems: mockItemTemplates.size,
    inventories: mockPlayerInventory.size,
  });
};

// Ensure initialization is complete before using mockDB
const ensureInitialized = async (): Promise<void> => {
  if (_isInitialized) return;
  if (!_initPromise) {
    _initPromise = initializeDemoData();
  }
  await _initPromise;
};

/**
 * Mock database API matching gameDatabase interface
 */
export const mockDB = {
  // ==================== PROFILES ====================

  async getProfile(userId: string): Promise<UserProfile | null> {
    await ensureInitialized();
    return mockProfiles.get(userId) || null;
  },

  async createProfile(userId: string, displayName: string): Promise<UserProfile> {
    await ensureInitialized();
    const profile: UserProfile = {
      id: userId,
      display_name: displayName,
      ...DEFAULT_PROFILE_VALUES,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockProfiles.set(userId, profile);
    logger.info('Mock profile created', { userId });
    return profile;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    await ensureInitialized();
    const existing = mockProfiles.get(userId);
    if (!existing) {
      throw new Error(`Profile not found: ${userId}`);
    }

    const updated: UserProfile = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    mockProfiles.set(userId, updated);
    return updated;
  },

  async updateOverallRank(userId: string): Promise<UserProfile> {
    await ensureInitialized();
    const profile = mockProfiles.get(userId);
    if (!profile) {
      throw new Error(`Profile not found: ${userId}`);
    }

    // Calculate overall rank
    const { finalScore, rankTier } = calculateOverallRank({
      body: profile.body_points,
      mind: profile.mind_points,
      soul: profile.soul_points,
      will: profile.will_points || 0,
    });

    // Update profile with new rank
    const updated: UserProfile = {
      ...profile,
      final_score: finalScore,
      rank_tier: rankTier,
      updated_at: new Date().toISOString(),
    };
    mockProfiles.set(userId, updated);

    logger.info('Mock overall rank updated', {
      userId,
      finalScore,
      rankTier,
    });

    return updated;
  },

  // ==================== IDENTITY TEMPLATES ====================

  async getIdentityTemplates(): Promise<IdentityTemplate[]> {
    await ensureInitialized();
    return Array.from(mockIdentityTemplates.values());
  },

  async getIdentityTemplate(templateId: string): Promise<IdentityTemplate | null> {
    await ensureInitialized();
    return mockIdentityTemplates.get(templateId) || null;
  },

  // ==================== TASK TEMPLATES ====================

  async getTaskTemplates(identityTemplateId: string): Promise<TaskTemplate[]> {
    const tasks = Array.from(mockTaskTemplates.values()).filter(
      (task) => task.identity_template_id === identityTemplateId
    );
    logger.debug('getTaskTemplates', { 
      identityTemplateId, 
      tasksCount: tasks.length,
      firstTaskPathId: tasks[0]?.path_id,
      firstTaskPathLevel: tasks[0]?.path_level,
    });
    return tasks;
  },

  // ==================== PLAYER IDENTITIES ====================

  async getActiveIdentities(userId: string): Promise<PlayerIdentityWithDetails[]> {
    const identities = Array.from(mockPlayerIdentities.values()).filter(
      (identity) => identity.user_id === userId && identity.is_active
    );

    return Promise.all(
      identities.map(async (identity) => {
        const template = mockIdentityTemplates.get(identity.template_id);
        const tasks = await this.getTaskTemplates(identity.template_id);
        const completedToday = await this.checkCompletedToday(identity.id);

        if (!template) {
          throw new Error(`Template not found: ${identity.template_id}`);
        }

        return {
          ...identity,
          template,
          available_tasks: tasks,
          completed_today: completedToday,
        };
      })
    );
  },

  async activateIdentity(request: ActivateIdentityRequest): Promise<PlayerIdentity> {
    const id = `player-identity-${Date.now()}`;
    const identity: PlayerIdentity = {
      id,
      user_id: request.user_id,
      template_id: request.template_id,
      is_active: true,
      current_level: 1,
      current_xp: 0,
      current_streak: 0,
      will_contribution: 0,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockPlayerIdentities.set(id, identity);
    logger.info('Mock identity activated', request);
    return identity;
  },

  async deactivateIdentity(identityId: string): Promise<void> {
    const identity = mockPlayerIdentities.get(identityId);
    if (identity) {
      identity.is_active = false;
      identity.status = 'PAUSED';
      identity.updated_at = new Date().toISOString();
      logger.info('Mock identity deactivated', { identityId });
    }
  },

  // ==================== TASK COMPLETION ====================

  async completeTask(request: CompleteTaskRequest): Promise<CompleteTaskResponse> {
    const taskTemplate = mockTaskTemplates.get(request.task_template_id);
    const identity = mockPlayerIdentities.get(request.identity_instance_id);
    const profile = mockProfiles.get(request.user_id);

    if (!taskTemplate) throw new Error(`Task template not found: ${request.task_template_id}`);
    if (!identity) throw new Error(`Identity not found: ${request.identity_instance_id}`);
    if (!profile) throw new Error(`Profile not found: ${request.user_id}`);

    // Extract gate from task template ID (e.g., 'tempering-lvl1-task-rooting' -> 'rooting')
    const gateMatch = request.task_template_id.match(/task-(rooting|foundation|core|flow|breath)$/);
    const gate = gateMatch ? gateMatch[1] as GateType : null;

    // Calculate progressive stat points for tempering path
    let statPointsToAward = taskTemplate.base_points_reward;
    let statIncreased = false;

    if (taskTemplate.path_id === TEMPERING_TEMPLATE_ID && gate && taskTemplate.path_level) {
      const progressiveResult = calculateProgressiveStatPoints(
        request.user_id,
        request.identity_instance_id,
        taskTemplate.path_level,
        gate,
        taskTemplate.path_id
      );
      
      statPointsToAward = progressiveResult.pointsToAward;
      statIncreased = statPointsToAward > 0;
      
      logger.debug('Progressive reward applied', {
        gate,
        level: taskTemplate.path_level,
        pointsAwarded: statPointsToAward,
        statIncreased,
      });
    } else {
      // Non-tempering paths use base rewards
      statIncreased = statPointsToAward > 0;
    }

    // Create task log
    const taskLog: TaskLog = {
      id: `log-${Date.now()}`,
      user_id: request.user_id,
      identity_instance_id: request.identity_instance_id,
      task_template_id: request.task_template_id,
      completed_at: new Date().toISOString(),
      stat_points_earned: statPointsToAward,
      coins_earned: taskTemplate.coin_reward,
      xp_earned: taskTemplate.xp_reward,
    };
    mockTaskLogs.push(taskLog);

    // Update profile stats (use progressive points for tempering)
    const statColumn = STAT_COLUMN_MAPPING[taskTemplate.target_stat];
    const updatedProfile: UserProfile = {
      ...profile,
      [statColumn]: profile[statColumn] + statPointsToAward,
      coins: profile.coins + taskTemplate.coin_reward,
      updated_at: new Date().toISOString(),
    };
    mockProfiles.set(request.user_id, updatedProfile);

    // Update identity XP and level
    const newXp = identity.current_xp + taskTemplate.xp_reward;
    const xpForNextLevel = identity.current_level * 100;
    const leveledUp = newXp >= xpForNextLevel;
    const newLevel = leveledUp ? identity.current_level + 1 : identity.current_level;

    const updatedIdentity: PlayerIdentity = {
      ...identity,
      current_xp: leveledUp ? newXp - xpForNextLevel : newXp,
      current_level: newLevel,
      current_streak: identity.current_streak + 1,
      updated_at: new Date().toISOString(),
    };
    mockPlayerIdentities.set(request.identity_instance_id, updatedIdentity);

    // Update overall rank after stat changes
    const profileWithRank = await this.updateOverallRank(request.user_id);

    logger.info('Mock task completed', { taskLog, statIncreased });

    return {
      task_log: taskLog,
      updated_profile: profileWithRank,
      updated_identity: updatedIdentity,
      leveled_up: leveledUp,
      stat_increased: statIncreased,
      rewards: {
        [taskTemplate.target_stat.toLowerCase() + '_points']: statPointsToAward,
        coins: taskTemplate.coin_reward,
        xp: taskTemplate.xp_reward,
      },
    };
  },

  async checkCompletedToday(identityId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    return mockTaskLogs.some(
      (log) =>
        log.identity_instance_id === identityId &&
        log.completed_at.startsWith(today)
    );
  },

  async getRecentCompletions(userId: string, limit: number = 10): Promise<TaskLog[]> {
    return mockTaskLogs
      .filter((log) => log.user_id === userId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, limit);
  },

  // ==================== TASK LOGS (HISTORY) ====================

  async getCompletionHistory(
    userId: string,
    identityId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TaskLog[]> {
    return mockTaskLogs
      .filter((log) => {
        if (log.user_id !== userId || log.identity_instance_id !== identityId) {
          return false;
        }
        if (startDate && log.completed_at < startDate) return false;
        if (endDate && log.completed_at > endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  },

  // ==================== SHOP ====================

  async purchaseItem(request: PurchaseItemRequest): Promise<PlayerInventoryItem> {
    const itemTemplate = mockItemTemplates.get(request.item_template_id);
    const profile = mockProfiles.get(request.user_id);

    if (!itemTemplate) {
      throw new Error(`Item not found: ${request.item_template_id}`);
    }
    if (!profile) {
      throw new Error(`Profile not found: ${request.user_id}`);
    }

    // Use base price - inflation is handled by shopStore on the frontend
    // This ensures the price the user sees is the price they pay
    const actualPrice = itemTemplate.cost_coins;

    if (profile.coins < actualPrice) {
      throw new Error('Insufficient coins');
    }

    // Deduct coins from profile
    const updatedProfile: UserProfile = {
      ...profile,
      coins: profile.coins - actualPrice,
      updated_at: new Date().toISOString(),
    };
    mockProfiles.set(request.user_id, updatedProfile);

    // Get or create user's inventory
    let userInventory = mockPlayerInventory.get(request.user_id) || [];
    
    // Check if item already exists in inventory
    const existingItem = userInventory.find(
      (inv) => inv.item_template_id === request.item_template_id
    );

    let inventoryItem: PlayerInventoryItem;

    if (existingItem) {
      // Update quantity
      existingItem.quantity += request.quantity || 1;
      inventoryItem = existingItem;
    } else {
      // Add new item to inventory
      inventoryItem = {
        id: `inv-${Date.now()}`,
        user_id: request.user_id,
        item_template_id: request.item_template_id,
        quantity: request.quantity || 1,
        acquired_at: new Date().toISOString(),
        item_template: itemTemplate,
      };
      userInventory.push(inventoryItem);
    }

    mockPlayerInventory.set(request.user_id, userInventory);

    logger.info('Mock item purchased', {
      userId: request.user_id,
      itemId: request.item_template_id,
      quantity: request.quantity || 1,
    });

    return inventoryItem;
  },

  async getPlayerInventory(userId: string): Promise<PlayerInventoryItem[]> {
    const inventory = mockPlayerInventory.get(userId) || [];
    
    // Enrich with item template data
    return inventory.map((item) => ({
      ...item,
      item_template: mockItemTemplates.get(item.item_template_id),
    }));
  },

  async useInventoryItem(userId: string, inventoryItemId: string): Promise<PlayerInventoryItem> {
    const userInventory = mockPlayerInventory.get(userId);
    if (!userInventory) {
      throw new Error('Inventory not found');
    }

    const itemIndex = userInventory.findIndex((item) => item.id === inventoryItemId);
    if (itemIndex === -1) {
      throw new Error('Item not found in inventory');
    }

    const item = userInventory[itemIndex];
    
    // Apply item effect (simplified for now)
    const itemTemplate = mockItemTemplates.get(item.item_template_id);
    if (itemTemplate) {
      logger.info('Item used', {
        userId,
        itemId: item.id,
        effectType: itemTemplate.effect_type,
        effectValue: itemTemplate.effect_value,
      });
    }

    // Decrease quantity
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      // Remove item if quantity is 0
      userInventory.splice(itemIndex, 1);
    }

    mockPlayerInventory.set(userId, userInventory);

    return item;
  },

  async getShopItems(): Promise<ItemTemplate[]> {
    return Array.from(mockItemTemplates.values()).filter((item) => item.is_available);
  },

  /**
   * Check if a gate is capped for the current level
   * Used for UI dimming when stat growth is no longer possible
   */
  isGateCapped(
    userId: string,
    identityId: string,
    level: number,
    gate: GateType,
    pathId?: string
  ): boolean {
    // Only applies to tempering path
    if (pathId !== TEMPERING_TEMPLATE_ID) {
      return false;
    }

    const levelConfig = getTemperingLevelSync(level);
    if (!levelConfig) {
      return false;
    }

    const progress = getLevelProgress(userId, identityId, level);
    const { gateStatCap, mainStatLimit } = levelConfig;
    
    // Gate is capped if either:
    // 1. This specific gate has reached its cap
    // 2. The total level progress has reached the main limit
    return progress.gateProgress[gate] >= gateStatCap || progress.totalPointsEarned >= mainStatLimit;
  },

  /**
   * Get all gate cap statuses for a level
   * Returns object with each gate's capped status
   */
  getGateCapStatuses(
    userId: string,
    identityId: string,
    level: number,
    pathId?: string
  ): Record<GateType, boolean> {
    const gates: GateType[] = ['rooting', 'foundation', 'core', 'flow', 'breath'];
    const statuses: Record<GateType, boolean> = {
      rooting: false,
      foundation: false,
      core: false,
      flow: false,
      breath: false,
    };

    for (const gate of gates) {
      statuses[gate] = this.isGateCapped(userId, identityId, level, gate, pathId);
    }

    return statuses;
  },
};

// Export demo user ID for easy access
export const DEMO_USER = {
  id: DEMO_USER_ID,
  displayName: 'Demo Cultivator',
};
