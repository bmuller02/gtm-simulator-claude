import { WorkspaceState } from './gtm';

export interface UserProgress {
  completedChallenges: string[]; // challenge IDs like "1-1", "2-3"
  workspaces: Record<string, WorkspaceState>; // saved workspace per challenge
  userName?: string;
  allCompleted?: boolean;
  completedAt?: number;
}

export const defaultProgress: UserProgress = {
  completedChallenges: [],
  workspaces: {},
};
