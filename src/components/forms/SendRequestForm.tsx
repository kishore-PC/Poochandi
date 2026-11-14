'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Language, dictionaries } from '@/lib/i18n';
import { Sparkles, Send, ShieldCheck, AlertCircle, Heart } from 'lucide-react';

interface SendRequestFormProps {
  lang: Language;
}

export default function SendRequestForm({ lang }: SendRequestFormProps) {
  const router = useRouter();
  const dict = dictionaries[lang];

  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [ageGrade, setAgeGrade] = useState('');
  const [behavior, setBehavior] = useState('');
  const [city, setCity] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [consent, setConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const ageOptions = [
    { value: '2-3 years (Toddler)', label: lang === 'ta' ? '2-3 வயது (மழலை)' : '2-3 years (Toddler)' },
    { value: '4-5 years (Kindergarten)', label: lang === 'ta' ? '4-5 வயது (எல்.கே.ஜி / யுகே.ஜி)' : '4-5 years (Kindergarten)' },
    { value: '6-8 years (Primary Grade 1-3)', label: lang === 'ta' ? '6-8 வயது (வகுப்பு 1-3)' : '6-8 years (Primary Grade 1-3)' },
    { value: '9-12 years (Middle School)', label: lang === 'ta' ? '9-12 வயது (வகுப்பு 4-7)' : '9-12 years (Middle School)' },
  ];

  const behaviorOptions = [
    { value: 'Screen Time Reduction', label: lang === 'ta' ? 'செல்போன் பயன்பாட்டைக் குறைத்தல் 📱' : 'Screen Time Reduction 📱' },
    { value: 'Healthy Food & Eating Habits', label: lang === 'ta' ? 'சத்தான உணவு & காய்கறிகள் உண்ணுதல் 🥦' : 'Healthy Food & Eating Habits 🥦' },
    { value: 'Peaceful Bedtime Routine', label: lang === 'ta' ? 'சரியான நேரத்தில் தூங்குதல் 🌙' : 'Peaceful Bedtime Routine 🌙' },
    { value: 'Focus on Studies & Homework', label: lang === 'ta' ? 'வீட்டுப்பாடம் & படிப்பில் கவனம் 📚' : 'Focus on Studies & Homework 📚' },
    { value: 'Respecting Elders & Good Manners', label: lang === 'ta' ? 'பெரியவர்களுக்கு மரியாதை & நற்பண்புகள் ❤️' : 'Respecting Elders & Good Manners ❤️' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!parentName.trim()) {
      setErrorMessage(lang === 'ta' ? 'பெற்றோர் பெயரைப் பதிவு செய்க.' : 'Please enter the parent/guardian name.');
      return;
    }
    if (!childName.trim()) {
      setErrorMessage(lang === 'ta' ? 'குழந்தையின் பெயரைப் பதிவு செய்க.' : 'Please enter the child name.');
      return;
    }
    if (!ageGrade) {
      setErrorMessage(lang === 'ta' ? 'குழந்தையின் வயதைத் தேர்ந்தெடுக்கவும்.' : 'Please select the age or grade.');
      return;
    }
    if (!behavior) {
      setErrorMessage(lang === 'ta' ? 'ஊக்குவிக்க வேண்டிய நற்பழக்கத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please select a behavior to encourage.');
      return;
    }
    if (!consent) {
      setErrorMessage(lang === 'ta' ? 'பெற்றோர் ஒப்புதல் அவசியமானது.' : 'Parental consent is required to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentName,
          childName,
          ageGrade,
          behavior,
          city,
          specialInstructions,
          consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit request');
        setIsSubmitting(false);
        return;
      }

      // Navigate to /request-received with request parameters
      router.push(
        `/${lang}/request-received?id=${encodeURIComponent(data.requestId)}&child=${encodeURIComponent(data.childName)}&behavior=${encodeURIComponent(data.behavior)}`
      );
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parent Name */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            {dict.sendRequest.parentName} <span className="text-orange-400">*</span>
          </label>
          <input
            type="text"
            required
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder={dict.sendRequest.parentNamePlaceholder}
            className="w-full px-4 py-3.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-sm transition-all"
          />
        </div>

        {/* Child's Name & Nickname */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            {dict.sendRequest.childName} <span className="text-orange-400">*</span>
          </label>
          <input
            type="text"
            required
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder={dict.sendRequest.childNamePlaceholder}
            className="w-full px-4 py-3.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-sm transition-all"
          />
        </div>

        {/* Child's Age / Grade */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            {dict.sendRequest.ageGrade} <span className="text-orange-400">*</span>
          </label>
          <select
            required
            value={ageGrade}
            onChange={(e) => setAgeGrade(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-sm transition-all"
          >
            <option value="" disabled>
              {dict.sendRequest.selectAge}
            </option>
            {ageOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#140b2e] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Behavior to Encourage */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            {dict.sendRequest.behavior} <span className="text-orange-400">*</span>
          </label>
          <select
            required
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-sm transition-all"
          >
            <option value="" disabled>
              {dict.sendRequest.selectBehavior}
            </option>
            {behaviorOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#140b2e] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* City / Location (Optional) */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            {dict.sendRequest.city}
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={dict.sendRequest.cityPlaceholder}
            className="w-full px-4 py-3.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-sm transition-all"
          />
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            {dict.sendRequest.instructions}
          </label>
          <textarea
            rows={3}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder={dict.sendRequest.instructionsPlaceholder}
            className="w-full px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-sm transition-all"
          />
        </div>

        {/* Mandatory Parent Consent Checkbox */}
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/50">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-purple-700 text-teal-500 focus:ring-teal-400 bg-[#0e0722]"
            />
            <span className="text-xs text-slate-300 leading-relaxed">
              {dict.sendRequest.consentText}
            </span>
          </label>
        </div>

        {/* Clean Submit Button (Zero Ads nearby as per AdSense & Privacy rules) */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>{isSubmitting ? dict.sendRequest.submitting : dict.sendRequest.submitButton}</span>
        </button>
        {isSubmitting && (
          <div id="ad-interstitial-trigger" data-ad-type="interstitial" data-ad-trigger="send-request-submit" aria-hidden="true" className="h-0 w-0 overflow-hidden" />
        )}

        <p className="text-center text-xs text-slate-500">
          {dict.sendRequest.privacyNote}
        </p>
      </form>
    </div>
  );
}
