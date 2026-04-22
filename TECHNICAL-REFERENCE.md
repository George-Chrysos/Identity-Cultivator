# Identity Cultivator — Technical Reference for AI Agents

> **Document Purpose**: Machine-readable technical reference for AI agents evaluating integration, extension, or modification of this codebase. Contains stack details, architecture patterns, data models, working mechanisms, and extension points.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Name** | Identity Cultivator (internal codename: Anima Forger) |
| **Type** | Gamified habit tracker with cultivation/progression RPG mechanics |
| **Stage** | Alpha — single developer, active development |
| **Core Concept** | Users adopt "identity paths" representing real-world disciplines (fitness, mindfulness, etc.) and complete daily tasks framed as cultivation exercises. Consistency rewards XP, streaks, currency, stat points, and tier progression through a 13-tier ranking system. |
| **Design Philosophy** | Optimistic-first UI (0ms perceived delay), offline-capable patterns, single-responsibility modules (<300 lines), no raw console.log (centralized logger only) |

---

## 2. Technical Stack

### Runtime & Build

| Component | Technology | Version/Notes |
|-----------|-----------|---------------|
| Framework | React 18 | Functional components only, no class components |
| Language | TypeScript | Strict mode, no `any` types allowed |
| Bundler | Vite | Terser minification, manual chunk splitting (react-vendor, animation-vendor, supabase-vendor, store, services) |
| CSS | TailwindCSS | Dark mode enforced, custom theme tokens |
| Animation | Framer Motion | Used for transitions, progress bars, modals |
| State | Zustand | Persisted stores via `zustand/middleware/persist`, localStorage backend |
| Backend | Supabase | PostgreSQL + Auth + Row Level Security (RLS) |
| Validation | Zod | Schema-based input validation |
| Routing | React Router DOM | 4 routes: `/`, `/shop`, `/inventory`, `/path-tree` |
| Icons | Lucide React | SVG icon library |
| Deployment | Vercel | SPA rewrite rules in `vercel.json` |
| PWA | manifest.json | Installable web app support |

### Fonts

Orbitron, Exo 2, Cinzel Decorative, Rajdhani, JetBrains Mono — loaded via Google Fonts in `index.html`.

---

## 3. Architecture Overview

### Directory Structure

```
src/
├── api/              # Database abstraction layer
│   ├── gameDatabase.ts      # Supabase queries (CRUD for all tables)
│   └── mockDatabase.ts      # In-memory mock for offline/testing
├── components/       # UI layer, feature-folder organization
│   ├── auth/                # Login, OAuth, local dev auth
│   ├── common/              # Reusable: BaseModal, ErrorBoundary, TicketBase
│   ├── debug/               # Dev-only panels
│   ├── inventory/           # Item display
│   ├── layout/              # Header, navigation
│   ├── modals/              # Feature modals
│   ├── notifications/       # Toast system
│   ├── path/                # Core: PathCard, PathTaskItem, GateProgress
│   ├── pathTree/            # Skill tree visualization
│   ├── player/              # Player stats display
│   ├── quest/               # Quest tracking UI
│   ├── shop/                # Store interface
│   └── streak/              # Streak display components
├── constants/        # Game content (SOURCE OF TRUTH for paths/tasks)
│   ├── pathRegistry.ts      # Central path registration + reward lookup
│   ├── temperingPath.ts     # Body/Warrior path definition (10 levels × 5 tasks)
│   ├── presencePath.ts      # Mind path definition (10 levels × 5 tasks)
│   ├── seals.ts             # Unlock system definitions
│   ├── statRanks.ts         # Stat-to-rank conversion tables
│   ├── tickets.ts           # Item ticket definitions
│   ├── timing.ts            # Duration constants (TOAST_DURATION, COOLDOWN, etc.)
│   └── limits.ts            # System caps and boundaries
├── hooks/            # Reusable React hooks
│   ├── useChronosReset.ts   # Daily reset detection + execution
│   ├── useCooldownTimer.ts  # Cooldown mechanics
│   ├── useInflatedPrice.ts  # Economy inflation calculation
│   ├── useInventoryManager.ts
│   ├── useShopEngine.ts
│   └── useTransformedIdentity.ts
├── lib/
│   └── supabase.ts          # Supabase client initialization
├── logic/
│   └── ChronosManager.ts    # Daily reset algorithm (pure logic, no React)
├── models/           # Domain models (if any)
├── pages/            # Route-level components
│   ├── Homepage.tsx         # Main dashboard
│   ├── ShopPage.tsx         # Store
│   ├── InventoryPage.tsx    # Owned items
│   └── PathTreePage.tsx     # Skill tree
├── services/         # Business logic layer (framework-agnostic)
│   ├── PathTaskService.ts   # Task completion, XP calculation, reward distribution
│   ├── pathService.ts       # Path data resolution (DB → cache → constants)
│   ├── pathSyncService.ts   # Constants → DB sync (currently DISABLED)
│   ├── pathAlignmentService.ts
│   ├── ProgressionService.ts # Leveling, tier calculation
│   ├── StreakManager.ts     # Streak evaluation logic
│   ├── storageService.ts    # localStorage abstraction (never use raw localStorage)
│   ├── errorHandler.ts      # Centralized error handling
│   ├── localAuthService.ts  # Dev-mode demo user switching
│   └── resetUserService.ts  # User data reset utility
├── store/            # Zustand state stores
│   ├── gameStore.ts         # Primary store: identities, tasks, profiles, daily state
│   ├── authStore.ts         # Auth state, session management
│   ├── questStore.ts        # Quest tracking
│   ├── shopStore.ts         # Shop state
│   ├── pathStore.ts         # Path-specific UI state
│   ├── toastStore.ts        # Notification queue
│   ├── uiStore.ts           # UI flags (modals, panels)
│   └── testingStore.ts      # Dev/test utilities
├── tests/            # Smoke tests and validators
├── types/            # TypeScript type definitions
│   ├── index.ts             # Core domain types
│   └── database.ts          # Supabase table types
└── utils/            # Pure utility functions
    ├── logger.ts            # Centralized logging (replaces console.*)
    ├── formatters.ts        # Display formatting
    ├── overallRank.ts       # Rank computation
    ├── rankStyles.ts        # Rank-to-CSS mapping
    ├── sealLeveling.ts      # Seal progression math
    └── inflationCalculator.ts
```

### Key Architectural Decisions

1. **Client-side constants are the source of truth** for game content (paths, tasks, rewards). The database optionally mirrors them but is not authoritative.
2. **Optimistic updates are mandatory** — every mutation updates Zustand state immediately, writes to Supabase in background, rolls back on failure.
3. **No raw `console.log`** — all logging through `src/utils/logger.ts`.
4. **No raw `localStorage`** — all persistence through `src/services/storageService.ts`.
5. **No `any` types** — strict TypeScript throughout.
6. **All event handlers wrapped in `useCallback`**, computations in `useMemo`, list components in `React.memo`.

---

## 4. Database Schema (Supabase PostgreSQL)

### Custom Enums

```sql
identity_type: WARRIOR | SCHOLAR | MONK | STRATEGIST
identity_tier: D | D+ | C | C+ | B | B+ | A | A+ | S | S+ | SS | SS+ | SSS
identity_status: ACTIVE | COMPLETED | ABANDONED
```

### Core Tables

#### `profiles` (1 per user, auto-created on signup)
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID (PK, FK → auth.users) | | User ID |
| username | TEXT | | Display name |
| rank_tier | identity_tier | 'E' | Overall player rank |
| coins | INTEGER | 100 | Spendable currency |
| stars | INTEGER | 5 | Premium currency |
| body_points | INTEGER | 0 | Accumulated BODY stat |
| mind_points | INTEGER | 0 | Accumulated MIND stat |
| soul_points | INTEGER | 0 | Accumulated SOUL stat |
| will_points | INTEGER | 0 | Accumulated WILL stat |
| final_score | INTEGER | 0 | Composite ranking score |
| last_reset_date | DATE | | Last Chronos reset date |
| timezone | TEXT | | User timezone for reset timing |
| updated_at | TIMESTAMPTZ | NOW() | |

#### `player_identities` (adopted paths per user)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK → profiles) | |
| path_id | TEXT | References constants key (e.g., 'tempering') |
| identity_type | identity_type | WARRIOR, SCHOLAR, etc. |
| identity_name | TEXT | Display name |
| current_level | INTEGER | 1–10 |
| current_xp | INTEGER | XP within current level |
| current_streak | INTEGER | Consecutive days completed |
| longest_streak | INTEGER | All-time best streak |
| status | identity_status | ACTIVE / COMPLETED / ABANDONED |
| tier | identity_tier | Path-specific tier |

#### `task_logs` (completion history)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| identity_id | UUID (FK → player_identities) | |
| task_id | TEXT | Task key from constants |
| completed_at | TIMESTAMPTZ | |
| xp_earned | INTEGER | |
| coins_earned | INTEGER | |
| stat_points_earned | INTEGER | |

#### `daily_path_progress` (daily completion tracking for streak evaluation)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| identity_id | UUID (FK → player_identities) | |
| progress_date | DATE | |
| tasks_completed | INTEGER | |
| total_tasks | INTEGER | |
| is_complete | BOOLEAN | true if all tasks done |

#### `daily_records` (daily snapshot for history)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| record_date | DATE | |
| path_stats | JSONB | Snapshot of all path progress |
| quests_completed | INTEGER | |
| coins_earned | INTEGER | |
| total_xp_earned | INTEGER | |

#### `player_inventory` (owned items from shop)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| item_id | TEXT | References shop item definition |
| quantity | INTEGER | |
| purchased_at | TIMESTAMPTZ | |

### Security Model

- **Row Level Security (RLS)** enabled on ALL public tables
- Every policy filters by `(SELECT auth.uid()) = user_id` (optimized pattern to avoid per-row function call)
- Users can only SELECT/INSERT/UPDATE/DELETE their own rows
- `profiles` auto-created via `handle_new_user()` trigger on `auth.users` INSERT

---

## 5. Core Game Mechanisms

### 5.1 Identity Paths

Paths are the central gameplay unit. Each path represents a real-world discipline:

| Path | Identity Type | Stat | Status |
|------|--------------|------|--------|
| Tempering | WARRIOR | BODY | Implemented |
| Presence | MONK | MIND | Implemented |
| (Future paths) | SCHOLAR, STRATEGIST | SOUL, WILL | Planned |

**Path structure** (defined in constants):
```
Path → 10 Levels → 5 Gates per Level → Optional Subtasks per Gate
                  → 1 Trial per Level (end-of-level challenge)
```

Each gate/task has:
- `id`: Unique string key
- `name`: Display name
- `description`: What the user does in real life
- `xpReward`: XP awarded on completion
- `coinReward`: Coins awarded
- `statReward`: Stat points awarded (BODY/MIND/SOUL/WILL)

### 5.2 Task Completion Flow

```
User taps "Complete Task"
  → Zustand state updated immediately (optimistic)
  → PathTaskService.completeTask() called
    → Writes task_log to Supabase
    → Updates daily_path_progress
    → Awards XP, coins, stat points to profile
    → If all 5 tasks done → mark path COMPLETED for today, streak +1
  → On DB error → Zustand state rolled back, toast error shown
```

**Two-tier tracking**:
1. **Ephemeral**: `gameStore.dailyTaskStates` — per-session task completion flags, reset daily
2. **Permanent**: `task_logs` table — full history of every completion

### 5.3 XP & Leveling

- XP earned per task (typically 8 XP per task, 40 XP/day for a 5-task path)
- XP thresholds increase per level:
  - Level 1: ~120 XP (~3 days)
  - Level 5: ~600 XP (~15 days)
  - Level 10: ~2000 XP (~50 days)
- Level-up evaluated after each task completion
- Configured via `pathRegistry.getPathLevelConfig(pathId, level)`

### 5.4 Streak System

- **Per-path streaks**: Each adopted path tracks its own streak independently
- **Increment rule**: Streak +1 only when ALL tasks for that path are completed in a single day
- **Reset rule**: If previous day was <100% completion, streak resets to 0
- **Evaluation timing**: During Chronos daily reset (next day's first app load)
- **Storage**: `player_identities.current_streak` and `player_identities.longest_streak`

### 5.5 Daily Reset (Chronos System)

The `ChronosManager` (pure logic class) handles the midnight boundary:

```
App loads → useChronosReset hook fires
  → Compare today's date vs profiles.last_reset_date
  → If different day:
    1. Snapshot current state → daily_records
    2. Evaluate streaks (per-path: was yesterday 100%?)
    3. Reset daily task states (clear ephemeral completion flags)
    4. Reset daily quests (recurring ones re-enable)
    5. Carry over uncompleted persistent quests
    6. Update profiles.last_reset_date = today
```

### 5.6 13-Tier Ranking

```
D → D+ → C → C+ → B → B+ → A → A+ → S → S+ → SS → SS+ → SSS
```
- Stored as PostgreSQL enum `identity_tier`
- Applies to both individual paths (`player_identities.tier`) and overall player (`profiles.rank_tier`)
- Overall rank derived from `profiles.final_score` (composite of all stats)

### 5.7 Economy

| Currency | Earned From | Spent On | Starting |
|----------|------------|----------|----------|
| Coins | Task completion | Shop items | 100 |
| Stars | Premium (rare) | Path tree node unlocks | 5 |

- Shop has inflation mechanics (`useInflatedPrice` hook, `inflationCalculator` utility)
- Inventory tracked in `player_inventory` table

### 5.8 Stat System

Four stats accumulated from task completion:

| Stat | Path Type | Description |
|------|-----------|-------------|
| BODY | WARRIOR | Physical discipline |
| MIND | SCHOLAR/MONK | Mental cultivation |
| SOUL | MONK | Spiritual practice |
| WILL | STRATEGIST | Strategic discipline |

Stats contribute to `final_score` which determines `rank_tier`.

### 5.9 Quest System

- Managed by `questStore` (Zustand)
- Quest types: daily (reset at midnight), persistent (carry over until completed)
- Quests can award coins, XP, or items on completion
- Chronos reset handles quest lifecycle transitions

### 5.10 Seal System

- Defined in `constants/seals.ts` and `constants/sealsContent.ts`
- Seals are achievement/unlock milestones
- Leveling logic in `utils/sealLeveling.ts`

---

## 6. State Management Detail

### Zustand Stores

| Store | Key State | Persistence |
|-------|-----------|-------------|
| `gameStore` | player profile, identities, daily task states, loading flags | Yes (localStorage) |
| `authStore` | session, user, isAuthenticated | Yes |
| `questStore` | active quests, completion state | Yes |
| `shopStore` | shop items, purchase state | Yes |
| `pathStore` | path UI selection state | Yes |
| `toastStore` | notification queue | No |
| `uiStore` | modal visibility flags | No |
| `testingStore` | dev utilities | No |

### Store Pattern (enforced)

```typescript
// Always use selective selectors (subscribe to specific slices)
const coins = useGameStore((state) => state.profile.coins);

// Never destructure the whole store
// ❌ const { profile, identities, tasks } = useGameStore();
```

---

## 7. Authentication

### Production
- Supabase Auth (email/password + OAuth providers)
- Session managed by `authStore`
- RLS policies enforce data isolation

### Development
- `localAuthService.ts` provides demo users (`demo-user-1`, `demo-user-2`, etc.)
- `LocalAuthIndicator` component for switching demo accounts
- Mock database (`mockDatabase.ts`) for offline development

---

## 8. Error Handling

| Layer | Mechanism |
|-------|-----------|
| Component | `ErrorBoundary` wraps feature sections, shows retry UI |
| App Root | `AppErrorBoundary` catches catastrophic failures |
| Service | `handleError()` from `errorHandler.ts` — logs + optional toast |
| Global | `window.onerror` in `main.tsx` — DOM fallback message |
| Logging | `logger` singleton: debug/info (dev only), warn/error (always) |

---

## 9. Extension Points

### Adding a New Path
1. Create `src/constants/newPath.ts` following `temperingPath.ts` structure
2. Register in `src/constants/pathRegistry.ts` via the registry's add method
3. Add identity_type enum value if needed (DB migration)
4. Path becomes available — task completion, XP, streaks all work automatically through existing services

### Adding New Shop Items
1. Define item in shop constants/configuration
2. Items automatically available via `shopStore` and `useShopEngine`

### Adding New Stats
1. Add column to `profiles` table (DB migration)
2. Add to stat type definitions in `src/types/`
3. Update `PathTaskService` reward distribution
4. Update `overallRank` calculation

### Adding New Routes/Pages
1. Create page in `src/pages/`
2. Add route in `src/App.tsx` (React Router)
3. Add nav link in `src/components/layout/Header.tsx`

### Integrating External Systems
- **API layer**: All DB access goes through `src/api/gameDatabase.ts` — add new query functions there
- **Services layer**: Business logic in `src/services/` — create new service files for new domains
- **Store layer**: New Zustand stores in `src/store/` — follow the persist + optimistic update pattern

---

## 10. Constraints & Conventions

| Rule | Enforcement |
|------|-------------|
| No `console.log` | Use `logger` from `src/utils/logger.ts` |
| No raw `localStorage` | Use `storageService` from `src/services/storageService.ts` |
| No `any` types | TypeScript strict mode |
| No inline handlers | All wrapped in `useCallback` |
| File size < 300 lines | Single responsibility principle |
| Optimistic updates | Every mutation must update UI before DB |
| Constants as source of truth | Game content defined in `src/constants/`, not DB |
| RLS on all tables | Users can only access own data |

---

## 11. Build & Deploy

```bash
# Development
npm run dev          # Vite dev server

# Production build
npm run build        # Vite build with Terser minification

# Deploy
# Auto-deploys via Vercel on git push
```

**Targets**: <2s load, <500KB bundle, <100ms interaction response.

---

*Document generated: 2026-02-21 | Source: Identity Cultivator codebase analysis*
