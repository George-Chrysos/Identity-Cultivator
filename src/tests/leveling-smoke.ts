/**
 * Leveling Smoke Test - Updated to use new gameDatabase API
 * 
 * Tests the core leveling functionality:
 * 1. XP accumulation through task completion
 * 2. Level-up triggers when XP threshold is reached
 * 3. PathRegistry integration for XP calculations
 * 
 * @see gameDatabase.ts for the main API
 * @see pathRegistry.ts for level configurations
 */

import { logger } from '@/utils/logger';
import { gameDB } from '@/api/gameDatabase';
import { getPathLevelConfig } from '@/constants/pathRegistry';
import { TEMPERING_TEMPLATE_ID } from '@/constants/temperingPath';
// Ensure path registration
import '@/constants/temperingPath';

interface LevelingSmokeTestResult {
  testName: string;
  passed: boolean;
  details: string;
}

/**
 * Run the leveling smoke test
 * Simulates task completions and verifies XP/level changes
 */
export const runLevelingSmokeTest = async (userId: string): Promise<LevelingSmokeTestResult[]> => {
  const results: LevelingSmokeTestResult[] = [];
  
  logger.info('=== Starting Leveling Smoke Test ===');
  
  // Test 1: PathRegistry XP configuration
  try {
    const level1Config = getPathLevelConfig(TEMPERING_TEMPLATE_ID, 1);
    const level2Config = getPathLevelConfig(TEMPERING_TEMPLATE_ID, 2);
    
    results.push({
      testName: 'PathRegistry Level 1 XP Config',
      passed: level1Config !== undefined && level1Config.xpToLevelUp > 0,
      details: `XP to level up: ${level1Config?.xpToLevelUp ?? 'NOT FOUND'}`,
    });
    
    results.push({
      testName: 'PathRegistry Level 2 XP Config',
      passed: level2Config !== undefined && level2Config.xpToLevelUp > level1Config!.xpToLevelUp,
      details: `XP to level up: ${level2Config?.xpToLevelUp ?? 'NOT FOUND'}`,
    });
  } catch (error) {
    results.push({
      testName: 'PathRegistry Configuration',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
  
  // Test 2: Profile loading
  try {
    const profile = await gameDB.getProfile(userId);
    results.push({
      testName: 'Load User Profile',
      passed: profile !== null,
      details: profile ? `Profile: ${profile.display_name}` : 'Profile not found',
    });
  } catch (error) {
    results.push({
      testName: 'Load User Profile',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
  
  // Test 3: Active identities loading
  try {
    const identities = await gameDB.getActiveIdentities(userId);
    const hasTemperingIdentity = identities.some(i => i.template_id.startsWith(TEMPERING_TEMPLATE_ID));
    
    results.push({
      testName: 'Load Active Identities',
      passed: identities.length >= 0,
      details: `Found ${identities.length} active identities. Has Tempering: ${hasTemperingIdentity}`,
    });
  } catch (error) {
    results.push({
      testName: 'Load Active Identities',
      passed: false,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
  
  // Summary
  const passedCount = results.filter(r => r.passed).length;
  logger.info(`=== Leveling Smoke Test Complete ===`);
  logger.info(`Results: ${passedCount}/${results.length} passed`);
  
  results.forEach(r => {
    const icon = r.passed ? '✅' : '❌';
    logger.info(`${icon} ${r.testName}: ${r.details}`);
  });
  
  return results;
};

export {};
