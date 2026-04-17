'use client';

import { useState } from 'react';
import { ChallengeDefinition } from '@/lib/types/challenge';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
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

// ── Glossary ──────────────────────────────────────────────────────────────────
// Keys are lowercase. Phrases are matched case-insensitively in the text.
const GLOSSARY: Record<string, string> = {
  'data layer': 'A JavaScript array (window.dataLayer) on the page that developers push structured data into. GTM reads this data to power tags and triggers.',
  'data layer variable': 'A GTM variable type that reads a specific key from the dataLayer array. If the dev pushes { userType: "internal" }, a Data Layer Variable named "userType" captures that value.',
  'custom event': 'In the context of GTM triggers, a custom event is NOT the GA4 "Custom Event" tag type. It refers to a developer-pushed dataLayer event: dataLayer.push({ event: "purchase" }). The Custom Event trigger listens for these specific event names.',
  'page view trigger': 'Fires when a browser loads a new page. Can have conditions (e.g. only on URLs containing "/products") or fire on all pages.',
  'click trigger': 'Fires when a user clicks an element matching your conditions. Use "Click Text" to match a button\'s label, or "Click Element" to match by CSS selector.',
  'form submission trigger': 'Fires when a user submits an HTML form. Can fire on all forms or only forms matching specific conditions.',
  'firing trigger': 'The trigger assigned to a tag that determines when the tag fires. A tag will not fire unless it has a firing trigger assigned.',
  'measurement id': 'A unique identifier for your GA4 property, formatted as G-XXXXXXXXX. Found in your GA4 property settings under Data Streams.',
  'custom dimension': 'Extra data parameters you attach to a GA4 event. For example, sending { email: "user@co.com" } alongside a form_submission event lets you segment that data in GA4 reports.',
  'css selector': 'A pattern used to identify HTML elements, e.g. input[name="email"] targets an input whose name attribute is "email". The same syntax used in CSS stylesheets.',
  'dom element': 'Any HTML element on a webpage (a button, input field, div, etc.). GTM\'s DOM Element variable type lets you read any attribute from any element.',
  'tag sequencing': 'A GTM feature that guarantees one tag fires before another. Configured under Advanced Settings in any tag, where you can specify that a tag must fire before or after this tag.',
  'conversion linker': 'A Google tag that stores click information from Google Ads URLs in first-party cookies, enabling cross-device and cross-domain conversion tracking.',
  'consent mode': 'A Google framework that lets tags operate in a cookieless mode when users deny consent. Cookieless pings are sent instead of full tracking data, preserving some measurement capability.',
  'gdpr': 'General Data Protection Regulation — an EU law that requires websites to obtain user consent before collecting personal data. GTM Consent Mode helps comply with GDPR requirements.',
  'google tag': 'A universal Google tag (tag ID starting with GT- or DC-) that acts as the base configuration for Google\'s measurement products, including GA4 and CM360 Floodlight.',
  'floodlight': 'Campaign Manager 360\'s conversion tracking system. Floodlight tags fire on key actions (page views, clicks, form fills) and report back to CM360 for attribution.',
  'floodlight activity': 'A specific conversion event tracked by CM360. Each activity has a unique Activity Tag String and belongs to an Activity Group.',
};

// Build a regex that matches any glossary term (longest first to avoid partial matches)
const glossaryKeys = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
const glossaryRegex = new RegExp(`(${glossaryKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

// ── GlossaryText: renders text with portal-based tooltip-enabled glossary terms ─────
function GlossaryText({ text }: { text: string }) {
  // Split text into plain and glossary segments
  const parts = text.split(glossaryRegex);

  return (
    <span>
      {parts.map((part, i) => {
        const lower = part.toLowerCase();
        const definition = GLOSSARY[lower];
        if (!definition) return <span key={i}>{part}</span>;

        return (
          <Tooltip key={i}>
            <TooltipTrigger
              className="underline decoration-dotted decoration-blue-400 text-blue-700 cursor-help font-medium"
            >
              {part}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
              <span className="font-semibold block mb-0.5">{part}</span>
              {definition}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}

export function InstructionsPanel({ challenge }: InstructionsPanelProps) {
  const [tipsExpanded, setTipsExpanded] = useState(false);

  return (
    <TooltipProvider>
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
          <p className="text-sm text-gray-600 leading-relaxed">
            <GlossaryText text={challenge.scenario} />
          </p>
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
                <GlossaryText text={obj} />
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
              if (/^[1-9]\. /.test(line)) {
                const dotIdx = line.indexOf('. ');
                const num = line.slice(0, dotIdx);
                const content = line.slice(dotIdx + 2);
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

        {/* Tips */}
        {challenge.hints.length > 0 && (
          <>
            <Separator />
            <div>
              <button
                onClick={() => setTipsExpanded(!tipsExpanded)}
                className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors w-full"
              >
                <Lightbulb className="h-4 w-4" />
                Tips ({challenge.hints.length})
                {tipsExpanded ? (
                  <ChevronDown className="h-3 w-3 ml-auto" />
                ) : (
                  <ChevronRight className="h-3 w-3 ml-auto" />
                )}
              </button>
              {tipsExpanded && (
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

        <p className="text-xs text-blue-500 italic pt-1">
          Hover over <span className="underline decoration-dotted">underlined terms</span> for definitions.
        </p>
      </div>
    </TooltipProvider>
  );
}

function formatLine(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
