'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GTMWorkspace } from '@/components/workspace/GTMWorkspace';
import { MockWebsite } from '@/components/mock-website/MockWebsite';
import { InstructionsPanel } from '@/components/challenge/InstructionsPanel';
import { ValidationFeedback } from '@/components/challenge/ValidationFeedback';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import { useProgressStore } from '@/lib/store/progressStore';
import { getChallenge, getNextChallenge, ALL_CHALLENGES } from '@/lib/challenges/index';
import { validateWorkspace } from '@/lib/validation/engine';
import { ValidationResult } from '@/lib/types/challenge';
import { ChevronLeft, ChevronRight, SkipForward, ClipboardCheck, Monitor, Settings2, Trophy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { emptyWorkspace } from '@/lib/types/gtm';

interface PageProps {
  params: Promise<{ level: string; index: string }>;
}

export default function ChallengePage({ params }: PageProps) {
  const { level: levelStr, index: indexStr } = use(params);
  const level = parseInt(levelStr);
  const index = parseInt(indexStr);
  const router = useRouter();

  const challenge = getChallenge(level, index);
  const nextChallenge = challenge ? getNextChallenge(challenge.id) : undefined;

  const { loadWorkspace, resetWorkspace, getSnapshot } = useWorkspaceStore();
  const { completedChallenges, markComplete, saveWorkspace, getSavedWorkspace } = useProgressStore();

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [activePanel, setActivePanel] = useState<'instructions' | 'site'>('instructions');
  const [hasValidated, setHasValidated] = useState(false);

  const isCompleted = challenge ? completedChallenges.includes(challenge.id) : false;

  // Load workspace when challenge changes
  useEffect(() => {
    if (!challenge) return;
    resetWorkspace();
    setValidationResult(null);
    setHasValidated(false);

    if (challenge.preloadedWorkspace) {
      loadWorkspace(challenge.preloadedWorkspace);
    } else {
      const saved = getSavedWorkspace(challenge.id);
      if (saved) {
        loadWorkspace(saved);
      }
    }
  }, [challenge?.id]);

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500">Challenge not found.</p>
          <Button onClick={() => router.push('/')} className="mt-4">← Back to Home</Button>
        </div>
      </div>
    );
  }

  const handleCheckWork = () => {
    const workspace = getSnapshot();
    saveWorkspace(challenge.id, workspace);
    const result = validateWorkspace(workspace, challenge.successCriteria);
    setValidationResult(result);
    setHasValidated(true);

    if (result.passed) {
      markComplete(challenge.id);
    }
  };

  const handleNext = () => {
    if (nextChallenge) {
      router.push(`/challenge/${nextChallenge.level}/${nextChallenge.index}`);
    } else {
      router.push('/certificate');
    }
  };

  const handleSkip = () => {
    if (nextChallenge) {
      router.push(`/challenge/${nextChallenge.level}/${nextChallenge.index}`);
    } else {
      router.push('/certificate');
    }
  };

  const handleNavigate = (value: string | null) => {
    if (!value) return;
    const [l, i] = value.split('-');
    router.push(`/challenge/${l}/${i}`);
  };

  const isNextEnabled = isCompleted || (validationResult?.passed ?? false);
  const isLastChallenge = !nextChallenge;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b px-4 py-2 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-xs gap-1 h-7">
          <ChevronLeft className="h-3 w-3" />
          Home
        </Button>
        <Separator orientation="vertical" className="h-5" />

        {/* Challenge selector dropdown */}
        <Select value={`${level}-${index}`} onValueChange={handleNavigate}>
          <SelectTrigger className="w-56 h-7 text-xs border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_CHALLENGES.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-xs">
                <div className="flex items-center gap-2">
                  <span className={completedChallenges.includes(c.id) ? 'text-green-500' : 'text-gray-400'}>
                    {completedChallenges.includes(c.id) ? '✓' : '○'}
                  </span>
                  L{c.level}-{c.index}: {c.title}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Progress indicator */}
        <div className="flex items-center gap-1 ml-1">
          {ALL_CHALLENGES.map((c) => (
            <div
              key={c.id}
              className={`w-2 h-2 rounded-full transition-colors ${
                completedChallenges.includes(c.id)
                  ? 'bg-green-400'
                  : c.id === challenge.id
                  ? 'bg-blue-400'
                  : 'bg-gray-200'
              }`}
              title={c.title}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Skip button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-xs gap-1 h-7 text-gray-500"
          >
            Skip
            <SkipForward className="h-3 w-3" />
          </Button>

          {/* Check Work button */}
          <Button
            size="sm"
            onClick={handleCheckWork}
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
          >
            <ClipboardCheck className="h-3 w-3" />
            Check Work
          </Button>

          {/* Next / Finish button */}
          <Button
            size="sm"
            onClick={handleNext}
            disabled={!isNextEnabled}
            className={`h-7 text-xs gap-1 transition-all ${
              isNextEnabled
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLastChallenge ? (
              <>
                <Trophy className="h-3 w-3" />
                Finish
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-0">
        {/* Left Panel — Instructions */}
        <div className="w-72 shrink-0 flex flex-col border-r bg-white overflow-hidden">
          {/* Panel tabs */}
          <div className="flex border-b shrink-0">
            <button
              onClick={() => setActivePanel('instructions')}
              className={`flex-1 text-xs py-2 flex items-center justify-center gap-1 transition-colors ${
                activePanel === 'instructions'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings2 className="h-3 w-3" />
              Instructions
            </button>
            <button
              onClick={() => setActivePanel('site')}
              className={`flex-1 text-xs py-2 flex items-center justify-center gap-1 transition-colors ${
                activePanel === 'site'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Monitor className="h-3 w-3" />
              Preview Site
            </button>
          </div>

          {activePanel === 'instructions' ? (
            <ScrollArea className="flex-1 p-4">
              <InstructionsPanel challenge={challenge} />

              {/* Validation feedback inline */}
              {validationResult && (
                <div className="mt-4">
                  <ValidationFeedback result={validationResult} />
                </div>
              )}
            </ScrollArea>
          ) : (
            <div className="flex-1 overflow-hidden">
              <MockWebsite type={challenge.mockWebsite} />
            </div>
          )}
        </div>

        {/* Right Panel — GTM Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden p-3">
          <GTMWorkspace />
        </div>
      </div>
    </div>
  );
}
