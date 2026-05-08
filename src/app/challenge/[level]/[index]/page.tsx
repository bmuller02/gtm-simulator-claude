'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { ChevronLeft, ChevronRight, ClipboardCheck, Trophy, MousePointerClick } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkspaceState, Trigger, Tag, Variable, DataLayerVariableConfig } from '@/lib/types/gtm';

// ── Tag firing simulation ─────────────────────────────────────────────────────

function resolveVariableValue(
  variableName: string,
  eventData: Record<string, unknown>,
  variables: Variable[]
): string {
  const dlVar = variables.find(
    (v) => v.type === 'DataLayer' && v.name.toLowerCase() === variableName.toLowerCase()
  );
  if (dlVar) {
    const key = (dlVar.config as DataLayerVariableConfig).dataLayerVariableName;
    return String(eventData[key] ?? '');
  }
  const lower = variableName.toLowerCase();
  if (lower.includes('page url') || lower.includes('page_url')) {
    return `https://preview.site${eventData.page_path || '/'}`;
  }
  if (lower.includes('page path') || lower.includes('page_path')) {
    return String(eventData.page_path || '/');
  }
  if (lower.includes('click text')) {
    return eventData.click_text ? String(eventData.click_text) : 'Add to Cart';
  }
  return String(eventData[variableName] ?? eventData[lower] ?? '');
}

function evaluateCondition(actual: string, operator: string, expected: string): boolean {
  const a = actual.toLowerCase();
  const e = expected.toLowerCase();
  switch (operator) {
    case 'equals': return a === e;
    case 'doesNotEqual': return a !== e;
    case 'contains': return a.includes(e);
    case 'doesNotContain': return !a.includes(e);
    case 'startsWith': return a.startsWith(e);
    case 'greaterThan': return parseFloat(actual) > parseFloat(expected);
    case 'lessThan': return parseFloat(actual) < parseFloat(expected);
    default: return false;
  }
}

function triggerFires(
  trigger: Trigger,
  eventName: string,
  eventData: Record<string, unknown>,
  variables: Variable[]
): boolean {
  const pageViewEvents = ['page_view'];
  const clickEvents = ['add_to_cart'];
  const formEvents = ['form_submission'];

  switch (trigger.type) {
    case 'PageView':
      if (!pageViewEvents.includes(eventName)) return false;
      break;
    case 'Click':
      if (!clickEvents.includes(eventName)) return false;
      break;
    case 'FormSubmission':
      if (!formEvents.includes(eventName)) return false;
      break;
    case 'CustomEvent':
      if (trigger.customEventName?.toLowerCase() !== eventName.toLowerCase()) return false;
      break;
    default:
      return false;
  }

  for (const condition of trigger.conditions) {
    const actual = resolveVariableValue(condition.variable, eventData, variables);
    if (!evaluateCondition(actual, condition.operator, condition.value)) {
      return false;
    }
  }
  return true;
}

function simulateFiredTags(
  workspace: WorkspaceState,
  eventName: string,
  eventData: Record<string, unknown>
): Tag[] {
  return workspace.tags.filter((tag) => {
    if (!tag.firingTriggerId) return false;
    const trigger = workspace.triggers.find((t) => t.id === tag.firingTriggerId);
    if (!trigger) return false;
    return triggerFires(trigger, eventName, eventData, workspace.variables);
  });
}

const REQUIRED_EVENTS: Record<string, string> = {
  '1-1': 'page_view',
  '1-2': 'add_to_cart',
  '1-3': 'page_view',
  '2-1': 'form_submission',
  '2-2': 'purchase',
};

const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  2: { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' },
  3: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
};

const LEVEL_NAMES: Record<number, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
};

interface PageProps {
  params: Promise<{ level: string; index: string }>;
}

// Default workspace height (px)
const DEFAULT_WORKSPACE_HEIGHT = 200;

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
  const [workspaceHeight, setWorkspaceHeight] = useState(DEFAULT_WORKSPACE_HEIGHT);
  const [workspaceCollapsed, setWorkspaceCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingWorkspace = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (isDraggingLeft.current) {
      const newWidth = Math.max(200, Math.min(420, e.clientX - rect.left));
      setLeftWidth(newWidth);
    }
    if (isDraggingWorkspace.current) {
      const newHeight = Math.max(120, Math.min(500, rect.bottom - e.clientY));
      setWorkspaceHeight(newHeight);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingLeft.current = false;
    isDraggingWorkspace.current = false;
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
          <p style={{ color: '#6b7280' }}>Challenge not found.</p>
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
    if (result.passed) markComplete(challenge.id);
  };

  const handleNext = () => {
    if (nextChallenge) router.push(`/challenge/${nextChallenge.level}/${nextChallenge.index}`);
    else router.push('/quiz');
  };

  const handleSkip = () => {
    if (nextChallenge) router.push(`/challenge/${nextChallenge.level}/${nextChallenge.index}`);
    else router.push('/quiz');
  };

  const handleNavigate = (value: string | null) => {
    if (!value) return;
    const [l, i] = value.split('-');
    router.push(`/challenge/${l}/${i}`);
  };

  const isNextEnabled = (isCompleted || (validationResult?.passed ?? false)) && hasRequiredEvent;
  const isLastChallenge = !nextChallenge;
  const levelColor = LEVEL_COLORS[challenge.level];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#faf8f4' }}>

      {/* ── Top Navigation Bar ─────────────────────────────────────── */}
      <header
        className="shrink-0 flex items-center gap-3 px-4 py-2"
        style={{ background: '#ffffff', borderBottom: '1px solid #c9c5be' }}
      >
        {/* PSL Branding */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <span className="text-xs font-bold tracking-widest" style={{ color: '#1a1d24' }}>
            PLATFORM SOLUTIONS
          </span>
          <span
            className="text-xs font-semibold px-1.5 py-0.5"
            style={{ border: '1px solid #4f5b8a', color: '#4f5b8a' }}
          >
            LABS
          </span>
        </button>

        <Separator orientation="vertical" className="h-5" style={{ background: '#c9c5be' }} />

        {/* Simulator title + challenge name */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold shrink-0" style={{ color: '#1a1d24' }}>
            Tag Manager Simulator
          </span>
          <span className="text-sm truncate" style={{ color: '#6b7280' }}>
            · {challenge.title}
          </span>
        </div>

        {/* Right-side controls */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Level badge */}
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{ background: levelColor.bg, color: levelColor.text, border: `1px solid ${levelColor.border}` }}
          >
            Level {challenge.level}
          </span>

          {/* Challenge selector */}
          <Select value={`${level}-${index}`} onValueChange={handleNavigate}>
            <SelectTrigger
              className="h-7 text-xs"
              style={{ width: '140px', borderColor: '#c9c5be' }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_CHALLENGES.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span style={{ color: completedChallenges.includes(c.id) ? '#5b8a5b' : '#c9c5be' }}>
                      {completedChallenges.includes(c.id) ? '✓' : '○'}
                    </span>
                    L{c.level}-{c.index}: {c.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {ALL_CHALLENGES.map((c) => (
              <div
                key={c.id}
                className="w-2 h-2 rounded-full transition-colors"
                style={{
                  background: completedChallenges.includes(c.id)
                    ? '#5b8a5b'
                    : c.id === challenge.id
                    ? '#4f5b8a'
                    : '#c9c5be',
                }}
                title={c.title}
              />
            ))}
          </div>

          <Separator orientation="vertical" className="h-5" style={{ background: '#c9c5be' }} />

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="text-xs px-3 py-1.5 rounded transition-colors hover:bg-gray-100"
            style={{ color: '#6b7280' }}
          >
            Skip
          </button>

          {/* Check Work */}
          <button
            onClick={handleCheckWork}
            className="text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors hover:bg-gray-50"
            style={{ border: '1px solid #1a1d24', color: '#1a1d24', background: '#ffffff' }}
          >
            <ClipboardCheck className="h-3 w-3" />
            Check Work
          </button>

          {/* Interaction hint */}
          {(isCompleted || validationResult?.passed) && requiredEvent && !hasRequiredEvent && (
            <span className="text-xs flex items-center gap-1" style={{ color: '#c98a3a' }}>
              <MousePointerClick className="h-3 w-3" />
              Try the preview site first
            </span>
          )}

          {/* Next / Finish */}
          <button
            onClick={handleNext}
            disabled={!isNextEnabled}
            title={
              !isNextEnabled && requiredEvent && !hasRequiredEvent
                ? `Fire a "${requiredEvent}" event on the preview site first`
                : undefined
            }
            className="text-xs px-3 py-1.5 rounded flex items-center gap-1.5 font-semibold transition-colors"
            style={{
              background: isNextEnabled ? '#1a1d24' : '#e6e2db',
              color: isNextEnabled ? '#ffffff' : '#a39d94',
              cursor: isNextEnabled ? 'pointer' : 'not-allowed',
            }}
          >
            {isLastChallenge ? (
              <><Trophy className="h-3 w-3" />Finish</>
            ) : (
              <>Next <ChevronRight className="h-3 w-3" /></>
            )}
          </button>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden min-h-0">

        {/* Column 1: Instructions */}
        <div
          className="shrink-0 flex flex-col overflow-hidden"
          style={{ width: `${leftWidth}px`, background: '#ffffff', borderRight: '1px solid #c9c5be' }}
        >
          <div
            className="px-3 py-2 shrink-0"
            style={{ borderBottom: '1px solid #e6e2db', background: '#faf8f4' }}
          >
            <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>Instructions</span>
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
          className="w-1.5 shrink-0 cursor-col-resize transition-colors"
          style={{ background: '#e6e2db' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#4f5b8a')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#e6e2db')}
          onMouseDown={(e) => {
            e.preventDefault();
            isDraggingLeft.current = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
        />

        {/* Column 2: Preview + Workspace stacked */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Preview Site label */}
          <div
            className="px-3 py-2 shrink-0"
            style={{ borderBottom: '1px solid #e6e2db', background: '#faf8f4' }}
          >
            <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>Preview Site</span>
            {requiredEvent && !hasRequiredEvent && (isCompleted || validationResult?.passed) && (
              <span className="ml-2 text-xs" style={{ color: '#c98a3a' }}>
                — fire a <code
                  className="px-1 rounded font-mono text-xs"
                  style={{ background: '#fef4c8', color: '#c98a3a' }}
                >{requiredEvent}</code> event to unlock Next
              </span>
            )}
          </div>

          {/* Preview site */}
          <div className="flex-1 overflow-hidden min-h-0">
            <MockWebsite
              type={challenge.mockWebsite}
              externalLog={firedEvents}
              onEvent={(name, data) => {
                const ts = Date.now();
                const entry: EventLogEntry = {
                  id: `${ts}-${Math.random()}`,
                  timestamp: ts,
                  name,
                  data: data ?? {},
                  type: 'dlEvent',
                };
                const workspace = getSnapshot();
                const fired = simulateFiredTags(workspace, name, data ?? {});
                const tagEntries: EventLogEntry[] = fired.map((tag) => ({
                  id: `${ts}-tag-${tag.id}`,
                  timestamp: ts,
                  name: tag.name,
                  data: {},
                  type: 'tagFired' as const,
                  tagType: tag.type,
                }));
                setFiredEvents((prev) => [...tagEntries, entry, ...prev].slice(0, 100));
              }}
            />
          </div>

          {/* Workspace resize handle */}
          {!workspaceCollapsed && (
            <div
              className="h-1.5 shrink-0 cursor-row-resize transition-colors flex items-center justify-center"
              style={{ background: '#e6e2db' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#4f5b8a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#e6e2db')}
              onMouseDown={(e) => {
                e.preventDefault();
                isDraggingWorkspace.current = true;
                document.body.style.cursor = 'row-resize';
                document.body.style.userSelect = 'none';
              }}
            >
              <div className="w-8 h-0.5 rounded-full" style={{ background: '#a39d94' }} />
            </div>
          )}

          {/* Simulator Workspace bottom bar */}
          <div
            className="shrink-0 overflow-hidden"
            style={{ height: workspaceCollapsed ? 'auto' : `${workspaceHeight}px` }}
          >
            <GTMWorkspace
              collapsed={workspaceCollapsed}
              onToggleCollapse={() => setWorkspaceCollapsed((c) => !c)}
              onBuilderOpen={() => {
                setWorkspaceCollapsed(false);
                setWorkspaceHeight((h) => Math.max(h, 420));
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Check Work results dialog ── */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent
          className="max-w-lg p-0 overflow-hidden gap-0"
          style={{ background: '#fefcf9', border: '1px solid #e6e2db', borderRadius: '12px' }}
        >
          {/* suppress the default DialogTitle for screen-reader by providing sr-only title */}
          <DialogHeader className="sr-only">
            <DialogTitle>Check Work Results</DialogTitle>
          </DialogHeader>
          {validationResult && (
            <>
              <div className="px-6 pt-6 pb-2">
                <ValidationFeedback result={validationResult} />

                {/* Required-event nudge */}
                {validationResult.passed && requiredEvent && !hasRequiredEvent && (
                  <div
                    className="mt-4 rounded px-3 py-2 text-xs leading-relaxed"
                    style={{ background: '#fef9c3', border: '1px solid #fde68a' }}
                  >
                    <strong style={{ color: '#b45309' }}>One more step: </strong>
                    <span style={{ color: '#78350f' }}>
                      Navigate the preview site to fire a{' '}
                      <code
                        className="px-1 rounded font-mono"
                        style={{ background: '#fef3c7', color: '#92400e' }}
                      >{requiredEvent}</code>{' '}
                      event to see your tag in action before advancing.
                    </span>
                  </div>
                )}

                {/* Continue button (all passed + event fired) */}
                {validationResult.passed && (!requiredEvent || hasRequiredEvent) && (
                  <button
                    className="mt-4 w-full py-2 text-sm font-semibold rounded transition-colors"
                    style={{ background: '#1a1d24', color: '#ffffff' }}
                    onClick={() => { setShowValidationDialog(false); handleNext(); }}
                  >
                    {isLastChallenge ? 'Finish & Earn Certificate →' : 'Continue to Next Challenge →'}
                  </button>
                )}
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-6 py-4 mt-2"
                style={{ borderTop: '1px solid #e6e2db', background: '#faf8f4' }}
              >
                <button
                  onClick={() => setShowValidationDialog(false)}
                  className="text-sm px-4 py-1.5 rounded transition-colors hover:bg-gray-100"
                  style={{ color: '#6b7280', border: '1px solid #e6e2db' }}
                >
                  Close
                </button>
                {!validationResult.passed && (
                  <button
                    onClick={handleCheckWork}
                    className="text-sm px-4 py-1.5 rounded font-semibold transition-colors"
                    style={{ background: '#1a1d24', color: '#ffffff' }}
                  >
                    Re-check
                  </button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
