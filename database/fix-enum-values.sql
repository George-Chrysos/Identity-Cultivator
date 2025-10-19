-- ============================================
-- EMERGENCY FIX: Add Missing Enum Values
-- ============================================
-- This script fixes the identity_type enum to include all 4 types
-- Run this FIRST before attempting any data migration

-- Step 1: Check what enum values currently exist
DO $$
DECLARE
    enum_values TEXT;
BEGIN
    SELECT string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder)
    INTO enum_values
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'identity_type';
    
    RAISE NOTICE 'Current identity_type enum values: %', enum_values;
END$$;

-- Step 2: Add STRATEGIST if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'identity_type' AND e.enumlabel = 'STRATEGIST'
    ) THEN
        ALTER TYPE identity_type ADD VALUE IF NOT EXISTS 'STRATEGIST';
        RAISE NOTICE '✅ Added STRATEGIST to identity_type enum';
    ELSE
        RAISE NOTICE 'ℹ️ STRATEGIST already exists in enum';
    END IF;
END$$;

-- Step 3: Add JOURNALIST if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'identity_type' AND e.enumlabel = 'JOURNALIST'
    ) THEN
        ALTER TYPE identity_type ADD VALUE IF NOT EXISTS 'JOURNALIST';
        RAISE NOTICE '✅ Added JOURNALIST to identity_type enum';
    ELSE
        RAISE NOTICE 'ℹ️ JOURNALIST already exists in enum';
    END IF;
END$$;

-- Step 4: Create RPC function for future enum checks
CREATE OR REPLACE FUNCTION ensure_identity_types()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Add STRATEGIST if missing
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'identity_type' AND e.enumlabel = 'STRATEGIST'
    ) THEN
        ALTER TYPE identity_type ADD VALUE IF NOT EXISTS 'STRATEGIST';
    END IF;

    -- Add JOURNALIST if missing
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'identity_type' AND e.enumlabel = 'JOURNALIST'
    ) THEN
        ALTER TYPE identity_type ADD VALUE IF NOT EXISTS 'JOURNALIST';
    END IF;
END;
$$;

-- Step 5: Verify all enum values
SELECT 
    e.enumlabel as identity_type,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'identity_type'
ORDER BY e.enumsortorder;

RAISE NOTICE '🎉 Enum fix complete! You should see: CULTIVATOR, BODYSMITH, PATHWEAVER, JOURNALIST, STRATEGIST (or similar)';
