/**
 * Automated Test: Coin Rewards on Task Check/Uncheck
 * 
 * This test verifies that:
 * 1. Path registry is properly registered
 * 2. Coins are correctly awarded when checking a task
 * 3. Coins are correctly deducted when unchecking a task
 * 4. The gameStore updateRewards function works as expected
 * 
 * Run this test by importing and calling runCoinRewardsTest() in the browser console
 * or by adding a button to trigger it in development mode.
 */

import { logger } from '@/utils/logger';
import { isPathRegistered, getPathTaskRewards } from '@/constants/pathRegistry';
// Import temperingPath to ensure registration
import '@/constants/temperingPath';
import { TEMPERING_TEMPLATE_ID, getTemperingLevel } from '@/constants/temperingPath';

interface TestResult {
  name: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  message: string;
}

const results: TestResult[] = [];

const assert = (name: string, expected: unknown, actual: unknown, message: string = '') => {
  const passed = JSON.stringify(expected) === JSON.stringify(actual);
  results.push({ name, passed, expected, actual, message });
  
  if (passed) {
    logger.info(`✅ PASS: ${name}`, { expected, actual });
  } else {
    logger.error(`❌ FAIL: ${name}`, { expected, actual, message });
  }
  
  return passed;
};

/**
 * Test 1: Verify Path Registry Registration
 */
const testPathRegistration = () => {
  logger.info('=== Test 1: Path Registry Registration ===');
  
  const pathId = TEMPERING_TEMPLATE_ID;
  const isRegistered = isPathRegistered(pathId);
  
  assert(
    'Tempering path is registered',
    true,
    isRegistered,
    `Path '${pathId}' should be registered in the path registry`
  );
  
  return isRegistered;
};

/**
 * Test 2: Verify Path Task Rewards Lookup
 */
const testPathTaskRewards = () => {
  logger.info('=== Test 2: Path Task Rewards Lookup ===');
  
  const pathId = TEMPERING_TEMPLATE_ID;
  
  // Test each level
  for (let level = 1; level <= 10; level++) {
    const levelConfig = getTemperingLevel(level);
    const pathRewards = getPathTaskRewards(pathId, level);
    
    assert(
      `Level ${level} coins match`,
      levelConfig?.baseCoins,
      pathRewards.coins,
      `Level ${level} should return ${levelConfig?.baseCoins} coins from path registry`
    );
    
    assert(
      `Level ${level} stat points match`,
      levelConfig?.baseBodyPoints,
      pathRewards.statPoints,
      `Level ${level} should return ${levelConfig?.baseBodyPoints} stat points from path registry`
    );
    
    assert(
      `Level ${level} primary stat is BODY`,
      'BODY',
      pathRewards.primaryStat,
      `Level ${level} should have BODY as primary stat`
    );
  }
};

/**
 * Test 3: Verify GameStore updateRewards Function
 */
const testGameStoreUpdateRewards = async () => {
  logger.info('=== Test 3: GameStore updateRewards Function ===');
  
  // Dynamic import to avoid circular dependencies
  const { useGameStore } = await import('@/store/gameStore');
  const store = useGameStore.getState();
  
  if (!store.userProfile) {
    logger.warn('No user profile loaded, skipping gameStore test');
    results.push({
      name: 'GameStore has user profile',
      passed: false,
      expected: 'UserProfile object',
      actual: null,
      message: 'Cannot test updateRewards without a loaded user profile'
    });
    return;
  }
  
  const initialCoins = store.userProfile.coins;
  logger.info('Initial coins', { initialCoins });
  
  // Test adding coins
  const coinsToAdd = 30;
  await store.updateRewards(coinsToAdd, '', 0);
  
  // Re-fetch state after update
  const afterAdd = useGameStore.getState().userProfile;
  const coinsAfterAdd = afterAdd?.coins ?? 0;
  
  assert(
    'Coins increased after adding',
    initialCoins + coinsToAdd,
    coinsAfterAdd,
    `Coins should be ${initialCoins + coinsToAdd} after adding ${coinsToAdd}`
  );
  
  // Test removing coins (uncheck scenario)
  const coinsToRemove = -30;
  await store.updateRewards(coinsToRemove, '', 0);
  
  // Re-fetch state after removal
  const afterRemove = useGameStore.getState().userProfile;
  const coinsAfterRemove = afterRemove?.coins ?? 0;
  
  assert(
    'Coins decreased after removing',
    initialCoins,
    coinsAfterRemove,
    `Coins should be back to ${initialCoins} after removing ${Math.abs(coinsToRemove)}`
  );
  
  logger.info('Final coins', { coinsAfterRemove });
};

/**
 * Test 4: Simulate Full Task Check/Uncheck Flow
 */
const testFullTaskFlow = async () => {
  logger.info('=== Test 4: Full Task Check/Uncheck Flow Simulation ===');
  
  const { useGameStore } = await import('@/store/gameStore');
  const store = useGameStore.getState();
  
  if (!store.userProfile) {
    logger.warn('No user profile, skipping full flow test');
    return;
  }
  
  const pathId = TEMPERING_TEMPLATE_ID;
  const level = 1;
  const pathRewards = getPathTaskRewards(pathId, level);
  
  logger.info('Task rewards from path registry', { 
    pathId, 
    level, 
    coins: pathRewards.coins,
    statPoints: pathRewards.statPoints,
    primaryStat: pathRewards.primaryStat
  });
  
  const initialCoins = store.userProfile.coins;
  const initialBodyPoints = store.userProfile.body_points;
  
  logger.info('Before check', { initialCoins, initialBodyPoints });
  
  // Simulate CHECKING a task
  logger.info('--- Simulating TASK CHECK ---');
  await store.updateRewards(pathRewards.coins, pathRewards.primaryStat, pathRewards.statPoints);
  
  const afterCheck = useGameStore.getState().userProfile;
  logger.info('After check', { 
    coins: afterCheck?.coins, 
    body_points: afterCheck?.body_points 
  });
  
  assert(
    'Coins added on task check',
    initialCoins + pathRewards.coins,
    afterCheck?.coins,
    `Expected ${initialCoins + pathRewards.coins} coins after check`
  );
  
  assert(
    'Body points added on task check',
    initialBodyPoints + pathRewards.statPoints,
    afterCheck?.body_points,
    `Expected ${initialBodyPoints + pathRewards.statPoints} body points after check`
  );
  
  // Simulate UNCHECKING a task
  logger.info('--- Simulating TASK UNCHECK ---');
  await store.updateRewards(-pathRewards.coins, '', 0);
  await store.updateRewards(0, pathRewards.primaryStat, -pathRewards.statPoints);
  
  const afterUncheck = useGameStore.getState().userProfile;
  logger.info('After uncheck', { 
    coins: afterUncheck?.coins, 
    body_points: afterUncheck?.body_points 
  });
  
  assert(
    'Coins deducted on task uncheck',
    initialCoins,
    afterUncheck?.coins,
    `Expected ${initialCoins} coins after uncheck`
  );
  
  assert(
    'Body points deducted on task uncheck',
    initialBodyPoints,
    afterUncheck?.body_points,
    `Expected ${initialBodyPoints} body points after uncheck`
  );
};

/**
 * Test 5: Verify React State Sync
 */
const testReactStateSync = async () => {
  logger.info('=== Test 5: React State Sync ===');
  
  const { useGameStore } = await import('@/store/gameStore');
  
  // Subscribe to state changes
  let stateChanges = 0;
  const unsubscribe = useGameStore.subscribe((state, prevState) => {
    if (state.userProfile?.coins !== prevState.userProfile?.coins) {
      stateChanges++;
      logger.info('State change detected', { 
        prevCoins: prevState.userProfile?.coins,
        newCoins: state.userProfile?.coins,
        changeCount: stateChanges
      });
    }
  });
  
  const store = useGameStore.getState();
  if (!store.userProfile) {
    unsubscribe();
    return;
  }
  
  const testAmount = 50;
  
  // Trigger an update
  await store.updateRewards(testAmount, '', 0);
  
  // Small delay to ensure subscription fires
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Revert
  await store.updateRewards(-testAmount, '', 0);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  unsubscribe();
  
  assert(
    'State subscription fired for coin changes',
    2,
    stateChanges,
    `Expected 2 state changes (add and remove), got ${stateChanges}`
  );
};

/**
 * Main test runner
 */
export const runCoinRewardsTest = async () => {
  logger.info('🧪 ====================================');
  logger.info('🧪 COIN REWARDS TEST SUITE STARTING');
  logger.info('🧪 ====================================');
  
  results.length = 0; // Clear previous results
  
  try {
    // Test 1: Path Registration
    testPathRegistration();
    
    // Test 2: Path Task Rewards
    testPathTaskRewards();
    
    // Test 3: GameStore updateRewards
    await testGameStoreUpdateRewards();
    
    // Test 4: Full Task Flow
    await testFullTaskFlow();
    
    // Test 5: React State Sync
    await testReactStateSync();
    
  } catch (error) {
    logger.error('Test suite error', error);
  }
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  logger.info('🧪 ====================================');
  logger.info(`🧪 TEST RESULTS: ${passed} passed, ${failed} failed`);
  logger.info('🧪 ====================================');
  
  if (failed > 0) {
    logger.error('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      logger.error(`  - ${r.name}: expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.actual)}`);
    });
  }
  
  return { passed, failed, results };
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as unknown as { runCoinRewardsTest: typeof runCoinRewardsTest }).runCoinRewardsTest = runCoinRewardsTest;
}

export default runCoinRewardsTest;
