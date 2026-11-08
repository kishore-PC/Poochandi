'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, AlertCircle } from 'lucide-react';

interface ComplaintNameFormProps {
  lang: string;
}

export default function ComplaintNameForm({ lang }: ComplaintNameFormProps) {
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!childName.trim()) {
      setErrorMessage(lang === 'ta' ? 'குழந்தையின் பெயரைப் பதிவு செய்யவும்.' : "Child's name cannot be empty.");
      return;
    }

    const ageNum = parseInt(childAge, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      setErrorMessage(lang === 'ta' ? 'சரியான வயதை (1 முதல் 18 வரை) உள்ளிடவும்.' : 'Please enter a valid age between 1 and 18.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/complaint-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: childName.trim(),
          childAge: ageNum,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || (lang === 'ta' ? 'பதிவு செய்வதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.' : 'Storage failed. Please try again.'));
        setIsSubmitting(false);
        return;
      }

      // ONLY redirect upon verified database storage
      // Use sessionStorage so the success page cannot leak sensitive info in public URLs
      sessionStorage.setItem('pch_success_data', JSON.stringify({
        entryId: data.entryId,
        childName: data.childName,
        childAge: data.childAge,
      }));

      router.push(`/${lang}/complaint-name-list/success`);
    } catch (err) {
      setErrorMessage(lang === 'ta' ? 'இணைய தொடர்பு பிழை. உங்கள் விவரங்கள் அழியவில்லை, மீண்டும் முயற்சிக்கவும்.' : 'Network error. Your entered details were retained, please retry.');
      setIsSubmitting(false);
    }
  };

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
        {/* Child's Name */}
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            {lang === 'ta' ? 'குழந்தையின் பெயர்' : "Child's Name"} <span className="text-orange-400">*</span>
          </label>
          <input
            type="text"
            required
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder={lang === 'ta' ? 'எ.கா: ஆரவ் / அனன்யா' : "e.g. Aarav / Diya"}
            className="w-full px-4 py-3.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 text-sm transition-all"
          />
        </div>

        {/* Child's Age */}
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

        {/* CONFIRM BUTTON (Prevent duplicate clicks) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
            <span>{isSubmitting ? (lang === 'ta' ? 'பதிவாகிறது...' : 'Confirming...') : (lang === 'ta' ? 'உறுதி செய்க (CONFIRM)' : 'CONFIRM')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
