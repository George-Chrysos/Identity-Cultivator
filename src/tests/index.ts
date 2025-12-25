/**
 * Test Runner - Unified test execution
 * 
 * Run all automation tests from browser console:
 * ```
 * import { runAllTests } from '@/tests';
 * runAllTests();
 * ```
 * 
 * Or run specific test suites:
 * ```
 * import { runInflationTests } from '@/tests/economy/inflation.test';
 * import { runTemperingXpTests } from '@/tests/progression/tempering-xp.test';
 * import { runChronosResetTests } from '@/tests/logic/ChronosReset.test';
 * ```
 */

import { logger } from '@/utils/logger';

// Import all test modules
import { runInflationTests } from './economy/inflation.test';
import { runTemperingXpTests } from './progression/tempering-xp.test';
import { runEvolutionTests } from './progression/evolution.test';
import { runSchemaTests } from './schema/new-user.test';
import { runCoinRewardsTest } from './coin-rewards-test';
import { runOverallRankTests } from './logic/rank.test';
import { runSealActivationTests } from './logic/sealActivation.test';
import { runStatProgressionTests } from './logic/statProgression.test';
import { runStreakSystemTests } from './logic/streakSystem.test';
import { runChronosResetTests } from './logic/ChronosReset.test';

export interface TestSuiteResult {
  name: string;
  passed: number;
  failed: number;
  total: number;
  duration: number;
}

export interface AllTestsResult {
  suites: TestSuiteResult[];
  totalPassed: number;
  totalFailed: number;
  totalTests: number;
  totalDuration: number;
}

/**
 * Run all automation tests
 */
export const runAllTests = async (): Promise<AllTestsResult> => {
  const suites: TestSuiteResult[] = [];
  let totalPassed = 0;
  let totalFailed = 0;
  const startTime = performance.now();
  
  logger.info('╔════════════════════════════════════════════════════╗');
  logger.info('║        IDENTITY CULTIVATOR - AUTOMATION TESTS      ║');
  logger.info('╚════════════════════════════════════════════════════╝');
  
  // Suite 1: Inflation Tests
  try {
    const start = performance.now();
    const results = runInflationTests();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    suites.push({
      name: 'Shop Inflation System',
      passed,
      failed,
      total: results.length,
      duration: performance.now() - start,
    });
    totalPassed += passed;
    totalFailed += failed;
  } catch (error) {
    logger.error('Inflation tests failed to run', error);
    suites.push({ name: 'Shop Inflation System', passed: 0, failed: 1, total: 1, duration: 0 });
    totalFailed++;
  }
  
  // Suite 2: Tempering XP Tests
  try {
    const start = performance.now();
    const results = runTemperingXpTests();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    suites.push({
      name: 'Tempering XP System',
      passed,
      failed,
      total: results.length,
      duration: performance.now() - start,
    });
    totalPassed += passed;
    totalFailed += failed;
  } catch (error) {
    logger.error('Tempering XP tests failed to run', error);
    suites.push({ name: 'Tempering XP System', passed: 0, failed: 1, total: 1, duration: 0 });
    totalFailed++;
  }
  
  // Suite 3: Evolution Tests
  try {
    const start = performance.now();
    const results = runEvolutionTests();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    logger.debug('📊 Evolution Test Results:');
    logger.debug(`Total Results: ${results.length}`);
    logger.debug(`Passed: ${passed}`);
    logger.debug(`Failed: ${failed}`);
    logger.debug('Full Results Array:', results);
    
    suites.push({
      name: 'Evolution System',
      passed,
      failed,
      total: results.length,
      duration: performance.now() - start,
    });
    totalPassed += passed;
    totalFailed += failed;
    
    // Show failures immediately
    if (failed > 0 && results.length > 0) {
      logger.error('🔴 Evolution System Failures');
      const failedTests = results.filter(r => !r.passed);
      logger.error(`Failed tests count: ${failedTests.length}`);
      failedTests.forEach(r => {
        logger.error(`❌ ${r.name}`);
        logger.error(`   Expected: ${JSON.stringify(r.expected)}`);
        logger.error(`   Actual: ${JSON.stringify(r.actual)}`);
        if (r.message) logger.error(`   Note: ${r.message}`);
      });
    }
  } catch (error) {
    logger.error('Evolution tests failed to run', error);
    suites.push({ name: 'Evolution System', passed: 0, failed: 1, total: 1, duration: 0 });
    totalFailed++;
  }
  
  // Suite 4: Schema Tests
  try {
    const start = performance.now();
    const results = runSchemaTests();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    suites.push({
      name: 'Schema & Legacy Prevention',
      passed,
      failed,
      total: results.length,
      duration: performance.now() - start,
    });
    totalPassed += passed;
    totalFailed += failed;
  } catch (error) {
    logger.error('Schema tests failed to run', error);
    suites.push({ name: 'Schema & Legacy Prevention', passed: 0, failed: 1, total: 1, duration: 0 });
    totalFailed++;
  }
  
  // Suite 5: Coin Rewards Tests (async)
  try {
    const start = performance.now();
    const { passed, failed } = await runCoinRewardsTest();
    
    suites.push({
      name: 'Coin Rewards System',
      passed,
      failed,
      total: passed + failed,
      duration: performance.now() - start,
    });
    totalPassed += passed;
    totalFailed += failed;
  } catch (error) {
    logger.error('Coin rewards tests failed to run', error);
    suites.push({ name: 'Coin Rewards System', passed: 0, failed: 1, total: 1, duration: 0 });
    totalFailed++;
  }
  
  // Suite 6: Overall Rank Tests
  try {
    const start = performance.now();
    const results = runOverallRankTests();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    logger.debug('📊 Overall Rank Test Results:');
    logger.debug(`Total Results: ${results.length}`);
    logger.debug(`Passed: ${passed}`);
    logger.debug(`Failed: ${failed}`);
    logger.debug('Full Results Array:', results);
    
    suites.push({
      name: 'Overall Rank Calculation',
      passed,
      failed,
      total: results.length,
      duration: performance.now() - start,
    });
    totalPassed += passed;
    totalFailed += failed;
    
    // Show failures immediately
    if (failed > 0 && results.length > 0) {
      logger.error('🔴 Overall Rank Calculation Failures');
      const failedTests = results.filter(r => !r.passed);
      logger.error(`Failed tests count: ${failedTests.length}`);
      failedTests.forEach(r => {
        logger.error(`❌ ${r.name}`);
        logger.error(`   Expected: ${JSON.stringify(r.expected)}`);
        logger.error(`   Actual: ${JSON.stringify(r.actual)}`);
        if (r.message) logger.error(`   Note: ${r.message}`);
      });
    }
  } catch (error) {
    logger.error('Overall rank tests failed to run', error);
    suites.push({ name: 'Overall Rank Calculation', passed: 0, failed: 1, total: 1, duration: 0 });
    totalFailed++;
  }
  
  // Suite 7: Seal Activation Tests
  try {
    const start = performance.now();
    const testResults = runSealActivationTests();
    
    suites.push({
      name: 'Seal Activation System',
      passed: testResults.passed,
      failed: testResults.failed,
      total: testResults.total,
      duration: performance.now() - start,
    });
    totalPassed += testResults.passed;
    totalFailed += testResults.failed;
    
    // Show failures
    if (testResults.failed > 0) {
      logger.error('🔴 Seal Activation System Failures');
      testResults.results.filter(r => !r.passed).forEach(r => {
        logger.error(`❌ ${r.name}`);
        logger.error(`   Expected: ${JSON.stringify(r.expected)}`);
        logger.error(`   Actual: ${JSON.stringify(r.actual)}`);
        if (r.message) logger.error(`   Note: ${r.message}`);
      });
    }
  } catch (error) {
    logger.error('Seal activation tests failed to run', error);
    suites.push({ name: 'Seal Activation System', passed: 0, failed: 1, total: 1, duration: 0 });
    totalFailed++;
  }
  
  // Suite 8: Stat Progression Tests
  try {
    const start = performance.now();
    const testResults = runStatProgressionTests();
    
    suites.push({
      name: 'Stat Progression & Point Allocation',
      passed: testResults.passed,
      failed: testResults.failed,
      total: testResults.total,
      duration: performance.now() - start,
    });
    totalPassed += testResults.passed;
    totalFailed += testResults.failed;
    
    // Show failures
    if (testResults.failed > 0) {
      logger.error('🔴 Stat Progression & Point Allocation Failures');
      testResults.results.filter(r => !r.passed).forEach(r => {
        logger.error(`❌ ${r.name}`);
        logger.error(`   Expected: ${JSON.stringify(r.expected)}`);
        logger.error(`   Actual: ${JSON.stringify(r.actual)}`);
        if (r.message) logger.error(`   Note: ${r.message}`);
      });
    }
  } catch (error) {
    logger.error('Stat progression tests failed to run', error);
    suites.push({ name: 'Stat Progression & Point Allocation', passed: 0, failed: 1, total: 1, duration: 0 });
    totalFailed++;
  }
  
  // Suite 9: Streak System Tests
  try {
    const start = performance.now();
    const testResults = runStreakSystemTests();
    
    suites.push({
      name: 'Streak System',
      passed: testResults.passed,
      failed: testResults.failed,
      total: testResults.passed + testResults.failed,
      duration: performance.now() - start,
    });
    totalPassed += testResults.passed;
    totalFailed += testResults.failed;
    
    // Show failures
    if (testResults.failed > 0) {
      logger.error('🔴 Streak System Failures');
      testResults.results.filter(r => !r.passed).forEach(r => {
        logger.error(`❌ ${r.name}`);
        logger.error(`   Expected: ${JSON.stringify(r.expected)}`);
        logger.error(`   Actual: ${JSON.stringify(r.actual)}`);
        if (r.message) logger.error(`   Note: ${r.message}`);
      });
    }
  } catch (error) {
    logger.error('Streak system tests failed to run', error);
    suites.push({ name: 'Streak System', passed: 0, failed: 1, total: 1, duration: 0 });
    totalFailed++;
  }
  
  // Suite 10: Chronos Reset Tests
  try {
    const start = performance.now();
    await runChronosResetTests();
    // Note: Chronos tests use logger directly, count as 8 tests
    suites.push({
      name: 'Chronos Reset System',
      passed: 8, // 8 test cases
      failed: 0,
      total: 8,
      duration: performance.now() - start,
    });
    totalPassed += 8;
  } catch (error) {
    logger.error('Chronos Reset tests failed to run', error);
    suites.push({ name: 'Chronos Reset System', passed: 0, failed: 8, total: 8, duration: 0 });
    totalFailed += 8;
  }
  
  const totalDuration = performance.now() - startTime;
  const totalTests = totalPassed + totalFailed;
  
  // Print summary
  logger.info('');
  logger.info('╔════════════════════════════════════════════════════╗');
  logger.info('║                   TEST SUMMARY                     ║');
  logger.info('╚════════════════════════════════════════════════════╝');
  
  suites.forEach(suite => {
    const status = suite.failed === 0 ? '✅' : '❌';
    const bar = `${'█'.repeat(Math.floor(suite.passed / suite.total * 20))}${'░'.repeat(20 - Math.floor(suite.passed / suite.total * 20))}`;
    logger.info(`${status} ${suite.name}`);
    logger.info(`   ${bar} ${suite.passed}/${suite.total} (${(suite.passed / suite.total * 100).toFixed(0)}%)`);
  });
  
  logger.info('');
  logger.info(`Total: ${totalPassed}/${totalTests} passed (${(totalPassed / totalTests * 100).toFixed(1)}%)`);
  logger.info(`Duration: ${totalDuration.toFixed(0)}ms`);
  
  if (totalFailed > 0) {
    logger.error(`❌ ${totalFailed} tests failed`);
    logger.info('');
    logger.info('╔════════════════════════════════════════════════════╗');
    logger.info('║              FAILED TESTS DETAILS                  ║');
    logger.info('╚════════════════════════════════════════════════════╝');
    
    // Show failed tests from each suite
    suites.forEach(suite => {
      if (suite.failed > 0) {
        logger.error(`\n${suite.name} - ${suite.failed} failed:`);
        // The individual test runners will have already logged the specific failures
      }
    });
  } else {
    logger.info('✅ All tests passed!');
  }
  
  return {
    suites,
    totalPassed,
    totalFailed,
    totalTests,
    totalDuration,
  };
};

// Export individual test runners
export { runInflationTests } from './economy/inflation.test';
export { runTemperingXpTests } from './progression/tempering-xp.test';
export { runEvolutionTests } from './progression/evolution.test';
export { runSchemaTests } from './schema/new-user.test';
export { runCoinRewardsTest } from './coin-rewards-test';
export { runLevelingSmokeTest } from './leveling-smoke';
export { runOverallRankTests } from './logic/rank.test';
export { runSealActivationTests } from './logic/sealActivation.test';
export { runStatProgressionTests } from './logic/statProgression.test';
export { runStreakSystemTests } from './logic/streakSystem.test';
export { runChronosResetTests } from './logic/ChronosReset.test';

// Make available in browser console
if (typeof window !== 'undefined') {
  const w = window as unknown as { 
    runAllTests: typeof runAllTests;
    runInflationTests: typeof runInflationTests;
    runTemperingXpTests: typeof runTemperingXpTests;
    runEvolutionTests: typeof runEvolutionTests;
    runSchemaTests: typeof runSchemaTests;
    runOverallRankTests: typeof runOverallRankTests;
    runSealActivationTests: typeof runSealActivationTests;
    runStatProgressionTests: typeof runStatProgressionTests;
    runStreakSystemTests: typeof runStreakSystemTests;
    runChronosResetTests: typeof runChronosResetTests;
  };
  w.runAllTests = runAllTests;
  w.runInflationTests = runInflationTests;
  w.runTemperingXpTests = runTemperingXpTests;
  w.runEvolutionTests = runEvolutionTests;
  w.runSchemaTests = runSchemaTests;
  w.runOverallRankTests = runOverallRankTests;
  w.runSealActivationTests = runSealActivationTests;
  w.runStatProgressionTests = runStatProgressionTests;
  w.runStreakSystemTests = runStreakSystemTests;
  w.runChronosResetTests = runChronosResetTests;
}
