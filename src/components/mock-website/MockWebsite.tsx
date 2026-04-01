'use client';

import { useState } from 'react';
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
}

export interface SiteEvent {
  id: string;
  timestamp: number;
  name: string;
  data: Record<string, unknown>;
}

export function MockWebsite({ type }: MockWebsiteProps) {
  const [events, setEvents] = useState<EventLogEntry[]>([]);

  const fireEvent = (name: string, data: Record<string, unknown> = {}) => {
    const entry: EventLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      name,
      data,
    };
    setEvents((prev) => [entry, ...prev].slice(0, 20));
  };

  if (type === 'broken') {
    return (
      <div className="flex flex-col h-full">
        <SiteBrowser url="https://demo-store.example.com">
          <MockEcommerce onEvent={fireEvent} />
        </SiteBrowser>
        <EventLog events={events} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SiteBrowser
        url={
          type === 'ecommerce' ? 'https://demo-store.example.com/products' :
          type === 'contact' ? 'https://demo-saas.example.com/contact' :
          type === 'checkout' ? 'https://demo-store.example.com/thank-you' :
          type === 'cookieBanner' ? 'https://demo-eu.example.com' :
          'https://demo-agency.example.com'
        }
      >
        {type === 'ecommerce' && <MockEcommerce onEvent={fireEvent} />}
        {type === 'contact' && <MockContactForm onEvent={fireEvent} />}
        {type === 'checkout' && <MockCheckout onEvent={fireEvent} />}
        {type === 'cookieBanner' && <MockCookieBanner onEvent={fireEvent} />}
        {type === 'marketing' && <MockMarketing onEvent={fireEvent} />}
      </SiteBrowser>
      <EventLog events={events} />
    </div>
  );
}

function SiteBrowser({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 border rounded-t-lg overflow-hidden bg-white">
      {/* Browser chrome */}
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
      {/* Site content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
