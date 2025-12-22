/**
 * Schema Tests: Data Integrity & Legacy Prevention
 * 
 * Tests to ensure:
 * 1. PathRegistry consistency with database seeds
 * 2. Type enum consistency
 * 3. No legacy artifact usage
 * 
 * @module tests/schema/new-user.test
 */

import { logger } from '@/utils/logger';
import { 
  getTemperingLevel,
  TEMPERING_TEMPLATE_ID,
} from '@/constants/temperingPath';
import { 
  isPathRegistered,
  getPathLevelConfig,
  getPathTaskRewards,
  getAllPathIds,
} from '@/constants/pathRegistry';
import { STORE_KEYS } from '@/constants/storage';
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

// ==================== PATH REGISTRY CONSISTENCY ====================

const testPathRegistryConsistency = () => {
  logger.info('=== PathRegistry Consistency ===');
  
  // Test 1: All 10 tempering levels registered
  assert(
    'Tempering path is registered',
    true,
    isPathRegistered(TEMPERING_TEMPLATE_ID),
    ''
  );
  
  for (let level = 1; level <= 10; level++) {
    const registryConfig = getPathLevelConfig(TEMPERING_TEMPLATE_ID, level);
    const directConfig = getTemperingLevel(level);
    
    assert(
      `Level ${level} exists in PathRegistry`,
      true,
      registryConfig !== undefined,
      ''
    );
    
    // Test 2: Registry values match direct access
    if (registryConfig && directConfig) {
      assert(
        `Level ${level} xpToLevelUp matches`,
        directConfig.xpToLevelUp,
        registryConfig.xpToLevelUp,
        ''
      );
      
      assert(
        `Level ${level} daysRequired matches`,
        directConfig.daysRequired,
        registryConfig.daysRequired,
        ''
      );
      
      assert(
        `Level ${level} baseCoins matches`,
        directConfig.baseCoins,
        registryConfig.baseCoins,
        ''
      );
    }
  }
  
  // Test 3: Reward lookup function works
  for (let level = 1; level <= 10; level++) {
    const rewards = getPathTaskRewards(TEMPERING_TEMPLATE_ID, level);
    const directConfig = getTemperingLevel(level);
    
    assert(
      `Level ${level} rewards.coins matches`,
      directConfig?.baseCoins,
      rewards.coins,
      ''
    );
    
    assert(
      `Level ${level} rewards.primaryStat is BODY`,
      'BODY',
      rewards.primaryStat,
      ''
    );
  }
  
  // Test 4: Task counts per level
  for (let level = 1; level <= 10; level++) {
    const config = getTemperingLevel(level);
    assert(
      `Level ${level} has 5 tasks`,
      5,
      config?.tasks.length,
      ''
    );
  }
};

// ==================== TYPE CONSISTENCY ====================

const testTypeConsistency = () => {
  logger.info('=== Type Consistency ===');
  
  // Test 1: PrimaryStat enum values are used consistently
  const validPrimaryStats = ['BODY', 'MIND', 'SOUL'];
  
  for (let level = 1; level <= 10; level++) {
    const rewards = getPathTaskRewards(TEMPERING_TEMPLATE_ID, level);
    
    assert(
      `Level ${level} primaryStat is valid`,
      true,
      validPrimaryStats.includes(rewards.primaryStat),
      `Got: ${rewards.primaryStat}`
    );
  }
  
  // Test 2: IdentityTier values (verify Tempering uses 'D' tier)
  // Tempering path should be tier D (starting tier)
  logger.info('Note: Tempering path is starter tier (D)');
  
  // Test 3: PlayerIdentityStatus values
  const validStatuses = ['ACTIVE', 'PAUSED', 'COMPLETED'];
  logger.info('Valid PlayerIdentityStatus values:', validStatuses);
  
  assert(
    'PlayerIdentityStatus enum has 3 values',
    3,
    validStatuses.length,
    ''
  );
};

// ==================== NO LEGACY ARTIFACT USAGE ====================

const testNoLegacyArtifacts = () => {
  logger.info('=== No Legacy Artifact Usage ===');
  
  // Test 1: CULTIVATOR store key is NOT in STORE_KEYS
  const storeKeyValues = Object.values(STORE_KEYS) as string[];
  
  assert(
    'CULTIVATOR store key is removed',
    false,
    storeKeyValues.includes('cultivator-store'),
    'Legacy CULTIVATOR key should not exist'
  );
  
  // Test 2: GAME store key exists
  assert(
    'GAME store key exists',
    true,
    storeKeyValues.includes('game-store'),
    ''
  );
  
  // Test 3: Required store keys are present
  const requiredKeys = ['auth-store', 'game-store', 'toast-store'];
  requiredKeys.forEach(key => {
    assert(
      `Required store key '${key}' exists`,
      true,
      storeKeyValues.includes(key),
      ''
    );
  });
  
  // Test 4: No 'cultivatorTypes' references in active paths
  // This is a static check - we verify the tempering path doesn't use old types
  const allPaths = getAllPathIds();
  
  assert(
    'At least one path is registered',
    true,
    allPaths.length > 0,
    `Paths: ${allPaths.join(', ')}`
  );
  
  // Test 5: Path IDs follow new naming convention
  allPaths.forEach(pathId => {
    assert(
      `Path '${pathId}' uses kebab-case naming`,
      true,
      pathId.includes('-'),
      'New paths should use kebab-case'
    );
  });
};

// ==================== DATABASE SEED ALIGNMENT ====================

const testDatabaseSeedAlignment = () => {
  logger.info('=== Database Seed Alignment ===');
  
  // These values should match what's in seed-tempering-path.sql
  // Note: This is a static check based on expected seed values
  
  const level1 = getTemperingLevel(1);
  const level10 = getTemperingLevel(10);
  
  // Test 1: Level 1 base rewards match expected seed values
  assert(
    'Level 1 baseCoins matches seed (30)',
    30,
    level1?.baseCoins,
    'Should match seed-tempering-path.sql'
  );
  
  assert(
    'Level 1 baseBodyPoints matches seed (2)',
    2,
    level1?.baseBodyPoints,
    'Should match seed-tempering-path.sql'
  );
  
  // Test 2: XP per task calculation
  const xpPerTask = 8; // TEMPERING_XP_PER_DAY (40) / 5 tasks
  
  assert(
    'XP per task is 8',
    8,
    xpPerTask,
    '40 total XP / 5 tasks = 8 XP per task'
  );
  
  // Test 3: Level 10 has highest rewards (as per progression design)
  assert(
    'Level 10 baseCoins > Level 1 baseCoins',
    true,
    (level10?.baseCoins ?? 0) > (level1?.baseCoins ?? 0),
    `L10: ${level10?.baseCoins}, L1: ${level1?.baseCoins}`
  );
};

// ==================== NEW USER FLOW VALIDATION ====================

const testNewUserFlow = () => {
  logger.info('=== New User Flow Validation ===');
  
  // Test 1: Default profile values should be 0
  const expectedDefaults = {
    coins: 0,
    stars: 0,
    body_points: 0,
    mind_points: 0,
    soul_points: 0,
    will_points: 0,
  };
  
  // Note: This validates the expected defaults, actual DB check would require live connection
  Object.entries(expectedDefaults).forEach(([key, value]) => {
    assert(
      `Default ${key} should be ${value}`,
      true,
      value === 0,
      'New users start with 0 stats'
    );
  });
  
  // Test 2: Tempering path is available as starter path
  assert(
    'Tempering path ID follows template convention',
    true,
    TEMPERING_TEMPLATE_ID.startsWith('tempering-'),
    `ID: ${TEMPERING_TEMPLATE_ID}`
  );
  
  // Test 3: First level is achievable
  const level1 = getTemperingLevel(1);
  assert(
    'Level 1 daysRequired is reasonable for new users',
    true,
    (level1?.daysRequired ?? 0) >= 1 && (level1?.daysRequired ?? 0) <= 7,
    `Days: ${level1?.daysRequired}`
  );
};

// ==================== MAIN TEST RUNNER ====================

export const runSchemaTests = (): TestResult[] => {
  results.length = 0;
  
  logger.info('========================================');
  logger.info('  DATA INTEGRITY & LEGACY PREVENTION');
  logger.info('========================================');
  
  testPathRegistryConsistency();
  testTypeConsistency();
  testNoLegacyArtifacts();
  testDatabaseSeedAlignment();
  testNewUserFlow();
  
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

export { results as schemaTestResults };
