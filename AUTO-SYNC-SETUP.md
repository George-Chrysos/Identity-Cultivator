# Auto-Sync System - Complete Setup

## ✅ What Was Built

### 1. **Path Sync Service** ([pathSyncService.ts](src/services/pathSyncService.ts))
- Syncs constants → database automatically
- Version-based sync (only when needed)
- Upserts all path data (levels, gates, subtasks, trials)

### 2. **Auto-Sync on App Load** ([main.tsx](src/main.tsx))
- Runs `syncPathsToDatabase()` on startup
- Non-blocking (runs in background)
- Graceful failure handling

### 3. **Smart Path Service** ([pathService.ts](src/services/pathService.ts))
- Tries database first
- Auto-syncs if data missing
- Falls back to constants if sync fails
- 24-hour caching

### 4. **Debug Panel** ([PathSyncDebugPanel.tsx](src/components/debug/PathSyncDebugPanel.tsx))
- View sync status
- Manual sync button
- Force sync option
- Real-time feedback

### 5. **Documentation**
- [PATH-SYNC-WORKFLOW.md](PATH-SYNC-WORKFLOW.md) - Daily workflow guide
- [TEMPERING-MIGRATION.md](TEMPERING-MIGRATION.md) - Updated migration guide

---

## 🚀 How to Use

### Initial Setup (One Time)

1. **Create database tables**
   ```sql
   -- Run in Supabase: database/create-paths-table.sql
   ```

2. **Set initial version**
   ```typescript
   // src/services/pathSyncService.ts (already set)
   const CURRENT_SYNC_VERSION = '1.0.0';
   ```

3. **Deploy & visit app**
   - Auto-sync runs
   - Database populated ✅

---

### Daily Updates (1-3x per day)

1. **Edit constants**
   ```typescript
   // src/constants/temperingPath.ts
   TEMPERING_LEVELS[0].baseCoins = 35; // Change anything
   ```

2. **Bump version**
   ```typescript
   // src/services/pathSyncService.ts
   const CURRENT_SYNC_VERSION = '1.0.1'; // Increment
   ```

3. **Deploy**
   ```bash
   npm run build
   ```

4. **Visit app → Auto-syncs** ✅

---

## 🎯 Key Features

### Version-Based Sync
```
localStorage: '1.0.0'
Code version: '1.0.1'
→ Sync triggered ✓

localStorage: '1.0.1'
Code version: '1.0.1'
→ Skip sync (already up-to-date)
```

### Triple Fallback System
```
1. Try database → Success ✓
2. Database empty → Auto-sync → Retry ✓
3. Sync fails → Use constants ✓
```

### Smart Caching
```
Visit 1: DB → Cache → Display (300ms)
Visit 2 (within 24h): Cache → Display (0ms)
Visit 3 (after 24h): DB → Update cache → Display
```

---

## 🛠️ Dev Tools

### Add Debug Panel (Optional)
```tsx
// Homepage.tsx
import { PathSyncDebugPanel } from '@/components/debug/PathSyncDebugPanel';

<PathSyncDebugPanel />
```

### Manual Operations
```typescript
// Force sync (ignores version check)
import { forceSyncPaths } from '@/services/pathSyncService';
await forceSyncPaths();

// Check status
import { getSyncStatus } from '@/services/pathSyncService';
console.log(getSyncStatus());

// Clear cache
localStorage.removeItem('path-sync-version');
```

---

## 📊 Data Flow

```
┌─────────────────┐
│   Constants     │ (Source of Truth)
│ temperingPath.ts│
└────────┬────────┘
         │
         │ Bump version
         │
         ▼
┌─────────────────┐
│   Deploy App    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Visits    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Auto-Sync     │ Check version
│   (main.tsx)    │ → Sync if needed
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │ Updated with
│   (Supabase)    │ latest data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  pathService    │ Serves cached
│  (24h cache)    │ data to users
└─────────────────┘
```

---

## ✅ Benefits for Alpha Testing

1. **Single source of truth**: Constants in code
2. **Git tracked**: All changes versioned
3. **Zero manual SQL**: Everything automatic
4. **Deploy freely**: 1-3x per day safely
5. **Always online**: Fallback to constants
6. **Fast**: 24h cache + smart retry

---

## 📝 Example Update

**Morning (8:00 AM):**
```typescript
// Change task reward
TEMPERING_LEVELS[0].baseCoins = 35;

// Bump version
const CURRENT_SYNC_VERSION = '1.0.1';

// Deploy
npm run build && deploy
```

**You visit (8:05 AM):**
- App loads → Detects version change
- Auto-sync runs → Database updated
- pathService serves fresh data
- ✅ Done!

**Afternoon (3:00 PM):**
```typescript
// Change another level
TEMPERING_LEVELS[1].subtitle = 'New Text';

// Bump version again
const CURRENT_SYNC_VERSION = '1.0.2';

// Deploy again
npm run build && deploy
```

**You visit (3:05 PM):**
- Auto-sync runs again
- Database updated with new changes
- ✅ Done!

**No SQL. No downtime. Just code & deploy.** 🎯

---

## 🔐 Safety

- ✅ Upserts (no duplicates)
- ✅ Graceful failures
- ✅ Constants fallback
- ✅ Non-blocking sync
- ✅ Safe for alpha (only you using it)
- ✅ Can deploy multiple times per day

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| [pathSyncService.ts](src/services/pathSyncService.ts) | Core sync logic |
| [pathService.ts](src/services/pathService.ts) | Fetch + cache + fallback |
| [main.tsx](src/main.tsx) | Auto-sync on startup |
| [PathSyncDebugPanel.tsx](src/components/debug/PathSyncDebugPanel.tsx) | Dev UI |
| [PATH-SYNC-WORKFLOW.md](PATH-SYNC-WORKFLOW.md) | Detailed workflow guide |
| [create-paths-table.sql](database/create-paths-table.sql) | Database schema |

---

**You're all set!** 🚀

Just edit constants → bump version → deploy → auto-syncs!
