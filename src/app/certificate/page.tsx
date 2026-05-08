'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useProgressStore } from '@/lib/store/progressStore';
import { Download, ArrowLeft } from 'lucide-react';

export default function CertificatePage() {
  const router = useRouter();
  const { userName, setUserName, setCertId, certId, quizScore, completedChallenges } = useProgressStore();
  const [nameInput, setNameInput] = useState(userName || '');
  const [showCertificate, setShowCertificate] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [resolvedCertId, setResolvedCertId] = useState(certId || '');

  useEffect(() => { setHydrated(true); }, []);

  const totalCompleted = hydrated ? completedChallenges.length : 0;
  const quizDisplay = quizScore !== undefined ? `${quizScore}/8` : '—/8';

  const handleGenerate = () => {
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    setUserName(name);
    let id = certId;
    if (!id) {
      id = `PSL-TMS-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
      setCertId(id);
    }
    setResolvedCertId(id);
    setShowCertificate(true);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const jsPDF = (await import('jspdf')).default;

      const W = 2480;
      const H = 1754;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;

      // Warm paper background
      ctx.fillStyle = '#faf8f4';
      ctx.fillRect(0, 0, W, H);

      // Dashed border
      ctx.strokeStyle = '#c9c5be';
      ctx.lineWidth = 6;
      ctx.setLineDash([24, 16]);
      ctx.strokeRect(60, 60, W - 120, H - 120);
      ctx.setLineDash([]);

      const cx = W / 2;
      ctx.textAlign = 'center';

      // Logo area — "PLATFORM SOLUTIONS" + "LABS" box
      ctx.fillStyle = '#1a1d24';
      ctx.font = 'bold 44px sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('PLATFORM SOLUTIONS', cx - 80, 280);
      ctx.letterSpacing = '0px';

      // LABS box
      ctx.strokeStyle = '#4f5b8a';
      ctx.lineWidth = 4;
      ctx.strokeRect(cx + 285, 244, 130, 52);
      ctx.fillStyle = '#4f5b8a';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('LABS', cx + 350, 282);

      // "CERTIFICATE OF COMPLETION"
      ctx.fillStyle = '#9ca3af';
      ctx.font = '36px sans-serif';
      ctx.letterSpacing = '8px';
      ctx.fillText('CERTIFICATE OF COMPLETION', cx, 380);
      ctx.letterSpacing = '0px';

      // Title — "Tag Manager Simulator" in larger serif script-style
      ctx.fillStyle = '#1a1d24';
      ctx.font = 'italic bold 120px Georgia, serif';
      ctx.fillText('Tag Manager Simulator', cx, 560);

      // "This certifies that"
      ctx.fillStyle = '#6b7280';
      ctx.font = '44px sans-serif';
      ctx.fillText('This certifies that', cx, 680);

      // Name
      ctx.fillStyle = '#4f5b8a';
      ctx.font = 'italic bold 100px Georgia, serif';
      ctx.fillText(nameInput || userName || 'Your Name', cx, 820);

      // Body text
      ctx.fillStyle = '#374151';
      ctx.font = '44px sans-serif';
      ctx.fillText('has completed all 9 challenges across Foundations, Intermediate, and Advanced', cx, 940);
      ctx.fillText('levels — and passed the Knowledge Check.', cx, 1000);

      // Stats
      const statsY = 1160;

      ctx.fillStyle = '#1a1d24';
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText('9/9', cx - 180, statsY);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '36px sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('CHALLENGES', cx - 180, statsY + 56);
      ctx.letterSpacing = '0px';

      // Divider
      ctx.strokeStyle = '#e6e2db';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, statsY - 60);
      ctx.lineTo(cx, statsY + 80);
      ctx.stroke();

      ctx.fillStyle = '#1a1d24';
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText(quizDisplay, cx + 180, statsY);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '36px sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('QUIZ', cx + 180, statsY + 56);
      ctx.letterSpacing = '0px';

      // Cert ID
      ctx.fillStyle = '#c9c5be';
      ctx.font = '32px monospace';
      ctx.fillText(`Cert ID · ${resolvedCertId}`, cx, H - 120);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save(`PSL-Certificate-${(nameInput || 'certificate').trim().replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: '#faf8f4' }}>
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-sm mb-8 transition-colors hover:opacity-70"
          style={{ color: '#6b7280' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {!showCertificate ? (
          /* Name entry step */
          <div className="max-w-md mx-auto">
            {/* PSL header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded flex items-center justify-center shrink-0 text-xs font-bold text-white"
                style={{ background: '#1a1d24' }}
              >
                PSL
              </div>
              <div>
                <div className="text-xs font-semibold tracking-widest" style={{ color: '#9ca3af' }}>
                  PLATFORM SOLUTIONS LABS
                </div>
                <div className="text-lg font-bold" style={{ color: '#1a1d24' }}>
                  Certificate of Completion
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-6 space-y-5"
              style={{ background: '#ffffff', border: '1px solid #e6e2db' }}
            >
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#1a1d24' }}>
                  Your name
                </p>
                <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>
                  Enter your name as you'd like it to appear on the certificate.
                </p>
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Full name"
                  className="text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && nameInput.trim() && handleGenerate()}
                />
              </div>

              {/* Stats preview */}
              <div
                className="flex items-center gap-6 px-4 py-3 rounded"
                style={{ background: '#faf8f4', border: '1px solid #e6e2db' }}
              >
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: '#1a1d24' }}>
                    {totalCompleted}/9
                  </div>
                  <div className="text-xs tracking-wider" style={{ color: '#9ca3af' }}>
                    CHALLENGES
                  </div>
                </div>
                <div style={{ width: '1px', height: '32px', background: '#e6e2db' }} />
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: '#1a1d24' }}>
                    {quizDisplay}
                  </div>
                  <div className="text-xs tracking-wider" style={{ color: '#9ca3af' }}>
                    QUIZ
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!nameInput.trim()}
                className="w-full py-2.5 text-sm font-semibold rounded transition-colors"
                style={{
                  background: nameInput.trim() ? '#1a1d24' : '#e6e2db',
                  color: nameInput.trim() ? '#ffffff' : '#a39d94',
                  cursor: nameInput.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Generate Certificate
              </button>
            </div>
          </div>
        ) : (
          /* Certificate display */
          <div className="space-y-6">
            {/* Certificate card */}
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                background: '#ffffff',
                border: '2px dashed #c9c5be',
                padding: '48px',
                textAlign: 'center',
              }}
            >
              {/* PSL header */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <span
                  className="text-xs font-bold tracking-widest"
                  style={{ color: '#1a1d24' }}
                >
                  PLATFORM SOLUTIONS
                </span>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5"
                  style={{ border: '1px solid #4f5b8a', color: '#4f5b8a' }}
                >
                  LABS
                </span>
              </div>

              <p
                className="text-xs tracking-widest mb-6"
                style={{ color: '#9ca3af' }}
              >
                CERTIFICATE OF COMPLETION
              </p>

              {/* Title in Caveat */}
              <h1
                className="text-5xl mb-6"
                style={{
                  fontFamily: 'var(--font-caveat)',
                  color: '#1a1d24',
                  lineHeight: 1.1,
                }}
              >
                Tag Manager Simulator
              </h1>

              <p className="text-sm mb-2" style={{ color: '#6b7280' }}>
                This certifies that
              </p>

              {/* Name in Caveat */}
              <p
                className="text-4xl mb-6"
                style={{ fontFamily: 'var(--font-caveat)', color: '#4f5b8a' }}
              >
                {nameInput || userName}
              </p>

              <p className="text-sm max-w-md mx-auto leading-relaxed mb-8" style={{ color: '#6b7280' }}>
                has completed all 9 challenges across Foundations, Intermediate, and Advanced
                levels — and passed the Knowledge Check.
              </p>

              {/* Stats row */}
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#1a1d24' }}>9/9</div>
                  <div className="text-xs tracking-widest mt-1" style={{ color: '#9ca3af' }}>
                    CHALLENGES
                  </div>
                </div>
                <div style={{ width: '1px', height: '36px', background: '#e6e2db' }} />
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#1a1d24' }}>{quizDisplay}</div>
                  <div className="text-xs tracking-widest mt-1" style={{ color: '#9ca3af' }}>
                    QUIZ
                  </div>
                </div>
              </div>

              {/* Cert ID */}
              <p className="text-xs font-mono" style={{ color: '#c9c5be' }}>
                Cert ID · {resolvedCertId}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-colors"
                style={{ background: '#1a1d24', color: '#ffffff' }}
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Preparing PDF…' : 'Download PDF'}
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2 rounded text-sm transition-colors"
                style={{ border: '1px solid #e6e2db', color: '#6b7280', background: '#ffffff' }}
              >
                Edit Name
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
