'use client';

import { ValidationResult } from '@/lib/types/challenge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface ValidationFeedbackProps {
  result: ValidationResult | null;
}

export function ValidationFeedback({ result }: ValidationFeedbackProps) {
  if (!result) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`rounded-lg border p-4 space-y-3 ${
          result.passed
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {result.passed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <span className={`font-semibold text-sm ${result.passed ? 'text-green-800' : 'text-amber-800'}`}>
              {result.passed ? 'All checks passed!' : `${result.passedCount} of ${result.totalCount} checks passed`}
            </span>
          </div>
          <span className={`text-sm font-bold ${result.passed ? 'text-green-700' : 'text-amber-700'}`}>
            {result.score}%
          </span>
        </div>

        {/* Progress bar */}
        <Progress
          value={result.score}
          className={`h-1.5 ${result.passed ? '[&>div]:bg-green-500' : '[&>div]:bg-amber-400'}`}
        />

        {/* Individual criteria */}
        <div className="space-y-1.5">
          {result.feedback.map((item) => (
            <div key={item.criterionId} className="flex items-start gap-2">
              {item.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
              )}
              <span className={`text-xs leading-relaxed ${item.passed ? 'text-green-700' : 'text-red-600'}`}>
                {item.message}
              </span>
            </div>
          ))}
        </div>

        {result.passed && (
          <div className="bg-green-100 rounded-md px-3 py-2 text-xs text-green-800 font-medium">
            🎉 Challenge complete! Click "Next Challenge" to continue.
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
