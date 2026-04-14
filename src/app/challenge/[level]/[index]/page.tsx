'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GTMWorkspace } from '@/components/workspace/GTMWorkspace';
import { MockWebsite } from '@/components/mock-website/MockWebsite';
import { InstructionsPanel } from '@/components/challenge/InstructionsPanel';
import { ValidationFeedback } from '@/components/challenge/ValidationFeedback';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import { useProgressStore } from '@/lib/store/progressStore';
import { getChallenge, getNextChallenge, ALL_CHALLENGES } from '@/lib/challenges/index';
import { validateWorkspace } from '@/lib/validation/engine';
import { ValidationResult } from '@/lib/types/challenge';
import { EventLogEntry } from '@/components/mock-website/EventLog';
import {
  ChevronLeft, ChevronRight, SkipForward, ClipboardCheck,
  Trophy, MousePointerClick
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Events that must be fired on the preview site before advancing (per challenge)
const REQUIRED_EVENTS: Record<string, string> = {
  '1-1': 'page_view',
  '1-2': 'add_to_cart',
  '1-3': 'page_view',
  '2-1': 'form_submission',
  '2-2': 'purchase',
};

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
  const { completedChallenges, markComplete, saveWorkspace, getSavedWorkspace, getAccumulatedWorkspace } = useProgressStore();

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [firedEvents, setFiredEvents] = useState<EventLogEntry[]>([]);

  const isCompleted = challenge ? completedChallenges.includes(challenge.id) : false;
  const requiredEvent = challenge ? REQUIRED_EVENTS[challenge.id] : undefined;
  const hasRequiredEvent = !requiredEvent || firedEvents.some((e) => e.name === requiredEvent);

  // ── Panel resize state ────────────────────────────────────────────
  const [leftWidth, setLeftWidth] = useState(270);
  const [rightWidth, setRightWidth] = useState(420);
  const [eventLogHeight, setEventLogHeight] = useState(130);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (isDraggingLeft.current) {
      const newWidth = Math.max(200, Math.min(400, e.clientX - rect.left));
      setLeftWidth(newWidth);
    }
    if (isDraggingRight.current) {
      const newWidth = Math.max(300, Math.min(600, rect.right - e.clientX));
      setRightWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingLeft.current = false;
    isDraggingRight.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ── Load workspace on challenge change ───────────────────────────
  useEffect(() => {
    if (!challenge) return;
    resetWorkspace();
    setValidationResult(null);
    setHasValidated(false);
    setFiredEvents([]);

    if (challenge.preloadedWorkspace) {
      loadWorkspace(challenge.preloadedWorkspace);
    } else {
      const saved = getSavedWorkspace(challenge.id);
      if (saved) {
        loadWorkspace(saved);
      } else {
        // Seed new challenge with items accumulated from all prior completed challenges
        const accumulated = getAccumulatedWorkspace(challenge.id);
        if (accumulated.tags.length || accumulated.triggers.length || accumulated.variables.length) {
          loadWorkspace(accumulated);
        }
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
    setShowValidationDialog(true);
    if (result.passed) {
      markComplete(challenge.id);
    }
  };

  const handleNext = () => {
    if (nextChallenge) {
      router.push(`/challenge/${nextChallenge.level}/${nextChallenge.index}`);
    } else {
      router.push('/quiz');
    }
  };

  const handleSkip = () => {
    if (nextChallenge) {
      router.push(`/challenge/${nextChallenge.level}/${nextChallenge.index}`);
    } else {
      router.push('/quiz');
    }
  };

  const handleNavigate = (value: string | null) => {
    if (!value) return;
    const [l, i] = value.split('-');
    router.push(`/challenge/${l}/${i}`);
  };

  const isNextEnabled = (isCompleted || (validationResult?.passed ?? false)) && hasRequiredEvent;
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-xs gap-1 h-7 text-gray-500"
          >
            Skip
            <SkipForward className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            onClick={handleCheckWork}
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
          >
            <ClipboardCheck className="h-3 w-3" />
            Check Work
          </Button>

          {/* Show interaction requirement hint */}
          {(isCompleted || validationResult?.passed) && requiredEvent && !hasRequiredEvent && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <MousePointerClick className="h-3 w-3" />
              Try the preview site first
            </span>
          )}

          <Button
            size="sm"
            onClick={handleNext}
            disabled={!isNextEnabled}
            title={
              !isNextEnabled && requiredEvent && !hasRequiredEvent
                ? `Fire a "${requiredEvent}" event on the preview site first`
                : undefined
            }
            className={`h-7 text-xs gap-1 transition-all ${
              isNextEnabled
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLastChallenge ? (
              <><Trophy className="h-3 w-3" />Finish</>
            ) : (
              <>Next<ChevronRight className="h-3 w-3" /></>
            )}
          </Button>
        </div>
      </header>

      {/* ── Three-column main layout ── */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">

        {/* Column 1: Instructions */}
        <div
          style={{ width: `${leftWidth}px` }}
          className="shrink-0 flex flex-col border-r bg-white overflow-hidden"
        >
          <div className="px-3 py-2 border-b bg-gray-50 shrink-0">
            <span className="text-xs font-medium text-gray-600">Instructions</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <InstructionsPanel challenge={challenge} />
            {hasValidated && validationResult && !validationResult.passed && (
              <div className="mt-4">
                <ValidationFeedback result={validationResult} />
              </div>
            )}
          </div>
        </div>

        {/* Drag handle — left */}
        <div
          className="w-1.5 shrink-0 cursor-col-resize bg-gray-200 hover:bg-blue-400 transition-colors active:bg-blue-500"
          onMouseDown={(e) => {
            e.preventDefault();
            isDraggingLeft.current = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
        />

        {/* Column 2: Preview Site */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="px-3 py-2 border-b bg-gray-50 shrink-0">
            <span className="text-xs font-medium text-gray-600">Preview Site</span>
            {requiredEvent && !hasRequiredEvent && (isCompleted || validationResult?.passed) && (
              <span className="ml-2 text-xs text-amber-600">
                — fire a <code className="bg-amber-50 px-1 rounded font-mono">{requiredEvent}</code> event here to unlock Next
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <MockWebsite
              type={challenge.mockWebsite}
              eventLogHeight={eventLogHeight}
              onEventLogHeightChange={setEventLogHeight}
              onEvent={(name, data) => {
                const entry: EventLogEntry = {
                  id: `${Date.now()}-${Math.random()}`,
                  timestamp: Date.now(),
                  name,
                  data: data ?? {},
                };
                setFiredEvents((prev) => [entry, ...prev].slice(0, 50));
              }}
            />
          </div>
        </div>

        {/* Drag handle — right */}
        <div
          className="w-1.5 shrink-0 cursor-col-resize bg-gray-200 hover:bg-blue-400 transition-colors active:bg-blue-500"
          onMouseDown={(e) => {
            e.preventDefault();
            isDraggingRight.current = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
        />

        {/* Column 3: GTM Workspace */}
        <div
          style={{ width: `${rightWidth}px` }}
          className="shrink-0 flex flex-col overflow-hidden"
        >
          <div className="px-3 py-2 border-b bg-gray-50 shrink-0 border-l">
            <span className="text-xs font-medium text-gray-600">GTM Workspace</span>
          </div>
          <div className="flex-1 overflow-hidden p-2 min-h-0 border-l">
            <GTMWorkspace />
          </div>
        </div>
      </div>

      {/* ── Check Work results dialog ── */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {validationResult?.passed ? '✓ All checks passed!' : 'Check Work Results'}
            </DialogTitle>
          </DialogHeader>
          {validationResult && (
            <div className="space-y-3">
              <ValidationFeedback result={validationResult} />
              {validationResult.passed && requiredEvent && !hasRequiredEvent && (
                <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-800">
                  <strong>One more step:</strong> Navigate the preview site to fire a{' '}
                  <code className="bg-amber-100 px-1 rounded font-mono">{requiredEvent}</code>{' '}
                  event. This lets you see your tag in action before advancing!
                </div>
              )}
              {validationResult.passed && (!requiredEvent || hasRequiredEvent) && (
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => { setShowValidationDialog(false); handleNext(); }}
                >
                  {isLastChallenge ? '🏆 Finish & Earn Certificate' : 'Continue to Next Challenge →'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
