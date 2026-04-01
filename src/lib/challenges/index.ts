import { ChallengeDefinition } from '@/lib/types/challenge';
import { level1Challenges } from './level1';
import { level2Challenges } from './level2';
import { level3Challenges } from './level3';

export const ALL_CHALLENGES: ChallengeDefinition[] = [
  ...level1Challenges,
  ...level2Challenges,
  ...level3Challenges,
];

export function getChallenge(level: number, index: number): ChallengeDefinition | undefined {
  return ALL_CHALLENGES.find((c) => c.level === level && c.index === index);
}

export function getChallengeById(id: string): ChallengeDefinition | undefined {
  return ALL_CHALLENGES.find((c) => c.id === id);
}

export function getNextChallenge(currentId: string): ChallengeDefinition | undefined {
  const idx = ALL_CHALLENGES.findIndex((c) => c.id === currentId);
  if (idx === -1 || idx >= ALL_CHALLENGES.length - 1) return undefined;
  return ALL_CHALLENGES[idx + 1];
}

export function getPrevChallenge(currentId: string): ChallengeDefinition | undefined {
  const idx = ALL_CHALLENGES.findIndex((c) => c.id === currentId);
  if (idx <= 0) return undefined;
  return ALL_CHALLENGES[idx - 1];
}

export const CHALLENGE_LEVELS = [1, 2, 3] as const;
export const LEVEL_NAMES = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
} as const;
