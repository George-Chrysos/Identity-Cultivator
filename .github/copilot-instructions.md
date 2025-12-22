# GitHub Copilot Instructions - Identity Cultivator

<!-- 
  PURPOSE: Quick reference for AI assistants to generate production-ready code.
  This is a LIVING DOCUMENT - update it as patterns evolve.
  For detailed explanations, see CODE-REVIEW.md
-->

## 🚨 Critical Behavioral Rules

**NEVER perform tasks that were not explicitly requested by the user.**

1. **Ask Permission First**: If you need to perform an additional task to complete a requested task, ask for permission before proceeding.
2. **No Unsolicited Information**: Never provide explanations, documentation, or additional information unless explicitly requested.
3. **No Unsolicited Documents**: Never generate documents, README files, or documentation unless explicitly requested.
4. **Task Summary Required**: At the end of each completed task, provide ONLY a concise bullet-point list of what was completed.

---

## 🎯 Project Context

**Identity Cultivator** - Gamified habit tracker with cultivation/progression RPG mechanics.
- **Stack**: React 18 + TypeScript + Vite + Zustand + Supabase + TailwindCSS + Framer Motion
- **Core UX**: Optimistic updates (0ms perceived delay), 13-tier progression (D → SSS), daily streaks
- **Target**: <2s load, <500KB bundle, minimal re-renders

---

## 🔥 Non-Negotiable Principles

### 1. Optimistic Updates Always
```typescript
// ✅ Pattern: Update UI → Database → Rollback on error
const handleAction = async () => {
  const original = state;
  setState(newState);
  try {
    await db.update(newState);
  } catch (error) {
    setState(original);
    toast.error('Failed');
  }
};
```

### 2. No Console Logs
```typescript
// ❌ NEVER: console.log('data', data);
// ✅ ALWAYS: logger.debug('data', { data });
import { logger } from '@/utils/logger';
```

### 3. Type Safety (No `any`)
```typescript
// ❌ const data: any = await fetch();
// ✅ const data: Identity[] = await fetch();
```

### 4. Performance First
```typescript
// ✅ Memoize callbacks in components
const handleClick = useCallback(() => {}, [deps]);
const computed = useMemo(() => expensiveCalc(), [deps]);

// ✅ Optimize Zustand selectors
const data = useStore((state) => state.specific);
// ❌ NOT: Multiple individual selectors
```

### 5. Single Responsibility (< 300 lines per file)
```typescript
// ✅ Split stores: userStore.ts, identityStore.ts, progressStore.ts
// ❌ NOT: One 1000+ line cultivatorStore.ts
```

---

## 📁 Architecture Patterns

### File Organization
```
src/
├── api/              # Supabase client, repositories
├── components/       # Feature folders + common/
│   └── [Feature]/
│       ├── index.tsx         # < 200 lines
│       ├── SubComponent.tsx
│       └── hooks/            # Feature-specific hooks
├── constants/        # tiers.ts, timing.ts, limits.ts
├── services/         # storageService, errorHandler, validator
├── store/            # Feature-based Zustand stores
├── types/            # models.ts, api.ts, ui.ts
└── utils/            # logger, formatters, validators
```

### Component Template
```typescript
import { memo, useCallback, useMemo } from 'react';
import { useStore } from '@/store';

interface Props {
  id: string;
  onAction?: () => void;
}

export const Component = memo(({ id, onAction }: Props) => {
  // 1. Store selectors (optimized)
  const item = useStore((state) => state.getById(id));
  
  // 2. Memoized callbacks
  const handleClick = useCallback(() => {
    onAction?.();
  }, [onAction]);
  
  // 3. Memoized computations
  const value = useMemo(() => compute(item), [item]);
  
  // 4. Early returns
  if (!item) return null;
  
  // 5. Render
  return <div>{value}</div>;
}, (prev, next) => prev.id === next.id);

Component.displayName = 'Component';
```

### Zustand Store Template
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { handleError } from '@/services/errorHandler';

interface State {
  items: Item[];
  isLoading: boolean;
  
  loadItems: (id: string) => Promise<void>;
  createItem: (data: CreateData) => Promise<void>;
  getById: (id: string) => Item | null;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      
      loadItems: async (id) => {
        set({ isLoading: true });
        try {
          const items = await api.getAll(id);
          set({ items, isLoading: false });
        } catch (error) {
          handleError(error, 'loadItems');
          set({ isLoading: false });
        }
      },
      
      createItem: async (data) => {
        // Optimistic update
        const temp = { ...data, id: `temp-${Date.now()}` };
        set((s) => ({ items: [...s.items, temp] }));
        
        try {
          const created = await api.create(data);
          set((s) => ({ items: s.items.map(i => i.id === temp.id ? created : i) }));
        } catch (error) {
          set((s) => ({ items: s.items.filter(i => i.id !== temp.id) }));
          handleError(error, 'createItem');
        }
      },
      
      getById: (id) => get().items.find(i => i.id === id) || null,
    }),
    { name: 'store-name' }
  )
);
```

---

## 🚫 Anti-Patterns (Never Do This)

```typescript
// ❌ Direct console/localStorage
console.log(); localStorage.getItem();

// ❌ Inline handlers (creates new function each render)
<button onClick={() => handle(id)}>

// ❌ Missing dependencies
useEffect(() => { use(value); }, []); // Missing value!

// ❌ Direct mutation
state.items.push(item); setState(state);

// ❌ Any types
const data: any = fetch();

// ❌ Magic numbers
setTimeout(fn, 3000); // What is 3000?

// ❌ Multiple Zustand selectors
const fn1 = useStore(s => s.fn1);
const fn2 = useStore(s => s.fn2); // Creates multiple subscriptions!
```

---

## 📋 Code Quality Checklist

**Before submitting ANY code:**
- [ ] No `console.log/warn/error` (use `logger`)
- [ ] No direct `localStorage` (use `storage` service)
- [ ] Event handlers use `useCallback`
- [ ] Expensive computations use `useMemo`
- [ ] List components use `React.memo`
- [ ] No `any` types
- [ ] Constants imported from `constants/`
- [ ] Optimistic updates for mutations
- [ ] Proper error handling with rollback
- [ ] File < 300 lines
- [ ] Single responsibility

---

## 💡 Key Patterns

### Constants (DRY Principle)
```typescript
// constants/tiers.ts
export const TIER_ORDER = { 'SSS': 13, 'SS+': 12, /* ... */ } as const;
export const getTierScore = (tier: Tier) => TIER_ORDER[tier];

// constants/timing.ts
export const TIMING = {
  TOAST_DURATION: 4000,
  OPTIMISTIC_TIMEOUT: 3000,
} as const;
```

### Error Handling
```typescript
// Use centralized handler
import { handleError } from '@/services/errorHandler';
try {
  await operation();
} catch (error) {
  handleError(error, 'contextName');
}
```

### Database Queries (Use JOINs)
```typescript
// ✅ Single query with JOIN
const data = await supabase
  .from('identities')
  .select('*, user_progress!inner(days_completed, level)')
  .eq('user_id', userId);

// ❌ N+1 queries
const identities = await supabase.from('identities').select('*');
for (const id of identities) {
  await supabase.from('user_progress').select('*').eq('identity_id', id.id);
}
```

### Input Validation (Zod)
```typescript
import { z } from 'zod';

const Schema = z.object({
  name: z.string().min(3).max(50),
  type: z.enum(['A', 'B', 'C']),
});

const validated = Schema.parse(input);
```

---

**Version**: 1.0 | **Updated**: Oct 13, 2025  
**For detailed explanations**: See `CODE-REVIEW.md`, `IMPROVEMENT-PRIORITY.md`, `QUICK-REFERENCE.md`
