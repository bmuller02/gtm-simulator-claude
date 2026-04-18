'use client';

import { useRef, useState } from 'react';
import { MockWebsiteType } from '@/lib/types/challenge';
import { MockEcommerce } from './MockEcommerce';
import { MockContactForm } from './MockContactForm';
import { MockCheckout } from './MockCheckout';
import { MockCookieBanner } from './MockCookieBanner';
import { MockMarketing } from './MockMarketing';
import { EventLog, EventLogEntry } from './EventLog';
import { Badge } from '@/components/ui/badge';
import { Monitor } from 'lucide-react';

interface MockWebsiteProps {
  type: MockWebsiteType;
  /** Height in px of the event log panel. Default 130. */
  eventLogHeight?: number;
  /** Called when user drags the event log resize handle */
  onEventLogHeightChange?: (height: number) => void;
  /** Optional external event listener (used by challenge page to detect fired events) */
  onEvent?: (name: string, data?: Record<string, unknown>) => void;
  /** If provided, shown in the EventLog instead of local state (allows tag-fired entries from parent) */
  externalLog?: EventLogEntry[];
}

export function MockWebsite({ type, eventLogHeight = 130, onEventLogHeightChange, onEvent, externalLog }: MockWebsiteProps) {
  const [localEvents, setLocalEvents] = useState<EventLogEntry[]>([]);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(eventLogHeight);

  const fireEvent = (name: string, data: Record<string, unknown> = {}) => {
    const entry: EventLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      name,
      data,
    };
    setLocalEvents((prev) => [entry, ...prev].slice(0, 20));
    onEvent?.(name, data);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = eventLogHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartY.current - ev.clientY;
      const newHeight = Math.max(60, Math.min(400, dragStartHeight.current + delta));
      onEventLogHeightChange?.(newHeight);
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
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

  return (
    <div className="flex flex-col h-full">
      {/* Browser chrome + site content */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
        <div className="bg-gray-100 border-b px-3 py-2 flex items-center gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded border px-2 py-0.5 text-xs text-gray-500 font-mono truncate">
            {url}
          </div>
          <Badge variant="outline" className="text-xs font-normal py-0">
            <Monitor className="h-2.5 w-2.5 mr-1" />
            Preview
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {siteContent}
        </div>
      </div>

      {/* Drag handle to resize event log */}
      <div
        className="h-1.5 shrink-0 cursor-row-resize bg-gray-200 hover:bg-blue-400 transition-colors flex items-center justify-center"
        onMouseDown={handleResizeMouseDown}
        title="Drag to resize event log"
      >
        <div className="w-8 h-0.5 rounded-full bg-gray-400" />
      </div>

      {/* Event log */}
      <EventLog events={externalLog ?? localEvents} height={eventLogHeight} />
    </div>
  );
}
