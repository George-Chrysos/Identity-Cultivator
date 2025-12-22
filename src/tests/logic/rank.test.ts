/**
 * Logic Tests: Overall Rank Calculation
 * 
 * Tests the 70/30 weighted rank formula for overall player rank.
 * 
 * Run from browser console:
 * ```
 * import { runOverallRankTests } from '@/tests/logic/rank.test';
 * runOverallRankTests();
 * ```
 * 
 * @module tests/logic/rank.test
 */

import { logger } from '@/utils/logger';
import { calculateOverallRank, PlayerDimensions } from '@/utils/overallRank';

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

// ==================== 70/30 WEIGHTED FORMULA TESTS ====================

const test70_30WeightedFormula = () => {
  logger.info('=== 70/30 Weighted Formula Tests ===');
  
  // Test 1: Core verification - 3 C-rank stats + 1 E-rank stat = D+ rank
  const dimensions1: PlayerDimensions = {
    body: 30,  // C rank, value 6
    mind: 30,  // C rank, value 6
    soul: 30,  // C rank, value 6
    will: 10,  // E rank, value 2
  };
  
  const result1 = calculateOverallRank(dimensions1);
  
  assert(
    'Stats (6,6,6,2) should result in D+ rank',
    'D+',
    result1.rankTier,
    'Formula: eliteAvg=(6+6+6)/3=6, anchor=2, final=(6*0.7)+(2*0.3)=4.8 → D+'
  );
  
  assertClose(
    'Stats (6,6,6,2) should have finalScore close to 4.8',
    4.8,
    result1.finalScore,
    0.1
  );
  
  // Test 2: Perfectly balanced stats
  const dimensions2: PlayerDimensions = {
    body: 30,  // C rank, value 6
    mind: 30,  // C rank, value 6
    soul: 30,  // C rank, value 6
    will: 30,  // C rank, value 6
  };
  
  const result2 = calculateOverallRank(dimensions2);
  
  assert(
    'Balanced C-rank stats should maintain C rank',
    'C',
    result2.rankTier,
    'Formula: (6*0.7)+(6*0.3)=6.0 → C'
  );
  
  assertClose(
    'Balanced C-rank stats should have finalScore of 6.0',
    6.0,
    result2.finalScore,
    0.1
  );
  
  // Test 3: One strong stat among weak stats
  const dimensions3: PlayerDimensions = {
    body: 10,  // E rank, value 2
    mind: 10,  // E rank, value 2
    soul: 10,  // E rank, value 2
    will: 50,  // A rank, value 10
  };
  
  const result3 = calculateOverallRank(dimensions3);
  
  assert(
    'One A-rank among E-ranks should result in E+ rank',
    'E+',
    result3.rankTier,
    'Formula: eliteAvg=(10+2+2)/3=4.67, anchor=2, final=(4.67*0.7)+(2*0.3)=3.87 → E+'
  );
  
  assertClose(
    'One A-rank among E-ranks should have finalScore close to 3.87',
    3.87,
    result3.finalScore,
    0.1
  );
  
  // Test 4: All F-rank stats
  const dimensions4: PlayerDimensions = {
    body: 0,   // F rank, value 0
    mind: 0,   // F rank, value 0
    soul: 0,   // F rank, value 0
    will: 0,   // F rank, value 0
  };
  
  const result4 = calculateOverallRank(dimensions4);
  
  assert(
    'All F-rank stats should result in F rank',
    'F',
    result4.rankTier,
    'Formula: (0*0.7)+(0*0.3)=0 → F'
  );
  
  assert(
    'All F-rank stats should have finalScore of 0',
    0,
    result4.finalScore,
    ''
  );
  
  // Test 5: All S-rank stats
  const dimensions5: PlayerDimensions = {
    body: 60,  // S rank, value 12
    mind: 60,  // S rank, value 12
    soul: 60,  // S rank, value 12
    will: 60,  // S rank, value 12
  };
  
  const result5 = calculateOverallRank(dimensions5);
  
  assert(
    'All S-rank stats should result in S rank',
    'S',
    result5.rankTier,
    'Formula: (12*0.7)+(12*0.3)=12 → S'
  );
  
  assert(
    'All S-rank stats should have finalScore of 12',
    12,
    result5.finalScore,
    ''
  );
};

const test70PercentWeight = () => {
  logger.info('=== 70% Weight on Top 3 Stats ===');
  
  // Test: 3 B-rank stats + 1 E-rank stat
  const dimensions: PlayerDimensions = {
    body: 40,  // B rank, value 8
    mind: 40,  // B rank, value 8
    soul: 40,  // B rank, value 8
    will: 10,  // E rank, value 2
  };
  
  const result = calculateOverallRank(dimensions);
  
  assert(
    '3 B-rank stats + 1 E-rank should result in C rank',
    'C',
    result.rankTier,
    'Formula: eliteAvg=(8+8+8)/3=8, anchor=2, final=(8*0.7)+(2*0.3)=6.2 → C'
  );
  
  assertClose(
    '3 B-rank stats + 1 E-rank should have finalScore close to 6.2',
    6.2,
    result.finalScore,
    0.1
  );
};

const test30PercentAnchor = () => {
  logger.info('=== 30% Weight on Anchor Stat ===');
  
  // Test: 3 A-rank stats + 1 F-rank stat
  const dimensions: PlayerDimensions = {
    body: 50,  // A rank, value 10
    mind: 50,  // A rank, value 10
    soul: 50,  // A rank, value 10
    will: 0,   // F rank, value 0
  };
  
  const result = calculateOverallRank(dimensions);
  
  assert(
    '3 A-rank stats + 1 F-rank should result in C+ rank',
    'C+',
    result.rankTier,
    'Formula: eliteAvg=(10+10+10)/3=10, anchor=0, final=(10*0.7)+(0*0.3)=7.0 → C+'
  );
  
  assertClose(
    '3 A-rank stats + 1 F-rank should have finalScore of 7.0',
    7.0,
    result.finalScore,
    0.1
  );
};

// ==================== TEST RUNNER ====================

export const runOverallRankTests = (): TestResult[] => {
  results.length = 0;
  
  console.log('%c=== OVERALL RANK TESTS STARTING ===', 'color: purple; font-weight: bold; font-size: 12px');
  
  logger.info('╔══════════════════════════════════════════════════════╗');
  logger.info('║  Overall Rank Calculation Tests (70/30 Weighted)    ║');
  logger.info('╚══════════════════════════════════════════════════════╝');
  
  test70_30WeightedFormula();
  test70PercentWeight();
  test30PercentAnchor();
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log('%c=== OVERALL RANK TESTS COMPLETE ===', 'color: green; font-weight: bold; font-size: 12px');
  console.table({
    Total: results.length,
    Passed: passed,
    Failed: failed,
  });
  
  if (failed > 0) {
    console.log('%cFailed tests:', 'color: red; font-weight: bold;');
    console.table(results.filter(r => !r.passed));
  }
  
  logger.info('');
  logger.info('=== Test Summary ===');
  logger.info(`✅ Passed: ${passed}`);
  logger.info(`❌ Failed: ${failed}`);
  logger.info(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    logger.error('❌ Some tests failed. Review logs above.');
    logger.info('');
    logger.info('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      logger.error(`  ❌ ${r.name}`);
      logger.error(`     Expected: ${JSON.stringify(r.expected)}`);
      logger.error(`     Actual: ${JSON.stringify(r.actual)}`);
      if (r.message) logger.error(`     ${r.message}`);
    });
  } else {
    logger.info('✅ All tests passed!');
  }
  
  return results;
};
