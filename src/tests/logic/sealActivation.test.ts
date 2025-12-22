/**
 * Logic Tests: Seal Activation System
 * 
 * Tests the seal activation limits based on Will rank,
 * daily reset functionality, and leveling progression.
 * 
 * Run from browser console:
 * ```
 * import { runSealActivationTests } from '@/tests/logic/sealActivation.test';
 * runSealActivationTests();
 * ```
 * 
 * @module tests/logic/sealActivation.test
 */

import { logger } from '@/utils/logger';
import {
  getMaxDailySealActivations,
  canActivateMoreSeals,
  shouldResetSeals,
  getSubPillarLevel,
  formatSubPillarLevel,
  getDaysUntilNextLevel,
  calculateSealAverageLevel,
  SEAL_LEVEL_THRESHOLDS,
  WILL_RANK_SEAL_LIMITS,
  MAX_SEAL_LEVEL,
  MAX_SEAL_DAYS,
  SubPillarStats,
} from '@/constants/seals';

// ==================== TEST UTILITIES ====================

interface TestResult {
  name: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  message: string;
}

const results: TestResult[] = [];

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

// ==================== TEST 1: WILL RANK ACTIVATION LIMITS ====================

const testWillRankActivationLimits = () => {
  logger.info('=== Test 1: Will Rank Activation Limits ===');
  
  // Test each Will rank tier
  const testCases = [
    { rank: 'F', expected: 2 },
    { rank: 'F+', expected: 3 },
    { rank: 'E', expected: 4 },
    { rank: 'E+', expected: 4 },
    { rank: 'D', expected: 6 },
    { rank: 'D+', expected: 6 },
    { rank: 'C', expected: 8 },
    { rank: 'C+', expected: 8 },
    { rank: 'B', expected: 10 },
    { rank: 'B+', expected: 10 },
    { rank: 'A', expected: 12 },
    { rank: 'A+', expected: 12 },
    { rank: 'S', expected: 16 },
    { rank: 'S+', expected: 16 },
  ];
  
  testCases.forEach(({ rank, expected }) => {
    const actual = getMaxDailySealActivations(rank);
    assert(
      `Will rank ${rank} should allow ${expected} seals`,
      expected,
      actual,
      `Max daily activations for ${rank}`
    );
  });
  
  // Test unknown rank defaults to E (4)
  const unknownRankLimit = getMaxDailySealActivations('UNKNOWN');
  assert(
    'Unknown Will rank should default to 4 (E rank)',
    4,
    unknownRankLimit,
    'Default fallback for unknown ranks'
  );
  
  return true;
};

// ==================== TEST 2: CAN ACTIVATE MORE SEALS ====================

const testCanActivateMoreSeals = () => {
  logger.info('=== Test 2: Can Activate More Seals ===');
  
  // E rank: max 4 seals
  assert(
    'E rank with 0 active seals can activate more',
    true,
    canActivateMoreSeals(0, 'E'),
    '0 < 4'
  );
  
  assert(
    'E rank with 3 active seals can activate more',
    true,
    canActivateMoreSeals(3, 'E'),
    '3 < 4'
  );
  
  assert(
    'E rank with 4 active seals cannot activate more',
    false,
    canActivateMoreSeals(4, 'E'),
    '4 >= 4'
  );
  
  // C rank: max 8 seals
  assert(
    'C rank with 7 active seals can activate more',
    true,
    canActivateMoreSeals(7, 'C'),
    '7 < 8'
  );
  
  assert(
    'C rank with 8 active seals cannot activate more',
    false,
    canActivateMoreSeals(8, 'C'),
    '8 >= 8'
  );
  
  // S rank: max 16 seals
  assert(
    'S rank with 15 active seals can activate more',
    true,
    canActivateMoreSeals(15, 'S'),
    '15 < 16'
  );
  
  assert(
    'S rank with 16 active seals cannot activate more',
    false,
    canActivateMoreSeals(16, 'S'),
    '16 >= 16'
  );
  
  return true;
};

// ==================== TEST 3: DAILY RESET LOGIC ====================

const testDailyResetLogic = () => {
  logger.info('=== Test 3: Daily Reset Logic ===');
  
  // Test with no last activated date
  assert(
    'No last activated date should trigger reset',
    true,
    shouldResetSeals(undefined),
    'undefined date'
  );
  
  // Test with today's date (should NOT reset)
  const today = new Date().toISOString().split('T')[0];
  assert(
    'Today\'s date should NOT trigger reset',
    false,
    shouldResetSeals(today),
    `Same day: ${today}`
  );
  
  // Test with yesterday's date (should reset)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  assert(
    'Yesterday\'s date should trigger reset',
    true,
    shouldResetSeals(yesterdayStr),
    `Different day: ${yesterdayStr}`
  );
  
  // Test with old date (should reset)
  assert(
    'Old date (2020-01-01) should trigger reset',
    true,
    shouldResetSeals('2020-01-01'),
    'Very old date'
  );
  
  return true;
};

// ==================== TEST 4: SEAL LEVELING SYSTEM ====================

const testSealLevelingSystem = () => {
  logger.info('=== Test 4: Seal Leveling System ===');
  
  // Test level thresholds
  const levelTestCases = [
    { days: 0, expectedLevel: 1 },
    { days: 4, expectedLevel: 1 },
    { days: 5, expectedLevel: 2 },
    { days: 14, expectedLevel: 2 },
    { days: 15, expectedLevel: 3 },
    { days: 29, expectedLevel: 3 },
    { days: 30, expectedLevel: 4 },
    { days: 44, expectedLevel: 4 },
    { days: 45, expectedLevel: 5 },
    { days: 89, expectedLevel: 5 },
    { days: 90, expectedLevel: 6 },
    { days: 179, expectedLevel: 6 },
    { days: 180, expectedLevel: 7 },
    { days: 359, expectedLevel: 7 },
    { days: 360, expectedLevel: 8 },
    { days: 719, expectedLevel: 8 },
    { days: 720, expectedLevel: 9 },
    { days: 999, expectedLevel: 9 },
    { days: 1000, expectedLevel: 10 }, // Max level
    { days: 2000, expectedLevel: 10 }, // Beyond max
  ];
  
  levelTestCases.forEach(({ days, expectedLevel }) => {
    const actualLevel = getSubPillarLevel(days);
    assert(
      `${days} days should be level ${expectedLevel}`,
      expectedLevel,
      actualLevel,
      `Days: ${days}`
    );
  });
  
  // Test level display formatting
  assert(
    'Level 1 should display as "Lv.1"',
    'Lv.1',
    formatSubPillarLevel(1),
    'Normal level format'
  );
  
  assert(
    'Level 9 should display as "Lv.9"',
    'Lv.9',
    formatSubPillarLevel(9),
    'Normal level format'
  );
  
  assert(
    'Level 10 should display as "Lv.Max"',
    'Lv.Max',
    formatSubPillarLevel(10),
    'Max level format'
  );
  
  assert(
    'Level 11+ should still display as "Lv.Max"',
    'Lv.Max',
    formatSubPillarLevel(15),
    'Beyond max level'
  );
  
  return true;
};

// ==================== TEST 5: DAYS UNTIL NEXT LEVEL ====================

const testDaysUntilNextLevel = () => {
  logger.info('=== Test 5: Days Until Next Level ===');
  
  // At 0 days (level 1), need 5 days to reach level 2
  assert(
    '0 days (Lv.1) needs 5 days to reach Lv.2',
    5,
    getDaysUntilNextLevel(0),
    '5 - 0 = 5'
  );
  
  // At 3 days (level 1), need 2 days to reach level 2
  assert(
    '3 days (Lv.1) needs 2 days to reach Lv.2',
    2,
    getDaysUntilNextLevel(3),
    '5 - 3 = 2'
  );
  
  // At 5 days (level 2), need 10 days to reach level 3
  assert(
    '5 days (Lv.2) needs 10 days to reach Lv.3',
    10,
    getDaysUntilNextLevel(5),
    '15 - 5 = 10'
  );
  
  // At 100 days (level 6), need 80 days to reach level 7
  assert(
    '100 days (Lv.6) needs 80 days to reach Lv.7',
    80,
    getDaysUntilNextLevel(100),
    '180 - 100 = 80'
  );
  
  // At max level (1000 days), should return null
  assert(
    '1000 days (Lv.Max) should return null',
    null,
    getDaysUntilNextLevel(1000),
    'Already at max level'
  );
  
  // Beyond max level, should return null
  assert(
    '2000 days (beyond max) should return null',
    null,
    getDaysUntilNextLevel(2000),
    'Beyond max level'
  );
  
  return true;
};

// ==================== TEST 6: SEAL AVERAGE LEVEL CALCULATION ====================

const testSealAverageLevel = () => {
  logger.info('=== Test 6: Seal Average Level Calculation ===');
  
  // Test with empty array
  assert(
    'Empty subpillar array should return level 1',
    1,
    calculateSealAverageLevel([]),
    'Default for empty array'
  );
  
  // Test with single subpillar
  const singleSubpillar: SubPillarStats[] = [
    { subpillar_id: 'test-1', days_activated: 30, current_level: 4, current_streak: 0 },
  ];
  assert(
    'Single Lv.4 subpillar should average to 4',
    4,
    calculateSealAverageLevel(singleSubpillar),
    'Single value average'
  );
  
  // Test with multiple subpillars (even average)
  const evenSubpillars: SubPillarStats[] = [
    { subpillar_id: 'test-1', days_activated: 30, current_level: 4, current_streak: 0 },
    { subpillar_id: 'test-2', days_activated: 90, current_level: 6, current_streak: 0 },
  ];
  assert(
    'Lv.4 + Lv.6 should average to 5',
    5,
    calculateSealAverageLevel(evenSubpillars),
    '(4 + 6) / 2 = 5'
  );
  
  // Test with multiple subpillars (rounded)
  const unevenSubpillars: SubPillarStats[] = [
    { subpillar_id: 'test-1', days_activated: 5, current_level: 2, current_streak: 0 },
    { subpillar_id: 'test-2', days_activated: 15, current_level: 3, current_streak: 0 },
    { subpillar_id: 'test-3', days_activated: 30, current_level: 4, current_streak: 0 },
  ];
  assert(
    'Lv.2 + Lv.3 + Lv.4 should average to 3 (rounded)',
    3,
    calculateSealAverageLevel(unevenSubpillars),
    'round((2 + 3 + 4) / 3) = round(3) = 3'
  );
  
  // Test with mixed levels (rounding up)
  const mixedSubpillars: SubPillarStats[] = [
    { subpillar_id: 'test-1', days_activated: 5, current_level: 2, current_streak: 0 },
    { subpillar_id: 'test-2', days_activated: 90, current_level: 6, current_streak: 0 },
  ];
  assert(
    'Lv.2 + Lv.6 should average to 4',
    4,
    calculateSealAverageLevel(mixedSubpillars),
    'round((2 + 6) / 2) = round(4) = 4'
  );
  
  return true;
};

// ==================== TEST 7: LEVEL THRESHOLD CONSTANTS ====================

const testLevelThresholdConstants = () => {
  logger.info('=== Test 7: Level Threshold Constants ===');
  
  // Verify threshold array structure
  assert(
    'Should have 10 level thresholds',
    10,
    SEAL_LEVEL_THRESHOLDS.length,
    'Levels 1-10'
  );
  
  // Verify specific thresholds
  const expectedThresholds = [
    { level: 1, minDays: 0 },
    { level: 2, minDays: 5 },
    { level: 3, minDays: 15 },
    { level: 4, minDays: 30 },
    { level: 5, minDays: 45 },
    { level: 6, minDays: 90 },
    { level: 7, minDays: 180 },
    { level: 8, minDays: 360 },
    { level: 9, minDays: 720 },
    { level: 10, minDays: 1000 },
  ];
  
  expectedThresholds.forEach(({ level, minDays }) => {
    const threshold = SEAL_LEVEL_THRESHOLDS.find(t => t.level === level);
    assert(
      `Level ${level} threshold should be ${minDays} days`,
      minDays,
      threshold?.minDays,
      `SEAL_LEVEL_THRESHOLDS[${level - 1}]`
    );
  });
  
  // Verify constants
  assert(
    'MAX_SEAL_LEVEL should be 10',
    10,
    MAX_SEAL_LEVEL,
    'Max level constant'
  );
  
  assert(
    'MAX_SEAL_DAYS should be 1000',
    1000,
    MAX_SEAL_DAYS,
    'Max days constant'
  );
  
  // Verify Will rank limits exist for all ranks
  const expectedRanks = ['F', 'F+', 'E', 'E+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'S+'];
  expectedRanks.forEach(rank => {
    assert(
      `WILL_RANK_SEAL_LIMITS should have ${rank}`,
      true,
      rank in WILL_RANK_SEAL_LIMITS,
      `Rank ${rank} exists`
    );
  });
  
  return true;
};

// ==================== TEST RUNNER ====================

export const runSealActivationTests = () => {
  logger.info('╔══════════════════════════════════════════════════════════════╗');
  logger.info('║          SEAL ACTIVATION TESTS                               ║');
  logger.info('╚══════════════════════════════════════════════════════════════╝');
  
  results.length = 0; // Clear previous results
  
  testWillRankActivationLimits();
  testCanActivateMoreSeals();
  testDailyResetLogic();
  testSealLevelingSystem();
  testDaysUntilNextLevel();
  testSealAverageLevel();
  testLevelThresholdConstants();
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  logger.info('═══════════════════════════════════════════════════════════════');
  logger.info(`📊 RESULTS: ${passed}/${total} tests passed, ${failed} failed`);
  
  if (failed > 0) {
    logger.info('❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      logger.error(`  - ${r.name}: Expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.actual)}`);
    });
  }
  
  logger.info('═══════════════════════════════════════════════════════════════');
  
  return { passed, failed, total, results };
};

// Auto-export for direct import
export default runSealActivationTests;
