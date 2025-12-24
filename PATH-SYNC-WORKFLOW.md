# Path Sync System - Deployment Workflow

## Overview
Constants in code → Auto-sync to database → Serve from database (with cache) → Fallback to constants if DB unavailable

## 🎯 How It Works

### 1. **Make Changes in Constants** (Source of Truth)
```typescript
// src/constants/temperingPath.ts
export const TEMPERING_LEVELS: TemperingLevelConfig[] = [
  {
    level: 1,
    subtitle: 'The Awakening of the Vessel', // ← Edit this
    baseCoins: 30, // ← Or change rewards
    // ...
  }
];
```

### 2. **Bump Sync Version**
```typescript
// src/services/pathSyncService.ts
const CURRENT_SYNC_VERSION = '1.0.1'; // ← Increment this
```

### 3. **Deploy**
```bash
npm run build
# Deploy to Vercel/production
```

### 4. **Automatic Sync** ✨
- On first app load, `syncPathsToDatabase()` runs automatically
- Compares `CURRENT_SYNC_VERSION` with localStorage
- If version changed → Syncs constants to database
- Marks sync complete

### 5. **Users Get Latest Data**
- pathService fetches from database (24h cache)
- Falls back to constants if DB unavailable

---

## 🔄 Sync Triggers

### Auto-sync (Preferred)
```typescript
// main.tsx - runs on app load
syncPathsToDatabase();
```

### Manual sync (Dev tool)
```tsx
// Add to Homepage during alpha
import { PathSyncDebugPanel } from '@/components/debug/PathSyncDebugPanel';

<PathSyncDebugPanel />
```

---

## 📋 Daily Workflow

### Making Content Updates

1. **Edit constants**
   ```typescript
   // Change any values in temperingPath.ts
   baseCoins: 30 → 35
   subtitle: 'Old Text' → 'New Text'
   ```

2. **Bump version**
   ```typescript
   // pathSyncService.ts
   const CURRENT_SYNC_VERSION = '1.0.2'; // Increment
   ```

3. **Deploy**
   ```bash
   npm run build
   # Push to production
   ```

4. **Done!** Next visit syncs automatically

---

## 🛠️ Manual Operations

### Force Sync (Ignores Version)
```typescript
import { forceSyncPaths } from '@/services/pathSyncService';
await forceSyncPaths();
```

### Check Sync Status
```typescript
import { getSyncStatus } from '@/services/pathSyncService';
const status = getSyncStatus();
console.log(status.isSynced); // true/false
```

### Clear Sync Cache
```typescript
// In browser console
localStorage.removeItem('path-sync-version');
location.reload(); // Will re-sync
```

---

## 🏗️ Database Schema

Sync creates/updates:
- `paths` - Path metadata
- `path_levels` - Level configs
- `gates` - Task gates
- `subtasks` - Individual exercises
- `trials` - End-of-level challenges

---

## 🔐 Safety Features

### Upsert Strategy
- Updates existing records (no duplicates)
- Creates missing records
- Safe to run multiple times

### Fallback System
```
Sync fails? → App uses constants
Database down? → pathService uses constants
Network error? → localStorage cache + constants
```

### Alpha Testing Safe
- Only you are using it
- No user data conflicts
- Deploy freely 1-3 times per day

---

## 🎮 Dev Tools

### Debug Panel (Optional)
```tsx
// Add to Homepage.tsx for easy access
import { PathSyncDebugPanel } from '@/components/debug/PathSyncDebugPanel';

return (
  <>
    {/* Your content */}
    <PathSyncDebugPanel /> {/* Bottom-right corner */}
  </>
);
```

Features:
- View sync status
- Manual sync button
- Force sync button
- Real-time feedback

---

## 📊 Sync Flow Diagram

```
┌──────────────────┐
│ Edit Constants   │ (temperingPath.ts)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Bump Version     │ (pathSyncService.ts)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ npm run build    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Deploy to Prod   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ User visits app  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Auto-sync runs   │ (main.tsx)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Database updated │ ✅
└──────────────────┘
         │
         ▼
┌──────────────────┐
│ pathService uses │ DB (24h cache)
│ fresh data       │
└──────────────────┘
```

---

## ✅ Benefits

1. **Single Source of Truth**: Constants in code
2. **Git Tracked**: All changes versioned
3. **Auto-deploy**: No manual DB updates
4. **Zero Downtime**: Fallback to constants
5. **Fast Serving**: Database + 24h cache
6. **Alpha Friendly**: Deploy 1-3x daily safely

---

## 🚀 Example: Daily Update

```typescript
// 1. Edit constants (8:00 AM)
TEMPERING_LEVELS[0].baseCoins = 35; // Was 30

// 2. Bump version
const CURRENT_SYNC_VERSION = '1.0.3';

// 3. Deploy (8:05 AM)
npm run build && vercel --prod

// 4. You visit app (8:10 AM)
// → Auto-syncs → Database updated → Done! ✅

// 5. Next deployment (3:00 PM - same day)
TEMPERING_LEVELS[1].subtitle = 'New Subtitle';
const CURRENT_SYNC_VERSION = '1.0.4';
// → Deploy → Auto-syncs again → Fresh data
```

**No manual SQL. No downtime. Just code & deploy.** 🎯
