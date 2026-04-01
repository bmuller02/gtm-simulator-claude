'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress, defaultProgress } from '@/lib/types/progress';
import { WorkspaceState } from '@/lib/types/gtm';

interface ProgressStore extends UserProgress {
  markComplete: (challengeId: string) => void;
  saveWorkspace: (challengeId: string, workspace: WorkspaceState) => void;
  getSavedWorkspace: (challengeId: string) => WorkspaceState | null;
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
