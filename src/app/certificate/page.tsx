'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProgressStore } from '@/lib/store/progressStore';
import { Trophy, Download, ArrowLeft, Star, CheckCircle2 } from 'lucide-react';
import { ALL_CHALLENGES } from '@/lib/challenges/index';

export default function CertificatePage() {
  const router = useRouter();
  const { completedChallenges, userName, setUserName, markAllCompleted, completedAt, allCompleted } = useProgressStore();
  const [nameInput, setNameInput] = useState(userName || '');
  const [showCertificate, setShowCertificate] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const totalCompleted = hydrated ? completedChallenges.length : 0;
  const completionDate = completedAt ? new Date(completedAt) : new Date();

  const handleGenerateCertificate = () => {
    if (!nameInput.trim()) return;
    setUserName(nameInput.trim());
    markAllCompleted();
    setShowCertificate(true);
  };

  const handleDownload = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 297;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 210));
      pdf.save(`GTM-Simulator-Certificate-${nameInput.trim().replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6 text-slate-400 hover:text-white gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        {/* Congratulations header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {totalCompleted === 9 ? 'Congratulations!' : 'Almost There!'}
          </h1>
          {totalCompleted === 9 ? (
            <p className="text-slate-300 text-lg">
              You&apos;ve completed all 9 GTM challenges. You&apos;re ready for production.
            </p>
          ) : (
            <p className="text-slate-300">
              You&apos;ve completed {totalCompleted}/9 challenges.{' '}
              <button onClick={() => router.push('/')} className="text-blue-400 underline">
                Finish the remaining {9 - totalCompleted}
              </button>{' '}
              to earn your certificate.
            </p>
          )}
        </motion.div>

        {/* Challenge completion summary */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {ALL_CHALLENGES.map((challenge) => {
            const done = completedChallenges.includes(challenge.id);
            return (
              <div
                key={challenge.id}
                className={`rounded-lg border p-3 flex items-start gap-2 ${
                  done ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${done ? 'text-green-400' : 'text-slate-600'}`} />
                <div>
                  <p className="text-xs font-medium leading-tight">{challenge.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Level {challenge.level}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Name entry + generate */}
        {totalCompleted === 9 && !showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 rounded-xl p-6 border border-white/20 mb-8"
          >
            <h2 className="font-semibold text-lg mb-1">Generate Your Certificate</h2>
            <p className="text-sm text-slate-400 mb-4">Enter your name as you&apos;d like it to appear on the certificate.</p>
            <div className="flex gap-3">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your full name"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                onKeyDown={(e) => e.key === 'Enter' && nameInput.trim() && handleGenerateCertificate()}
              />
              <Button
                onClick={handleGenerateCertificate}
                disabled={!nameInput.trim()}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold gap-2 shrink-0"
              >
                <Trophy className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </motion.div>
        )}

        {/* Certificate */}
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Certificate template */}
            <div
              ref={certRef}
              className="bg-slate-900 rounded-2xl border-2 border-yellow-500/50 overflow-hidden"
              style={{ aspectRatio: '1.414 / 1', position: 'relative' }}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900" />
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-x-32 -translate-y-32" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full translate-x-32 translate-y-32" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-500" />

              <div className="relative h-full flex flex-col items-center justify-center px-16 py-10 text-center">
                {/* Stars */}
                <div className="flex gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-blue-300 text-sm font-medium tracking-widest uppercase mb-2">
                  Certificate of Completion
                </p>

                <h1 className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                  {nameInput || userName || 'Your Name'}
                </h1>

                <div className="w-24 h-0.5 bg-yellow-400 my-4" />

                <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                  has successfully completed all 9 challenges of the
                </p>
                <p className="text-white text-xl font-semibold mt-1 mb-4">
                  GTM Simulator
                </p>
                <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
                  demonstrating proficiency in Google Tag Manager including tag configuration,
                  trigger management, variable setup, and advanced implementation strategies.
                </p>

                <div className="mt-8 flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-white font-semibold">9/9</div>
                    <div className="text-slate-400 text-xs mt-0.5">Challenges Completed</div>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="text-center">
                    <div className="text-white font-semibold">
                      {completionDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">Date of Completion</div>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="text-center">
                    <div className="text-yellow-400 font-semibold">Advanced</div>
                    <div className="text-slate-400 text-xs mt-0.5">Skill Level Achieved</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-slate-600 text-xs">GTM Simulator — Interactive Learning Platform</p>
                </div>
              </div>
            </div>

            {/* Download button */}
            <div className="flex justify-center gap-3">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold gap-2"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Preparing PDF...' : 'Download Certificate (PDF)'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCertificate(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Edit Name
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
