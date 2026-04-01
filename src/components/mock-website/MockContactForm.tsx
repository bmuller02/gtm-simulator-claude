'use client';

import { useState } from 'react';

interface MockContactFormProps {
  onEvent: (name: string, data?: Record<string, unknown>) => void;
}

export function MockContactForm({ onEvent }: MockContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEvent('form_submission', { form_name: 'contact', email, name });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-full bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="font-bold text-gray-800">CloudSaaS</div>
      </header>

      <div className="px-4 py-8 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Contact Us</h1>
        <p className="text-sm text-gray-500 mb-6">Get in touch with our team</p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-700 font-medium text-sm">✓ Message sent!</p>
            <p className="text-xs text-green-600 mt-1">A form_submission event was fired.</p>
          </div>
        ) : (
          <form id="contact-form" onSubmit={handleSubmit} className="bg-white rounded-lg border p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jane@company.com"
              />
              <p className="text-xs text-blue-600 mt-0.5">
                ↑ input[name=&quot;email&quot;] — this is the element your DOM variable should target
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Message</label>
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
