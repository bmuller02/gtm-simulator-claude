'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useProgressStore } from '@/lib/store/progressStore';
import { ALL_CHALLENGES, LEVEL_NAMES } from '@/lib/challenges/index';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: 'Floodlights & Click Tracking',
  2: 'GA4 & Custom Events',
  3: 'Consent, Segmentation, & Multi-tag',
};

const LEVEL_COLORS: Record<number, { badge: string; badgeBg: string }> = {
  1: { badge: 'text-white', badgeBg: 'bg-[#5b8a5b]' },
  2: { badge: 'text-[#c98a3a]', badgeBg: 'bg-[#fef4c8]' },
  3: { badge: 'text-[#b85a5a]', badgeBg: 'bg-[#f3e6e6]' },
};

export default function LandingPage() {
  const router = useRouter();
  const { completedChallenges } = useProgressStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const totalCompleted = hydrated ? completedChallenges.length : 0;
  const allDone = totalCompleted === 9;

  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1a1d24]">
      {/* Topbar */}
      <div className="border-b border-[#c9c5be] px-12 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold tracking-widest text-[#1a1d24]">PLATFORM SOLUTIONS</span>
            <span className="text-xs font-semibold border border-[#4f5b8a] text-[#4f5b8a] px-2 py-1">LABS</span>
          </div>
          <div className="text-base font-bold text-[#1a1d24]">Tag Manager Simulator</div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/quiz')} className="text-sm border border-[#1a1d24] px-4 py-2 rounded text-[#1a1d24] hover:bg-[#f3efe7]">
            Knowledge Check
          </button>
          <button onClick={() => router.push('/certificate')} className="text-sm border border-[#1a1d24] px-4 py-2 rounded text-[#1a1d24] hover:bg-[#f3efe7]">
            Certificate
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl leading-tight mb-6 text-[#1a1d24]" style={{ fontFamily: 'var(--font-caveat)', fontStyle: 'italic' }}>
            Where AdOps can practice tag management — without breaking production.
          </h1>

          <p className="text-sm leading-relaxed text-[#4f5b8a] mb-12 max-w-3xl">
            9 hands-on challenges across 3 difficulty levels. Build tags, triggers, and variables in a sandboxed workspace, then navigate a live preview site to confirm your work fires correctly.
          </p>

          {/* Level Cards */}
          <div className="grid grid-cols-3 gap-6">
            {([1, 2, 3] as const).map((level) => {
              const levelChallenges = ALL_CHALLENGES.filter((c) => c.level === level);
              const levelCompleted = hydrated
                ? levelChallenges.filter((c) => completedChallenges.includes(c.id)).length
                : 0;
              const isLocked = level === 3 && levelCompleted < 3;
              const colors = LEVEL_COLORS[level];

              return (
                <div key={level} className="bg-white border border-[#c9c5be] rounded p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className={`${colors.badgeBg} ${colors.badge} text-xs font-medium border-0`}>
                        Level {level}
                      </Badge>
                      {isLocked && <Lock className="h-4 w-4 text-[#6b7280]" />}
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-[#1a1d24] mb-1">{LEVEL_NAMES[level]}</h2>
                  <p className="text-xs text-[#6b7280] mb-4">{LEVEL_DESCRIPTIONS[level]}</p>

                  <div className="flex-1 space-y-2 mb-6">
                    {levelChallenges.map((challenge, idx) => {
                      const done = hydrated && completedChallenges.includes(challenge.id);
                      return (
                        <div key={challenge.id} className="flex items-start gap-2 text-sm">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-[#5b8a5b] shrink-0 mt-0.5" />
                          ) : (
                            <div className="text-xs text-[#6b7280] font-medium w-4 h-4 flex items-center justify-center mt-0.5">
                              {idx + 1}
                            </div>
                          )}
                          <span className={done ? 'line-through text-[#6b7280]' : 'text-[#1a1d24]'}>{challenge.title}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      if (isLocked) return;
                      router.push(`/challenge/${level}/1`);
                    }}
                    className={`w-full py-2 text-sm font-semibold rounded text-white transition-colors ${
                      isLocked
                        ? 'bg-[#a39d94] cursor-not-allowed'
                        : level === 1
                          ? 'bg-[#4f5b8a] hover:bg-[#3f4b7a]'
                          : 'bg-[#4f5b8a] hover:bg-[#3f4b7a]'
                    }`}
                  >
                    {isLocked ? 'Locked' : levelCompleted === 3 ? 'Continue →' : 'Start →'}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Note section */}
      <div className="max-w-6xl mx-auto px-12 py-8">
        <div className="bg-[#fef4c8] border border-[#fef4c8] rounded p-4">
          <p className="text-sm text-[#1a1d24]" style={{ fontFamily: 'var(--font-caveat)', fontSize: '16px' }}>
            Note: progress persists across sessions. Tags built in earlier challenges remain available later.
          </p>
        </div>
      </div>
    </div>
  );
}
