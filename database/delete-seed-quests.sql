-- Delete seeded quest data from production
-- This removes the mock "Today", "Backlog", and "completed" quests that were seeded

-- Delete all quests with IDs matching the seed pattern
DELETE FROM quests 
WHERE id LIKE 'quest-today-%'
   OR id LIKE 'quest-backlog-%'
   OR id LIKE 'quest-completed-%';

-- Alternative: Delete by title if IDs were generated differently
-- DELETE FROM quests 
-- WHERE title IN (
--   'Complete project documentation',
--   'Review and merge PR #123',
--   'Setup CI/CD pipeline',
--   'Implement user analytics',
--   'Refactor auth logic',
--   'Design system components'
-- );

-- Verify deletion
SELECT COUNT(*) as remaining_quests FROM quests;
