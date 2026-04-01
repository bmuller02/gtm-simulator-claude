'use client';

import { create } from 'zustand';
import { Tag, Trigger, Variable, WorkspaceState, emptyWorkspace } from '@/lib/types/gtm';

interface WorkspaceStore extends WorkspaceState {
  // Tag actions
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // Trigger actions
  addTrigger: (trigger: Trigger) => void;
  updateTrigger: (id: string, updates: Partial<Trigger>) => void;
  deleteTrigger: (id: string) => void;

  // Variable actions
  addVariable: (variable: Variable) => void;
  updateVariable: (id: string, updates: Partial<Variable>) => void;
  deleteVariable: (id: string) => void;

  // Workspace management
  loadWorkspace: (state: WorkspaceState) => void;
  resetWorkspace: () => void;
  getSnapshot: () => WorkspaceState;
}

export const useWorkspaceStore = create<WorkspaceStore>()((set, get) => ({
  ...emptyWorkspace,

  addTag: (tag) =>
    set((state) => ({ tags: [...state.tags, tag] })),

  updateTag: (id, updates) =>
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  deleteTag: (id) =>
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) })),

  addTrigger: (trigger) =>
    set((state) => ({ triggers: [...state.triggers, trigger] })),

  updateTrigger: (id, updates) =>
    set((state) => ({
      triggers: state.triggers.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  deleteTrigger: (id) =>
    set((state) => ({
      triggers: state.triggers.filter((t) => t.id !== id),
    })),

  addVariable: (variable) =>
    set((state) => ({ variables: [...state.variables, variable] })),

  updateVariable: (id, updates) =>
    set((state) => ({
      variables: state.variables.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    })),

  deleteVariable: (id) =>
    set((state) => ({
      variables: state.variables.filter((v) => v.id !== id),
    })),

  loadWorkspace: (state) => set({ ...state }),

  resetWorkspace: () => set({ ...emptyWorkspace }),

  getSnapshot: () => {
    const { tags, triggers, variables } = get();
    return { tags, triggers, variables };
  },
}));
