'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface EventLogEntry {
  id: string;
  timestamp: number;
  name: string;
  data: Record<string, unknown>;
  type?: 'dlEvent' | 'tagFired' | 'blocked';
  tagType?: string;
}

type FilterTab = 'All' | 'Data Layer' | 'Tags Fired' | 'Errors';

interface EventLogProps {
  events: EventLogEntry[];
  onClose?: () => void;
  onHeaderMouseDown?: (e: React.MouseEvent) => void;
}

const TAG_TYPE_SHORT: Record<string, string> = {
  GoogleTag: 'Google Tag',
  FloodlightActivity: 'Floodlight',
  GA4Configuration: 'GA4',
  GA4Event: 'GA4 Event',
  GoogleAdsConversion: 'Google Ads',
  ConversionLinker: 'Conv. Linker',
  CustomHTML: 'HTML',
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatPayload(data: Record<string, unknown>): string {
  const entries = Object.entries(data);
  if (entries.length === 0) return '';
  const parts = entries.slice(0, 3).map(([k, v]) => `${k}: "${v}"`);
  if (entries.length > 3) parts.push('…');
  return `{ ${parts.join(', ')} }`;
}

const TABS: FilterTab[] = ['All', 'Data Layer', 'Tags Fired', 'Errors'];

export function EventLog({ events, onClose, onHeaderMouseDown }: EventLogProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [minimized, setMinimized] = useState(false);

  const filteredEvents = events.filter((e) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Data Layer') return !e.type || e.type === 'dlEvent';
    if (activeTab === 'Tags Fired') return e.type === 'tagFired';
    if (activeTab === 'Errors') return e.type === 'blocked';
    return true;
  });

  return (
    <div
      className="rounded-lg overflow-hidden shadow-2xl select-none"
      style={{ background: '#1a1d24', border: '1px solid #2e3340', width: '440px' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          borderBottom: '1px solid #2e3340',
          cursor: 'grab',
        }}
        onMouseDown={onHeaderMouseDown}
      >
        <span style={{ color: '#22c55e', fontSize: '9px', lineHeight: 1 }}>●</span>
        <span className="text-xs font-semibold" style={{ color: '#e5e7eb' }}>
          Live Debugger
        </span>
        <span className="text-xs" style={{ color: '#4b5563' }}>
          — Container PSL-DEMO
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          {/* Decorative buttons */}
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center rounded text-xs transition-colors hover:bg-white/10"
            style={{ color: '#4b5563' }}
            tabIndex={-1}
            aria-hidden="true"
          >
            ▽
          </button>
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center rounded text-xs transition-colors hover:bg-white/10"
            style={{ color: '#4b5563' }}
            tabIndex={-1}
            aria-hidden="true"
          >
            +
          </button>
          {/* Minimize */}
          <button
            type="button"
            onClick={() => setMinimized((m) => !m)}
            className="w-5 h-5 flex items-center justify-center rounded text-xs transition-colors hover:bg-white/10"
            style={{ color: '#9ca3af' }}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            −
          </button>
          {/* Close */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center rounded text-sm transition-colors hover:bg-white/10"
              style={{ color: '#9ca3af' }}
              title="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {!minimized && (
        <>
          {/* Filter tabs */}
          <div
            className="flex items-center px-2 py-1 gap-0.5"
            style={{ borderBottom: '1px solid #2e3340', background: '#161920' }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="text-xs px-2 py-0.5 rounded transition-colors"
                style={{
                  color: activeTab === tab ? '#e5e7eb' : '#6b7280',
                  background: activeTab === tab ? '#374151' : 'transparent',
                }}
              >
                {tab}
              </button>
            ))}
            <span className="ml-auto text-xs tabular-nums font-mono" style={{ color: '#4b5563' }}>
              {filteredEvents.length} events
            </span>
          </div>

          {/* Event list */}
          <ScrollArea style={{ height: '220px' }}>
            <div className="py-1 font-mono text-xs">
              {filteredEvents.length === 0 ? (
                <p className="px-3 py-4 italic" style={{ color: '#4b5563' }}>
                  {events.length === 0
                    ? 'Interact with the site to see events…'
                    : 'No events match this filter.'}
                </p>
              ) : (
                filteredEvents.map((event) => {
                  if (event.type === 'tagFired') {
                    const typeLabel = event.tagType
                      ? (TAG_TYPE_SHORT[event.tagType] ?? event.tagType)
                      : '';
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-2.5 px-3 py-1 min-w-0"
                        style={{ background: '#1f2937' }}
                      >
                        <span className="shrink-0 tabular-nums" style={{ color: '#374151' }}>
                          {formatTime(event.timestamp)}
                        </span>
                        <span className="shrink-0" style={{ color: '#f59e0b' }}>
                          ⚡
                        </span>
                        <span
                          className="shrink-0 font-bold tracking-wide"
                          style={{ color: '#fbbf24' }}
                        >
                          FIRED
                        </span>
                        <span className="truncate" style={{ color: '#fde68a' }}>
                          {event.name}
                          {typeLabel && (
                            <span style={{ color: '#6b7280' }}> — {typeLabel}</span>
                          )}
                          <span style={{ color: '#4ade80' }}> ✓</span>
                        </span>
                      </div>
                    );
                  }

                  if (event.type === 'blocked') {
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-2.5 px-3 py-1 min-w-0"
                      >
                        <span className="shrink-0 tabular-nums" style={{ color: '#374151' }}>
                          {formatTime(event.timestamp)}
                        </span>
                        <span
                          className="shrink-0 font-bold"
                          style={{ color: '#ef4444' }}
                        >
                          ✕ blocked
                        </span>
                        <span className="truncate" style={{ color: '#9ca3af' }}>
                          {event.name}
                        </span>
                      </div>
                    );
                  }

                  // dlEvent (default)
                  const payload = formatPayload(event.data);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-2.5 px-3 py-1 min-w-0"
                    >
                      <span className="shrink-0 tabular-nums" style={{ color: '#374151' }}>
                        {formatTime(event.timestamp)}
                      </span>
                      <span
                        className="shrink-0 font-semibold"
                        style={{ color: '#34d399' }}
                      >
                        {event.name}
                      </span>
                      {payload && (
                        <span className="truncate" style={{ color: '#6b7280' }}>
                          {payload}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
