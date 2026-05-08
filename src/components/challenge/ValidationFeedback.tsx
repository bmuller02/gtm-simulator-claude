'use client';

import { ValidationResult } from '@/lib/types/challenge';

interface ValidationFeedbackProps {
  result: ValidationResult | null;
}

export function ValidationFeedback({ result }: ValidationFeedbackProps) {
  if (!result) return null;

  const pct = Math.round((result.passedCount / result.totalCount) * 100);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 pb-4" style={{ borderBottom: '1px solid #e6e2db' }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
          style={{
            background: result.passed ? '#dcfce7' : '#fef3c7',
            color: result.passed ? '#166534' : '#92400e',
          }}
        >
          {result.passed ? '✓' : '!'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ color: '#1a1d24' }}>
            {result.passed
              ? 'All objectives complete!'
              : `Almost there — ${result.passedCount} of ${result.totalCount} objectives complete`}
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            {result.passed
              ? 'Great work! Everything is configured correctly.'
              : 'Fix the remaining objective and re-check'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="py-3" style={{ borderBottom: '1px solid #e6e2db' }}>
        <div className="w-full rounded-full h-1.5" style={{ background: '#e6e2db' }}>
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: result.passed ? '#5b8a5b' : '#c98a3a',
            }}
          />
        </div>
      </div>

      {/* Objective rows */}
      <div>
        {result.feedback.map((item) => (
          <div key={item.criterionId} style={{ borderBottom: '1px solid #f0ece4' }}>
            <div className="flex items-start gap-3 py-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5"
                style={{
                  background: item.passed ? '#dcfce7' : '#fef3c7',
                  color: item.passed ? '#166534' : '#92400e',
                }}
              >
                {item.passed ? '✓' : '!'}
              </div>
              <span className="text-sm flex-1 leading-snug" style={{ color: '#1a1d24' }}>
                {item.description}
              </span>
            </div>
            {!item.passed && item.message && (
              <div
                className="ml-9 mb-3 px-3 py-2 rounded text-xs leading-relaxed"
                style={{ background: '#fef9c3', border: '1px solid #fde68a' }}
              >
                <span className="font-semibold" style={{ color: '#b45309' }}>Fix: </span>
                <span style={{ color: '#78350f' }}>{item.message}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
