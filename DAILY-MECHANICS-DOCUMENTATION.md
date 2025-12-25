# Daily Mechanics Documentation - Identity Cultivator

## Overview
This document explains how Identity Cultivator tracks daily progress, manages streaks, handles task/quest completion, and implements the Chronos Reset system (daily reset). It answers key questions about calendar view feasibility and historical data tracking.

---

## Table of Contents
1. [Streak Accumulation System](#1-streak-accumulation-system)
2. [Task Completion Flow](#2-task-completion-flow)
3. [Quest Completion & Transfer](#3-quest-completion--transfer)
4. [Daily Reset (Chronos Reset)](#4-daily-reset-chronos-reset)
5. [Day Detection Mechanism](#5-day-detection-mechanism)
6. [Historical Records in Database](#6-historical-records-in-database)
7. [Calendar View Feasibility](#7-calendar-view-feasibility)

---

## 1. Streak Accumulation System

### Question: How do we implement the current streak accumulation?

**Answer:**

Streaks are managed **per Path (Identity)** and follow this logic:

#### Streak Increment Logic
- **Location:** `src/components/path/PathCard.tsx` (handleTaskComplete)
- **Trigger:** When ALL tasks for a path are completed for the first time in a day
- **Formula:** `newStreak = currentStreak + 1`

**Key Rules:**
1. Streak only increments when **completing the LAST uncompleted task** on a path
2. Streak does NOT increment per individual task (only once per day when all tasks done)
3. Streak is stored in `player_identities.current_streak` in the database
4. The UI shows streak in the `StreakCounter` component

#### Implementation Details

```typescript
// From PathCard.tsx (lines ~285-310)
if (newCompletedTasks.size === tasks.length && !allTasksWereCompleted) {
  newStatus = 'completed';
  newStreak = streak + 1;
  newAllTasksCompleted = true;

  // Persist streak update to database
  if (identityId && onAllTasksComplete) {
    try {
      await onAllTasksComplete(newStreak);
    } catch (error) {
      logger.error('Failed to persist streak', { error });
    }
  }

  // Check for milestone/sub-milestone rewards
  // Milestone formula: (2 * currentLevel) + 1
  const milestone = getMilestoneForLevel(currentLevel);
  const isSubMilestone = isSubMilestoneDay(newStreak, currentLevel);
  
  if (isSubMilestone) {
    // Award sub-milestone rewards (day 7, day 14 for higher levels)
    const rewards = SUB_MILESTONE_REWARDS;
    updateRewards(rewards.rewards.coins, 'WILL', rewards.willGain, rewards.rewards.stars);
  }
  
  if (milestone && newStreak >= milestone.milestoneDays) {
    // Award milestone rewards and advance to next level
    awardMilestoneRewards(milestone, updateRewards, setMilestoneRewardsData, setShowMilestoneCelebration);
  }
}
```

#### Streak State Storage

**In-Memory (Zustand Store):**
- `gameStore.activeIdentities[].current_streak`
- Updated optimistically in UI
- Synced to database on completion

**In Database (Supabase):**
- Table: `player_identities`
- Column: `current_streak` (INTEGER)
- Updated via: `gameDB.updateIdentity(identityId, { current_streak })`

---

## 2. Task Completion Flow

### Question: How do we implement task completion?

**Answer:**

Task completion follows a **two-tier tracking system**:
1. **Daily Task State** (ephemeral, resets daily)
2. **Task Logs** (permanent history in database)

### Daily Task State (Ephemeral)

**Storage:** `gameStore.dailyTaskStates`

```typescript
interface DailyTaskState {
  completedTasks: string[];      // Task template IDs completed today
  completedSubtasks: string[];   // Subtask IDs completed today
  date: string;                   // ISO date to detect day changes
}

// Structure
dailyTaskStates: Record<identityId, DailyTaskState>
```

**Purpose:** Track which tasks are checked/unchecked in the UI today.

**Lifecycle:**
- Created: When first task is clicked on a path
- Updated: Each time user checks/unchecks a task
- Cleared: During Chronos Reset (midnight)
- Validated: Date field ensures stale data is ignored

**Implementation:**

```typescript
// Setting a task as completed
setCompletedTask: (identityId: string, taskId: string, completed: boolean) => {
  const today = getTodayDate();
  const { dailyTaskStates } = get();
  const currentState = dailyTaskStates[identityId];
  
  // If state is from a previous day, start fresh
  const baseState: DailyTaskState = currentState?.date === today 
    ? currentState 
    : { completedTasks: [], completedSubtasks: [], date: today };
  
  const updatedTasks = new Set(baseState.completedTasks);
  if (completed) {
    updatedTasks.add(taskId);
  } else {
    updatedTasks.delete(taskId);
  }
  
  set({
    dailyTaskStates: {
      ...dailyTaskStates,
      [identityId]: {
        ...baseState,
        completedTasks: Array.from(updatedTasks),
      },
    },
  });
}
```

### Task Completion Rewards

**Implementation:** `src/components/path/PathCard.tsx`

When a task is completed:
1. **Get Rewards** from Path Registry (source of truth):
   ```typescript
   const taskRewards = getTaskRewardsFromPath(task);
   // Returns: { coins, stat, points }
   ```

2. **Award Immediately** (optimistic update):
   ```typescript
   updateRewards(
     taskRewards.coins,      // Coin reward
     taskRewards.stat,       // 'BODY', 'MIND', 'SOUL', 'WILL'
     taskRewards.points      // Stat points
   );
   ```

3. **Database Call** (via `gameDB.completeTask`):
   - Creates entry in `task_logs` table
   - Updates `profiles` table (coins, stat_points)
   - Returns updated profile + identity data

4. **No Duplicate Rewards:**
   - The database does NOT increment rewards again
   - It only logs the completion event
   - All reward logic is in the frontend (PathCard)

### Task Logs (Permanent History)

**Table:** `task_logs`

```sql
CREATE TABLE public.task_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    identity_instance_id UUID NOT NULL,
    task_template_id VARCHAR(100) NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    stat_points_earned NUMERIC(10, 2),
    coins_earned INTEGER,
    xp_earned INTEGER
);
```

**Purpose:** 
- Historical record of all task completions
- Can reconstruct daily activity for analytics
- Used for progress tracking and achievements

**When Created:**
- When `gameDB.completeTask()` is called
- Happens AFTER optimistic UI update
- Only logs the FIRST completion (not re-checks)

---

## 3. Quest Completion & Transfer

### Question: How do we implement quest completion and transfer?

**Answer:**

Quests are managed by `questStore.ts` and follow different rules than Path tasks.

### Quest Completion

**Storage:** `questStore.quests[]`

```typescript
interface Quest {
  id: string;
  title: string;
  date: string;            // Formatted date: "Jan 12"
  status: 'today' | 'completed';
  difficulty?: QuestDifficulty; // 'Easy', 'Moderate', 'Difficult', 'Hard', 'Hell'
  isRecurring?: boolean;   // If true, resets daily
  completedAt?: string;    // ISO timestamp when completed
  subtasks?: SubQuest[];
}
```

**Completion Flow:**

1. **User clicks quest checkbox**
2. **Toggle Status:**
   ```typescript
   completeQuest: async (questId) => {
     const quest = prevQuests.find(q => q.id === questId);
     const isCompleted = quest.status === 'completed';
     const newStatus = isCompleted ? 'today' : 'completed';
     const completedAt = isCompleted ? undefined : new Date().toISOString();
   }
   ```

3. **Award/Deduct Coins:**
   ```typescript
   const difficulty = quest.difficulty || 'Easy';
   const coinReward = QUEST_COIN_REWARDS[difficulty];
   // Easy: 10, Moderate: 20, Difficult: 30, Hard: 40, Hell: 50
   
   const coinDelta = isCompleted ? -coinReward : coinReward;
   const newCoins = Math.max(0, userProfile.coins + coinDelta);
   
   await gameDB.updateProfile(userProfile.id, { coins: newCoins });
   ```

4. **Update Game Store:**
   ```typescript
   gameStoreModule.useGameStore.setState({ userProfile: updatedProfile });
   ```

### Quest Transfer (Daily Migration)

**Trigger:** Chronos Reset (daily reset)

**Two Types of Quests:**

1. **Recurring Quests** (`isRecurring: true`):
   - Reset to 'today' status every day
   - Date updated to new day
   - `completedAt` cleared
   - Example: Daily habits

2. **Non-Recurring Quests** (`isRecurring: false`):
   - If incomplete: Moved to today's date
   - If completed: Stays on completion date (history preserved)
   - Example: One-time tasks

**Implementation:** `questStore.ts`

```typescript
resetRecurringQuests: (newDate: Date) => {
  const newDateFormatted = getDateFormatted(newDate);
  
  set((state) => ({
    quests: state.quests.map(quest => {
      if (!quest.isRecurring) return quest;
      
      return {
        ...quest,
        date: newDateFormatted,
        status: 'today' as const,
        completedAt: undefined,
      };
    }),
  }));
}

moveIncompleteQuestsToDate: (newDate: Date) => {
  const newDateFormatted = getDateFormatted(newDate);
  
  set((state) => ({
    quests: state.quests.map(quest => {
      // Skip completed quests
      if (quest.status === 'completed') return quest;
      
      // Skip recurring quests (handled by resetRecurringQuests)
      if (quest.isRecurring) return quest;
      
      // Move non-recurring incomplete quests to new date
      return { ...quest, date: newDateFormatted, status: 'today' as const };
    }),
  }));
}
```

### Quest Difficulty Escalation

Quests increase in difficulty if left incomplete for multiple days:

```typescript
export const DIFFICULTY_ESCALATION = {
  MODERATE: 3,    // 3 days → Moderate
  DIFFICULT: 10,  // 10 days → Difficult
  HARD: 20,       // 20 days → Hard (then Hell)
} as const;

export const getEscalatedDifficulty = (
  currentDifficulty: QuestDifficulty | undefined, 
  daysNotCompleted: number
): QuestDifficulty => {
  if (daysNotCompleted >= 20) return 'Hell';
  if (daysNotCompleted >= 10) return 'Hard';
  if (daysNotCompleted >= 3) return 'Difficult';
  return currentDifficulty || 'Easy';
};
```

---

## 4. Daily Reset (Chronos Reset)

### Question: What happens when a day passes?

**Answer:**

The Chronos Reset system runs a full daily reset algorithm:

**Trigger:** Detected by `useChronosReset` hook

**Algorithm:** (Located in `src/hooks/useChronosReset.ts`)

```typescript
executeReset: async () => {
  // Step D: Create daily snapshot BEFORE any changes
  const snapshot = createDailySnapshot();
  await gameDB.saveDailyRecord(snapshot);
  
  // Step A & B: Path Evaluation and Task Reset
  // - Check if all tasks were completed yesterday
  // - If YES: Keep streak as-is (will increment when today's tasks done)
  // - If NO: Reset streak to 0
  await gameStore.resetDailyProgress(previousDayTaskStates);
  
  // Step C: Quest Migration
  // - Reset recurring quests to 'today'
  // - Move incomplete non-recurring quests to today
  for (const quest of quests) {
    if (quest.isRecurring) {
      await updateQuest(quest.id, {
        date: todayFormatted,
        status: 'today',
      });
    } else if (quest.status !== 'completed') {
      await updateQuest(quest.id, {
        date: todayFormatted,
        status: 'today',
      });
    }
  }
  
  // Step E: Update last reset date
  await updateLastResetDate(today);
  
  // Show dawn summary modal
  setShowDawnSummary(true);
}
```

### Path Evaluation Logic

**Location:** `gameStore.resetDailyProgress()`

```typescript
resetDailyProgress: async (previousDayTaskStates?: Record<string, DailyTaskState>) => {
  const taskStatesToEvaluate = previousDayTaskStates || dailyTaskStates;
  
  const updatedIdentities = activeIdentities.map((identity) => {
    // Check if ALL tasks were completed yesterday
    const state = taskStatesToEvaluate[identity.id];
    const completedTaskIds = state ? new Set(state.completedTasks) : new Set<string>();
    const totalTasks = identity.available_tasks?.length || 0;
    const allTasksCompleted = totalTasks > 0 && completedTaskIds.size === totalTasks;
    
    // KEEP streak if all tasks done, RESET to 0 if not
    const newStreak = allTasksCompleted ? identity.current_streak : 0;
    
    return {
      ...identity,
      completed_today: false,  // Reset for new day
      current_streak: newStreak,
    };
  });
  
  // Persist to database
  for (const identity of updatedIdentities) {
    await gameDB.updateIdentity(identity.id, {
      current_streak: identity.current_streak,
    });
  }
  
  // Clear daily task states
  set({ dailyTaskStates: {} });
}
```

**Key Insight:** 
- Streaks are NOT incremented during reset
- They are only PRESERVED or RESET
- Increment happens when user completes tasks TODAY (in PathCard)

---

## 5. Day Detection Mechanism

### Question: How do we check if a day has passed?

**Answer:**

Day changes are detected by comparing dates in the user profile.

### Detection Point

**Hook:** `useChronosReset` (src/hooks/useChronosReset.ts)

```typescript
useEffect(() => {
  if (!userProfile) return;
  
  const today = getTodayISO();  // e.g., "2025-12-25"
  const lastReset = userProfile.last_reset_date;
  
  // If no last reset date or dates differ, trigger reset
  if (!lastReset || lastReset !== today) {
    logger.info('Day change detected, triggering Chronos Reset', { 
      lastReset, 
      today 
    });
    executeReset();
  }
}, [userProfile]);
```

### Date Comparison

**Format:** ISO date strings (YYYY-MM-DD)

**Source:** 
- Production: `new Date().toISOString().split('T')[0]`
- Testing Mode: `testingStore.testingDate` (allows time travel)

**Database Field:**
- Table: `profiles`
- Column: `last_reset_date` (VARCHAR or DATE)
- Updated: After every Chronos Reset

### Testing Mode Support

The system supports manual time travel for testing:

```typescript
const getTodayISO = (): string => {
  // Check if testing mode is active
  const testingStore = (window as any).__testingStore;
  if (testingStore) {
    const state = testingStore.getState();
    if (state.isTestingMode) {
      return new Date(state.testingDate).toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
};
```

### Why This Works

1. **App loads** → `useChronosReset` checks `userProfile.last_reset_date`
2. **Date differs** → Runs Chronos Reset algorithm
3. **Date same** → No reset, normal operation
4. **Manual trigger** → Available via `executeManualReset()` for testing

---

## 6. Historical Records in Database

### Question: What historic records do we keep in the database to understand what happened the previous days?

**Answer:**

We maintain **three types of historical records**:

### 6.1 Daily Records (Snapshots)

**Table:** `daily_records`

```sql
CREATE TABLE public.daily_records (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE NOT NULL,  -- The day this record represents (YYYY-MM-DD)
    
    -- Path statistics (JSONB array)
    path_stats JSONB NOT NULL DEFAULT '[]',
    
    -- Quest metrics
    quests_completed INT DEFAULT 0,
    
    -- Economy metrics
    total_coins_earned INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);
```

**Path Stats Structure:**

```typescript
interface PathDailyStat {
  path_id: string;
  path_name: string;
  completed_count: number;  // How many tasks completed
  total_count: number;      // Total tasks for this path
  streak_before: number;    // Streak at start of day
  streak_after: number;     // Streak at end of day (after evaluation)
}
```

**Example Record:**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "date": "2025-12-24",
  "path_stats": [
    {
      "path_id": "tempering-path",
      "path_name": "Tempering Path",
      "completed_count": 3,
      "total_count": 3,
      "streak_before": 5,
      "streak_after": 6
    }
  ],
  "quests_completed": 4,
  "total_coins_earned": 150,
  "created_at": "2025-12-25T00:00:00Z"
}
```

**Creation Time:** BEFORE Chronos Reset runs (snapshot of yesterday)

**Retention:** Last 90 days (configurable via cleanup function)

### 6.2 Task Logs (Completion History)

**Table:** `task_logs`

```sql
CREATE TABLE public.task_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    identity_instance_id UUID NOT NULL,
    task_template_id VARCHAR(100) NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    stat_points_earned NUMERIC(10, 2),
    coins_earned INTEGER,
    xp_earned INTEGER
);
```

**Purpose:**
- Granular completion history
- Can reconstruct exact completion times
- Used for analytics and streaks validation

**Example Queries:**

```sql
-- Get all completions for a specific day
SELECT * FROM task_logs 
WHERE user_id = 'uuid' 
  AND DATE(completed_at) = '2025-12-24';

-- Count completions per path per day
SELECT 
  identity_instance_id,
  DATE(completed_at) as completion_date,
  COUNT(*) as completions
FROM task_logs 
WHERE user_id = 'uuid'
GROUP BY identity_instance_id, DATE(completed_at);
```

### 6.3 Player Identity Progress

**Table:** `player_identities`

```sql
CREATE TABLE public.player_identities (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 1,
    current_xp INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    will_contribution NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:**
- Current state of each path
- Streak tracking (current value)
- Level/XP progression
- Will points earned

**Note:** This is current state, not history. Daily snapshots are in `daily_records`.

### Historical Data Capabilities

**What We Can Reconstruct:**
✅ Daily task completion counts per path
✅ Streak progression over time
✅ Quest completion rates
✅ Coin earning trends
✅ Path completion patterns
✅ Specific task completion timestamps

**What We Cannot Reconstruct:**
❌ Exact order of task completions within a day (unless using `task_logs.completed_at`)
❌ Times when tasks were unchecked/rechecked (only final state)
❌ Real-time progression snapshots (only daily snapshots)

---

## 7. Calendar View Feasibility

### Question: If we had a calendar view, would we be able to populate it properly?

**Answer:** **YES**, but with some limitations.

### What We CAN Display

#### 7.1 Daily Completion Status (Per Path)

**Data Source:** `daily_records.path_stats`

```typescript
// For each day in calendar
const getDayStatus = async (userId: string, date: string) => {
  const record = await supabase
    .from('daily_records')
    .select('path_stats')
    .eq('user_id', userId)
    .eq('date', date)
    .single();
  
  return record.path_stats.map((stat: PathDailyStat) => ({
    pathName: stat.path_name,
    completed: stat.completed_count === stat.total_count,
    progress: `${stat.completed_count}/${stat.total_count}`,
    streakChange: stat.streak_after - stat.streak_before,
  }));
};
```

**Calendar Cell Display:**
```
Dec 24
----
✅ Tempering Path (3/3) +1
⚠️ Scholar Path (2/3) -streak
❌ Artist Path (0/3) -streak
Quests: 4/6
```

#### 7.2 Streak Progression

**Data Source:** `daily_records.path_stats.streak_after`

Can display a streak heatmap:
- Green: Streak increased
- Yellow: Streak maintained
- Red: Streak broken

#### 7.3 Quest Completion

**Data Source:** 
- `daily_records.quests_completed` (aggregated count)
- `quests[]` with `completedAt` timestamps (detailed)

Can show:
- Number of quests completed per day
- Specific quest titles completed
- Difficulty levels completed

#### 7.4 Economic Activity

**Data Source:** `daily_records.total_coins_earned`

Can display:
- Total coins earned per day
- Coin earning trends over time
- Daily/weekly/monthly summaries

### What We CANNOT Display (Without Additional Data)

#### 7.5 Individual Task Details

**Missing:** Which specific tasks were completed

**Why:** `daily_records.path_stats` only stores aggregated counts, not task IDs

**Workaround:** Use `task_logs` table:

```sql
SELECT 
  tt.name as task_name,
  tl.completed_at
FROM task_logs tl
JOIN task_templates tt ON tl.task_template_id = tt.id
WHERE tl.user_id = 'uuid' 
  AND DATE(tl.completed_at) = '2025-12-24';
```

#### 7.6 Intra-Day Progress

**Missing:** Real-time snapshots of progress throughout the day

**Why:** Only end-of-day snapshots are stored

**Workaround:** Show completion times from `task_logs.completed_at` for a timeline view

### Recommended Calendar Implementation

**Data Structure:**

```typescript
interface CalendarDay {
  date: string;              // "2025-12-24"
  
  // Path completion status
  paths: {
    name: string;
    completed: boolean;
    progress: string;        // "3/3"
    streakChange: number;    // +1, 0, -5
  }[];
  
  // Quest metrics
  quests: {
    total: number;
    completed: number;
  };
  
  // Economic metrics
  coinsEarned: number;
  
  // Milestones/achievements
  milestones?: string[];     // ["Level 5 Reached", "50-day Streak!"]
}
```

**Query:**

```typescript
const getCalendarData = async (userId: string, startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('daily_records')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  
  return data.map(record => ({
    date: record.date,
    paths: record.path_stats.map((stat: PathDailyStat) => ({
      name: stat.path_name,
      completed: stat.completed_count === stat.total_count,
      progress: `${stat.completed_count}/${stat.total_count}`,
      streakChange: stat.streak_after - stat.streak_before,
    })),
    quests: {
      total: record.quests_completed,  // Assuming this is stored
      completed: record.quests_completed,
    },
    coinsEarned: record.total_coins_earned,
  }));
};
```

### Calendar Features We Can Build

**Fully Supported:**
✅ Monthly view with daily completion indicators
✅ Streak heatmap (color-coded by streak status)
✅ Click day → See detailed breakdown
✅ Filter by specific path
✅ Export to CSV for analytics
✅ Comparison view (this week vs last week)
✅ Achievement timeline

**Partially Supported (needs `task_logs`):**
⚠️ Task-level completion details
⚠️ Completion time breakdown
⚠️ Activity timeline (when during the day tasks were done)

**Not Supported:**
❌ Real-time progress during the day (only end-of-day snapshot)
❌ Historical undo/redo actions (only final state)

---



## Summary

### Key Takeaways

1. **Streaks:** SHOULD increment once per day when ALL path tasks are completed (not per task) - **BUT CURRENTLY BUGGY**
2. **Tasks:** Tracked in two places - ephemeral `dailyTaskStates` (UI) + permanent `task_logs` (history)
3. **Quests:** Separate system with recurring/non-recurring logic, migrated daily
4. **Daily Reset:** Chronos Reset runs automatically on day change, evaluates streaks, clears UI state
5. **Day Detection:** Compare `last_reset_date` in profile with current date
6. **History:** Three tables - `daily_records` (snapshots), `task_logs` (completions), `player_identities` (current state)
7. **Calendar View:** Feasible with good detail level, but task-specific details require joining `task_logs`

### Potential Improvements for Calendar View

If building a calendar view, consider:

1. **Add to `daily_records`:**
   - `task_details` JSONB field with completed task IDs/names
   - `session_times` JSONB with start/end times of work sessions

2. **Index Optimization:**
   ```sql
   CREATE INDEX idx_task_logs_user_date ON task_logs(user_id, DATE(completed_at));
   CREATE INDEX idx_daily_records_date_range ON daily_records(user_id, date DESC);
   ```

3. **Materialized View for Analytics:**
   ```sql
   CREATE MATERIALIZED VIEW user_weekly_stats AS
   SELECT 
     user_id,
     DATE_TRUNC('week', date) as week_start,
     COUNT(*) as days_with_activity,
     SUM(quests_completed) as total_quests,
     SUM(total_coins_earned) as total_coins
   FROM daily_records
   GROUP BY user_id, DATE_TRUNC('week', date);
   ```

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Author:** AI Assistant analyzing Identity Cultivator codebase
