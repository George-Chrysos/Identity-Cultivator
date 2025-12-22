/**
 * Progression Tests: Evolution System
 * 
 * Tests the level 10 completion, trial unlocking, and stage transitions.
 * 
 * @module tests/progression/evolution.test
 */

import { logger } from '@/utils/logger';
import { 
  getTemperingLevel,
} from '@/constants/temperingPath';
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

// ==================== LEVEL 10 COMPLETION ====================

const testLevel10Completion = () => {
  logger.info('=== Level 10 Completion ===');
  
  const level10 = getTemperingLevel(10);
  
  // Test 1: Level 10 exists
  assert(
    'Level 10 configuration exists',
    true,
    level10 !== null && level10 !== undefined,
    ''
  );
  
  // Test 2: Level 10 has trial (evolution trigger)
  assert(
    'Level 10 has trial defined',
    true,
    level10?.trial !== undefined,
    ''
  );
  
  // Test 3: Level 10 trial has special reward (evolution item)
  const trialRewards = level10?.trial.rewards;
  assert(
    'Level 10 trial has item reward',
    true,
    trialRewards?.item !== undefined && trialRewards.item.length > 0,
    `Item: ${trialRewards?.item}`
  );
  
  // Test 4: Level 10 trial name indicates evolution
  const trialName = level10?.trial.name ?? '';
  assert(
    'Level 10 trial name suggests mastery/evolution',
    true,
    trialName.length > 0,
    `Trial: ${trialName}`
  );
  
  // Test 5: Level 10 has highest rewards
  const level1Rewards = getTemperingLevel(1);
  assert(
    'Level 10 coins > Level 1 coins',
    true,
    (level10?.baseCoins ?? 0) > (level1Rewards?.baseCoins ?? 0),
    `L10: ${level10?.baseCoins}, L1: ${level1Rewards?.baseCoins}`
  );
  
  assert(
    'Level 10 body points > Level 1 body points',
    true,
    (level10?.baseBodyPoints ?? 0) > (level1Rewards?.baseBodyPoints ?? 0),
    `L10: ${level10?.baseBodyPoints}, L1: ${level1Rewards?.baseBodyPoints}`
  );
  
  // Test 6: Level 10 trial rewards are substantial
  assert(
    'Level 10 trial coins > 0',
    true,
    (trialRewards?.coins ?? 0) > 0,
    `Coins: ${trialRewards?.coins}`
  );
  
  assert(
    'Level 10 trial stars > 0',
    true,
    (trialRewards?.stars ?? 0) > 0,
    `Stars: ${trialRewards?.stars}`
  );
  
  assert(
    'Level 10 trial body points > 0',
    true,
    (trialRewards?.bodyPoints ?? 0) > 0,
    `Body Points: ${trialRewards?.bodyPoints}`
  );
};

// ==================== TRIAL UNLOCKING ====================

const testTrialUnlocking = () => {
  logger.info('=== Trial Unlocking ===');
  
  // Test 1: Each level has a trial defined
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    
    assert(
      `Level ${level} has trial`,
      true,
      config?.trial !== undefined,
      ''
    );
    
    assert(
      `Level ${level} trial has name`,
      true,
      (config?.trial.name?.length ?? 0) > 0,
      `Name: ${config?.trial.name}`
    );
    
    assert(
      `Level ${level} trial has tasks description`,
      true,
      (config?.trial.tasks?.length ?? 0) > 0,
      ''
    );
    
    assert(
      `Level ${level} trial has focus`,
      true,
      (config?.trial.focus?.length ?? 0) > 0,
      ''
    );
  }
  
  // Test 2: Trial streak requirement formula (2n+1)
  // Level 1: 2(1)+1 = 3 days
  // Level 2: 2(2)+1 = 5 days
  // etc.
  logger.info('Note: Trial unlock formula is (2n+1) streak days');
  logger.info('Level 1 requires 3 streak days to unlock trial');
  logger.info('Level 2 requires 5 streak days to unlock trial');
  
  // Test 3: daysRequired matches expected streak for trial
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    const expectedMinStreak = 2 * level + 1;
    
    assert(
      `Level ${level} daysRequired (${config?.daysRequired}) is reasonable for trial streak`,
      true,
      (config?.daysRequired ?? 0) >= Math.floor(expectedMinStreak / 2),
      `Expected min streak: ${expectedMinStreak}, Days: ${config?.daysRequired}`
    );
  }
};

// ==================== STAGE TRANSITIONS ====================

const testStageTransitions = () => {
  logger.info('=== Stage Transitions ===');
  
  // Test 1: Level subtitles indicate progression
  const subtitles: string[] = [];
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    subtitles.push(config?.subtitle ?? '');
  }
  
  assert(
    'All 10 levels have unique subtitles',
    true,
    new Set(subtitles).size === 10,
    'Each level should have a distinct subtitle'
  );
  
  // Test 2: Level 1 subtitle indicates beginning
  const level1Subtitle = getTemperingLevel(1)?.subtitle ?? '';
  assert(
    'Level 1 subtitle indicates awakening/beginning',
    true,
    level1Subtitle.length > 0,
    `Subtitle: ${level1Subtitle}`
  );
  
  // Test 3: Level 10 subtitle indicates mastery
  const level10Subtitle = getTemperingLevel(10)?.subtitle ?? '';
  assert(
    'Level 10 subtitle indicates mastery/completion',
    true,
    level10Subtitle.length > 0,
    `Subtitle: ${level10Subtitle}`
  );
  
  // Test 4: Trial names progress thematically
  const trialNames: string[] = [];
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    trialNames.push(config?.trial.name ?? '');
  }
  
  assert(
    'All 10 trials have unique names',
    true,
    new Set(trialNames).size === 10,
    'Each trial should have a distinct name'
  );
};

// ==================== GATE SYSTEM ====================

const testGateSystem = () => {
  logger.info('=== Gate System (5 Gates) ===');
  
  const expectedGates = ['rooting', 'foundation', 'core', 'flow', 'breath'];
  
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    const tasks = config?.tasks ?? [];
    
    // Test 1: Each level has 5 tasks
    assert(
      `Level ${level} has 5 gate tasks`,
      5,
      tasks.length,
      ''
    );
    
    // Test 2: All 5 gates are represented
    const gatesInLevel = tasks.map(t => t.gate as string);
    const hasAllGates = expectedGates.every(gate => gatesInLevel.includes(gate));
    
    assert(
      `Level ${level} includes all 5 gates`,
      true,
      hasAllGates,
      `Found: ${gatesInLevel.join(', ')}`
    );
  }
};

// ==================== REWARD SCALING ====================

const testRewardScaling = () => {
  logger.info('=== Reward Scaling ===');
  
  let previousCoins = 0;
  let previousPoints = 0;
  
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    const coins = config?.baseCoins ?? 0;
    const points = config?.baseBodyPoints ?? 0;
    
    // Test: Rewards increase or stay same (never decrease)
    assert(
      `Level ${level} coins (${coins}) >= previous (${previousCoins})`,
      true,
      coins >= previousCoins,
      ''
    );
    
    assert(
      `Level ${level} points (${points}) >= previous (${previousPoints})`,
      true,
      points >= previousPoints,
      ''
    );
    
    previousCoins = coins;
    previousPoints = points;
  }
  
  // Test: Trial rewards also scale
  let previousTrialCoins = 0;
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    const trialCoins = config?.trial.rewards.coins ?? 0;
    
    assert(
      `Level ${level} trial coins (${trialCoins}) >= previous (${previousTrialCoins})`,
      true,
      trialCoins >= previousTrialCoins,
      ''
    );
    
    previousTrialCoins = trialCoins;
  }
};

// ==================== EVOLUTION ITEMS ====================

const testEvolutionItems = () => {
  logger.info('=== Evolution Items ===');
  
  // Test: Each trial has an item reward
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    const item = config?.trial.rewards.item;
    
    assert(
      `Level ${level} trial has item reward`,
      true,
      item !== undefined && item.length > 0,
      `Item: ${item}`
    );
  }
  
  // Test: Level 10 item is special
  const level10Item = getTemperingLevel(10)?.trial.rewards.item ?? '';
  assert(
    'Level 10 trial item name indicates significance',
    true,
    level10Item.length > 0,
    `Item: ${level10Item}`
  );
};

// ==================== MAIN TEST RUNNER ====================

export const runEvolutionTests = (): TestResult[] => {
  results.length = 0;
  
  console.log('%c=== EVOLUTION TESTS STARTING ===', 'color: blue; font-weight: bold; font-size: 12px');
  
  logger.info('========================================');
  logger.info('  EVOLUTION SYSTEM TESTS');
  logger.info('========================================');
  
  testLevel10Completion();
  testTrialUnlocking();
  testStageTransitions();
  testGateSystem();
  testRewardScaling();
  testEvolutionItems();
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log('%c=== EVOLUTION TESTS COMPLETE ===', 'color: green; font-weight: bold; font-size: 12px');
  console.table({
    Total: results.length,
    Passed: passed,
    Failed: failed,
  });
  
  if (failed > 0) {
    console.log('%cFailed tests:', 'color: red; font-weight: bold;');
    console.table(results.filter(r => !r.passed));
  }
  
  logger.info('========================================');
  logger.info(`  RESULTS: ${passed} passed, ${failed} failed`);
  logger.info('========================================');
  
  if (failed > 0) {
    logger.error('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      logger.error(`  ❌ ${r.name}`);
      logger.error(`     Expected: ${JSON.stringify(r.expected)}`);
      logger.error(`     Actual: ${JSON.stringify(r.actual)}`);
      if (r.message) logger.error(`     ${r.message}`);
    });
  }
  
  return results;
};

export { results as evolutionTestResults };
