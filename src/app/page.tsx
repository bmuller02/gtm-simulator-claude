'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProgressStore } from '@/lib/store/progressStore';
import { ALL_CHALLENGES, LEVEL_NAMES } from '@/lib/challenges/index';
import { ArrowRight, Tag, Zap, Variable, Trophy, CheckCircle2, Circle } from 'lucide-react';

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: 'Master the fundamentals: page view tracking, click tracking, and basic trigger configuration.',
  2: 'Go deeper: form tracking with custom dimensions, ecommerce events, and tag sequencing.',
  3: 'Expert territory: consent mode, debugging broken setups, and multi-channel attribution.',
};

const LEVEL_COLORS: Record<number, { badge: string; dot: string }> = {
  1: { badge: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
  2: { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  3: { badge: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
};

export default function LandingPage() {
  const router = useRouter();
  const { completedChallenges, resetProgress } = useProgressStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const totalCompleted = hydrated ? completedChallenges.length : 0;
  const allDone = totalCompleted === 9;

  const handleStart = () => {
    if (allDone) {
      router.push('/quiz');
      return;
    }
    const firstIncomplete = ALL_CHALLENGES.find((c) => !completedChallenges.includes(c.id));
    if (firstIncomplete) {
      router.push(`/challenge/${firstIncomplete.level}/${firstIncomplete.index}`);
    } else {
      router.push('/challenge/1/1');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <div className="w-3 h-3 rounded-full bg-blue-300" />
              <div className="w-3 h-3 rounded-full bg-blue-200" />
            </div>
            <span className="text-sm text-blue-300 font-medium">GTM Simulator</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Learn Google Tag Manager
            <br />
            <span className="text-blue-400">by doing, not reading.</span>
          </h1>

          <p className="text-lg text-slate-300 max-w-xl leading-relaxed mb-8">
            9 interactive challenges that teach you real GTM skills — from basic page view tracking to consent mode and multi-channel attribution.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 gap-2"
            >
              {allDone ? (
                <><Trophy className="h-5 w-5" />Final Quiz & Certificate</>
              ) : totalCompleted > 0 ? (
                <>Continue Learning<ArrowRight className="h-4 w-4" /></>
              ) : (
                <>Start Learning<ArrowRight className="h-4 w-4" /></>
              )}
            </Button>

            {hydrated && totalCompleted > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {ALL_CHALLENGES.map((c) => (
                    <div
                      key={c.id}
                      className={`w-2.5 h-2.5 rounded-full ${completedChallenges.includes(c.id) ? 'bg-green-400' : 'bg-slate-600'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-400">{totalCompleted}/9 complete</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* What you'll practice */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Tag, label: 'Tags', desc: 'GA4, Google Ads, Custom HTML' },
            { icon: Zap, label: 'Triggers', desc: 'Page Views, Clicks, Events' },
            { icon: Variable, label: 'Variables', desc: 'Data Layer, DOM, Cookies' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Icon className="h-5 w-5 text-blue-400 mb-2" />
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge levels */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-lg font-semibold mb-5 text-slate-200">The 9 Challenges</h2>
        <div className="space-y-4">
          {([1, 2, 3] as const).map((level) => {
            const levelChallenges = ALL_CHALLENGES.filter((c) => c.level === level);
            const levelCompleted = hydrated
              ? levelChallenges.filter((c) => completedChallenges.includes(c.id)).length
              : 0;
            const colors = LEVEL_COLORS[level];

            return (
              <div key={level} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="px-5 py-3 flex items-center gap-3 border-b border-white/10">
                  <Badge className={`${colors.badge} text-xs border-0 font-medium`}>
                    Level {level}
                  </Badge>
                  <span className="font-semibold text-sm">{LEVEL_NAMES[level]}</span>
                  <span className="text-xs text-slate-400 ml-1 hidden sm:block">{LEVEL_DESCRIPTIONS[level]}</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    {levelChallenges.map((c) => (
                      <div
                        key={c.id}
                        className={`w-2 h-2 rounded-full ${
                          hydrated && completedChallenges.includes(c.id) ? colors.dot : 'bg-slate-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">{levelCompleted}/3</span>
                  </div>
                </div>

                <div className="divide-y divide-white/5">
                  {levelChallenges.map((challenge) => {
                    const done = hydrated && completedChallenges.includes(challenge.id);
                    return (
                      <button
                        key={challenge.id}
                        onClick={() => router.push(`/challenge/${challenge.level}/${challenge.index}`)}
                        className="w-full px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-500 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{challenge.title}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{challenge.scenario.slice(0, 80)}...</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Certificate teaser */}
        <div className="mt-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-5 flex items-center gap-4">
          <Trophy className="h-8 w-8 text-yellow-400 shrink-0" />
          <div>
            <p className="font-semibold text-yellow-300">Complete all 9 challenges</p>
            <p className="text-sm text-slate-400 mt-0.5">
              Earn a personalized certificate of completion you can share with your team.
            </p>
          </div>
          {allDone && (
            <Button
              onClick={() => router.push('/quiz')}
              className="ml-auto bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm shrink-0"
            >
              Take Final Quiz →
            </Button>
          )}
        </div>

        {hydrated && totalCompleted > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                if (confirm('Reset all progress? This cannot be undone.')) {
                  resetProgress();
                }
              }}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors underline"
            >
              Reset all progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
