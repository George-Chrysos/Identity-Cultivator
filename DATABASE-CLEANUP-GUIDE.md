# Database Cleanup Guide - PATHWEAVER Migration

## Problem
Existing users have legacy `PATHWEAVER` identities in the database that need to be migrated to `STRATEGIST`, and may be missing other identity types (JOURNALIST).

## Solution Implemented

### 1. Automatic Migration (Runs on Login)
When you log in, the system now automatically:
- ✅ Migrates any `PATHWEAVER` identities to `STRATEGIST`
- ✅ Creates any missing identity types (CULTIVATOR, BODYSMITH, JOURNALIST, STRATEGIST)
- ✅ Ensures all identities have matching progress entries
- ✅ Logs all actions for debugging

**Location**: `src/store/cultivatorStore.ts` → `loadUserData()` function

### 2. Manual Cleanup (If Automatic Fails)
If the automatic migration doesn't work, you can manually trigger it:

#### Option A: Browser Console (Easiest)
1. Open your app in development mode
2. Open browser console (F12)
3. Type: `cleanupDatabase()`
4. Press Enter
5. Wait for "✅ Cleanup complete!" message
6. Refresh the page (Ctrl+Shift+R)

#### Option B: SQL Script (Direct Database)
Run this directly in your Supabase SQL editor:

```sql
-- Step 1: Migrate PATHWEAVER to STRATEGIST
UPDATE public.identities 
SET identity_type = 'STRATEGIST', 
    updated_at = NOW()
WHERE identity_type::text = 'PATHWEAVER';

-- Step 2: Show current identities (verify)
SELECT id, user_id, title, identity_type, tier, level, is_active 
FROM public.identities 
WHERE is_active = true
ORDER BY user_id, identity_type;

-- Step 3: Show progress entries (verify)
SELECT identity_id, level, tier, days_completed, completed_today
FROM public.user_progress
ORDER BY user_id, identity_id;
```

## Expected Outcome
After migration, you should see **4 identities**:
1. **CULTIVATOR** - Seed/Growth path
2. **BODYSMITH** - Physical cultivation path  
3. **JOURNALIST** - Documentation/reflection path
4. **STRATEGIST** - Planning/strategy path (was PATHWEAVER)

## Files Modified
- ✅ `src/utils/migrateUserData.ts` - New migration utility
- ✅ `src/utils/cleanupDatabase.ts` - Manual cleanup tool
- ✅ `src/store/cultivatorStore.ts` - Auto-run migration on load
- ✅ `src/main.tsx` - Expose cleanup function in dev mode
- ✅ `src/api/supabaseService.ts` - Better error handling & auto-heal
- ✅ `src/pages/CultivatorHomepage.tsx` - Defensive rendering with fallback

## Testing Steps
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Log out** completely
3. **Hard refresh** (Ctrl+Shift+R)
4. **Log back in**
5. **Check console** for migration logs
6. **Verify** you see 4 identity cards

## Troubleshooting

### Still seeing PATHWEAVER after refresh?
Open console and check for error messages. If you see any, run:
```javascript
cleanupDatabase()
```

### Missing JOURNALIST or STRATEGIST?
Check the console logs. The migration should create them automatically. If not, run the SQL script in Option B above.

### Progress data missing?
The system now auto-creates missing progress entries. Check console for:
```
✅ Auto-created missing progress entry
```

### Nothing works?
Contact support with:
1. Browser console logs (F12 → Console tab)
2. Your user ID (visible in console logs)
3. Screenshot of what you see

## Why This Happened
- Legacy identity type `PATHWEAVER` was renamed to `STRATEGIST` in recent updates
- Database migration script may not have run or was added after your user was created
- The frontend was normalizing PATHWEAVER → STRATEGIST in memory, but not in database
- This caused sync issues and prevented proper rendering

## Prevention
- ✅ Migration now runs automatically on every login
- ✅ System self-heals missing data
- ✅ Better error logging for debugging
- ✅ Defensive rendering (shows identities even if data is incomplete)
