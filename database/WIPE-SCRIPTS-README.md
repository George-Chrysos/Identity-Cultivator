# Database Wipe Scripts Documentation

## Overview
These SQL scripts are provided to reset user data when deploying new versions or for individual user resets.

## Scripts

### 1. `wipe-all-users-data.sql`
**Purpose**: Complete database reset for all users (production deployment)

**Use Case**: When deploying a new major version that requires all users to start fresh

**What it does**:
- Deletes all daily records
- Deletes all task completions
- Deletes all user progress
- Deletes all identities
- Resets all profiles to tier D with 0 days active
- **Preserves**: auth.users (authentication remains intact)

**How to run** (Supabase SQL Editor):
```sql
-- Copy and paste the entire contents of wipe-all-users-data.sql
-- Review the transaction carefully
-- Execute
```

**Safety**: Wrapped in a transaction (BEGIN/COMMIT) for atomicity. Includes verification query at the end.

---

### 2. `wipe-user-data.sql`
**Purpose**: Reset individual user data

**Use Case**: Single user wants to reset their progress (used by Reset Button in app)

**What it does**:
- Deletes specified user's daily records
- Deletes specified user's task completions
- Deletes specified user's user progress
- Deletes specified user's identities
- Resets user's profile to tier D with 0 days active
- **Preserves**: User's authentication and profile entry

**How to run** (Manual - Supabase SQL Editor):
```sql
-- Replace :user_id with actual UUID
-- Example:
-- WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
```

**Automated Usage**: The app's Reset Button automatically executes this logic via `resetUserService.ts`

---

## Reset Button Feature

### Location
Player menu dropdown (click on player name/avatar in top-left of header)

### Behavior
1. User opens player menu
2. User clicks "Reset User" button (with ⚠️ icon)
3. Browser confirmation dialog appears with detailed warning
4. User confirms action
5. Service executes wipe operations
6. Local storage cleared (except auth - user stays logged in)
7. Page reloads with fresh state

### Files Involved
- **Service**: `src/services/resetUserService.ts`
- **Menu Integration**: `src/components/player/PlayerMenu.tsx`

### Data Cleared
- **Database**: All user-specific records (identities, progress, completions, daily records)
- **Profile**: Reset to tier D, 0 days active (profile entry preserved)
- **Local Storage**: game-store, quest-store, shop-store, toast-store
- **Preserved**: auth-store (user remains logged in)

---

## Important Notes

⚠️ **These operations are IRREVERSIBLE**
- Always backup database before running all-users wipe
- Test on development/staging environment first
- User confirmation modal warns of permanent deletion

✅ **Authentication Preserved**
- Users remain logged in after reset
- Profile entries remain (just reset to initial values)
- No need to re-authenticate

🔄 **Clean State Guarantee**
- All foreign key constraints respected
- Deletion order prevents constraint violations
- Transaction safety in all-users script
