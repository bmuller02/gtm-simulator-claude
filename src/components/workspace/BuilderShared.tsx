'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #e6e2db' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5"
        style={{ background: '#faf8f4', borderBottom: open ? '1px solid #e6e2db' : 'none' }}
      >
        <span
          style={{
            color: '#6b7280',
            fontFamily: 'var(--font-caveat)',
            fontSize: '15px',
            fontStyle: 'italic',
          }}
        >
          {title}
        </span>
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform"
          style={{ color: '#9ca3af', transform: open ? '' : 'rotate(-90deg)' }}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center px-4 py-2" style={{ borderBottom: '1px solid #f0ece4' }}>
      <span className="text-sm shrink-0" style={{ color: '#6b7280', width: '168px' }}>
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
