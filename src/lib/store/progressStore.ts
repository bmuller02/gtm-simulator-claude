'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress, defaultProgress } from '@/lib/types/progress';
import { WorkspaceState, emptyWorkspace } from '@/lib/types/gtm';

// Ordered list of all challenge IDs — used for "prior challenge" accumulation
const CHALLENGE_ORDER = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '3-1', '3-2', '3-3'];

interface ProgressStore extends UserProgress {
  markComplete: (challengeId: string) => void;
  saveWorkspace: (challengeId: string, workspace: WorkspaceState) => void;
  getSavedWorkspace: (challengeId: string) => WorkspaceState | null;
  /**
   * Returns all tags/triggers/variables from every completed challenge that
   * comes before `currentChallengeId` in the course order — deduplicated by ID.
   * Used to seed each new challenge with accumulated work from prior challenges.
   */
  getAccumulatedWorkspace: (currentChallengeId: string) => WorkspaceState;
  setUserName: (name: string) => void;
  markAllCompleted: () => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...defaultProgress,

      markComplete: (challengeId) =>
        set((state) => ({
          completedChallenges: state.completedChallenges.includes(challengeId)
            ? state.completedChallenges
            : [...state.completedChallenges, challengeId],
        })),

      saveWorkspace: (challengeId, workspace) =>
        set((state) => ({
          workspaces: { ...state.workspaces, [challengeId]: workspace },
        })),

      getSavedWorkspace: (challengeId) => {
        return get().workspaces[challengeId] ?? null;
      },

      getAccumulatedWorkspace: (currentChallengeId) => {
        const currentIndex = CHALLENGE_ORDER.indexOf(currentChallengeId);
        if (currentIndex <= 0) return { ...emptyWorkspace };

        const { workspaces } = get();
        const seenIds = new Set<string>();
        const tags: WorkspaceState['tags'] = [];
        const triggers: WorkspaceState['triggers'] = [];
        const variables: WorkspaceState['variables'] = [];

        for (const challengeId of CHALLENGE_ORDER.slice(0, currentIndex)) {
          const ws = workspaces[challengeId];
          if (!ws) continue;
          for (const tag of ws.tags) {
            if (!seenIds.has(tag.id)) { tags.push(tag); seenIds.add(tag.id); }
          }
          for (const trigger of ws.triggers) {
            if (!seenIds.has(trigger.id)) { triggers.push(trigger); seenIds.add(trigger.id); }
          }
          for (const variable of ws.variables) {
            if (!seenIds.has(variable.id)) { variables.push(variable); seenIds.add(variable.id); }
          }
        }

        return { tags, triggers, variables };
      },

      setUserName: (name) => set({ userName: name }),

      markAllCompleted: () =>
        set({ allCompleted: true, completedAt: Date.now() }),

      resetProgress: () => set({ ...defaultProgress }),
    }),
    {
      name: 'gtm-simulator-progress',
      version: 1,
    }
  )
);
