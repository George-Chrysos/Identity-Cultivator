# Database Cleanup Guide - PATHWEAVER Migration

## 🚨 QUICK FIX (Start Here!)

**The error you got means the PostgreSQL enum is missing values. Follow these 3 steps:**

### **Step 1: Fix the Enum** (Copy & paste into Supabase SQL Editor)
```sql
-- Add missing enum values
ALTER TYPE identity_type ADD VALUE IF NOT EXISTS 'STRATEGIST';
ALTER TYPE identity_type ADD VALUE IF NOT EXISTS 'JOURNALIST';

-- Verify it worked
SELECT e.enumlabel FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'identity_type';
```

### **Step 2: Migrate PATHWEAVER** (Run in Supabase SQL Editor)
```sql
UPDATE public.identities 
SET identity_type = 'STRATEGIST'::identity_type
WHERE identity_type::text = 'PATHWEAVER';
```

### **Step 3: Log Out & Back In**
- Log out of your app
- Clear cache (Ctrl+Shift+R)
- Log back in
- You should see all 4 identities!

---

## Problem (Background)
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
If the automatic migration doesn't work, you need to fix the database enum first:

#### **STEP 1: Fix Database Enum (REQUIRED)**
The PostgreSQL enum `identity_type` is missing values. Run this in Supabase SQL Editor:

```sql
-- Check current enum values
SELECT e.enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'identity_type'
ORDER BY e.enumsortorder;

-- Add STRATEGIST
ALTER TYPE identity_type ADD VALUE IF NOT EXISTS 'STRATEGIST';

-- Add JOURNALIST  
ALTER TYPE identity_type ADD VALUE IF NOT EXISTS 'JOURNALIST';

-- Verify (should show all 4+ types)
SELECT e.enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'identity_type'
ORDER BY e.enumsortorder;
```

#### **STEP 2: Browser Console Migration**
After fixing the enum, run this in your browser console (F12):
1. Type: `cleanupDatabase()`
2. Press Enter
3. Wait for "✅ Cleanup complete!" message
4. Refresh the page (Ctrl+Shift+R)

#### Option B: SQL Script (Direct Database)
Run this directly in your Supabase SQL editor:

```sql
-- Step 0: Check current enum values
SELECT e.enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'identity_type'
ORDER BY e.enumsortorder;

-- Step 1: Add STRATEGIST and JOURNALIST to enum if missing
DO $$
BEGIN
    -- Add STRATEGIST if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'identity_type' AND e.enumlabel = 'STRATEGIST'
    ) THEN
        ALTER TYPE identity_type ADD VALUE 'STRATEGIST';
        RAISE NOTICE 'Added STRATEGIST to identity_type enum';
    END IF;

    -- Add JOURNALIST if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'identity_type' AND e.enumlabel = 'JOURNALIST'
    ) THEN
        ALTER TYPE identity_type ADD VALUE 'JOURNALIST';
        RAISE NOTICE 'Added JOURNALIST to identity_type enum';
    END IF;
END$$;

-- Step 2: NOW migrate PATHWEAVER to STRATEGIST (this will work now)
UPDATE public.identities 
SET identity_type = 'STRATEGIST'::identity_type, 
    updated_at = NOW()
WHERE identity_type::text = 'PATHWEAVER';

-- Step 3: Show current identities (verify)
SELECT id, user_id, title, identity_type, tier, level, is_active 
FROM public.identities 
WHERE is_active = true
ORDER BY user_id, identity_type;

-- Step 4: Show progress entries (verify)
SELECT identity_id, level, tier, days_completed, completed_today
FROM public.user_progress
ORDER BY user_id, identity_id;

-- Step 5: Create missing identities for your user (replace YOUR_USER_ID)
DO $$
DECLARE
    v_user_id UUID := 'YOUR_USER_ID'; -- REPLACE WITH YOUR ACTUAL USER ID
    v_identity_id UUID;
    v_types TEXT[] := ARRAY['CULTIVATOR', 'BODYSMITH', 'JOURNALIST', 'STRATEGIST'];
    v_type TEXT;
BEGIN
    FOREACH v_type IN ARRAY v_types
    LOOP
        -- Check if identity type exists for user
        IF NOT EXISTS (
            SELECT 1 FROM public.identities 
            WHERE user_id = v_user_id 
            AND identity_type::text = v_type
            AND is_active = true
        ) THEN
            -- Create identity
            INSERT INTO public.identities (
                user_id, title, identity_type, tier, level, 
                days_completed, required_days_per_level, is_active,
                created_at, updated_at
            ) VALUES (
                v_user_id, v_type || ' Path', v_type::identity_type, 'D', 1,
                0, 5, true,
                NOW(), NOW()
            ) RETURNING id INTO v_identity_id;

            -- Create progress entry
            INSERT INTO public.user_progress (
                user_id, identity_id, days_completed, level, tier,
                completed_today, last_updated_date, streak_days, missed_days
            ) VALUES (
                v_user_id, v_identity_id, 0, 1, 'D',
                false, NOW(), 0, 0
            );

            RAISE NOTICE 'Created % identity', v_type;
        ELSE
            RAISE NOTICE '% identity already exists', v_type;
        END IF;
    END LOOP;
END$$;
```

**IMPORTANT**: In Step 5, replace `'YOUR_USER_ID'` with your actual user ID. To find it, run:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
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
