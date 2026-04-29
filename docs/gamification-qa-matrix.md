# Gamification QA Matrix

## Core XP
- Complete main quest with sector selected, verify XP gain and streak increment.
- Complete main quest twice same day, verify allowed reward behavior and diminishing return.
- Complete dashboard task without sector, verify completion requires sector.
- Complete side quest with sector, verify XP ledger entry type is side quest.

## Visits + Decay
- Open same sector twice in one day, verify first visit XP only once.
- Visit same sector on consecutive days, verify streak increases.
- Skip sector visits for 3+ days, verify streak bonus shrinks on return.

## Logs
- Update each Mystic widget once, verify low XP event recorded.
- Spam slider/inputs, verify diminishing returns apply and no crash.

## UX Feedback
- Verify `+XP` toast appears for quest completion, sector visit, and logs.
- Verify header shows main streak and hottest visit streak.
- Verify daily debrief card reports XP by source and top sector.

## Persistence
- With authenticated user, verify `xp_ledger`, `sector_visits`, `quest_completions`, and `main_quest_streaks` rows are written.
- Reload app and verify dashboard state hydration preserves XP/level/streak/ledger state.
