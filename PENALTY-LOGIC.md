# Penalty and Decay Logic

This document explains how missed days and decay are handled across both local mode and Supabase mode, based on the current codebase (as of Oct 19, 2025).

## TL;DR
- Missing 1–2 days: no automatic penalty; your progress stays where it was.
- Missing 3 or more consecutive days in local mode: decay applies and subtracts days from your current level progress (capped, never goes below 0).
- Supabase mode: decay is not currently applied automatically; only streak recalculates. Level progress is derived from total completions; missing days simply means you didn’t add progress for those days.
- Streak only counts consecutive calendar days; it resets if you miss a day.

---

## Where the logic lives

- Local mode (no Supabase configured):
  - `src/api/cultivatorDatabase.ts` → `updateProgress()` contains the decay check.
  - `recomputeProgressFromHistory()` (store) rebuilds level/tier from local history but does not add additional penalties beyond what has already been applied.

- Supabase mode (online):
  - `src/api/supabaseService.ts` handles completion creation/reversal and recalculates streak and progress from the authoritative `task_completions` table. No decay subtraction is applied here.

---

## Local mode: decay rules

Function: `CultivatorDatabase.updateProgress()`

1) Determine days since last update
- `daysSinceUpdate = getDaysDifference(lastUpdate, today)`
- If `daysSinceUpdate >= 3`, apply decay.

2) Apply decay when >= 3 missed days
- `decayDays = Math.min(daysSinceUpdate, progress.daysCompleted)`
- `newDaysCompleted = Math.max(0, progress.daysCompleted - decayDays)`
- Message appended: `"Lost ${decayDays} days due to inactivity."`
- Notes:
  - Decay subtracts from your current level’s partial progress (`daysCompleted`).
  - It cannot make your partial days negative.
  - It does NOT demote level/tier directly; it only reduces the partial progress toward the next level. Any demotion would only happen if there is separate logic to reduce level/tier—which does not exist here.

3) Daily rollover behavior
- If the last update wasn’t today, `completedToday` is reset to `false`.

4) Completing today
- If you complete today and `completedToday` is false, increment `daysCompleted` by 1.
- If this meets or exceeds `requiredDaysPerLevel`, run level-up logic which may evolve tier and sets `daysCompleted` to the remainder.

### Missed days examples (Local mode)

Assume: requiredDaysPerLevel = 10, you have `daysCompleted = 6` and `completedToday = true` as of last update day.

- Miss 1 day (daysSinceUpdate = 1):
  - No decay. `daysCompleted` stays 6. `completedToday` becomes false for the new day.

- Miss 2 days (daysSinceUpdate = 2):
  - No decay. `daysCompleted` stays 6. `completedToday` is false.

- Miss 3 days (daysSinceUpdate = 3):
  - Decay applies: `decayDays = min(3, 6) = 3`.
  - New `daysCompleted = 6 - 3 = 3`.

- Miss 5 days (daysSinceUpdate = 5):
  - Decay applies: `decayDays = min(5, 6) = 5`.
  - New `daysCompleted = 1`.

- Miss 8+ days with `daysCompleted = 2`:
  - Decay applies: `decayDays = min(8, 2) = 2` → `daysCompleted = 0` (can’t go negative).

Edge note: Decay never reduces below 0 and does not change level/tier, only your partial progress to next level.

---

## Supabase mode: behavior

- Completions are stored as individual rows in `task_completions`.
- Progress is recalculated from the total number of non-reversed completions.
- Streak is recalculated as consecutive days up to today using local-calendar date strings.
- There is currently no decay subtraction in Supabase path; missed days simply don’t add completions, so you don’t progress, and your streak will drop when a day is missed.

Relevant functions:
- `supabaseDB.toggleTaskCompletion`
- `supabaseDB.recalculateProgressFromCompletions`
- `supabaseDB.calculateStreak`

---

## Streak logic (both modes, conceptually)

- Streak counts consecutive completed days up to today.
- If today is completed, start streak at 1, then count backward day-by-day while there are completions.
- If today isn’t completed, start at 0, then count consecutive prior days.

In Supabase mode, this is implemented in `calculateStreak()` using local date strings to avoid timezone drift.

---

## Summary matrix

- 1 missed day:
  - Local: No decay, just no increment; streak resets if today not completed.
  - Supabase: No decay; streak resets if today not completed.

- 2 missed days:
  - Local: No decay; streak resets.
  - Supabase: No decay; streak resets.

- 3+ missed days:
  - Local: Decay subtracts up to `daysSinceUpdate`, capped by your current `daysCompleted`.
  - Supabase: No decay; only streak is affected.

---

## Considerations / potential improvements

- Align decay behavior between local and Supabase paths if decay is desired online (e.g., apply decay during `recalculateProgressFromCompletions`).
- Consider storing `missedDays` and surfacing a DECAY animation event when decay occurs, consistent with `AnimationEvent` type.
- Make required days per level dynamic from detailed identity definitions uniformly in both modes (some paths already consult definitions; Supabase path uses static tier-to-days mapping).
