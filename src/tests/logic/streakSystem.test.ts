/**
 * Streak System Tests
 * 
 * Tests for the streak milestone system including:
 * - Milestone calculation formula verification
 * - Reward logic at each level
 * - Persistence of maxStreak to history
 * - Will stat cap enforcement
 * 
 * Run from browser console:
 * ```
 * import { runStreakSystemTests } from '@/tests/logic/streakSystem.test';
 * runStreakSystemTests();
 * ```
 * 
 * @module tests/logic/streakSystem.test
 */

import { logger } from '@/utils/logger';
import {
  calculateMilestoneDays,
  getMilestoneForLevel,
  hasReachedMilestone,
  isSubMilestoneDay,
  getSubMilestoneRewards,
  calculateWillGain,
  calculateTotalWillFromMilestones,
  enforceWillCap,
  getStreakVisualState,
  createInitialStreakState,
  incrementStreak,
  handlePrestigeReset,
  validateMilestoneFormula,
  validateWillCap,
  MAX_TOTAL_WILL,
} from '@/services/StreakManager';

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

const assertClose = (name: string, expected: number, actual: number, tolerance: number = 0.1): boolean => {
  const passed = Math.abs(expected - actual) <= tolerance;
  results.push({ name, passed, expected, actual, message: `Tolerance: ±${tolerance}` });
  
  if (passed) {
    logger.info(`✅ PASS: ${name}`, { expected, actual, tolerance });
  } else {
    logger.error(`❌ FAIL: ${name}`, { expected, actual, tolerance });
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

const assertGreaterThanOrEqual = (name: string, actual: number, min: number): boolean => {
  const passed = actual >= min;
  results.push({ name, passed, expected: `>= ${min}`, actual, message: '' });
  
  if (passed) {
    logger.info(`✅ PASS: ${name}`, { actual, min });
  } else {
    logger.error(`❌ FAIL: ${name}`, { actual, min });
  }
  
  return passed;
};

const assertLessThanOrEqual = (name: string, actual: number, max: number): boolean => {
  const passed = actual <= max;
  results.push({ name, passed, expected: `<= ${max}`, actual, message: '' });
  
  if (passed) {
    logger.info(`✅ PASS: ${name}`, { actual, max });
  } else {
    logger.error(`❌ FAIL: ${name}`, { actual, max });
  }
  
  return passed;
};

// ==================== MILESTONE CALCULATION TESTS ====================

const testMilestoneCalculation = () => {
  logger.info('=== Milestone Calculation Tests ===');
  
  // Test 1: Formula (2 * level) + 1
  assert('Level 1 milestone should be 3 days', 3, calculateMilestoneDays(1));
  assert('Level 2 milestone should be 5 days', 5, calculateMilestoneDays(2));
  assert('Level 3 milestone should be 7 days', 7, calculateMilestoneDays(3));
  assert('Level 5 milestone should be 11 days', 11, calculateMilestoneDays(5));
  
  // Critical test: Level 10 = 21 days
  assert('Level 10 milestone should be EXACTLY 21 days', 21, calculateMilestoneDays(10), 
    'Formula: (2 * 10) + 1 = 21');
  
  // Test 2: Formula validation
  assertTrue('Milestone formula validation should pass', validateMilestoneFormula());
  
  // Test 3: Get milestone config
  const level1 = getMilestoneForLevel(1);
  assert('Level 1 config milestoneDays', 3, level1?.milestoneDays);
  assertClose('Level 1 config willGain', 0.25, level1?.willGain ?? 0);
  
  const level10 = getMilestoneForLevel(10);
  assert('Level 10 config milestoneDays', 21, level10?.milestoneDays);
  assertClose('Level 10 config willGain', 3.00, level10?.willGain ?? 0);
};

// ==================== REWARD LOGIC TESTS ====================

const testRewardLogic = () => {
  logger.info('=== Reward Logic Tests ===');
  
  // Test Level 10 milestone rewards (critical)
  const level10 = getMilestoneForLevel(10);
  assert('Level 10 rewards 1000 coins', 1000, level10?.rewards.coins);
  assert('Level 10 rewards 5 stars', 5, level10?.rewards.stars);
  assert('Level 10 rewards no ticket', undefined, level10?.rewards.ticket);
  
  // Test Level 1-2 rewards
  const level1 = getMilestoneForLevel(1);
  assert('Level 1 rewards 50 coins', 50, level1?.rewards.coins);
  assert('Level 1 rewards 0 stars', 0, level1?.rewards.stars);
  
  // Test Level 3-5 rewards
  const level3 = getMilestoneForLevel(3);
  assert('Level 3 rewards 100 coins', 100, level3?.rewards.coins);
  assert('Level 3 rewards 0 stars', 0, level3?.rewards.stars);
  
  // Test Level 6-9 rewards
  const level6 = getMilestoneForLevel(6);
  assert('Level 6 rewards 350 coins', 350, level6?.rewards.coins);
  assert('Level 6 rewards no ticket', undefined, level6?.rewards.ticket);
  
  // Test hasReachedMilestone
  assertTrue('Streak 2 has NOT reached Level 1 milestone', !hasReachedMilestone(2, 1));
  assertTrue('Streak 3 HAS reached Level 1 milestone', hasReachedMilestone(3, 1));
  assertTrue('Streak 20 has NOT reached Level 10 milestone', !hasReachedMilestone(20, 10));
  assertTrue('Streak 21 HAS reached Level 10 milestone', hasReachedMilestone(21, 10));
};

// ==================== SUB-MILESTONE TESTS ====================

const testSubMilestones = () => {
  logger.info('=== Sub-Milestone Tests ===');
  
  // No sub-milestones for levels < 4
  assertTrue('Level 1 day 7 should NOT be sub-milestone', !isSubMilestoneDay(7, 1));
  assertTrue('Level 3 day 7 should NOT be sub-milestone', !isSubMilestoneDay(7, 3));
  
  // Sub-milestones for levels >= 4
  assertTrue('Level 4 day 7 SHOULD be sub-milestone', isSubMilestoneDay(7, 4));
  assertTrue('Level 5 day 7 SHOULD be sub-milestone', isSubMilestoneDay(7, 5));
  assertTrue('Level 6 day 7 SHOULD be sub-milestone', isSubMilestoneDay(7, 6));
  assertTrue('Level 10 day 7 SHOULD be sub-milestone', isSubMilestoneDay(7, 10));
  
  // Not on final milestone day
  assertTrue('Level 5 day 11 (final) should NOT be sub-milestone', !isSubMilestoneDay(11, 5));
  assertTrue('Level 10 day 21 (final) should NOT be sub-milestone', !isSubMilestoneDay(21, 10));
  
  // Sub-milestone rewards
  const subRewards = getSubMilestoneRewards(7, 5);
  assert('Sub-milestone rewards 50 coins', 50, subRewards?.rewards.coins);
  assert('Sub-milestone rewards 0 stars', 0, subRewards?.rewards.stars);
};

// ==================== WILL STAT TESTS ====================

const testWillStats = () => {
  logger.info('=== Will Stat Tests ===');
  
  // Precision tests
  assertClose('calculateWillGain(0.25)', 0.25, calculateWillGain(0.25));
  assertClose('calculateWillGain(0.333)', 0.33, calculateWillGain(0.333));
  assertClose('calculateWillGain(1.999)', 1.99, calculateWillGain(1.999));
  
  // Total Will calculation
  const totalWill = calculateTotalWillFromMilestones();
  assertGreaterThanOrEqual('Total Will from milestones >= 12', totalWill, 12);
  assertLessThanOrEqual('Total Will from milestones <= 15', totalWill, MAX_TOTAL_WILL);
  
  // Will cap enforcement
  assertClose('Cap: 14 + 2 should cap to 1', 1.0, enforceWillCap(14.0, 2.0));
  assertClose('Cap: 15 + 1 should return 0', 0, enforceWillCap(15.0, 1.0));
  assertClose('Cap: 10 + 3 should return full 3', 3.0, enforceWillCap(10.0, 3.0));
  
  // Validation
  assertTrue('Will cap validation should pass', validateWillCap());
};

// ==================== STREAK STATE TESTS ====================

const testStreakState = () => {
  logger.info('=== Streak State Tests ===');
  
  // Initial state
  const initial = createInitialStreakState();
  assert('Initial currentStreak is 0', 0, initial.currentStreak);
  assert('Initial maxStreak is 0', 0, initial.maxStreak);
  assert('Initial currentLevel is 1', 1, initial.currentLevel);
  assert('Initial totalWillEarned is 0', 0, initial.totalWillEarned);
  assert('Initial streakHistory is empty', 0, initial.streakHistory.length);
  
  // Increment streak
  const result1 = incrementStreak(initial);
  assert('After increment, streak is 1', 1, result1.newState.currentStreak);
  assert('After increment, maxStreak is 1', 1, result1.newState.maxStreak);
  assertTrue('Milestone NOT reached at day 1', !result1.milestoneReached);
  
  // Reach milestone at day 3
  let state = initial;
  state = incrementStreak(state).newState;
  state = incrementStreak(state).newState;
  const milestone3 = incrementStreak(state);
  assertTrue('Milestone REACHED at day 3 (level 1)', milestone3.milestoneReached);
  assert('Day 3 milestone rewards 50 coins', 50, milestone3.rewards?.coins);
  assertClose('Day 3 milestone gives 0.25 Will', 0.25, milestone3.willGain);
};

// ==================== PERSISTENCE TESTS ====================

const testPersistence = () => {
  logger.info('=== Persistence Tests ===');
  
  // Build streak to milestone
  let state = createInitialStreakState();
  for (let i = 0; i < 5; i++) {
    state = incrementStreak(state).newState;
  }
  assert('Built streak to 5', 5, state.currentStreak);
  assert('maxStreak is 5', 5, state.maxStreak);
  
  // Prestige reset
  const newState = handlePrestigeReset(state);
  
  // Verify history
  assert('History has 1 entry after prestige', 1, newState.streakHistory.length);
  assert('History entry level is 1', 1, newState.streakHistory[0].level);
  assert('History entry maxStreak is 5', 5, newState.streakHistory[0].maxStreak);
  
  // Verify reset
  assert('currentStreak reset to 0 (Purification)', 0, newState.currentStreak);
  assert('maxStreak reset to 0 for new level', 0, newState.maxStreak);
  assert('currentLevel incremented to 2', 2, newState.currentLevel);
};

// ==================== VISUAL STATE TESTS ====================

const testVisualState = () => {
  logger.info('=== Visual State Tests ===');
  
  // Ember stage (days 1-2) - always applies
  assert('Day 1 is ember stage', 'ember', getStreakVisualState(1, 1).stage);
  assert('Day 2 is ember stage', 'ember', getStreakVisualState(2, 1).stage);
  
  // Flame stage (day 3+ before singularity)
  assert('Day 3 Level 3 is flame stage', 'flame', getStreakVisualState(3, 3).stage);
  
  // ==================== LEVEL-GATED STAGES ====================
  // Singularity and Explosion stages require level >= 4
  // This ensures users must prove consistency (7+ day streaks through L1-3)
  // before accessing intense visual effects
  
  // Levels 1-3: Max stage is FLAME (no singularity/explosion)
  assert('Level 1 at milestone (day 3) caps at flame', 'flame', getStreakVisualState(3, 1).stage,
    'Explosion locked until L4+ to build anticipation');
  assert('Level 2 at milestone (day 5) caps at flame', 'flame', getStreakVisualState(5, 2).stage,
    'L1-3 max stage is flame');
  assert('Level 3 at milestone (day 7) caps at flame', 'flame', getStreakVisualState(7, 3).stage,
    'Must reach L4 (proven 7+ day consistency) for advanced effects');
  assert('Level 3 near milestone (day 5) stays at flame', 'flame', getStreakVisualState(5, 3).stage,
    'Singularity not available until L4');
  assert('Level 3 near milestone (day 6) stays at flame', 'flame', getStreakVisualState(6, 3).stage,
    'No singularity at L3 even 1 day before milestone');
  
  // Levels 4+: Full access to singularity and explosion
  assert('Level 4 near milestone (day 7/9) is singularity', 'singularity', getStreakVisualState(7, 4).stage,
    'L4+ unlocks singularity stage');
  assert('Level 4 at milestone (day 9) is explosion', 'explosion', getStreakVisualState(9, 4).stage,
    'L4+ unlocks explosion stage');
  assert('Day 5 Level 3 (milestone=7) is flame (no singularity at L3)', 'flame', getStreakVisualState(5, 3).stage);
  assert('Day 19 Level 10 (milestone=21) is singularity', 'singularity', getStreakVisualState(19, 10).stage);
  
  // Explosion stage - only at milestone AND level >= 4
  assert('Day 21 Level 10 is explosion', 'explosion', getStreakVisualState(21, 10).stage);
  
  // Progress percent
  assertClose('Day 1/3 (Level 1) = 33%', 33.33, getStreakVisualState(1, 1).progressPercent, 1);
  assert('Day 3/3 (Level 1) = 100%', 100, getStreakVisualState(3, 1).progressPercent);
};

// ==================== FULL PROGRESSION SIMULATION ====================

const testFullProgression = () => {
  logger.info('=== Full L1-10 Progression Simulation ===');
  
  let state = createInitialStreakState();
  let totalWillAccumulated = 0;
  
  for (let level = 1; level <= 10; level++) {
    state = { ...state, currentLevel: level };
    const milestone = getMilestoneForLevel(level);
    
    if (!milestone) continue;
    
    // Simulate reaching milestone
    for (let day = 1; day <= milestone.milestoneDays; day++) {
      const result = incrementStreak(state);
      state = result.newState;
      totalWillAccumulated += result.willGain;
    }
    
    // Prestige reset (except after level 10)
    if (level < 10) {
      state = handlePrestigeReset(state);
    }
  }
  
  // Verify total Will is within bounds
  assertGreaterThanOrEqual('Total Will accumulated >= 12', totalWillAccumulated, 12);
  assertLessThanOrEqual('Total Will accumulated <= 15', totalWillAccumulated, MAX_TOTAL_WILL);
  assertLessThanOrEqual('State totalWillEarned <= 15', state.totalWillEarned, MAX_TOTAL_WILL);
  
  // Verify E → D+ progression
  const startingWill = 10; // E rank
  const finalWill = startingWill + calculateTotalWillFromMilestones();
  assertGreaterThanOrEqual('Final Will (E+gains) >= 22 (D+ threshold)', finalWill, 22);
  assertLessThanOrEqual('Final Will (E+gains) <= 26', finalWill, 26);
  
  logger.info('Progression simulation complete', {
    totalWillAccumulated,
    startingWill,
    finalWill,
    expectedRank: 'D+',
  });
};

// ==================== RUN ALL TESTS ====================

export const runStreakSystemTests = (): { passed: number; failed: number; results: TestResult[] } => {
  results = [];
  
  logger.info('╔════════════════════════════════════════════╗');
  logger.info('║       STREAK SYSTEM TEST SUITE             ║');
  logger.info('╚════════════════════════════════════════════╝');
  
  testMilestoneCalculation();
  testRewardLogic();
  testSubMilestones();
  testWillStats();
  testStreakState();
  testPersistence();
  testVisualState();
  testFullProgression();
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  logger.info('════════════════════════════════════════════');
  logger.info(`TOTAL: ${passed}/${results.length} tests passed`);
  
  if (failed > 0) {
    logger.error(`❌ ${failed} tests FAILED`);
    results.filter(r => !r.passed).forEach(r => {
      logger.error(`  - ${r.name}: Expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.actual)}`);
    });
  } else {
    logger.info('✅ All tests PASSED');
  }
  
  return { passed, failed, results };
};
