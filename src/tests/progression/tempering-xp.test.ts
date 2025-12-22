/**
 * Progression Tests: Tempering XP System
 * 
 * Tests the XP accumulation, level-up triggers, and level configuration.
 * 
 * @module tests/progression/tempering-xp.test
 */

import { logger } from '@/utils/logger';
import { 
  getTemperingLevel, 
  generateTemperingTaskTemplates,
  TEMPERING_TEMPLATE_ID,
  TEMPERING_XP_PER_DAY,
  TEMPERING_LEVELS,
} from '@/constants/temperingPath';
import { 
  getPathLevelConfig, 
  getPathTaskRewards,
  isPathRegistered,
} from '@/constants/pathRegistry';
// Ensure path registration
import '@/constants/temperingPath';

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

const assertRange = (name: string, min: number, max: number, actual: number): boolean => {
  const passed = actual >= min && actual <= max;
  results.push({ name, passed, expected: `${min}-${max}`, actual, message: '' });
  
  if (passed) {
    logger.info(`✅ PASS: ${name}`, { range: `${min}-${max}`, actual });
  } else {
    logger.error(`❌ FAIL: ${name}`, { range: `${min}-${max}`, actual });
  }
  
  return passed;
};

// ==================== DAILY XP ACCUMULATION ====================

const testDailyXpAccumulation = () => {
  logger.info('=== Daily XP Accumulation ===');
  
  // Test 1: TEMPERING_XP_PER_DAY constant
  assert(
    'TEMPERING_XP_PER_DAY is defined as 40',
    40,
    TEMPERING_XP_PER_DAY,
    'Total XP awarded per day should be 40'
  );
  
  // Test 2: XP distributed evenly across 5 gate tasks
  const level1Tasks = generateTemperingTaskTemplates(1);
  const totalXp = level1Tasks.reduce((sum, task) => sum + task.xp_reward, 0);
  
  assert(
    'Total XP from level 1 tasks equals TEMPERING_XP_PER_DAY',
    TEMPERING_XP_PER_DAY,
    totalXp,
    `5 tasks × 8 XP = 40 XP total`
  );
  
  // Test 3: Each task awards equal XP
  const xpPerTask = TEMPERING_XP_PER_DAY / 5;
  level1Tasks.forEach((task, index) => {
    assert(
      `Task ${index + 1} awards ${xpPerTask} XP`,
      xpPerTask,
      task.xp_reward,
      `Each gate task should award ${xpPerTask} XP`
    );
  });
  
  // Test 4: All 10 levels have consistent XP distribution
  for (let level = 1; level <= 10; level++) {
    const tasks = generateTemperingTaskTemplates(level);
    const levelTotalXp = tasks.reduce((sum, task) => sum + task.xp_reward, 0);
    
    assert(
      `Level ${level} total XP equals TEMPERING_XP_PER_DAY`,
      TEMPERING_XP_PER_DAY,
      levelTotalXp,
      ''
    );
  }
};

// ==================== LEVEL UP TRIGGERS ====================

const testLevelUpTriggers = () => {
  logger.info('=== Level Up Triggers ===');
  
  // Test 1: Level up when current_xp >= xpToLevelUp
  for (let level = 1; level <= 9; level++) {
    const config = getTemperingLevel(level);
    const nextConfig = getTemperingLevel(level + 1);
    
    assert(
      `Level ${level} xpToLevelUp is defined`,
      true,
      config !== null && config !== undefined && config.xpToLevelUp > 0,
      `Should have XP requirement for level ${level}`
    );
    
    if (config && nextConfig) {
      assert(
        `Level ${level + 1} requires more XP than level ${level}`,
        true,
        nextConfig.xpToLevelUp > config.xpToLevelUp,
        `Level ${level + 1} XP (${nextConfig.xpToLevelUp}) > Level ${level} XP (${config.xpToLevelUp})`
      );
    }
  }
  
  // Test 2: XP requirement matches expected progression
  const level1 = getTemperingLevel(1);
  const daysToComplete = level1?.daysRequired ?? 0;
  const expectedXp = daysToComplete * TEMPERING_XP_PER_DAY;
  
  assert(
    'Level 1 xpToLevelUp matches days × daily XP',
    expectedXp,
    level1?.xpToLevelUp,
    `${daysToComplete} days × ${TEMPERING_XP_PER_DAY} XP = ${expectedXp}`
  );
  
  // Test 3: PathRegistry formula is used (not legacy level * 100)
  const registryConfig = getPathLevelConfig(TEMPERING_TEMPLATE_ID, 1);
  
  assert(
    'PathRegistry returns level 1 config',
    true,
    registryConfig !== undefined,
    'Level config should be available from PathRegistry'
  );
  
  assert(
    'PathRegistry xpToLevelUp matches TEMPERING_LEVELS',
    level1?.xpToLevelUp,
    registryConfig?.xpToLevelUp,
    'PathRegistry should return same values as getTemperingLevel'
  );
  
  // Test 4: Verify NOT using legacy formula (level * 100)
  const legacyXp = 1 * 100; // Old formula
  const actualXp = level1?.xpToLevelUp ?? 0;
  
  assert(
    'Level 1 XP is NOT legacy formula (level × 100)',
    false,
    actualXp === legacyXp,
    `Actual: ${actualXp}, Legacy would be: ${legacyXp}`
  );
};

// ==================== LEVEL CONFIGURATION LOOKUP ====================

const testLevelConfigurationLookup = () => {
  logger.info('=== Level Configuration Lookup ===');
  
  // Test each level 1-10
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    
    // Test xpToLevelUp
    assert(
      `Level ${level} has xpToLevelUp > 0`,
      true,
      config !== null && config !== undefined && config.xpToLevelUp > 0,
      ''
    );
    
    // Test daysRequired
    assert(
      `Level ${level} has daysRequired > 0`,
      true,
      config !== null && config !== undefined && config.daysRequired > 0,
      ''
    );
    
    // Test baseCoins
    assert(
      `Level ${level} has baseCoins > 0`,
      true,
      config !== null && config !== undefined && config.baseCoins > 0,
      `BaseCoins: ${config?.baseCoins}`
    );
    
    // Test baseBodyPoints
    assert(
      `Level ${level} has baseBodyPoints > 0`,
      true,
      config !== null && config !== undefined && config.baseBodyPoints > 0,
      `BaseBodyPoints: ${config?.baseBodyPoints}`
    );
    
    // Test tasks array
    assert(
      `Level ${level} has 5 gate tasks`,
      5,
      config?.tasks?.length ?? 0,
      ''
    );
    
    // Test trial exists
    assert(
      `Level ${level} has trial defined`,
      true,
      config !== null && config !== undefined && config.trial !== undefined,
      ''
    );
  }
  
  // Test PathRegistry integration
  for (let level = 1; level <= 10; level++) {
    const rewards = getPathTaskRewards(TEMPERING_TEMPLATE_ID, level);
    const config = getTemperingLevel(level);
    
    assert(
      `Level ${level} PathRegistry coins match`,
      config?.baseCoins ?? 0,
      rewards.coins,
      ''
    );
    
    assert(
      `Level ${level} PathRegistry statPoints match`,
      config?.baseBodyPoints ?? 0,
      rewards.statPoints,
      ''
    );
    
    assert(
      `Level ${level} PathRegistry primaryStat is BODY`,
      'BODY',
      rewards.primaryStat,
      ''
    );
  }
};

// ==================== PROGRESSION CURVE VALIDATION ====================

const testProgressionCurve = () => {
  logger.info('=== Progression Curve Validation ===');
  
  // Test 1: XP requirements increase each level
  let previousXp = 0;
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    const currentXp = config?.xpToLevelUp ?? 0;
    
    assert(
      `Level ${level} XP (${currentXp}) > previous (${previousXp})`,
      true,
      currentXp > previousXp,
      ''
    );
    
    previousXp = currentXp;
  }
  
  // Test 2: Days required is reasonable (1-30 days per level)
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    assertRange(
      `Level ${level} daysRequired is reasonable`,
      1,
      30,
      config?.daysRequired ?? 0
    );
  }
  
  // Test 3: Rewards scale with level
  const level1Coins = getTemperingLevel(1)?.baseCoins ?? 0;
  const level10Coins = getTemperingLevel(10)?.baseCoins ?? 0;
  
  assert(
    'Level 10 coins > Level 1 coins',
    true,
    level10Coins > level1Coins,
    `Level 10: ${level10Coins}, Level 1: ${level1Coins}`
  );
  
  // Test 4: Total levels defined
  assert(
    'TEMPERING_LEVELS has 10 levels',
    10,
    TEMPERING_LEVELS.length,
    ''
  );
};

// ==================== PATH REGISTRY INTEGRATION ====================

const testPathRegistryIntegration = () => {
  logger.info('=== Path Registry Integration ===');
  
  // Test 1: Path is registered
  assert(
    'Tempering path is registered',
    true,
    isPathRegistered(TEMPERING_TEMPLATE_ID),
    ''
  );
  
  // Test 2: All 10 levels accessible via registry
  for (let level = 1; level <= 10; level++) {
    const config = getPathLevelConfig(TEMPERING_TEMPLATE_ID, level);
    assert(
      `Level ${level} accessible via PathRegistry`,
      true,
      config !== undefined,
      ''
    );
  }
  
  // Test 3: Level 0 and 11 return undefined
  const level0 = getPathLevelConfig(TEMPERING_TEMPLATE_ID, 0);
  const level11 = getPathLevelConfig(TEMPERING_TEMPLATE_ID, 11);
  
  assert(
    'Level 0 returns undefined',
    undefined,
    level0,
    ''
  );
  
  assert(
    'Level 11 returns undefined',
    undefined,
    level11,
    ''
  );
};

// ==================== MAIN TEST RUNNER ====================

export const runTemperingXpTests = (): TestResult[] => {
  results.length = 0;
  
  logger.info('========================================');
  logger.info('  TEMPERING XP SYSTEM TESTS');
  logger.info('========================================');
  
  testDailyXpAccumulation();
  testLevelUpTriggers();
  testLevelConfigurationLookup();
  testProgressionCurve();
  testPathRegistryIntegration();
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  logger.info('========================================');
  logger.info(`  RESULTS: ${passed} passed, ${failed} failed`);
  logger.info('========================================');
  
  if (failed > 0) {
    logger.error('Failed tests:', results.filter(r => !r.passed).map(r => r.name));
  }
  
  return results;
};

export { results as temperingXpTestResults };
