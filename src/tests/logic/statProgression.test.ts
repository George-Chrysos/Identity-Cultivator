/**
 * Logic Tests: Stat Progression & Point Allocation
 * 
 * Tests the progressive reward system for tempering path levels.
 * Verifies gate saturation, level caps, and mathematical accuracy.
 * 
 * Run from browser console:
 * ```
 * import { runStatProgressionTests } from '@/tests/logic/statProgression.test';
 * runStatProgressionTests();
 * ```
 * 
 * @module tests/logic/statProgression.test
 */

import { logger } from '@/utils/logger';
import { getTemperingLevel } from '@/constants/temperingPath';

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

const assertClose = (name: string, expected: number, actual: number, tolerance: number = 0.001): boolean => {
  const passed = Math.abs(expected - actual) <= tolerance;
  results.push({ name, passed, expected, actual, message: `Tolerance: ±${tolerance}` });
  
  if (passed) {
    logger.info(`✅ PASS: ${name}`, { expected, actual, tolerance });
  } else {
    logger.error(`❌ FAIL: ${name}`, { expected, actual, tolerance });
  }
  
  return passed;
};

// ==================== MOCK LEVEL PROGRESS TRACKER ====================

type GateType = 'rooting' | 'foundation' | 'core' | 'flow' | 'breath';

interface LevelProgress {
  level: number;
  gateProgress: Record<GateType, number>;
  totalPointsEarned: number;
}

/**
 * Simulate progressive stat point calculation
 * Mirrors the logic in mockDatabase.ts
 */
const calculateProgressiveStatPoints = (
  progress: LevelProgress,
  gate: GateType,
  levelConfig: { mainStatLimit: number; gateStatCap: number; daysRequired: number }
): { pointsToAward: number; newGateProgress: number; newTotalProgress: number } => {
  const { mainStatLimit, gateStatCap, daysRequired } = levelConfig;
  const pointsPerTask = gateStatCap / daysRequired;
  
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

  return { pointsToAward, newGateProgress, newTotalProgress };
};

const createFreshLevelProgress = (level: number): LevelProgress => ({
  level,
  gateProgress: { rooting: 0, foundation: 0, core: 0, flow: 0, breath: 0 },
  totalPointsEarned: 0,
});

// ==================== TEST 1: GATE SATURATION ====================

const testGateSaturation = () => {
  logger.info('=== Test 1: Gate Saturation (Level 6) ===');
  
  const levelConfig = getTemperingLevel(6);
  if (!levelConfig) {
    logger.error('❌ FAIL: Level 6 config not found');
    return false;
  }
  
  // Verify level 6 has expected values
  assert(
    'Level 6 mainStatLimit should be 2.5',
    2.5,
    levelConfig.mainStatLimit,
    'Level 6 mainStatLimit'
  );
  
  assertClose(
    'Level 6 gateStatCap should be 0.5 (2.5 / 5)',
    0.5,
    levelConfig.gateStatCap,
    0.001
  );
  
  // Create fresh progress tracker
  const progress = createFreshLevelProgress(6);
  
  // Simulate 13 completions of the 'rooting' task (daysRequired = 13)
  let totalRootingPoints = 0;
  for (let i = 0; i < 13; i++) {
    const result = calculateProgressiveStatPoints(progress, 'rooting', levelConfig);
    totalRootingPoints += result.pointsToAward;
  }
  
  // Assert: Total rooting points should be exactly 0.5 (gateStatCap)
  assertClose(
    'Total rooting points after 13 completions should be capped at 0.5',
    0.5,
    totalRootingPoints,
    0.001
  );
  
  assertClose(
    'Gate progress for rooting should be exactly 0.5',
    0.5,
    progress.gateProgress.rooting,
    0.001
  );
  
  // Additional completion should yield 0 points
  const extraResult = calculateProgressiveStatPoints(progress, 'rooting', levelConfig);
  assert(
    'Additional rooting completion should yield 0 points',
    0,
    extraResult.pointsToAward,
    'Gate already saturated'
  );
  
  return true;
};

// ==================== TEST 2: LEVEL HARD-CAP ====================

const testLevelHardCap = () => {
  logger.info('=== Test 2: Level Hard-Cap (Level 1) ===');
  
  const levelConfig = getTemperingLevel(1);
  if (!levelConfig) {
    logger.error('❌ FAIL: Level 1 config not found');
    return false;
  }
  
  // Verify level 1 has expected values
  assert(
    'Level 1 mainStatLimit should be 1.0',
    1.0,
    levelConfig.mainStatLimit,
    'Level 1 mainStatLimit'
  );
  
  assertClose(
    'Level 1 gateStatCap should be 0.2 (1.0 / 5)',
    0.2,
    levelConfig.gateStatCap,
    0.001
  );
  
  // daysRequired = 3, so pointsPerTask = 0.2 / 3 ≈ 0.0667 per task
  const pointsPerTask = levelConfig.gateStatCap / levelConfig.daysRequired;
  assertClose(
    'Points per task should be ~0.0667',
    0.0667,
    pointsPerTask,
    0.001
  );
  
  // Create fresh progress tracker
  const progress = createFreshLevelProgress(1);
  
  // Simulate 4 days of completing all 5 gates
  // Day 1-3: Normal progression, Day 4: Should hit cap
  const gates: GateType[] = ['rooting', 'foundation', 'core', 'flow', 'breath'];
  let totalBodyPoints = 0;
  
  for (let day = 1; day <= 4; day++) {
    for (const gate of gates) {
      const result = calculateProgressiveStatPoints(progress, gate, levelConfig);
      totalBodyPoints += result.pointsToAward;
    }
    logger.debug(`Day ${day} complete`, { 
      totalBodyPoints: totalBodyPoints.toFixed(4),
      totalProgress: progress.totalPointsEarned.toFixed(4)
    });
  }
  
  // Total potential: 4 days × 5 gates × 0.0667 = 1.333 points
  // But capped at mainStatLimit = 1.0
  assertClose(
    'Total body points for Level 1 should be capped at 1.0',
    1.0,
    totalBodyPoints,
    0.001
  );
  
  assertClose(
    'Total level progress should be capped at 1.0',
    1.0,
    progress.totalPointsEarned,
    0.001
  );
  
  return true;
};

// ==================== TEST 3: MATHEMATICAL ACCURACY (Stage 1 Journey) ====================

const testMathematicalAccuracy = () => {
  logger.info('=== Test 3: Mathematical Accuracy (Stage 1 Journey) ===');
  
  // Sum mainStatLimit for all 10 levels
  let totalMainStatLimit = 0;
  const levelBreakdown: { level: number; limit: number }[] = [];
  
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    if (!config) {
      logger.error(`❌ FAIL: Level ${level} config not found`);
      return false;
    }
    totalMainStatLimit += config.mainStatLimit;
    levelBreakdown.push({ level, limit: config.mainStatLimit });
  }
  
  logger.info('Level breakdown:', levelBreakdown);
  
  // Expected: L1(1.0) + L2(1.25) + L3(1.5) + L4(1.75) + L5(2.0) + L6-10(2.5×5) = 20.0
  const expectedTotal = 1.0 + 1.25 + 1.5 + 1.75 + 2.0 + (2.5 * 5);
  
  assertClose(
    'Sum of all mainStatLimits should be 20.0',
    expectedTotal,
    totalMainStatLimit,
    0.001
  );
  
  // Starting at 10.0 (Rank E) + 20.0 (Stage 1) = 30.0 (Rank C)
  // Note: 10 points = Rank E, 30 points = Rank C per STAT_THRESHOLDS
  const startingBodyPoints = 10; // Rank E
  const finalBodyPoints = startingBodyPoints + totalMainStatLimit;
  
  assertClose(
    'Starting at 10.0 + Stage 1 completion = 30.0 body points',
    30.0,
    finalBodyPoints,
    0.001
  );
  
  // Verify rank progression: 10 pts = E, 30 pts = C
  assert(
    '10 body points corresponds to Rank E threshold',
    true,
    startingBodyPoints >= 10 && startingBodyPoints < 15,
    'E rank: 10-14 points'
  );
  
  assert(
    '30 body points corresponds to Rank C threshold',
    true,
    finalBodyPoints >= 30 && finalBodyPoints < 35,
    'C rank: 30-34 points'
  );
  
  return true;
};

// ==================== TEST 4: PRECISION HANDLING ====================

const testPrecisionHandling = () => {
  logger.info('=== Test 4: Precision Handling ===');
  
  // Test that small increments don't lose precision due to JavaScript float errors
  const levelConfig = getTemperingLevel(1);
  if (!levelConfig) {
    logger.error('❌ FAIL: Level 1 config not found');
    return false;
  }
  
  const pointsPerTask = levelConfig.gateStatCap / levelConfig.daysRequired;
  // 0.2 / 3 = 0.06666666666666667
  
  // Manually accumulate using JavaScript float math
  let accumulated = 0;
  for (let i = 0; i < 3; i++) {
    accumulated += pointsPerTask;
  }
  
  // After 3 tasks on one gate, should equal gateStatCap (0.2)
  // But JavaScript might give us 0.19999999999999998 or similar
  assertClose(
    '3 × pointsPerTask should be close to gateStatCap',
    levelConfig.gateStatCap,
    accumulated,
    0.0001
  );
  
  // Test with level 2: gateStatCap = 0.25, daysRequired = 5
  // pointsPerTask = 0.05
  const level2Config = getTemperingLevel(2);
  if (!level2Config) {
    logger.error('❌ FAIL: Level 2 config not found');
    return false;
  }
  
  const level2PointsPerTask = level2Config.gateStatCap / level2Config.daysRequired;
  assertClose(
    'Level 2 pointsPerTask should be 0.05',
    0.05,
    level2PointsPerTask,
    0.0001
  );
  
  // Accumulate 5 tasks
  let level2Accumulated = 0;
  for (let i = 0; i < 5; i++) {
    level2Accumulated += level2PointsPerTask;
  }
  
  assertClose(
    '5 × 0.05 should be close to 0.25 (gateStatCap)',
    level2Config.gateStatCap,
    level2Accumulated,
    0.0001
  );
  
  // Test full level progression for Level 5
  const level5Config = getTemperingLevel(5);
  if (!level5Config) {
    logger.error('❌ FAIL: Level 5 config not found');
    return false;
  }
  
  // Level 5: mainStatLimit = 2.0, gateStatCap = 0.4, daysRequired = 11
  // pointsPerTask = 0.4 / 11 ≈ 0.0364
  const level5PointsPerTask = level5Config.gateStatCap / level5Config.daysRequired;
  
  // Simulate full level completion
  const progress = createFreshLevelProgress(5);
  const gates: GateType[] = ['rooting', 'foundation', 'core', 'flow', 'breath'];
  
  // Complete 11 days × 5 gates = 55 completions
  for (let day = 0; day < level5Config.daysRequired; day++) {
    for (const gate of gates) {
      calculateProgressiveStatPoints(progress, gate, level5Config);
    }
  }
  
  assertClose(
    'Level 5 full completion should yield exactly mainStatLimit (2.0)',
    level5Config.mainStatLimit,
    progress.totalPointsEarned,
    0.0001
  );
  
  logger.info('Precision test summary:', {
    level1_pointsPerTask: pointsPerTask.toFixed(10),
    level2_pointsPerTask: level2PointsPerTask.toFixed(10),
    level5_pointsPerTask: level5PointsPerTask.toFixed(10),
  });
  
  return true;
};

// ==================== TEST RUNNER ====================

export const runStatProgressionTests = () => {
  logger.info('╔══════════════════════════════════════════════════════════════╗');
  logger.info('║          STAT PROGRESSION TESTS                              ║');
  logger.info('╚══════════════════════════════════════════════════════════════╝');
  
  results.length = 0; // Clear previous results
  
  testGateSaturation();
  testLevelHardCap();
  testMathematicalAccuracy();
  testPrecisionHandling();
  
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
export default runStatProgressionTests;
