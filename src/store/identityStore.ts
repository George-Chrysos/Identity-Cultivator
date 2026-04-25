import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORE_KEYS } from '@/constants/storage';
import { IDENTITY_LIMITS } from '@/constants/limits';
import { applyCompletion, todayKey } from '@/utils/leveling';
import { getArchetype } from '@/constants/archetypes';
import type {
  ArchetypeId,
  CompletionResult,
  SideQuest,
  UserIdentity,
} from '@/types/identity';
import { toast } from './toastStore';
import { logger } from '@/utils/logger';
import { identityDB } from '@/api/identityDatabase';

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

interface IdentityState {
  userId: string | null;
  isHydrating: boolean;
  identities: UserIdentity[];
  sideQuests: SideQuest[];

  // Cloud sync
  setUserId: (userId: string | null) => void;
  hydrateFromRemote: (userId: string) => Promise<void>;

  // Identity bindings
  bindIdentity: (templateId: ArchetypeId) => Promise<{ ok: boolean; reason?: string }>;
  releaseIdentity: (identityId: string) => Promise<void>;

  // Daily completion
  completeIdentityToday: (identityId: string) => Promise<CompletionResult>;
  isCompletedToday: (identityId: string) => boolean;

  // Side quests (local-only for now)
  addSideQuest: (title: string) => SideQuest | null;
  removeSideQuest: (sideQuestId: string) => void;
  toggleSideQuestActive: (sideQuestId: string) => void;
  completeSideQuestToday: (sideQuestId: string) => void;

  clearAll: () => void;
}

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set, get) => ({
      userId: null,
      isHydrating: false,
      identities: [],
      sideQuests: [],

      setUserId: (userId) => {
        const current = get().userId;
        set({ userId });
        if (userId && userId !== current) {
          void get().hydrateFromRemote(userId);
        }
      },

      hydrateFromRemote: async (userId) => {
        if (!identityDB.isReady()) return;
        set({ isHydrating: true });
        try {
          await identityDB.ensureProfile(userId);
          const remoteIdentities = await identityDB.listIdentities(userId);
          // Remote is source of truth for bindings; merge keeps locally
          // persisted side quests untouched.
          set({ identities: remoteIdentities, isHydrating: false });
        } catch (error) {
          logger.error('hydrateFromRemote failed', error);
          set({ isHydrating: false });
        }
      },

      bindIdentity: async (templateId) => {
        const state = get();

        if (!getArchetype(templateId)) {
          return { ok: false, reason: 'Unknown archetype.' };
        }

        if (state.identities.some((i) => i.templateId === templateId)) {
          return { ok: false, reason: 'Already bound.' };
        }

        if (state.identities.length >= IDENTITY_LIMITS.MAX_ACTIVE) {
          return {
            ok: false,
            reason: `You can only bind ${IDENTITY_LIMITS.MAX_ACTIVE} identities at a time.`,
          };
        }

        const localIdentity: UserIdentity = {
          id: genId(),
          templateId,
          level: 1,
          xpIntoLevel: 0,
          lastCompletedDate: null,
          boundAt: new Date().toISOString(),
        };

        // Optimistic local insert
        set({ identities: [...state.identities, localIdentity] });

        if (state.userId && identityDB.isReady()) {
          try {
            const remote = await identityDB.bindIdentity(state.userId, templateId);
            // Replace optimistic row with the canonical row from the server.
            set((s) => ({
              identities: s.identities.map((i) =>
                i.id === localIdentity.id ? remote : i
              ),
            }));
          } catch (error) {
            logger.error('Remote bindIdentity failed; rolling back', error);
            set((s) => ({
              identities: s.identities.filter((i) => i.id !== localIdentity.id),
            }));
            return { ok: false, reason: 'Could not save. Try again.' };
          }
        }

        logger.info('Identity bound', { templateId });
        return { ok: true };
      },

      releaseIdentity: async (identityId) => {
        const state = get();
        const target = state.identities.find((i) => i.id === identityId);

        set({ identities: state.identities.filter((i) => i.id !== identityId) });

        if (state.userId && identityDB.isReady() && target) {
          try {
            await identityDB.releaseIdentity(identityId);
          } catch (error) {
            logger.error('Remote releaseIdentity failed; restoring', error);
            set((s) => ({ identities: [...s.identities, target] }));
          }
        }
      },

      completeIdentityToday: async (identityId) => {
        const state = get();
        const today = todayKey();
        const target = state.identities.find((i) => i.id === identityId);

        if (!target) {
          return {
            alreadyCompleted: false,
            leveledUp: false,
            newLevel: 1,
            newXpIntoLevel: 0,
          };
        }

        if (target.lastCompletedDate === today) {
          return {
            alreadyCompleted: true,
            leveledUp: false,
            newLevel: target.level,
            newXpIntoLevel: target.xpIntoLevel,
          };
        }

        const result = applyCompletion(target.level, target.xpIntoLevel);

        // Optimistic local write
        set({
          identities: state.identities.map((i) =>
            i.id === identityId
              ? {
                  ...i,
                  level: result.level,
                  xpIntoLevel: result.xpIntoLevel,
                  lastCompletedDate: today,
                }
              : i
          ),
        });

        const template = getArchetype(target.templateId);
        if (result.leveledUp && template) {
          toast.success(`${template.name} ascends to level ${result.level}`);
        }

        if (state.userId && identityDB.isReady()) {
          try {
            await identityDB.recordCompletion(
              target,
              result.level,
              result.xpIntoLevel,
              today
            );
          } catch (error) {
            logger.error('Remote recordCompletion failed; rolling back', error);
            // Revert to the original on failure so state stays truthful.
            set((s) => ({
              identities: s.identities.map((i) =>
                i.id === identityId ? target : i
              ),
            }));
            toast.error('Could not save completion. Try again.');
            return {
              alreadyCompleted: false,
              leveledUp: false,
              newLevel: target.level,
              newXpIntoLevel: target.xpIntoLevel,
            };
          }
        }

        return {
          alreadyCompleted: false,
          leveledUp: result.leveledUp,
          newLevel: result.level,
          newXpIntoLevel: result.xpIntoLevel,
        };
      },

      isCompletedToday: (identityId) => {
        const state = get();
        const target = state.identities.find((i) => i.id === identityId);
        return target?.lastCompletedDate === todayKey();
      },

      addSideQuest: (title) => {
        const trimmed = title.trim();
        if (!trimmed) return null;
        const quest: SideQuest = {
          id: genId(),
          title: trimmed,
          createdAt: new Date().toISOString(),
          active: false,
          lastCompletedDate: null,
        };
        set((state) => ({ sideQuests: [quest, ...state.sideQuests] }));
        return quest;
      },

      removeSideQuest: (sideQuestId) => {
        set((state) => ({
          sideQuests: state.sideQuests.filter((q) => q.id !== sideQuestId),
        }));
      },

      toggleSideQuestActive: (sideQuestId) => {
        set((state) => ({
          sideQuests: state.sideQuests.map((q) =>
            q.id === sideQuestId ? { ...q, active: !q.active } : q
          ),
        }));
      },

      completeSideQuestToday: (sideQuestId) => {
        const today = todayKey();
        set((state) => ({
          sideQuests: state.sideQuests.map((q) =>
            q.id === sideQuestId ? { ...q, lastCompletedDate: today } : q
          ),
        }));
      },

      clearAll: () =>
        set({
          userId: null,
          identities: [],
          sideQuests: [],
          isHydrating: false,
        }),
    }),
    {
      name: STORE_KEYS.IDENTITY,
      partialize: (state) => ({
        identities: state.identities,
        sideQuests: state.sideQuests,
      }),
    }
  )
);
