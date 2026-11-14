'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle } from 'lucide-react';
import AdSenseSlot from '@/components/ads/AdSenseSlot';

interface ComplaintNameFormProps {
  lang: string;
}

const NAME_MAX = 13;
const NAME_VALID_RE = /^[\p{L} ]+$/u;
const NAME_ERROR = 'Maximum 13 characters. Commas, full stops and special characters are not allowed.';

function makeEntryId() {
  return `PCH-LIST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

async function postComplaint(payload: { childName: string; childAge: number; entryId: string }, retries = 2) {
  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch('/api/complaint-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
      if (res.ok) return { ok: true as const };
      const data = await res.json().catch(() => ({}));
      lastErr = data?.error || `HTTP ${res.status}`;
      // don't retry obvious validation errors
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) return { ok: false as const, error: lastErr };
    } catch (e: any) {
      lastErr = e?.message || 'Network error';
    }
    if (i < retries) await new Promise((r) => setTimeout(r, 250 * (i + 1)));
  }
  return { ok: false as const, error: lastErr };
}

export default function ComplaintNameForm({ lang }: ComplaintNameFormProps) {
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    const trimmedName = childName.trim();
    if (!trimmedName) {
      setErrorMessage(lang === 'ta' ? 'குழந்தையின் பெயரைப் பதிவு செய்யவும்.' : "Child's name cannot be empty.");
      return;
    }
    if (trimmedName.length > NAME_MAX || !NAME_VALID_RE.test(trimmedName)) {
      setErrorMessage(NAME_ERROR);
      return;
    }

    const ageNum = parseInt(childAge, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      setErrorMessage(lang === 'ta' ? 'சரியான வயதை (1 முதல் 18 வரை) உள்ளிடவும்.' : 'Please enter a valid age between 1 and 18.');
      return;
    }

    setIsSubmitting(true);
    const entryId = makeEntryId();
    const payload = { childName: trimmedName, childAge: ageNum, entryId };

    // Optimistic UI: navigate instantly; persist in background (keepalive + retry)
    try {
      sessionStorage.setItem('pch_success_data', JSON.stringify({
        entryId,
        childName: trimmedName,
        childAge: ageNum,
        pending: true,
      }));
    } catch {}

    // Fire-and-forget background save (non-blocking navigation)
    void postComplaint(payload).then((result) => {
      try {
        if (result.ok) {
          sessionStorage.setItem('pch_success_data', JSON.stringify({ entryId, childName: trimmedName, childAge: ageNum, pending: false }));
        } else {
          sessionStorage.setItem('pch_success_data', JSON.stringify({ entryId, childName: trimmedName, childAge: ageNum, pending: true, saveError: result.error || 'save_failed' }));
        }
      } catch {}
    });

    router.push(`/${lang}/complaint-name-list/success`);
  }, [childAge, childName, isSubmitting, lang, router]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-white">
          {lang === 'ta' ? 'குழந்தையின் விவரங்களைப் பதிவு செய்க' : "Enter Your Child's Details"}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ta' ? 'பெயர் மற்றும் வயதை மட்டும் உள்ளிட்டு உறுதிப்படுத்தவும்' : 'Only 2 simple fields required.'}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            {lang === 'ta' ? 'குழந்தையின் பெயர்' : "Child's Name"} <span className="text-orange-400">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={NAME_MAX}
            value={childName}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\p{L} ]/gu, '').slice(0, NAME_MAX);
              setChildName(raw.replace(/^\s+/, ''));
            }}
            placeholder="e.g. Kishore"
            className="w-full px-4 py-3.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 text-sm transition-all"
          />
          <div className="mt-2 text-[11px] leading-snug text-slate-400 space-y-0.5">
            <p>{lang === 'ta' ? 'ஒரு பதிவுக்கு ஒரு பெயர் மட்டும்.' : 'Only one name per entry.'}</p>
            <p>{lang === 'ta' ? 'மற்றொரு பெயரை சேர்க்க வேண்டுமா?' : 'Want to add another one name?'}</p>
            <p>{lang === 'ta' ? 'அடுத்த பக்கத்தில் சேர்க்கலாம்.' : 'You can add it on the next page.'}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            {lang === 'ta' ? 'குழந்தையின் வயது' : "Child's Age"} <span className="text-orange-400">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={18}
            required
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            placeholder={lang === 'ta' ? 'வயது (1 - 18)' : "Age (1 - 18)"}
            className="w-full px-4 py-3.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 text-sm transition-all"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.01] active:scale-95 duration-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
            <span>{isSubmitting ? (lang === 'ta' ? 'சமர்ப்பிக்கிறது...' : 'Submitting...') : (lang === 'ta' ? 'உறுதி செய்க (CONFIRM)' : 'CONFIRM & SUBMIT')}</span>
          </button>
          {isSubmitting && (
            <div id="ad-interstitial-trigger" data-ad-type="interstitial" data-ad-trigger="complaint-name-submit" aria-hidden="true" className="h-0 w-0 overflow-hidden" />
          )}
        </div>
      </form>

      <div className="mt-8 pt-2">
        <AdSenseSlot slotId="complaint-name-list-below-confirm-ad" />
      </div>
    </div>
  );
}
