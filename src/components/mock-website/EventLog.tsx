'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

export interface EventLogEntry {
  id: string;
  timestamp: number;
  name: string;
  data: Record<string, unknown>;
}

interface EventLogProps {
  events: EventLogEntry[];
}

export function EventLog({ events }: EventLogProps) {
  return (
    <div className="border-t bg-gray-900 text-green-400 font-mono text-xs shrink-0" style={{ height: '120px' }}>
      <div className="px-3 py-1.5 border-b border-gray-700 flex items-center gap-2">
        <Activity className="h-3 w-3" />
        <span className="text-gray-300 text-xs">Data Layer Events</span>
        {events.length > 0 && (
          <Badge variant="outline" className="ml-auto text-xs border-gray-600 text-gray-400 py-0 h-4">
            {events.length}
          </Badge>
        )}
      </div>
      <ScrollArea className="h-full pb-6">
        <div className="p-2 space-y-1">
          {events.length === 0 ? (
            <p className="text-gray-600 italic text-xs px-1">Interact with the site above to see events here...</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex gap-2 items-start">
                <span className="text-gray-500 shrink-0">
                  {new Date(event.timestamp).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span className="text-yellow-400 shrink-0">→</span>
                <span className="text-green-400">{event.name}</span>
                {Object.keys(event.data).length > 0 && (
                  <span className="text-gray-400">
                    {'{'}
                    {Object.entries(event.data)
                      .slice(0, 3)
                      .map(([k, v]) => `${k}: "${v}"`)
                      .join(', ')}
                    {Object.keys(event.data).length > 3 ? ', ...' : ''}
                    {'}'}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
