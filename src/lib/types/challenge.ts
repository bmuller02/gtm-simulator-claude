import { WorkspaceState } from './gtm';

export type DifficultyLevel = 1 | 2 | 3;
export type ChallengeIndex = 1 | 2 | 3;

export type MockWebsiteType =
  | 'ecommerce'
  | 'contact'
  | 'checkout'
  | 'cookieBanner'
  | 'marketing'
  | 'broken'; // pre-broken for debug challenge

export interface ValidationCriterion {
  id: string;
  description: string; // shown as checklist item
  check: (workspace: WorkspaceState) => boolean;
  failureMessage: string; // specific actionable feedback on failure
}

export interface ChallengeDefinition {
  id: string; // e.g. "1-1", "2-3"
  level: DifficultyLevel;
  index: ChallengeIndex;
  title: string;
  scenario: string; // paragraph describing the business context
  instructions: string; // markdown with step-by-step instructions
  objectives: string[]; // bullet list of what to accomplish
  successCriteria: ValidationCriterion[];
  mockWebsite: MockWebsiteType;
  preloadedWorkspace?: WorkspaceState; // for challenge 3-2 (debug)
  hints: string[];
}

export interface ValidationResult {
  passed: boolean;
  score: number; // 0–100
  passedCount: number;
  totalCount: number;
  feedback: ValidationFeedbackItem[];
}

export interface ValidationFeedbackItem {
  criterionId: string;
  description: string;
  passed: boolean;
  message: string;
}

export type ChallengeStatus = 'locked' | 'available' | 'completed';
