/**
 * Chronos Reset System Tests
 * 
 * Tests for the daily reset logic implementing 9 business rules:
 * 
 * Rule 1: PathCard status → COMPLETED when all tasks done
 * Rule 2: Streak +1 when all tasks done
 * Rule 3: Tasks reset at midnight (rewards kept)
 * Rule 4: PathCard status → PENDING at midnight
 * Rule 5: Homepage shows new date
 * Rule 6: Uncompleted quests move to new day
 * Rule 7: Recurring quests reset (rewards kept)
 * Rule 8: daily_path_progress tracking + streak verification
 * Rule 9: Per-path streak/XP tracking
 * 
 * Run from browser console:
 * ```
 * import { runChronosResetTests } from '@/tests/logic/ChronosReset.test';
 * runChronosResetTests();
 * ```
 * 
 * @module tests/logic/ChronosReset.test
 */

import { logger } from '@/utils/logger';
import { ChronosManager } from '@/logic/ChronosManager';
import type { 
  UserProfile, 
  PlayerIdentityWithDetails, 
  DailyPathProgress,
} from '@/types/database';
import type { Quest } from '@/components/quest/QuestCard';

// ==================== TEST UTILITIES ====================

interface TestResult {
  name: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  message: string;
}

let results: TestResult[] = [];

const assert = (name: string, expected: unknown, actual: unknown, message: string = ''): boolean => {
  const passed = JSON.stringify(expected) === JSON.stringify(actual);
  results.push({ name, passed, expected, actual, message });
  
  if (passed) {
    logger.info(`✅ PASS: ${name}`, { expected, actual });
  } else {
    logger.error(`❌ FAIL: ${name}`, { expected, actual, message });
  }
  
  return passed;
};

const assertTrue = (name: string, value: boolean, message: string = ''): boolean => {
  results.push({ name, passed: value, expected: true, actual: value, message });
  
  if (value) {
    logger.info(`✅ PASS: ${name}`);
  } else {
    logger.error(`❌ FAIL: ${name}`, { message });
  }
  
  return value;
};

const assertFalse = (name: string, value: boolean, message: string = ''): boolean => {
  results.push({ name, passed: !value, expected: false, actual: value, message });
  
  if (!value) {
    logger.info(`✅ PASS: ${name}`);
  } else {
    logger.error(`❌ FAIL: ${name}`, { message });
  }
  
  return !value;
};

// ==================== MOCK DATA FACTORIES ====================

const createMockUserProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'test-user-001',
  display_name: 'Test Cultivator',
  coins: 100,
  stars: 5,
  body_points: 10,
  mind_points: 5,
  soul_points: 3,
  will_points: 1,
  final_score: 19,
  rank_tier: 'D',
  timezone: 'UTC',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  last_reset_date: '2025-12-24', // Yesterday
  ...overrides,
});

const createMockIdentity = (overrides: Partial<PlayerIdentityWithDetails> = {}): PlayerIdentityWithDetails => ({
  id: 'identity-001',
  user_id: 'test-user-001',
  template_id: 'tempering-warrior-trainee-lvl1',
  is_active: true,
  current_level: 1,
  current_xp: 0,
  current_streak: 10,
  will_contribution: 0,
  status: 'ACTIVE',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  template: {
    id: 'tempering-warrior-trainee-lvl1',
    name: 'Tempering Lv.1 - The Awakening',
    primary_stat: 'BODY',
    tier: 'D',
    unlock_cost_stars: 5,
    created_at: '2025-01-01T00:00:00Z',
  },
  available_tasks: [
    { id: 'task-1', identity_template_id: 'tempering-warrior-trainee-lvl1', name: 'Task 1', target_stat: 'BODY', base_points_reward: 0.04, coin_reward: 30, xp_reward: 8, created_at: '' },
    { id: 'task-2', identity_template_id: 'tempering-warrior-trainee-lvl1', name: 'Task 2', target_stat: 'BODY', base_points_reward: 0.04, coin_reward: 30, xp_reward: 8, created_at: '' },
    { id: 'task-3', identity_template_id: 'tempering-warrior-trainee-lvl1', name: 'Task 3', target_stat: 'BODY', base_points_reward: 0.04, coin_reward: 30, xp_reward: 8, created_at: '' },
  ],
  completed_today: false,
  ...overrides,
});

const createMockQuest = (overrides: Partial<Quest> = {}): Quest => ({
  id: 'quest-001',
  title: 'Test Quest',
  project: '',
  date: 'Dec 24',
  status: 'today',
  isRecurring: false,
  ...overrides,
});

const createMockDailyProgress = (overrides: Partial<DailyPathProgress> = {}): DailyPathProgress => ({
  id: 'progress-001',
  user_id: 'test-user-001',
  path_id: 'identity-001',
  date: '2025-12-24',
  tasks_total: 3,
  tasks_completed: 3,
  percentage: 100,
  status: 'COMPLETED',
  created_at: '2025-12-24T00:00:00Z',
  updated_at: '2025-12-24T23:59:00Z',
  ...overrides,
});

// ==================== TEST CASE 1: THE "LAZY WARRIOR" ====================
// Rule 8: Streak reset when yesterday < 100%

const testLazyWarrior = async (): Promise<boolean> => {
  logger.info('🧪 Test Case 1: The "Lazy Warrior" (Rule 8)');
  logger.info('Setup: Yesterday\'s progress is 99%, Streak is 10');
  
  // Mock yesterday's progress at 99%
  const yesterdayProgress: DailyPathProgress = createMockDailyProgress({
    percentage: 99,
    tasks_completed: 2,
    tasks_total: 3,
    status: 'PENDING',
  });

  // Mock identity with streak of 10
  const identity = createMockIdentity({
    current_streak: 10,
  });

  // Evaluate streak
  const { newStreak, wasReset } = await ChronosManager.evaluateStreak(identity, yesterdayProgress);

  // Assertions
  const streakIsZero = assert(
    'Lazy Warrior: Streak must be 0',
    0,
    newStreak,
    'Streak should reset to 0 when yesterday < 100%'
  );

  const wasActuallyReset = assertTrue(
    'Lazy Warrior: wasReset flag is true',
    wasReset,
    'wasReset should be true when streak is reset'
  );

  return streakIsZero && wasActuallyReset;
};

// ==================== TEST CASE 2: THE "HIDDEN CHAMPION" ====================
// Rule 3: Tasks reset at midnight, rewards NOT deducted

const testHiddenChampion = async (): Promise<boolean> => {
  logger.info('🧪 Test Case 2: The "Hidden Champion" (Rule 3)');
  logger.info('Setup: All tasks completed, User has 100 Gold');

  const userProfile = createMockUserProfile({
    coins: 100,
  });

  // Track callback invocations
  let clearedTaskStates = false;
  const streakUpdates: { identityId: string; streak: number }[] = [];
  const questUpdates: { questId: string; updates: Partial<Quest> }[] = [];

  const callbacks = {
    updateQuest: async (questId: string, updates: Partial<Quest>) => {
      questUpdates.push({ questId, updates });
    },
    updateIdentityStreak: async (identityId: string, streak: number) => {
      streakUpdates.push({ identityId, streak });
    },
    updateLastResetDate: async (_date: string) => {
      // Date update tracked separately
    },
    clearDailyTaskStates: () => {
      clearedTaskStates = true;
    },
  };

  // Execute reset
  await ChronosManager.executeDailyReset(
    userProfile,
    [createMockIdentity()],
    [],
    {
      'identity-001': {
        completedTasks: ['task-1', 'task-2', 'task-3'],
        completedSubtasks: [],
        date: '2025-12-24',
      },
    },
    callbacks
  );

  // Assertions
  const taskStatesCleared = assertTrue(
    'Hidden Champion: Task states cleared',
    clearedTaskStates,
    'Daily task states should be cleared (tasks reset to unchecked)'
  );

  // The user's coins should NOT be affected by the reset
  // (coins are in userProfile, and reset doesn't modify them)
  const coinsUnchanged = assert(
    'Hidden Champion: User coins unchanged',
    100,
    userProfile.coins,
    'Gold should not be deducted during reset'
  );

  return taskStatesCleared && coinsUnchanged;
};

// ==================== TEST CASE 3: THE "ETERNAL VOW" ====================
// Rule 7: Recurring quest reset without reward deduction

const testEternalVow = async (): Promise<boolean> => {
  logger.info('🧪 Test Case 3: The "Eternal Vow" (Rule 7)');
  logger.info('Setup: Recurring Quest completed yesterday');

  const userProfile = createMockUserProfile({
    coins: 100,
  });

  // Completed recurring quest from yesterday
  const recurringQuest = createMockQuest({
    id: 'recurring-quest-001',
    title: 'Daily Meditation',
    isRecurring: true,
    status: 'completed',
    date: 'Dec 24',
    completedAt: '2025-12-24T20:00:00Z',
  });

  // Track quest updates
  const questUpdates: { questId: string; updates: Partial<Quest> }[] = [];

  const callbacks = {
    updateQuest: async (questId: string, updates: Partial<Quest>) => {
      questUpdates.push({ questId, updates });
    },
    updateIdentityStreak: async () => {},
    updateLastResetDate: async () => {},
    clearDailyTaskStates: () => {},
  };

  // Execute reset
  await ChronosManager.executeDailyReset(
    userProfile,
    [],
    [recurringQuest],
    {},
    callbacks
  );

  // Find the update for our recurring quest
  const questUpdate = questUpdates.find(u => u.questId === 'recurring-quest-001');

  // Assertions
  const questWasUpdated = assertTrue(
    'Eternal Vow: Quest was updated',
    questUpdate !== undefined,
    'Recurring quest should be updated during reset'
  );

  const dateIsToday = assertTrue(
    'Eternal Vow: Quest date is today',
    questUpdate?.updates.date === ChronosManager.getTodayFormatted(),
    `Quest date should be today (${ChronosManager.getTodayFormatted()})`
  );

  const statusIsToday = assert(
    'Eternal Vow: Quest status is "today"',
    'today',
    questUpdate?.updates.status,
    'Recurring quest status should reset to "today" (uncompleted)'
  );

  const coinsUnchanged = assert(
    'Eternal Vow: Coin balance unchanged',
    100,
    userProfile.coins,
    'Coins should not be deducted when recurring quest resets'
  );

  return questWasUpdated && dateIsToday && statusIsToday && coinsUnchanged;
};

// ==================== TEST CASE 4: STREAK MAINTENANCE ====================
// Rule 8: 100% completion maintains streak

const testStreakMaintenance = async (): Promise<boolean> => {
  logger.info('🧪 Test Case 4: Streak Maintenance (Rule 8)');
  logger.info('Setup: Yesterday was 100% complete, Streak is 10');

  // Mock yesterday's progress at 100%
  const yesterdayProgress: DailyPathProgress = createMockDailyProgress({
    percentage: 100,
    tasks_completed: 3,
    tasks_total: 3,
    status: 'COMPLETED',
  });

  // Mock identity with streak of 10
  const identity = createMockIdentity({
    current_streak: 10,
  });

  // Evaluate streak
  const { newStreak, wasReset } = await ChronosManager.evaluateStreak(identity, yesterdayProgress);

  // Assertions
  const streakMaintained = assert(
    'Streak Maintenance: Streak is maintained at 10',
    10,
    newStreak,
    'Streak should stay at 10 when yesterday was 100%'
  );

  const wasNotReset = assertFalse(
    'Streak Maintenance: wasReset flag is false',
    wasReset,
    'wasReset should be false when streak is maintained'
  );

  return streakMaintained && wasNotReset;
};

// ==================== TEST CASE 5: FIRST DAY USER ====================
// Rule 8: No yesterday progress = streak reset

const testFirstDayUser = async (): Promise<boolean> => {
  logger.info('🧪 Test Case 5: First Day User (Rule 8)');
  logger.info('Setup: No yesterday progress, Streak is 0');

  // New user with no history
  const identity = createMockIdentity({
    current_streak: 0,
  });

  // Evaluate streak with null yesterday progress
  const { newStreak, wasReset } = await ChronosManager.evaluateStreak(identity, null);

  // Assertions
  const streakIsZero = assert(
    'First Day User: Streak is 0',
    0,
    newStreak,
    'Streak should be 0 for first day users'
  );

  const wasActuallyReset = assertTrue(
    'First Day User: wasReset flag is true',
    wasReset,
    'wasReset should be true when no yesterday progress'
  );

  return streakIsZero && wasActuallyReset;
};

// ==================== TEST CASE 6: INCOMPLETE QUEST MIGRATION ====================
// Rule 6: Uncompleted quests move to new day

const testIncompleteQuestMigration = async (): Promise<boolean> => {
  logger.info('🧪 Test Case 6: Incomplete Quest Migration (Rule 6)');
  logger.info('Setup: Non-recurring incomplete quest from yesterday');

  const userProfile = createMockUserProfile();

  // Incomplete non-recurring quest from yesterday
  const incompleteQuest = createMockQuest({
    id: 'incomplete-quest-001',
    title: 'Finish Project',
    isRecurring: false,
    status: 'today', // Not completed
    date: 'Dec 24',
  });

  // Track quest updates
  const questUpdates: { questId: string; updates: Partial<Quest> }[] = [];

  const callbacks = {
    updateQuest: async (questId: string, updates: Partial<Quest>) => {
      questUpdates.push({ questId, updates });
    },
    updateIdentityStreak: async () => {},
    updateLastResetDate: async () => {},
    clearDailyTaskStates: () => {},
  };

  // Execute reset
  await ChronosManager.executeDailyReset(
    userProfile,
    [],
    [incompleteQuest],
    {},
    callbacks
  );

  // Find the update for our incomplete quest
  const questUpdate = questUpdates.find(u => u.questId === 'incomplete-quest-001');

  // Assertions
  const questWasUpdated = assertTrue(
    'Incomplete Quest: Quest was updated',
    questUpdate !== undefined,
    'Incomplete quest should be updated during reset'
  );

  const dateIsToday = assertTrue(
    'Incomplete Quest: Quest date is today',
    questUpdate?.updates.date === ChronosManager.getTodayFormatted(),
    `Quest date should be moved to today (${ChronosManager.getTodayFormatted()})`
  );

  return questWasUpdated && dateIsToday;
};

// ==================== TEST CASE 7: COMPLETED QUEST STAYS IN HISTORY ====================
// Completed non-recurring quests should NOT be modified

const testCompletedQuestStaysInHistory = async (): Promise<boolean> => {
  logger.info('🧪 Test Case 7: Completed Quest Stays in History');
  logger.info('Setup: Completed non-recurring quest');

  const userProfile = createMockUserProfile();

  // Completed non-recurring quest
  const completedQuest = createMockQuest({
    id: 'completed-quest-001',
    title: 'One-time Achievement',
    isRecurring: false,
    status: 'completed',
    date: 'Dec 24',
    completedAt: '2025-12-24T15:00:00Z',
  });

  // Track quest updates
  const questUpdates: { questId: string; updates: Partial<Quest> }[] = [];

  const callbacks = {
    updateQuest: async (questId: string, updates: Partial<Quest>) => {
      questUpdates.push({ questId, updates });
    },
    updateIdentityStreak: async () => {},
    updateLastResetDate: async () => {},
    clearDailyTaskStates: () => {},
  };

  // Execute reset
  await ChronosManager.executeDailyReset(
    userProfile,
    [],
    [completedQuest],
    {},
    callbacks
  );

  // Completed non-recurring quests should NOT be updated
  const questUpdate = questUpdates.find(u => u.questId === 'completed-quest-001');

  // Assertion
  const questNotUpdated = assertTrue(
    'Completed Quest: Quest was NOT updated',
    questUpdate === undefined,
    'Completed non-recurring quests should stay in history (not be modified)'
  );

  return questNotUpdated;
};

// ==================== TEST CASE 8: DATE UPDATE ====================
// Rule 5: Last reset date is updated to today

const testDateUpdate = async (): Promise<boolean> => {
  logger.info('🧪 Test Case 8: Date Update (Rule 5)');
  logger.info('Setup: Last reset date is yesterday');

  const userProfile = createMockUserProfile({
    last_reset_date: '2025-12-24',
  });

  let updatedDate = '';

  const callbacks = {
    updateQuest: async () => {},
    updateIdentityStreak: async () => {},
    updateLastResetDate: async (date: string) => {
      updatedDate = date;
    },
    clearDailyTaskStates: () => {},
  };

  // Execute reset
  await ChronosManager.executeDailyReset(
    userProfile,
    [],
    [],
    {},
    callbacks
  );

  // Assertion
  const dateIsToday = assert(
    'Date Update: Last reset date is today',
    ChronosManager.getTodayISO(),
    updatedDate,
    'Last reset date should be updated to today'
  );

  return dateIsToday;
};

// ==================== TEST RUNNER ====================

export const runChronosResetTests = async (): Promise<void> => {
  results = [];
  
  logger.info('========================================');
  logger.info('🌙 CHRONOS RESET SYSTEM TESTS');
  logger.info('========================================');
  logger.info('Testing the 9 business rules for daily reset logic');
  logger.info('');

  const tests = [
    { name: 'Test 1: The Lazy Warrior (Rule 8)', fn: testLazyWarrior },
    { name: 'Test 2: The Hidden Champion (Rule 3)', fn: testHiddenChampion },
    { name: 'Test 3: The Eternal Vow (Rule 7)', fn: testEternalVow },
    { name: 'Test 4: Streak Maintenance (Rule 8)', fn: testStreakMaintenance },
    { name: 'Test 5: First Day User (Rule 8)', fn: testFirstDayUser },
    { name: 'Test 6: Incomplete Quest Migration (Rule 6)', fn: testIncompleteQuestMigration },
    { name: 'Test 7: Completed Quest History', fn: testCompletedQuestStaysInHistory },
    { name: 'Test 8: Date Update (Rule 5)', fn: testDateUpdate },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    logger.info('');
    logger.info(`Running: ${test.name}`);
    logger.info('----------------------------------------');
    
    try {
      const testPassed = await test.fn();
      if (testPassed) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logger.error(`Test "${test.name}" threw an error:`, error);
      failed++;
    }
  }

  // Summary
  logger.info('');
  logger.info('========================================');
  logger.info('📊 TEST SUMMARY');
  logger.info('========================================');
  logger.info(`Total Tests: ${tests.length}`);
  logger.info(`✅ Passed: ${passed}`);
  logger.info(`❌ Failed: ${failed}`);
  logger.info(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
  logger.info('');

  // Detailed results
  if (failed > 0) {
    logger.info('Failed Assertions:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        logger.error(`  - ${r.name}`, { expected: r.expected, actual: r.actual });
      });
  }
};

// Export for use in browser console
export default runChronosResetTests;
