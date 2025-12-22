-- Delete seeded quest data from production
-- This removes the mock "Today", "Backlog", and "completed" quests that were seeded

-- IMPORTANT: Quests are stored in browser localStorage, not the database!
-- The quest store uses Zustand persist with key 'quest-store'
-- To clear quests for users, they need to clear localStorage or you can:
-- 1. Have users run: localStorage.removeItem('quest-store') in browser console
-- 2. Or deploy the updated code which no longer seeds mock data

-- If you DO have a quests table in database, run this:
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

-- Verify deletion (if table exists)
-- SELECT COUNT(*) as remaining_quests FROM quests;
