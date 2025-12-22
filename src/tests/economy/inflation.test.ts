/**
 * Economy Tests: Shop Inflation System
 * 
 * Tests the market exhaustion rules, shop-inventory sync, and ticket cooldown logic.
 * 
 * @module tests/economy/inflation.test
 */

import { logger } from '@/utils/logger';
import { 
  calculateInflation, 
  applyInflationToShopItems,
  getInflationResetTime,
  formatTimeRemaining,
  getInflationLevel,
} from '@/utils/inflationCalculator';
import { useShopStore } from '@/store/shopStore';
import type { ItemTemplate, PlayerInventoryItem } from '@/types/database';

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

const assertClose = (name: string, expected: number, actual: number, tolerance: number = 0.01): boolean => {
  const passed = Math.abs(expected - actual) <= tolerance;
  results.push({ name, passed, expected, actual, message: `Tolerance: ${tolerance}` });
  
  if (passed) {
    logger.info(`✅ PASS: ${name}`, { expected, actual });
  } else {
    logger.error(`❌ FAIL: ${name}`, { expected, actual, tolerance });
  }
  
  return passed;
};

// ==================== MOCK DATA ====================

const createMockItem = (overrides: Partial<ItemTemplate> = {}): ItemTemplate => ({
  id: 'test-ticket-1',
  name: 'Test Ticket',
  description: 'A test ticket',
  cost_coins: 100,
  effect_type: 'buff',
  effect_value: 1,
  is_available: true,
  created_at: new Date().toISOString(),
  category: 'tickets',
  cooldown_time: 24,
  base_inflation: 0.25,
  ...overrides,
});

const createMockInventoryItem = (overrides: Partial<PlayerInventoryItem> = {}): PlayerInventoryItem => ({
  id: 'inv-1',
  user_id: 'user-1',
  item_template_id: 'test-ticket-1',
  quantity: 1,
  acquired_at: new Date().toISOString(),
  ...overrides,
});

// ==================== MARKET EXHAUSTION RULES ====================

const testMarketExhaustionRules = () => {
  logger.info('=== Market Exhaustion Rules ===');
  
  // Test 1: Price increase by base_inflation % per inventory instance
  const item = createMockItem({ cost_coins: 100, base_inflation: 0.25 });
  
  const result1 = calculateInflation(item, 1);
  assert(
    'Price increases by base_inflation % for 1 instance',
    125,
    result1.currentPrice,
    'With 25% inflation and 1 instance, 100 * 1.25 = 125'
  );
  
  const result2 = calculateInflation(item, 2);
  assert(
    'Price increases by base_inflation × 2 for 2 instances',
    150,
    result2.currentPrice,
    'With 25% inflation and 2 instances, 100 * 1.50 = 150'
  );
  
  const result3 = calculateInflation(item, 4);
  assert(
    'Price increases by base_inflation × 4 for 4 instances',
    200,
    result3.currentPrice,
    'With 25% inflation and 4 instances, 100 * 2.0 = 200'
  );
  
  // Test 2: Inflation percent calculation
  assertClose(
    'Inflation percent for 1 instance is 25%',
    25,
    result1.inflationPercent,
    0.1
  );
  
  assertClose(
    'Inflation percent for 2 instances is 50%',
    50,
    result2.inflationPercent,
    0.1
  );
  
  // Test 3: Edge case - 0 items in inventory
  const result0 = calculateInflation(item, 0);
  assert(
    'No inflation with 0 inventory count',
    100,
    result0.currentPrice,
    'Base price should remain unchanged'
  );
  assert(
    'Inflation percent is 0 with no inventory',
    0,
    result0.inflationPercent,
    ''
  );
  
  // Test 4: Edge case - first purchase (no prior inventory)
  const firstPurchase = calculateInflation(item, 0);
  assert(
    'First purchase uses base price',
    100,
    firstPurchase.currentPrice,
    'First purchase should be at base price'
  );
  
  // Test 5: No inflation if base_inflation is 0
  const noInflationItem = createMockItem({ base_inflation: 0 });
  const noInflationResult = calculateInflation(noInflationItem, 5);
  assert(
    'No inflation when base_inflation is 0',
    100,
    noInflationResult.currentPrice,
    'Price should remain base even with inventory'
  );
};

// ==================== INFLATION RESET/COOLDOWN ====================

const testInflationReset = () => {
  logger.info('=== Inflation Reset (Cooldown) ===');
  
  // Test 1: Reset after cooldown_time hours
  const now = Date.now();
  const futureReset = new Date(now + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now
  const pastReset = new Date(now - 1 * 60 * 60 * 1000).toISOString(); // 1 hour ago
  
  const remainingFuture = getInflationResetTime(futureReset);
  assert(
    'Remaining time is positive for future reset',
    true,
    remainingFuture > 0,
    `Remaining: ${remainingFuture}ms`
  );
  
  const remainingPast = getInflationResetTime(pastReset);
  assert(
    'Remaining time is 0 for past reset',
    0,
    remainingPast,
    'Expired cooldowns should return 0'
  );
  
  // Test 2: Format time remaining
  const twoHoursMs = 2 * 60 * 60 * 1000;
  const formatted = formatTimeRemaining(twoHoursMs);
  assert(
    'Format 2 hours as 02:00',
    '02:00',
    formatted,
    ''
  );
  
  const ninetyMinsMs = 90 * 60 * 1000;
  const formatted90 = formatTimeRemaining(ninetyMinsMs);
  assert(
    'Format 90 minutes as 01:30',
    '01:30',
    formatted90,
    ''
  );
};

// ==================== SHOP-INVENTORY SYNC ====================

const testShopInventorySync = () => {
  logger.info('=== Shop-Inventory Sync ===');
  
  // Test 1: Apply inflation to shop items based on inventory
  const shopItems: ItemTemplate[] = [
    createMockItem({ id: 'ticket-a', cost_coins: 100, base_inflation: 0.25 }),
    createMockItem({ id: 'ticket-b', cost_coins: 200, base_inflation: 0.50 }),
    createMockItem({ id: 'non-ticket', cost_coins: 50, category: 'items' }),
  ];
  
  const inventory: PlayerInventoryItem[] = [
    createMockInventoryItem({ item_template_id: 'ticket-a', quantity: 2 }),
  ];
  
  const inflatedItems = applyInflationToShopItems(shopItems, inventory);
  
  const ticketA = inflatedItems.find(i => i.id === 'ticket-a');
  assert(
    'Ticket A has inflated price (2 in inventory)',
    150,
    ticketA?.currentPrice,
    '100 * (1 + 0.25 * 2) = 150'
  );
  
  const ticketB = inflatedItems.find(i => i.id === 'ticket-b');
  assert(
    'Ticket B has base price (0 in inventory)',
    200,
    ticketB?.currentPrice,
    'No instances in inventory'
  );
  
  const nonTicket = inflatedItems.find(i => i.id === 'non-ticket');
  assert(
    'Non-ticket items are unchanged',
    undefined,
    nonTicket?.currentPrice,
    'Items category should not be inflated'
  );
};

// ==================== SHOP STORE TESTS ====================

const testShopStore = () => {
  logger.info('=== Shop Store Market State ===');
  
  // Reset store state
  const store = useShopStore.getState();
  
  // Test 1: Record purchase
  store.recordPurchase('ticket-test', 24, 0.25);
  
  const marketState = store.getMarketState('ticket-test');
  assert(
    'Market state is created after purchase',
    true,
    marketState !== null,
    ''
  );
  
  assert(
    'Market state has correct ticketId',
    'ticket-test',
    marketState?.ticketId,
    ''
  );
  
  // Test 2: Inflation active check
  const isActive = store.isInflationActive('ticket-test');
  assert(
    'Inflation is active immediately after purchase',
    true,
    isActive,
    ''
  );
  
  // Test 3: Get current price
  const currentPrice = store.getCurrentPrice('ticket-test', 100);
  assert(
    'Current price includes inflation',
    125,
    currentPrice,
    '100 * (1 + 0.25) = 125'
  );
  
  // Test 4: Remaining cooldown
  const remaining = store.getRemainingCooldown('ticket-test');
  assert(
    'Remaining cooldown is positive',
    true,
    remaining > 0 && remaining <= 24 * 60 * 60 * 1000,
    `Remaining: ${remaining}ms`
  );
  
  // Test 5: Non-existent ticket
  const noState = store.getMarketState('non-existent');
  assert(
    'Non-existent ticket returns null',
    null,
    noState,
    ''
  );
  
  const noInflation = store.isInflationActive('non-existent');
  assert(
    'Non-existent ticket has no active inflation',
    false,
    noInflation,
    ''
  );
};

// ==================== INFLATION LEVELS ====================

const testInflationLevels = () => {
  logger.info('=== Inflation Level Classification ===');
  
  const level0 = getInflationLevel(0);
  assert(
    'Level 0% inflation is low/green',
    'low',
    level0.level,
    `Level: ${level0.level}, Color: ${level0.color}`
  );
  
  const level50 = getInflationLevel(50);
  assert(
    'Level 50% inflation is medium',
    'medium',
    level50.level,
    `Level: ${level50.level}`
  );
  
  const level150 = getInflationLevel(150);
  assert(
    'Level 150% inflation is high',
    'high',
    level150.level,
    `Level: ${level150.level}`
  );
  
  const level250 = getInflationLevel(250);
  assert(
    'Level 250% inflation is extreme',
    'extreme',
    level250.level,
    `Level: ${level250.level}`
  );
};

// ==================== MAIN TEST RUNNER ====================

export const runInflationTests = (): TestResult[] => {
  results.length = 0;
  
  logger.info('========================================');
  logger.info('  SHOP INFLATION SYSTEM TESTS');
  logger.info('========================================');
  
  testMarketExhaustionRules();
  testInflationReset();
  testShopInventorySync();
  testShopStore();
  testInflationLevels();
  
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

export { results as inflationTestResults };
