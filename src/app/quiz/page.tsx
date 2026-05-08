'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '@/lib/store/progressStore';

interface QuizOption {
  id: string;
  text: string;
  wrongHint?: string;
}

interface QuizQuestion {
  id: string;
  type: 'single' | 'multi';
  question: string;
  condition?: string;
  context?: string;
  options: QuizOption[];
  correctIds: string[];
  explanation: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multi',
    question: 'Select all the URLs that would satisfy the following Page View trigger condition:',
    condition: 'Page Path contains "company"',
    context: 'Reminder: the Page Path is the portion of a URL after the domain and before any query string (?).',
    options: [
      { id: 'a', text: 'https://www.website.com/company' },
      { id: 'b', text: 'https://www.website.com/company-trips' },
      { id: 'c', text: 'https://www.website.com/vacations?utm_campaign=company', wrongHint: 'query string is not part of page path' },
      { id: 'd', text: 'https://www.company.com/about?utm_source=news', wrongHint: '"company" appears in subdomain, not the path' },
    ],
    correctIds: ['a', 'b'],
    explanation:
      'The page path is the portion of the URL after the top-level domain (.com) and before the query string. Unlike "equals", "contains" only requires the substring to appear within the path.',
  },
  {
    id: 'q2',
    type: 'single',
    question: 'What is the Page Path in the following URL?',
    context: 'https://www.website.com/about-us/company?utm_source=news&utm_campaign=ads#definition',
    options: [
      { id: 'a', text: 'https://www.website.com', wrongHint: 'that is the protocol + domain' },
      { id: 'b', text: '/about-us/company' },
      { id: 'c', text: 'utm_source=news&utm_campaign=ads', wrongHint: 'that is the query string' },
      { id: 'd', text: '#definition', wrongHint: 'that is the fragment' },
    ],
    correctIds: ['b'],
    explanation:
      'A URL has several parts: Protocol (https://), Subdomain (www), Main Domain (website), TLD (.com), Path (/about-us/company), Query String (?utm_source=…), and Fragment (#definition). The Page Path is the segment between the domain and the query string.',
  },
  {
    id: 'q3',
    type: 'single',
    question: 'What is the primary purpose of a Data Layer Variable in GTM?',
    options: [
      { id: 'a', text: 'To store JavaScript code that runs when a tag fires', wrongHint: 'that describes a Custom HTML tag' },
      { id: 'b', text: 'To read structured data that developers push into window.dataLayer' },
      { id: 'c', text: 'To create new HTML elements dynamically on the page', wrongHint: 'GTM variables read data; they do not modify the DOM' },
      { id: 'd', text: 'To define which pages a tag is allowed to fire on', wrongHint: 'that describes a trigger' },
    ],
    correctIds: ['b'],
    explanation:
      'Developers push data into the dataLayer array (e.g. dataLayer.push({ userType: "internal" })). A Data Layer Variable reads a specific key from that array, making developer-set values available in your tags and trigger conditions.',
  },
  {
    id: 'q4',
    type: 'single',
    question: 'A Click trigger has the condition: Click Text → equals → "Subscribe". Which scenario fires this trigger?',
    options: [
      { id: 'a', text: 'Clicking a button with class ".subscribe-btn" and visible text "Subscribe Now"', wrongHint: '"Subscribe Now" ≠ "Subscribe"' },
      { id: 'b', text: 'Clicking a button whose visible text is exactly "Subscribe"' },
      { id: 'c', text: 'Clicking any element that contains the word "subscribe" anywhere on the page', wrongHint: '"equals" requires exact match, not "contains"' },
      { id: 'd', text: 'Clicking a button with the ID "subscribe" regardless of its visible text', wrongHint: 'that would use "Click ID", not "Click Text"' },
    ],
    correctIds: ['b'],
    explanation:
      '"Equals" requires an exact match against the element\'s visible text. "Subscribe Now" fails because of the extra word. Class names and IDs are matched by "Click Element" and "Click ID" — not "Click Text".',
  },
  {
    id: 'q5',
    type: 'multi',
    question: 'You need to track Google Ads conversions on a thank-you page. The Conversion Linker tag must fire before the Google Ads Conversion tag. How do you configure this in GTM? (Two correct answers)',
    options: [
      { id: 'a', text: 'Give the Conversion Linker a higher priority number in the tag settings' },
      { id: 'b', text: 'In the Google Ads Conversion tag\'s Advanced Settings, set the Conversion Linker as the tag to fire before it' },
      { id: 'c', text: 'Inside the Conversion Linker, set the Google Ads Conversion tag as a "fire after" tag', wrongHint: 'tag sequencing is set on the tag that fires second, not first' },
      { id: 'd', text: 'Both tags fire at the same time — GTM handles the order automatically', wrongHint: 'GTM does not auto-sequence tags; you must configure it' },
    ],
    correctIds: ['a', 'b'],
    explanation:
      'There are two valid approaches: (1) Tag Priority — give the Conversion Linker a higher priority number so it fires first when sharing the same trigger. (2) Tag Sequencing — open the Google Ads Conversion tag, go to Advanced Settings → Tag Sequencing, and set the Conversion Linker to fire before it.',
  },
  {
    id: 'q6',
    type: 'single',
    question: 'A developer tells you they fire a "checkout_complete" event via dataLayer. Which trigger type should you create in GTM?',
    options: [
      { id: 'a', text: 'Page View — with a Page URL condition for the checkout page', wrongHint: 'page view fires on load, not on dataLayer push' },
      { id: 'b', text: 'Click — targeting the checkout submit button', wrongHint: 'click triggers respond to DOM events, not dataLayer pushes' },
      { id: 'c', text: 'Custom Event — with the event name "checkout_complete"' },
      { id: 'd', text: 'Form Submission — since checkout is a form', wrongHint: 'form submission responds to native form submit events' },
    ],
    correctIds: ['c'],
    explanation:
      'When a developer pushes a named event to the dataLayer (dataLayer.push({ event: "checkout_complete" })), you use a Custom Event trigger whose event name exactly matches. Click and Form Submission triggers respond to browser interactions, not dataLayer pushes.',
  },
  {
    id: 'q7',
    type: 'single',
    question: 'Which GTM variable type would you use to read what a user typed into a form\'s email field at the moment of form submission?',
    options: [
      { id: 'a', text: 'Data Layer Variable — pointing to "email"', wrongHint: 'only works if the developer explicitly pushes email to dataLayer' },
      { id: 'b', text: 'DOM Element Variable — with CSS selector input[name="email"] and attribute "value"' },
      { id: 'c', text: 'JavaScript Variable — reading document.email', wrongHint: 'document.email is not a standard property' },
      { id: 'd', text: 'Constant — set to the user\'s email', wrongHint: 'constants are fixed values, not dynamic user input' },
    ],
    correctIds: ['b'],
    explanation:
      'A DOM Element Variable reads any HTML attribute from any element currently on the page. Using CSS selector input[name="email"] targets the email input, and the "value" attribute contains what the user typed, captured at the moment the trigger fires.',
  },
  {
    id: 'q8',
    type: 'single',
    question: 'What distinguishes Consent Mode from simply not loading GTM until consent is granted?',
    options: [
      { id: 'a', text: 'There is no difference — both result in zero data collection', wrongHint: 'consent mode is specifically designed to allow partial data collection' },
      { id: 'b', text: 'Consent Mode allows tags to fire in a limited cookieless mode, preserving some measurement without personal identifiers' },
      { id: 'c', text: 'Consent Mode forces all tags to fire normally regardless of the user\'s choice', wrongHint: 'consent mode respects denial; it does not override it' },
      { id: 'd', text: 'Consent Mode only affects Google Ads tags, not GA4', wrongHint: 'consent mode affects both Google Ads and GA4 tags' },
    ],
    correctIds: ['b'],
    explanation:
      'With Google Consent Mode, when a user denies consent, tags can still send "cookieless pings" — aggregated, anonymized signals — to Google. This lets Google model conversions without collecting personal data. Blocking all tags means zero data, which distorts analytics and impairs Google Ads optimization.',
  },
];

const TOTAL = QUESTIONS.length;

export default function QuizPage() {
  const router = useRouter();
  const { setQuizScore, markAllCompleted } = useProgressStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ selected: string[]; submitted: boolean }>>(() =>
    QUESTIONS.map(() => ({ selected: [], submitted: false }))
  );

  const question = QUESTIONS[currentIndex];
  const { selected: selectedIds, submitted: isSubmitted } = answers[currentIndex];

  const score = answers.filter((a, i) => {
    const q = QUESTIONS[i];
    return (
      a.submitted &&
      a.selected.length === q.correctIds.length &&
      a.selected.every((id) => q.correctIds.includes(id))
    );
  }).length;

  const handleSelect = (id: string) => {
    if (isSubmitted) return;
    setAnswers((prev) =>
      prev.map((a, i) => {
        if (i !== currentIndex) return a;
        if (question.type === 'single') return { ...a, selected: [id] };
        return {
          ...a,
          selected: a.selected.includes(id)
            ? a.selected.filter((x) => x !== id)
            : [...a.selected, id],
        };
      })
    );
  };

  const handleCheckAnswer = () => {
    if (selectedIds.length === 0) return;
    setAnswers((prev) =>
      prev.map((a, i) => (i === currentIndex ? { ...a, submitted: true } : a))
    );
  };

  const handleNext = () => {
    if (currentIndex + 1 >= TOTAL) {
      const finalScore = answers.filter((a, i) => {
        const q = QUESTIONS[i];
        return (
          a.submitted &&
          a.selected.length === q.correctIds.length &&
          a.selected.every((id) => q.correctIds.includes(id))
        );
      }).length;
      setQuizScore(finalScore);
      markAllCompleted();
      router.push('/certificate');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const isLastQuestion = currentIndex + 1 >= TOTAL;

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: '#faf8f4' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{ background: '#1a1d24' }}
            >
              PSL
            </div>
            <div>
              <div className="text-xs font-semibold tracking-widest" style={{ color: '#9ca3af' }}>
                KNOWLEDGE CHECK
              </div>
              <div className="text-xl font-bold" style={{ color: '#1a1d24' }}>
                Question {currentIndex + 1} of {TOTAL}
              </div>
            </div>
          </div>

          {/* Numbered progress circles */}
          <div className="flex items-center gap-1.5">
            {QUESTIONS.map((_, i) => {
              const isAnswered = answers[i].submitted;
              const isCurrent = i === currentIndex;
              return (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: isAnswered ? '#4f5b8a' : isCurrent ? '#4f5b8a' : 'transparent',
                    color: isAnswered || isCurrent ? '#ffffff' : '#c9c5be',
                    border: isAnswered || isCurrent ? 'none' : '1.5px solid #c9c5be',
                  }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Question card */}
        <div
          className="rounded-xl p-6 space-y-5"
          style={{ background: '#ffffff', border: '1px solid #e6e2db' }}
        >
          {/* Multi-select hint */}
          {question.type === 'multi' && (
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              Multiple select · {question.correctIds.length} correct answers
            </p>
          )}

          {/* Context block */}
          {question.context && (
            <div
              className="px-3 py-2 rounded text-xs font-mono break-all"
              style={{ background: '#f3efe7', color: '#6b7280', border: '1px solid #e6e2db' }}
            >
              {question.context}
            </div>
          )}

          {/* Question text + optional inline condition chip */}
          <p className="text-sm font-medium leading-relaxed" style={{ color: '#1a1d24' }}>
            {question.question}
            {question.condition && (
              <>
                {' '}
                <code
                  className="px-2 py-0.5 rounded text-xs font-mono"
                  style={{ background: '#1a1d24', color: '#e5e7eb' }}
                >
                  {question.condition}
                </code>
              </>
            )}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((opt) => {
              const isSelected = selectedIds.includes(opt.id);
              const isCorrect = question.correctIds.includes(opt.id);
              const showWrongHint = isSubmitted && isSelected && !isCorrect && opt.wrongHint;

              let bg = '#ffffff';
              let border = '#e6e2db';
              let textColor = '#1a1d24';
              let checkColor = '#c9c5be';

              if (isSubmitted) {
                if (isCorrect && isSelected) {
                  bg = '#f0fdf4'; border = '#bbf7d0'; checkColor = '#166534';
                } else if (isCorrect && !isSelected) {
                  bg = '#f0fdf4'; border = '#bbf7d0'; checkColor = '#166534'; textColor = '#374151';
                } else if (!isCorrect && isSelected) {
                  bg = '#fff1f2'; border = '#fecdd3'; checkColor = '#be123c'; textColor = '#1a1d24';
                } else {
                  textColor = '#9ca3af';
                }
              } else if (isSelected) {
                border = '#4f5b8a'; checkColor = '#4f5b8a';
              }

              const CheckIcon = question.type === 'multi' ? (
                <span
                  className="w-4 h-4 rounded flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ border: `1.5px solid ${checkColor}`, color: checkColor, background: isSelected && !isSubmitted ? '#eef0f7' : 'transparent' }}
                >
                  {isSelected ? '✓' : ''}
                </span>
              ) : (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ border: `1.5px solid ${checkColor}` }}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full" style={{ background: checkColor }} />
                  )}
                </span>
              );

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={isSubmitted}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-3"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <span className="mt-0.5">{CheckIcon}</span>
                  <span className="flex-1 text-sm break-all" style={{ color: textColor }}>
                    {opt.text}
                  </span>
                  {showWrongHint && (
                    <span className="text-xs italic shrink-0 ml-2 self-center" style={{ color: '#be123c' }}>
                      {opt.wrongHint}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explainer (post-submit) */}
          {isSubmitted && (
            <div
              className="px-4 py-3 rounded-lg text-sm leading-relaxed"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <span className="font-semibold" style={{ color: '#166534' }}>Explainer: </span>
              <span style={{ color: '#374151' }}>{question.explanation}</span>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="text-sm px-4 py-2 rounded transition-colors"
            style={{
              border: '1px solid #e6e2db',
              color: currentIndex === 0 ? '#c9c5be' : '#6b7280',
              background: '#ffffff',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Previous
          </button>

          {!isSubmitted ? (
            <button
              onClick={handleCheckAnswer}
              disabled={selectedIds.length === 0}
              className="text-sm px-5 py-2 rounded font-semibold transition-colors"
              style={{
                background: selectedIds.length === 0 ? '#e6e2db' : '#1a1d24',
                color: selectedIds.length === 0 ? '#a39d94' : '#ffffff',
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="text-sm px-5 py-2 rounded font-semibold transition-colors"
              style={{ background: '#4f5b8a', color: '#ffffff' }}
            >
              {isLastQuestion ? 'Finish →' : 'Next Question →'}
            </button>
          )}
        </div>

        {/* Score tally */}
        {answers.some((a) => a.submitted) && (
          <p className="text-center text-xs mt-4" style={{ color: '#9ca3af' }}>
            {score} of {answers.filter((a) => a.submitted).length} answered correctly so far
          </p>
        )}
      </div>
    </div>
  );
}
