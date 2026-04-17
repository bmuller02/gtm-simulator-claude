'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ChevronRight, Trophy, BookOpen } from 'lucide-react';

// ── Quiz question types ───────────────────────────────────────────────────────
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  type: 'single' | 'multi';
  question: string;
  context?: string; // optional URL/code block shown above the question
  options: QuizOption[];
  correctIds: string[];
  explanation: string;
}

// ── Questions ─────────────────────────────────────────────────────────────────
const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multi',
    question: 'Select ALL URLs that would satisfy the following Page View trigger condition: Page Path contains "company"',
    context: 'Reminder: the Page Path is the portion of a URL after the domain and before any query string (?).',
    options: [
      { id: 'a', text: 'https://www.website.com/company' },
      { id: 'b', text: 'https://www.website.com/company-trips' },
      { id: 'c', text: 'https://www.website.com/vacations?utm_campaign=company' },
      { id: 'd', text: 'https://www.company.com/about?utm_source=news' },
    ],
    correctIds: ['a', 'b'],
    explanation:
      'The Page Path is everything after the domain (.com) and before the query string (?). For A, the path is "/company" — contains "company" ✓. For B, the path is "/company-trips" — contains "company" ✓. For C, the path is "/vacations" — "company" only appears in the query string, not the path ✗. For D, the path is "/about" — "company" appears in the subdomain but not the path ✗.',
  },
  {
    id: 'q2',
    type: 'single',
    question: 'What is the Page Path in the following URL?',
    context: 'https://www.website.com/about-us/company?utm_source=news&utm_campaign=ads#definition',
    options: [
      { id: 'a', text: 'https://www.website.com' },
      { id: 'b', text: '/about-us/company' },
      { id: 'c', text: 'utm_source=news&utm_campaign=ads' },
      { id: 'd', text: '#definition' },
    ],
    correctIds: ['b'],
    explanation:
      'A URL has several parts: Protocol (https://), Subdomain (www), Main Domain (website), TLD (.com), Path (/about-us/company), Query String (?utm_source=news&utm_campaign=ads), and Fragment (#definition). The Page Path is the segment between the domain and the query string.',
  },
  {
    id: 'q3',
    type: 'single',
    question: 'What is the primary purpose of a Data Layer Variable in GTM?',
    options: [
      { id: 'a', text: 'To store JavaScript code that runs when a tag fires' },
      { id: 'b', text: 'To read structured data that developers push into window.dataLayer' },
      { id: 'c', text: 'To create new HTML elements dynamically on the page' },
      { id: 'd', text: 'To define which pages a tag is allowed to fire on' },
    ],
    correctIds: ['b'],
    explanation:
      'Developers push data into the dataLayer array (e.g. dataLayer.push({ userType: "internal" })). A Data Layer Variable in GTM reads a specific key from that array, making developer-set values available in your tags and trigger conditions. This is the bridge between your site\'s backend logic and GTM.',
  },
  {
    id: 'q4',
    type: 'single',
    question: 'A Click trigger has the condition: Click Text → equals → "Subscribe". Which scenario fires this trigger?',
    options: [
      { id: 'a', text: 'Clicking a button with class ".subscribe-btn" and visible text "Subscribe Now"' },
      { id: 'b', text: 'Clicking a button whose visible text is exactly "Subscribe"' },
      { id: 'c', text: 'Clicking any element that contains the word "subscribe" anywhere on the page' },
      { id: 'd', text: 'Clicking a button with the ID "subscribe" regardless of its visible text' },
    ],
    correctIds: ['b'],
    explanation:
      '"Equals" requires an exact match against the element\'s visible text. "Subscribe Now" (A) fails because of the extra word. Class names (A) and IDs (D) are matched by "Click Element" and "Click ID" — not "Click Text". Only a button whose visible label is exactly "Subscribe" will fire this trigger.',
  },
  {
    id: 'q5',
    type: 'multi',
    question: 'You need to track Google Ads conversions on a thank-you page. The Conversion Linker tag must fire before the Google Ads Conversion tag. How do you configure this in GTM? Two correct answers.',
    options: [
      { id: 'a', text: 'Give the Conversion Linker a higher priority number in the tag settings' },
      { id: 'b', text: 'Set the Conversion Linker as the tag associated to the "Fire a tag before this tag fires" setting in the Google Ads Tag Sequencing section' },
      { id: 'c', text: 'Set the Google Ads Conversion tag as the "Fire a tag before this tag fires" tag inside the Conversion Linker' },
      { id: 'd', text: 'Both tags fire at the same time — GTM handles the order automatically' },
    ],
    correctIds: ['a', 'b'],
    explanation:
      'There are two valid ways to ensure the Conversion Linker fires before the Google Ads tag: (1) Tag Sequencing — open the Google Ads Conversion tag, go to Advanced Settings → Tag Sequencing, check "Fire a tag before this tag fires", and select the Conversion Linker. (2) Tag Priority — give the Conversion Linker a higher priority number in its tag settings. When two tags share the same trigger, GTM fires the higher-priority tag first.',
  },
  {
    id: 'q6',
    type: 'single',
    question: 'A developer tells you they fire a "checkout_complete" event via dataLayer. Which trigger type should you create in GTM to listen for this?',
    options: [
      { id: 'a', text: 'Page View — with a Page URL condition for the checkout page' },
      { id: 'b', text: 'Click — targeting the checkout submit button' },
      { id: 'c', text: 'Custom Event — with the event name "checkout_complete"' },
      { id: 'd', text: 'Form Submission — since checkout is a form' },
    ],
    correctIds: ['c'],
    explanation:
      'When a developer pushes a named event to the dataLayer (dataLayer.push({ event: "checkout_complete" })), you use a Custom Event trigger whose "Custom Event Name" field exactly matches the pushed event name. Click and Form Submission triggers respond to browser interactions, not dataLayer pushes. A Page View trigger would fire on page load, not at the moment the event is pushed.',
  },
  {
    id: 'q7',
    type: 'single',
    question: 'Which GTM variable type would you use to read what a user typed into a form\'s email field at the moment of form submission?',
    options: [
      { id: 'a', text: 'Data Layer Variable — pointing to "email"' },
      { id: 'b', text: 'DOM Element Variable — with CSS selector input[name="email"] and attribute "value"' },
      { id: 'c', text: 'JavaScript Variable — reading document.email' },
      { id: 'd', text: 'Constant — set to the user\'s email' },
    ],
    correctIds: ['b'],
    explanation:
      'A DOM Element Variable reads any HTML attribute from any element currently on the page. Using CSS selector input[name="email"] targets the email input, and the "value" attribute contains what the user typed. This is captured at the moment the form submission trigger fires, before the form clears. Data Layer Variable would only work if the developer explicitly pushes the email value into the dataLayer.',
  },
  {
    id: 'q8',
    type: 'single',
    question: 'What distinguishes Consent Mode from simply not installing GTM until consent is granted?',
    options: [
      { id: 'a', text: 'There is no difference — both approaches result in zero data collection' },
      { id: 'b', text: 'Consent Mode allows tags to fire in a limited cookieless mode, preserving some conversion measurement without personal identifiers' },
      { id: 'c', text: 'Consent Mode forces all tags to fire normally regardless of the user\'s choice' },
      { id: 'd', text: 'Consent Mode only affects Google Ads tags, not GA4' },
    ],
    correctIds: ['b'],
    explanation:
      'With Google Consent Mode, when a user denies analytics or ads consent, tags can still send "cookieless pings" — aggregated, anonymized signals — to Google. This lets Google model conversions and fill gaps in reporting without collecting personal data. Simply blocking all tags means zero data, which can significantly distort your analytics and impair Google Ads optimization.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = QUESTIONS[currentIndex];
  const totalQuestions = QUESTIONS.length;
  const progress = ((currentIndex) / totalQuestions) * 100;

  const isCorrect = (optionId: string) => question.correctIds.includes(optionId);

  const handleSelect = (id: string) => {
    if (submitted) return;
    if (question.type === 'single') {
      setSelectedIds([id]);
    } else {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;
    setSubmitted(true);
    // Score: full credit only if exactly the right set
    const correct =
      selectedIds.length === question.correctIds.length &&
      selectedIds.every((id) => question.correctIds.includes(id));
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedIds([]);
      setSubmitted(false);
    }
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <Trophy className="h-16 w-16 text-yellow-400 mx-auto" />
          <h1 className="text-3xl font-bold">Quiz Complete!</h1>
          <p className="text-slate-300 text-lg">
            You scored <span className="text-white font-bold">{score}</span> out of{' '}
            <span className="text-white font-bold">{totalQuestions}</span>
          </p>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="bg-green-400 h-3 rounded-full transition-all"
              style={{ width: `${(score / totalQuestions) * 100}%` }}
            />
          </div>
          <p className="text-slate-400 text-sm">
            {score === totalQuestions
              ? "Perfect score! You're a GTM pro."
              : score >= totalQuestions * 0.7
              ? 'Great work! Review any missed questions to solidify your knowledge.'
              : 'Good effort! Revisiting the challenges will help reinforce these concepts.'}
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/certificate')}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold gap-2"
          >
            <Trophy className="h-5 w-5" />
            Claim Your Certificate
          </Button>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedIds([]);
              setSubmitted(false);
              setScore(0);
              setFinished(false);
            }}
            className="text-sm text-slate-400 hover:text-slate-300 underline"
          >
            Retake quiz
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <span className="text-sm text-blue-300 font-medium">GTM Knowledge Check</span>
          <Badge className="ml-auto bg-white/10 text-white border-0">
            {currentIndex + 1} / {totalQuestions}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div
            className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-5"
          >
            {/* Question type badge */}
            {question.type === 'multi' && (
              <p className="text-xs text-amber-300 font-medium">Select all that apply</p>
            )}

            {/* Context block (URL etc.) */}
            {question.context && (
              <div className="bg-black/30 rounded-lg px-3 py-2 font-mono text-xs text-slate-300 break-all">
                {question.context}
              </div>
            )}

            <p className="text-base font-medium leading-relaxed">{question.question}</p>

            {/* Options */}
            <div className="space-y-2">
              {question.options.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                const correct = isCorrect(opt.id);

                let optionClass = 'border border-white/10 bg-white/5 hover:bg-white/10';
                if (submitted) {
                  if (correct) optionClass = 'border border-green-400 bg-green-500/20';
                  else if (isSelected && !correct) optionClass = 'border border-red-400 bg-red-500/20';
                  else optionClass = 'border border-white/5 bg-white/3 opacity-50';
                } else if (isSelected) {
                  optionClass = 'border border-blue-400 bg-blue-500/20';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-start gap-3 ${optionClass}`}
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold mt-0.5">
                      {opt.id.toUpperCase()}
                    </span>
                    <span className="break-all">{opt.text}</span>
                    {submitted && correct && (
                      <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 ml-auto mt-0.5" />
                    )}
                    {submitted && isSelected && !correct && (
                      <XCircle className="h-4 w-4 text-red-400 shrink-0 ml-auto mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation (shown after submit) */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-xl p-4 text-sm text-slate-300 leading-relaxed border border-slate-700"
              >
                <p className="font-semibold text-white mb-1">Explanation</p>
                {question.explanation}
              </motion.div>
            )}

            {/* Submit / Next */}
            <div className="flex justify-end pt-1">
              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedIds.length === 0}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-green-500 hover:bg-green-400 text-white font-semibold px-6 gap-2"
                >
                  {currentIndex + 1 >= totalQuestions ? (
                    <><Trophy className="h-4 w-4" />See Results</>
                  ) : (
                    <>Next Question <ChevronRight className="h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
