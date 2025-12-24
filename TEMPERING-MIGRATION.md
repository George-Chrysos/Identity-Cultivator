# Tempering Path Migration - Auto-Sync Workflow

## Overview
**Constants are the source of truth.** Database auto-syncs on deployment.

---

## 🚀 Initial Setup (One Time)

### 1. **Create Database Tables**
```sql
-- Run in Supabase SQL Editor
-- Copy and run: database/create-paths-table.sql
```

### 2. **Set Sync Version**
```typescript
// src/services/pathSyncService.ts
const CURRENT_SYNC_VERSION = '1.0.0'; // Starting version
```

### 3. **Deploy**
```bash
npm run build
# Deploy to production
```

### 4. **Visit App**
- App loads → Auto-sync runs → Database populated ✅

**That's it!** Database is now populated from your constants.

---

## 🔄 Daily Update Workflow

### Making Content Changes

```typescript
// 1. Edit constants
// src/constants/temperingPath.ts
TEMPERING_LEVELS[0].baseCoins = 35; // Changed from 30

// 2. Bump version (tells app to re-sync)
// src/services/pathSyncService.ts
const CURRENT_SYNC_VERSION = '1.0.1'; // Increment

// 3. Deploy
npm run build && deploy

// 4. Done! Next app load syncs automatically
```

**No manual SQL needed!** 🎯

---

## 🎮 Optional: Add Debug Panel

For easy testing during alpha:

```tsx
// src/pages/Homepage.tsx
import { PathSyncDebugPanel } from '@/components/debug/PathSyncDebugPanel';

return (
  <>
    {/* Your content */}
    <PathSyncDebugPanel /> {/* Bottom-right panel */}
  </>
);
```

Features:
- View sync status
- Manual sync button
- Force re-sync
- Real-time feedback

---

## ✅ How It Works

### Caching Strategy (24-hour TTL)
```
User Visit 1:
  ├─ Check localStorage → Empty
  ├─ Fetch from Supabase → Success
  ├─ Cache to localStorage (24h)
  └─ Display path

User Visit 2 (within 24h):
  ├─ Check localStorage → Found (valid)
  └─ Display path (0ms, no DB call)

User Visit 3 (after 24h):
  ├─ Check localStorage → Expired
  ├─ Fetch from Supabase → Get latest changes
  ├─ Update cache
  └─ Display path
```

### Graceful Fallback
```
If Supabase fails:
  ├─ pathService catches error
  ├─ Falls back to constants/temperingPath.ts
  ├─ User sees data (offline-ready)
  └─ Logs error for debugging
```

---

## 🔄 Making Content Updates

### Option A: Supabase Dashboard (Recommended)
1. Go to Supabase → Table Editor
2. Edit `path_levels`, `gates`, or `subtasks`
3. **Done!** Users see changes after 24h (or on cache clear)

### Option B: SQL Editor
```sql
-- Example: Update Level 1 subtitle
UPDATE path_levels 
SET subtitle = 'The New Awakening'
WHERE path_id = 'tempering-warrior-trainee' AND level = 1;

-- Example: Update a gate's focus
UPDATE gates
SET focus_description = 'New instructions here'
WHERE gate_name = 'rooting' 
AND path_level_id = (
  SELECT id FROM path_levels 
  WHERE path_id = 'tempering-warrior-trainee' AND level = 1
);
```

### Option C: Re-run Seed Script
```sql
-- Edit database/seed-tempering-path-new.sql
-- Then run in SQL Editor
-- ON CONFLICT clauses ensure safe updates
```

---

## 🧪 Testing Changes

### Clear Cache Manually
```typescript
// In browser console:
localStorage.removeItem('path-cache');
location.reload();
```

### Or use pathService
```typescript
import { pathService } from '@/services/pathService';
pathService.clearPathCache();
```

---

## 📊 Current Implementation Status

### ✅ Complete
- pathService with DB + caching + fallback
- pathStore (Zustand) for reactive state
- 24-hour cache TTL
- All 10 levels seeded

### ⚠️ Not Yet Implemented
- Components still import directly from constants
- Need to update:
  - `src/hooks/useTransformedIdentity.ts`
  - `src/pages/Homepage.tsx`
  - Tests (optional, can keep using constants)

---

## 🔮 Future: Component Integration

When ready to fully migrate components:

```typescript
// Before (constants)
import { getTemperingLevel } from '@/constants/temperingPath';
const config = getTemperingLevel(level);

// After (pathStore)
import { usePathStore } from '@/store/pathStore';

const MyComponent = () => {
  const loadPath = usePathStore(s => s.loadPath);
  const getLevel = usePathStore(s => s.getPathLevel);
  
  useEffect(() => {
    loadPath('tempering-warrior-trainee');
  }, [loadPath]);
  
  const config = getLevel('tempering-warrior-trainee', level);
  // ...
};
```

**For now:** Constants work as fallback, so deploy is safe!

---

## 🎯 Summary

**To deploy Tempering Path changes:**
1. Run `create-paths-table.sql` in Supabase
2. Run `seed-tempering-path-new.sql` in Supabase
3. Deploy code (pathService handles everything)
4. Update content anytime in Supabase Dashboard
5. Users see changes after 24h (daily cache refresh)

**Zero downtime. Zero breaking changes. Full backward compatibility.**
