'use client';

import React, { useState } from 'react';
import { Language, dictionaries } from '@/lib/i18n';
import { Mail, MessageSquare, Send, CheckCircle2, PhoneCall } from 'lucide-react';

interface ContactFormProps {
  lang: Language;
}

export default function ContactForm({ lang }: ContactFormProps) {
  const dict = dictionaries[lang];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Parent Feedback');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-spam field
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot detected

    setStatus('sending');
    // Simulate swift dispatch
    setTimeout(() => {
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="w-full">
      {status === 'success' ? (
        <div className="p-8 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">{dict.contact.success}</h3>
          <button
            onClick={() => setStatus('idle')}
            className="text-xs font-bold text-teal-400 hover:underline pt-2"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Hidden honeypot */}
          <input
            type="text"
            className="hidden"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">{dict.contact.name}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">{dict.contact.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">{dict.contact.subject}</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400 text-sm"
            >
              <option value="Parent Feedback">Parent Feedback & Suggestion</option>
              <option value="Custom Video Mention">Custom Video Mention Query</option>
              <option value="Business / Collaboration">Business Collaboration / Sponsorship</option>
              <option value="Privacy / Data Request">Privacy & Data Deletion Request</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">{dict.contact.message}</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can Poochandi help you today?"
              className="w-full px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-orange-500/20"
          >
            <Send className="w-4 h-4" />
            <span>{status === 'sending' ? dict.contact.sending : dict.contact.send}</span>
          </button>
        </form>
      )}
    </div>
  );
}
