# QUICK FIX CHEAT SHEET

## Error: `invalid input value for enum identity_type: "STRATEGIST"`

### Root Cause
Your PostgreSQL database enum `identity_type` doesn't have `STRATEGIST` or `JOURNALIST` values.

### Solution (2 minutes)

#### 1️⃣ Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

#### 2️⃣ Copy & Paste This:
```sql
-- Add missing values to enum
ALTER TYPE identity_type ADD VALUE IF NOT EXISTS 'STRATEGIST';
ALTER TYPE identity_type ADD VALUE IF NOT EXISTS 'JOURNALIST';
```
Click **RUN**

#### 3️⃣ Migrate PATHWEAVER Data:
```sql
-- Change PATHWEAVER to STRATEGIST
UPDATE public.identities 
SET identity_type = 'STRATEGIST'::identity_type, 
    updated_at = NOW()
WHERE identity_type::text = 'PATHWEAVER';
```
Click **RUN**

#### 4️⃣ Verify:
```sql
-- Should show all your identities with correct types
SELECT user_id, title, identity_type, tier, level 
FROM public.identities 
WHERE is_active = true;
```

#### 5️⃣ In Your App:
- Log out
- Hard refresh (Ctrl+Shift+R)
- Log back in
- ✅ You should see all 4 identities!

---

## Still Missing Identities?

The automatic migration will create missing ones. If not, run this (replace YOUR_USER_ID):

```sql
-- Find your user ID first
SELECT id, email FROM auth.users;

-- Then create missing identities (replace the UUID)
INSERT INTO public.identities (user_id, title, identity_type, tier, level, days_completed, required_days_per_level, is_active)
SELECT 
    'YOUR_USER_ID_HERE'::uuid,
    v.type || ' Path',
    v.type::identity_type,
    'D',
    1,
    0,
    5,
    true
FROM (VALUES ('CULTIVATOR'), ('BODYSMITH'), ('JOURNALIST'), ('STRATEGIST')) AS v(type)
WHERE NOT EXISTS (
    SELECT 1 FROM public.identities i 
    WHERE i.user_id = 'YOUR_USER_ID_HERE'::uuid 
    AND i.identity_type::text = v.type
    AND i.is_active = true
);
```

---

## Contact
If this doesn't work, share:
1. Output from: `SELECT e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'identity_type';`
2. Output from: `SELECT user_id, identity_type FROM public.identities WHERE is_active = true;`
3. Any error messages
