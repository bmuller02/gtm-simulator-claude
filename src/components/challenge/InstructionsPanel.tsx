'use client';

import { useState } from 'react';
import { ChallengeDefinition } from '@/lib/types/challenge';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronRight, Lightbulb, Target } from 'lucide-react';

interface InstructionsPanelProps {
  challenge: ChallengeDefinition;
}

const LEVEL_COLORS = {
  1: 'bg-green-100 text-green-700 border-green-200',
  2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  3: 'bg-red-100 text-red-700 border-red-200',
};

const LEVEL_NAMES = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
};

export function InstructionsPanel({ challenge }: InstructionsPanelProps) {
  const [hintsExpanded, setHintsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-xs ${LEVEL_COLORS[challenge.level]}`}>
            Level {challenge.level} — {LEVEL_NAMES[challenge.level]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Challenge {challenge.index}/3
          </Badge>
        </div>
        <h2 className="text-base font-semibold text-gray-900">{challenge.title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{challenge.scenario}</p>
      </div>

      <Separator />

      {/* Objectives */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Target className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-800">Objectives</span>
        </div>
        <ul className="space-y-1">
          {challenge.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <span className="shrink-0 w-4 h-4 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                {i + 1}
              </span>
              {obj}
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Instructions */}
      <div>
        <span className="text-sm font-medium text-gray-800 mb-2 block">How to Complete</span>
        <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
          {challenge.instructions.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return <h3 key={i} className="font-semibold text-gray-800 text-xs mt-3 first:mt-0">{line.replace('## ', '')}</h3>;
            }
            if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
              const parts = line.split('. ');
              const num = parts[0];
              const content = parts.slice(1).join('. ');
              return (
                <div key={i} className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {num}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: formatLine(content) }} />
                </div>
              );
            }
            if (line.startsWith('   - ')) {
              return (
                <div key={i} className="ml-7 flex gap-1.5 text-gray-500">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span dangerouslySetInnerHTML={{ __html: formatLine(line.replace('   - ', '')) }} />
                </div>
              );
            }
            if (line.startsWith('**Bug')) {
              return (
                <div key={i} className="bg-red-50 border border-red-100 rounded px-2 py-1 mt-2">
                  <span className="font-semibold text-red-700 text-xs" dangerouslySetInnerHTML={{ __html: formatLine(line) }} />
                </div>
              );
            }
            if (line === '') return null;
            return <p key={i} dangerouslySetInnerHTML={{ __html: formatLine(line) }} />;
          })}
        </div>
      </div>

      {/* Hints */}
      {challenge.hints.length > 0 && (
        <>
          <Separator />
          <div>
            <button
              onClick={() => setHintsExpanded(!hintsExpanded)}
              className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              Hints ({challenge.hints.length})
              {hintsExpanded ? (
                <ChevronDown className="h-3 w-3 ml-auto" />
              ) : (
                <ChevronRight className="h-3 w-3 ml-auto" />
              )}
            </button>
            {hintsExpanded && (
              <ul className="mt-2 space-y-1.5">
                {challenge.hints.map((hint, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 rounded px-2 py-1.5">
                    <span className="shrink-0 text-amber-500">💡</span>
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function formatLine(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>');
}
