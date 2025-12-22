# Soul Cultivation - Technical Documentation

## Table of Contents

1. The Tempering Path (Warrior Stage 1)
2. The Market Economy (Tickets & Inflation)
3. Inventory System (The Ghost Card)
4. Database & Type Architecture
5. Development & QA

---

## 1. The Tempering Path (Warrior Stage 1)

### 1.1 Overview

The Tempering Path is the foundational progression system for the "Warrior" identity type. It represents the first stage of physical cultivation, focusing on building discipline through consistent daily practice.

**Source Files:**
- `src/constants/temperingPath.ts` - Level configurations and task templates
- `src/constants/pathRegistry.ts` - Centralized path registration system
- `src/tests/progression/tempering-xp.test.ts` - XP system tests

### 1.2 Level 1-10 Progression

The Tempering Path consists of 10 levels, each with increasing XP requirements and time investment.

**Core Constants:**

```
TEMPERING_TEMPLATE_ID = 'tempering-path'
TEMPERING_XP_PER_DAY = 40 (total XP from completing all 5 daily tasks)
XP_PER_TASK = 8 (40 ÷ 5 gates)
```

**Level Configuration Table:**

| Level | XP to Level Up | Days Required | Base Coins | Base Body Points |
|-------|----------------|---------------|------------|------------------|
| 1     | 120            | 3             | 10         | 5                |
| 2     | 200            | 5             | 15         | 8                |
| 3     | 280            | 7             | 20         | 10               |
| 4     | 400            | 10            | 25         | 12               |
| 5     | 520            | 13            | 30         | 15               |
| 6     | 680            | 17            | 35         | 18               |
| 7     | 840            | 21            | 40         | 20               |
| 8     | 1040           | 26            | 45         | 22               |
| 9     | 1280           | 32            | 50         | 25               |
| 10    | 1600           | 40            | 60         | 30               |

**XP Calculation Formula:**

```
xpToLevelUp = daysRequired × TEMPERING_XP_PER_DAY
```

Example: Level 1 requires 3 days × 40 XP = 120 XP

**Important:** The system does NOT use the legacy formula `level × 100`. This is explicitly tested in `src/tests/progression/tempering-xp.test.ts` (line 166).

### 1.3 The Five Gates System

Each day, the practitioner completes 5 tasks corresponding to the Five Gates of physical cultivation. Each gate awards 8 XP upon completion.

**Gate Structure:**

| Gate | Name | Purpose | Focus Area |
|------|------|---------|------------|
| 1 | Rooting | Ground connection | Lower body stability, stance work |
| 2 | Foundation | Structural strength | Core stability, posture alignment |
| 3 | Core | Power center | Abdominal strength, breath control |
| 4 | Flow | Movement quality | Mobility, flexibility, transitions |
| 5 | Breath | Energy regulation | Breathing patterns, recovery |

**Task Generation:**

Tasks are generated via `generateTemperingTaskTemplates(level)` which returns an array of 5 task templates:

```typescript
interface TaskTemplate {
  id: string;           // e.g., 'tempering-1-gate-1'
  name: string;         // e.g., 'Rooting Gate'
  description: string;  // Task instructions
  xp_reward: number;    // Always 8
  gate: number;         // 1-5
  level: number;        // 1-10
}
```

### 1.4 Evolution Trials

At Level 10, the practitioner faces an "Evolution Trial" - a culminating challenge that tests mastery of all Five Gates.

**Trial Structure:**

```typescript
interface TrialConfig {
  name: string;           // Trial name
  description: string;    // What the trial tests
  successCriteria: string; // Conditions for passing
  rewards: {
    coins: number;
    statPoints: number;
    unlocks: string[];    // What becomes available after passing
  };
}
```

**Trial Rewards (Level 10):**

- Bonus Coins: 100
- Bonus Body Points: 50
- Unlocks: Next cultivation stage (Iron Body Path)

### 1.5 Stat Progression

The Tempering Path awards the `BODY` stat as its primary attribute:

```typescript
primaryStat: 'BODY'
```

This is retrieved via `getPathTaskRewards(TEMPERING_TEMPLATE_ID, level)` from the PathRegistry.

---

## 2. The Market Economy (Tickets & Inflation)

### 2.1 Overview

The Market Economy implements a dynamic pricing system where item costs increase based on purchase frequency, simulating supply/demand economics.

### 2.2 Item Categories

**Physical Items vs Tickets:**

| Property | Physical Items | Tickets (Consumables) |
|----------|---------------|----------------------|
| Persistence | Permanent in inventory | Consumed on use |
| Stacking | No | Yes (quantity-based) |
| Inflation | Applied | Applied |
| Cooldown | Yes | Yes |
| Ghost Card | No | Yes (after use) |

**Examples:**

- Physical Item: Equipment, permanent upgrades
- Ticket: "Rest Day Pass", "XP Boost Token"

### 2.3 Market Exhaustion (Inflation System)

The inflation system prevents "farming" by increasing prices after each purchase.

**Core Variables:**

```typescript
interface ShopItem {
  id: string;
  name: string;
  basePrice: number;        // Original cost (never changes)
  currentPrice: number;     // Actual cost = basePrice × inflationMultiplier
  baseInflation: number;    // Percentage increase per purchase (e.g., 0.15 = 15%)
  inflationMultiplier: number; // Current multiplier (starts at 1.0)
  durationHours: number;    // Cooldown period
  lastPurchasedAt: Date | null; // Timestamp of last purchase
  purchaseCount: number;    // Total purchases (for calculating multiplier)
}
```

**Price Calculation Formula:**

```
currentPrice = Math.ceil(basePrice × inflationMultiplier)
inflationMultiplier = 1 + (baseInflation × purchaseCount)
```

**Example Scenario:**

Item: "Rest Day Ticket"
- basePrice: 100 coins
- baseInflation: 0.20 (20%)

| Purchase # | Multiplier Calculation | Current Price |
|------------|----------------------|---------------|
| 0 (initial)| 1 + (0.20 × 0) = 1.0 | 100 coins     |
| 1          | 1 + (0.20 × 1) = 1.2 | 120 coins     |
| 2          | 1 + (0.20 × 2) = 1.4 | 140 coins     |
| 3          | 1 + (0.20 × 3) = 1.6 | 160 coins     |
| 4          | 1 + (0.20 × 4) = 1.8 | 180 coins     |
| 5          | 1 + (0.20 × 5) = 2.0 | 200 coins     |

### 2.4 Refractory Cooldown (Shop-Centric)

After purchasing an item, a cooldown period prevents immediate repurchase. This is "Shop-Centric" meaning the timer is on the Shop item, not the Inventory.

**Cooldown Logic Flow:**

```
1. User purchases item
   ↓
2. Shop updates:
   - lastPurchasedAt = NOW()
   - purchaseCount += 1
   - inflationMultiplier recalculated
   - currentPrice updated
   ↓
3. Item enters "Refractory Period"
   - Duration: durationHours (e.g., 24 hours)
   - Visual: Grayed out in shop, timer displayed
   ↓
4. During cooldown:
   - Item cannot be purchased again
   - Price penalty MAINTAINED (no decay)
   ↓
5. Cooldown expires:
   - Item becomes purchasable again
   - Price remains inflated
   - Ghost cards in inventory fade
```

**Critical Rule:** The price penalty does NOT decay during cooldown. The inflationMultiplier persists until a separate "Market Reset" event (if implemented).

**Checking Cooldown Status:**

```typescript
const isOnCooldown = (item: ShopItem): boolean => {
  if (!item.lastPurchasedAt) return false;
  
  const cooldownEnd = new Date(item.lastPurchasedAt);
  cooldownEnd.setHours(cooldownEnd.getHours() + item.durationHours);
  
  return new Date() < cooldownEnd;
};

const getRemainingCooldown = (item: ShopItem): number => {
  if (!item.lastPurchasedAt) return 0;
  
  const cooldownEnd = new Date(item.lastPurchasedAt);
  cooldownEnd.setHours(cooldownEnd.getHours() + item.durationHours);
  
  const remaining = cooldownEnd.getTime() - Date.now();
  return Math.max(0, remaining);
};
```

---

## 3. Inventory System (The Ghost Card)

### 3.1 Overview

The Inventory manages owned items and implements the "Ghost Card" visual system for consumed tickets.

### 3.2 Ghost Card Mechanics

When a ticket is consumed, it transforms into a "Ghost Card" or "Cinder" - a visual placeholder that remains until the Shop's cooldown expires.

**Ghost Card Lifecycle:**

```
1. User owns Ticket (solid card in inventory)
   ↓
2. User consumes Ticket
   ↓
3. Ticket transforms to Ghost Card:
   - Visual: Translucent, ember effect
   - Cannot be used again
   - Displays "Cooling..." or timer
   ↓
4. System queries Shop for item's cooldown status
   ↓
5. When Shop cooldown expires:
   - Ghost Card fades out
   - Removed from inventory view
   - Shop item becomes purchasable again
```

### 3.3 System Sync Logic

The Inventory UI must query the Shop state to determine Ghost Card rendering:

```typescript
interface InventoryItem {
  id: string;
  itemId: string;          // Reference to ShopItem
  quantity: number;
  usedAt: Date | null;     // When consumed (null if unused)
  isGhost: boolean;        // Calculated from Shop state
}

const calculateIsGhost = (
  inventoryItem: InventoryItem, 
  shopItem: ShopItem
): boolean => {
  // If never used, not a ghost
  if (!inventoryItem.usedAt) return false;
  
  // If shop item is still on cooldown, show as ghost
  return isOnCooldown(shopItem);
};
```

**Visual States:**

| State | Appearance | Interactable |
|-------|------------|--------------|
| Owned (unused) | Solid, glowing border | Yes - can use |
| Ghost (cooling) | Translucent, ember particles | No - locked |
| Expired | Fade-out animation | Removed from UI |

### 3.4 Inventory-Shop Relationship Diagram

```
┌─────────────────┐      queries      ┌─────────────────┐
│    INVENTORY    │ ───────────────── │      SHOP       │
│                 │                   │                 │
│  InventoryItem  │                   │   ShopItem      │
│  - itemId ──────│───────────────────│── id            │
│  - usedAt       │                   │  - lastPurchased│
│  - quantity     │                   │  - durationHours│
│                 │                   │  - currentPrice │
└─────────────────┘                   └─────────────────┘
         │                                     │
         │   isGhost = usedAt !== null         │
         │        AND                          │
         │   isOnCooldown(shopItem) === true   │
         └─────────────────────────────────────┘
```

---

## 4. Database & Type Architecture

### 4.1 Core Entities

**Entity Relationship Overview:**

```
User (1) ──────────── (N) PathNode
  │                         │
  │                         │
  └──── (N) Ticket ─────────┘
              │
              │
         TaskTemplate
```

### 4.2 Entity Schemas

**User:**

```typescript
interface User {
  userId: string;          // Primary key (matches Supabase auth.id)
  name: string;
  tier: IdentityTier;      // Calculated from highest identity
  totalDaysActive: number;
  createdAt: Date;
  lastActiveDate: Date;
  coins: number;           // Currency for Shop
  stats: {
    BODY: number;
    MIND: number;
    SPIRIT: number;
    // ... other stats
  };
}
```

**PathNode (formerly Identity):**

```typescript
interface PathNode {
  pathNodeId: string;      // Primary key
  userId: string;          // Foreign key
  pathTemplateId: string;  // e.g., 'tempering-path'
  title: string;
  tier: IdentityTier;
  level: number;           // 1-10
  currentXp: number;       // XP towards next level
  daysCompleted: number;
  isActive: boolean;
  lastCompletedDate: Date | null;
  createdAt: Date;
}
```

**Ticket (Shop Item in Inventory):**

```typescript
interface Ticket {
  ticketId: string;        // Primary key
  userId: string;          // Foreign key
  shopItemId: string;      // Reference to ShopItem
  name: string;
  quantity: number;
  usedAt: Date | null;
  purchasedAt: Date;
  expiresAt: Date | null;  // Optional expiration
}
```

**TaskTemplate:**

```typescript
interface TaskTemplate {
  templateId: string;      // e.g., 'tempering-1-gate-1'
  pathTemplateId: string;  // e.g., 'tempering-path'
  level: number;
  gate: number;            // 1-5 for Five Gates
  name: string;
  description: string;
  xpReward: number;
  coinReward: number;
  statReward: {
    stat: string;          // e.g., 'BODY'
    points: number;
  };
}
```

### 4.3 Naming Conventions

**Standardized Naming Rules:**

| Convention | Format | Examples |
|------------|--------|----------|
| Primary Keys | `entityId` (camelCase) | `userId`, `pathNodeId`, `ticketId` |
| Foreign Keys | `relatedEntityId` | `userId`, `shopItemId` |
| Timestamps | `verbedAt` | `createdAt`, `usedAt`, `purchasedAt` |
| Booleans | `isState` or `hasState` | `isActive`, `isGhost`, `hasExpired` |
| Counts | `entityCount` or `totalEntities` | `purchaseCount`, `totalDaysActive` |

**Database Column Mapping (snake_case → camelCase):**

| Database (PostgreSQL) | TypeScript Interface |
|----------------------|---------------------|
| `user_id` | `userId` |
| `path_node_id` | `pathNodeId` |
| `created_at` | `createdAt` |
| `last_updated_date` | `lastUpdatedDate` |
| `is_active` | `isActive` |
| `xp_to_level_up` | `xpToLevelUp` |

**Deprecated Names to Avoid:**

| Legacy Name | Current Name | Reason |
|-------------|--------------|--------|
| `identityID` | `pathNodeId` | Aligned with "Path" terminology |
| `userID` | `userId` | Consistent casing |
| `habit_id` | `taskId` | Tasks, not habits |
| `tier: 'D'` on User | Calculated | Derived from best PathNode |

### 4.4 PathRegistry Architecture

The PathRegistry provides a centralized lookup for all path configurations:

```typescript
// Registration pattern
registerPath(TEMPERING_TEMPLATE_ID, {
  name: 'Tempering Path',
  description: 'Warrior Stage 1',
  primaryStat: 'BODY',
  getLevelConfig: (level) => TEMPERING_LEVELS[level - 1],
  getTaskRewards: (level) => ({
    coins: TEMPERING_LEVELS[level - 1].baseCoins,
    statPoints: TEMPERING_LEVELS[level - 1].baseBodyPoints,
    primaryStat: 'BODY',
  }),
});

// Usage
const config = getPathLevelConfig('tempering-path', 5);
const rewards = getPathTaskRewards('tempering-path', 5);
const isRegistered = isPathRegistered('tempering-path');
```

---

## 5. Overall Rank System

### 5.1 Overview

The Overall Rank system aggregates a player's four core dimensions (BODY, MIND, SOUL, WILL) into a single rank letter that represents their overall cultivation progress.

**Source File:** `src/utils/overallRank.ts`

### 5.2 Rank Calculation Formula

The system uses a **70/30 Weighted Rank** formula that prioritizes the player's top 3 stats while still considering their weakest dimension.

**Step 1: Stat Points to Rank Values**

Each stat's raw points are mapped to a rank value (0-12 scale):

| Stat Points | Rank Letter | Rank Value |
|-------------|-------------|------------|
| 0-4         | F           | 0          |
| 5-9         | F+          | 1          |
| 10-14       | E           | 2          |
| 15-19       | E+          | 3          |
| 20-24       | D           | 4          |
| 25-29       | D+          | 5          |
| 30-34       | C           | 6          |
| 35-39       | C+          | 7          |
| 40-44       | B           | 8          |
| 45-49       | B+          | 9          |
| 50-54       | A           | 10         |
| 55-59       | A+          | 11         |
| 60+         | S           | 12         |

**Step 2: Sort Rank Values**

```typescript
sortedRanks = [bodyRank, mindRank, soulRank, willRank].sort((a, b) => b - a)
```

**Step 3: Calculate Elite Average and Anchor**

```typescript
eliteAverage = (sortedRanks[0] + sortedRanks[1] + sortedRanks[2]) / 3  // Top 3 stats
anchor = sortedRanks[3]  // Lowest stat
```

**Step 4: Apply 70/30 Weighting**

```typescript
finalValue = (eliteAverage × 0.7) + (anchor × 0.3)
```

**Step 5: Map to Overall Rank**

The final value is mapped back to a rank letter using midpoint thresholds:

| Final Value Range | Overall Rank |
|-------------------|--------------|
| 0.0 - 0.49        | F            |
| 0.5 - 1.49        | F+           |
| 1.5 - 2.49        | E            |
| 2.5 - 3.49        | E+           |
| 3.5 - 4.49        | D            |
| 4.5 - 5.49        | D+           |
| 5.5 - 6.49        | C            |
| 6.5 - 7.49        | C+           |
| 7.5 - 8.49        | B            |
| 8.5 - 9.49        | B+           |
| 9.5 - 10.49       | A            |
| 10.5 - 11.49      | A+           |
| 11.5+             | S            |

### 5.3 Example Calculations

**Example 1: Balanced Stats**
- BODY: 30 points (C rank, value 6)
- MIND: 30 points (C rank, value 6)
- SOUL: 30 points (C rank, value 6)
- WILL: 30 points (C rank, value 6)

```
sortedRanks = [6, 6, 6, 6]
eliteAverage = (6 + 6 + 6) / 3 = 6
anchor = 6
finalValue = (6 × 0.7) + (6 × 0.3) = 4.2 + 1.8 = 6 → Overall Rank: C
```

**Example 2: Strong Core with Weak Anchor**
- BODY: 30 points (C rank, value 6)
- MIND: 30 points (C rank, value 6)
- SOUL: 30 points (C rank, value 6)
- WILL: 10 points (E rank, value 2)

```
sortedRanks = [6, 6, 6, 2]
eliteAverage = (6 + 6 + 6) / 3 = 6
anchor = 2
finalValue = (6 × 0.7) + (2 × 0.3) = 4.2 + 0.6 = 4.8 → Overall Rank: D+
```

**Example 3: One Strong Stat**
- BODY: 10 points (E rank, value 2)
- MIND: 10 points (E rank, value 2)
- SOUL: 10 points (E rank, value 2)
- WILL: 50 points (A rank, value 10)

```
sortedRanks = [10, 2, 2, 2]
eliteAverage = (10 + 2 + 2) / 3 = 4.67
anchor = 2
finalValue = (4.67 × 0.7) + (2 × 0.3) = 3.27 + 0.6 = 3.87 → Overall Rank: E+
```

### 5.4 Design Rationale

- **70/30 Weighting** rewards players for having 3 strong stats while still requiring attention to all dimensions
- **Elite Average** (top 3 stats) represents the player's primary cultivation strengths at 70% weight
- **Anchor** (weakest stat) prevents complete neglect of any dimension at 30% weight
- **No arbitrary penalties** - the formula is transparent and predictable
- **Encourages balanced growth** - a player with 3 C-rank stats and 1 E-rank stat gets D+ overall, respecting the strength of the majority while acknowledging the weakness

---

## 6. The Seals System

### 6.1 Overview

The Seals System represents daily focus areas that cultivators select each morning - a disciplined approach to daily practice across four dimensions.

**Source Files:**
- `src/constants/seals.ts` - Seal definitions and sub-pillars
- `src/constants/sealsContent.ts` - Detailed descriptions
- `src/store/gameStore.ts` - Seal state management

### 6.2 The Four Seals

| Seal | Icon | Stat Bonus | Sub-Pillars | Focus Area |
|------|------|------------|-------------|------------|
| **Shen Seal** (神) | Eye | MIND | 4 pillars | Awareness, focus, presence |
| **Body Seal** (体) | Shield | BODY | 4 pillars | Physical discipline, rest |
| **Fuel Seal** (気) | Flame | SOUL | 2 pillars | Energy, vitality |
| **Heart Seal** (心) | Heart | WILL | 2 pillars | Emotional resilience |

### 6.3 Sub-Pillars Structure

**Shen Seal (神) - The Mind's Eye:**
1. Soft Eyes - Relaxed visual awareness
2. The Cockpit - Centered presence
3. Silent Blade - Mental stillness
4. One Cut - Decisive action

**Body Seal (体) - Physical Foundation:**
1. 11 PM Gate - Sleep discipline
2. Tortoise Warmth - Kidney Yang cultivation
3. Drop the Armor - Release tension
4. Guard the Essence - Preserve vitality

**Fuel Seal (気) - Internal Energy:**
1. Warm Fire - Gentle activation
2. Steady Flame - Consistent energy

**Heart Seal (心) - Emotional Core:**
1. The Iron Circle - Protective boundaries
2. The Glass Wall - Emotional clarity

### 6.4 Daily Seal Selection

**Morning Ritual:**
1. User selects 1-4 seals for the day
2. Selection is logged in `UserSealLog`:
   ```typescript
   interface UserSealLog {
     date: string;              // YYYY-MM-DD
     activeSealIds: string[];   // e.g., ['seal-shen', 'seal-fuel']
     status: 'pending' | 'completed' | 'failed';
     completedAt?: string;      // ISO timestamp
   }
   ```

**Evening Check-In:**
1. User reviews which seals were honored
2. Status updates to 'completed' or 'failed'
3. `UserSealStats` updated for each active seal

### 6.5 Blind Leveling System

Unlike traditional XP systems, Seals use "Blind Leveling" - progress is tracked but not explicitly shown as XP bars.

**Progression Formula:**

```typescript
interface UserSealStats {
  seal_id: string;
  total_days_active: number;    // Total days selected
  current_streak: number;        // Consecutive days
  current_level: number;         // floor(total_days_active / 5)
  last_active_date?: string;
}
```

**Level Calculation:**
```
current_level = Math.floor(total_days_active / 5)
```

**Example:**
- Day 1-4: Level 0
- Day 5-9: Level 1
- Day 10-14: Level 2
- Day 15-19: Level 3
- etc.

### 6.6 Stat Bonuses

Completing a seal's daily practice awards stat points:

| Seal | Stat Awarded | Typical Amount |
|------|--------------|----------------|
| Shen | MIND points  | 1-5 per day |
| Body | BODY points  | 1-5 per day |
| Fuel | SOUL points  | 1-5 per day |
| Heart | WILL points  | 1-5 per day |

**Important:** Bonuses are awarded on evening check-in completion, not selection.

### 6.7 Integration with Calendar

The `UserSealLog` array creates a historical record visualized in the Calendar view:

```typescript
// Example logs
const sealHistory: UserSealLog[] = [
  { date: '2025-12-20', activeSealIds: ['seal-shen', 'seal-fuel'], status: 'completed' },
  { date: '2025-12-21', activeSealIds: ['seal-shen', 'seal-body'], status: 'completed' },
  { date: '2025-12-22', activeSealIds: ['seal-shen'], status: 'pending' },
];
```

This enables:
- Streak tracking per seal
- Pattern visualization (which seals are practiced together)
- Historical review of cultivation choices

---

## 7. Currency System (Coins & Stars)

### 7.1 Overview

The economy uses a two-currency system: **Coins** (common) and **Stars** (premium).

### 7.2 Coins (金)

**Primary currency for daily operations.**

**How to Earn:**
- Complete daily tasks: 10-60 coins per task (scales with path level)
- Complete gate tasks: 8-20 coins per gate
- Level up: Bonus coins (varies by level, see Tempering Path table)
- Trials: 100-200 coins for passing
- Daily quests: Variable rewards

**How to Spend:**
- Shop tickets: 100-500 coins (subject to inflation)
- Shop buffs: 50-200 coins
- Shop items: 100-1000+ coins

**Starting Amount:** 200 coins (new users)

**Display:** Gold/amber color, coin icon

### 7.3 Stars (星)

**Premium currency for unlocking paths and rare items.**

**How to Earn:**
- Level up: 1-5 stars per level (increases with difficulty)
- Trials: 1-3 stars per trial pass
- Achievements: Special milestones
- Daily login streaks: Bonus stars
- NOT purchasable with real money (commitment-based economy)

**How to Spend:**
- Unlock new identity paths: 3-10 stars per path
- Rare shop items: 2-5 stars
- Permanent upgrades: Variable cost
- Path tree unlocks: 1-3 stars per node

**Starting Amount:** 100 stars (new users)

**Display:** Blue/white color, star icon

### 7.4 Currency Balance Philosophy

**Coins = Renewable, Stars = Scarce**

| Property | Coins | Stars |
|----------|-------|-------|
| **Regeneration** | Fast (daily tasks) | Slow (milestones) |
| **Primary Use** | Consumables, tickets | Permanent unlocks |
| **Inflation Impact** | High (ticket prices inflate) | None |
| **Strategic Value** | Tactical (daily decisions) | Strategic (long-term) |

**Design Intent:**
- Coins encourage daily engagement and experimentation
- Stars require meaningful choices (which path to unlock first?)
- No "pay-to-win" - all currency earned through cultivation practice
- Inflation system prevents coin hoarding/farming

### 7.5 Economy Formulas

**Task Coin Rewards (Tempering Path):**

```typescript
baseCoins = 10 + (level × 5)  // Level 1 = 10, Level 10 = 60
```

**Trial Bonus Formula:**

```typescript
trialCoins = baseCoins × 2
trialStars = Math.ceil(level / 3)  // Level 1-3 = 1 star, 4-6 = 2 stars, etc.
```

**Shop Inflation (See Section 2.3):**

Coin purchasing power decreases with ticket inflation, encouraging:
- Strategic spending
- Path completion over ticket dependency
- Natural resource scarcity

### 7.6 Example Economy Flow

**Day 1-3 (Level 1 Tempering):**
- Starting: 200 coins, 100 stars
- Complete 5 gates/day: +10 coins × 5 = +50 coins
- Day 3 level up: +10 coins, +1 star
- **Total: 310 coins, 101 stars**

**Week 1:**
- Purchase "Rest Day Pass" (100 coins) → Price inflates to 120 coins
- Continue practicing, earn coins
- Save stars for path unlock decision

**Month 1:**
- Accumulate ~2000 coins from daily practice
- Earn ~10-15 stars from level-ups
- Ticket prices inflated 50-100% from repeated purchases
- Use stars to unlock second path tree node

---

## 8. Development & QA

### 5.1 Test Suites

**Available Tests:**

| Test File | Purpose | Run Command |
|-----------|---------|-------------|
| `src/tests/progression/tempering-xp.test.ts` | XP accumulation, level-up triggers | `runTemperingXpTests()` |
| `src/tests/leveling-smoke.ts` | End-to-end leveling flow | `runLevelingSmokeTest(userId)` |

### 5.2 Running Tests

**In Browser Console (Development):**

```javascript
// Import test runner
import { runTemperingXpTests } from '@/tests/progression/tempering-xp.test';

// Execute tests
const results = runTemperingXpTests();

// Check results
console.table(results.filter(r => !r.passed)); // Show failures only
```

**Test Categories Covered:**

1. **Daily XP Accumulation**
   - TEMPERING_XP_PER_DAY equals 40
   - Total XP from 5 tasks equals daily quota
   - Each task awards equal XP (8 per task)
   - All 10 levels have consistent XP distribution

2. **Level Up Triggers**
   - XP thresholds are defined for levels 1-9
   - Higher levels require more XP
   - XP formula: `daysRequired × 40`
   - NOT using legacy `level × 100` formula

3. **Level Configuration Lookup**
   - All levels have valid xpToLevelUp
   - All levels have valid daysRequired
   - All levels have baseCoins and baseBodyPoints
   - All levels have exactly 5 gate tasks
   - All levels have trial configuration

4. **Progression Curve Validation**
   - XP requirements increase monotonically
   - Days required is within reasonable bounds (1-30)
   - Rewards scale with level
   - Exactly 10 levels defined

5. **PathRegistry Integration**
   - Path is registered
   - All 10 levels accessible via registry
   - Level 0 and 11 return undefined (boundary check)
   - Registry values match direct lookup

### 5.3 Adding New Tests

**Test Template:**

```typescript
const testNewFeature = () => {
  logger.info('=== New Feature Tests ===');
  
  // Test 1: Basic functionality
  assert(
    'Feature does X',
    expectedValue,
    actualValue,
    'Explanation if test fails'
  );
  
  // Test 2: Edge case
  assert(
    'Feature handles edge case Y',
    true,
    someCondition,
    ''
  );
};

// Add to main runner
export const runAllTests = (): TestResult[] => {
  results.length = 0;
  
  testDailyXpAccumulation();
  testLevelUpTriggers();
  testNewFeature(); // Add here
  
  return results;
};
```

### 5.4 Validation Checklist

Before deploying changes to the "Iron Way" (Tempering Path) logic:

- [ ] `runTemperingXpTests()` passes all assertions
- [ ] XP per day still equals 40
- [ ] 5 gates still award 8 XP each
- [ ] Level 1 xpToLevelUp equals `daysRequired × 40`
- [ ] PathRegistry returns matching values
- [ ] No legacy formula (`level × 100`) in use
- [ ] Ghost Card syncs with Shop cooldown
- [ ] Inflation multiplier persists through cooldown

---

## Appendix A: Quick Reference

### Constants

```typescript
// XP System
TEMPERING_XP_PER_DAY = 40
XP_PER_GATE_TASK = 8
GATES_PER_DAY = 5

// Inflation
DEFAULT_BASE_INFLATION = 0.15  // 15% per purchase
DEFAULT_COOLDOWN_HOURS = 24
```

### Key Functions

```typescript
// Path Configuration
getTemperingLevel(level: number): TemperingLevel | undefined
generateTemperingTaskTemplates(level: number): TaskTemplate[]
getPathLevelConfig(pathId: string, level: number): LevelConfig | undefined
getPathTaskRewards(pathId: string, level: number): TaskRewards

// Shop/Inflation
calculateCurrentPrice(item: ShopItem): number
isOnCooldown(item: ShopItem): boolean
getRemainingCooldown(item: ShopItem): number

// Inventory
calculateIsGhost(inventoryItem: InventoryItem, shopItem: ShopItem): boolean
```

### File Locations

| System | Primary File | Tests |
|--------|--------------|-------|
| Tempering Path | `src/constants/temperingPath.ts` | `src/tests/progression/tempering-xp.test.ts` |
| Path Registry | `src/constants/pathRegistry.ts` | (covered in tempering tests) |
| Shop/Inflation | `src/store/shopStore.ts` | (pending) |
| Inventory | `src/store/inventoryStore.ts` | (pending) |

---

**Document Version:** 1.0  
**Last Updated:** December 22, 2025  
**Maintainer:** Soul Cultivation Development Team
