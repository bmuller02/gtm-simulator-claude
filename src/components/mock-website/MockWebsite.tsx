'use client';

import { useEffect, useRef, useState } from 'react';
import { MockWebsiteType } from '@/lib/types/challenge';
import { MockEcommerce } from './MockEcommerce';
import { MockContactForm } from './MockContactForm';
import { MockCheckout } from './MockCheckout';
import { MockCookieBanner } from './MockCookieBanner';
import { MockMarketing } from './MockMarketing';
import { EventLog, EventLogEntry } from './EventLog';

interface MockWebsiteProps {
  type: MockWebsiteType;
  onEvent?: (name: string, data?: Record<string, unknown>) => void;
  externalLog?: EventLogEntry[];
}

export function MockWebsite({ type, onEvent, externalLog }: MockWebsiteProps) {
  const [localEvents, setLocalEvents] = useState<EventLogEntry[]>([]);
  const [debuggerOpen, setDebuggerOpen] = useState(true);

  // Drag state: null = default bottom-right corner
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDragPos({
        x: Math.max(0, e.clientX - rect.left - dragOffset.current.x),
        y: Math.max(0, e.clientY - rect.top - dragOffset.current.y),
      });
    };
    const handleUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current || !containerRef.current) return;
    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - panelRect.left,
      y: e.clientY - panelRect.top,
    };
    // Anchor current position so it doesn't jump
    setDragPos({
      x: panelRect.left - containerRect.left,
      y: panelRect.top - containerRect.top,
    });
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const fireEvent = (name: string, data: Record<string, unknown> = {}) => {
    const entry: EventLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      name,
      data,
    };
    setLocalEvents((prev) => [entry, ...prev].slice(0, 50));
    onEvent?.(name, data);
  };

  const siteContent = (() => {
    if (type === 'ecommerce' || type === 'broken') return <MockEcommerce onEvent={fireEvent} />;
    if (type === 'contact') return <MockContactForm onEvent={fireEvent} />;
    if (type === 'checkout') return <MockCheckout onEvent={fireEvent} />;
    if (type === 'cookieBanner') return <MockCookieBanner onEvent={fireEvent} />;
    if (type === 'marketing') return <MockMarketing onEvent={fireEvent} />;
    return null;
  })();

  const url =
    type === 'ecommerce' || type === 'broken' ? 'https://demo-store.example.com/products' :
    type === 'contact' ? 'https://demo-saas.example.com/contact' :
    type === 'checkout' ? 'https://demo-store.example.com/thank-you' :
    type === 'cookieBanner' ? 'https://demo-eu.example.com' :
    'https://demo-agency.example.com';

  const events = externalLog ?? localEvents;

  const floatStyle: React.CSSProperties = dragPos
    ? { top: dragPos.y, left: dragPos.x }
    : { bottom: '16px', right: '16px' };

  return (
    <div ref={containerRef} className="flex flex-col h-full relative overflow-hidden">
      {/* Browser chrome */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 py-2"
        style={{ background: '#f3efe7', borderBottom: '1px solid #c9c5be' }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <div
          className="flex-1 rounded px-2 py-0.5 text-xs font-mono truncate"
          style={{ background: '#ffffff', border: '1px solid #c9c5be', color: '#6b7280' }}
        >
          {url}
        </div>
        <button
          onClick={() => setDebuggerOpen((o) => !o)}
          className="shrink-0 text-xs px-2 py-0.5 rounded transition-colors"
          style={{
            border: '1px solid #c9c5be',
            background: debuggerOpen ? '#1a1d24' : '#ffffff',
            color: debuggerOpen ? '#9ca3af' : '#6b7280',
          }}
        >
          {debuggerOpen ? 'Hide Debugger' : 'Show Debugger'}
        </button>
      </div>

      {/* Site content */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        {siteContent}
      </div>

      {/* Floating debugger overlay */}
      {debuggerOpen && (
        <div ref={panelRef} className="absolute z-20" style={floatStyle}>
          <EventLog
            events={events}
            onClose={() => {
              setDebuggerOpen(false);
              setDragPos(null);
            }}
            onHeaderMouseDown={handleHeaderMouseDown}
          />
        </div>
      )}
    </div>
  );
}
