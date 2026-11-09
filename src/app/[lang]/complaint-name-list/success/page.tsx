'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, Home, Plus, Loader2 } from 'lucide-react';
import AdSenseSlot from '@/components/ads/AdSenseSlot';

type SuccessData = { entryId?: string; childName?: string; childAge?: number; pending?: boolean };

async function ensureSaved(d: SuccessData) {
  if (!d?.entryId || !d?.childName || typeof d?.childAge !== 'number') return true;
  try {
    const res = await fetch('/api/complaint-names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childName: d.childName, childAge: d.childAge, entryId: d.entryId }),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

export default function ComplaintNameSuccessPage() {
  const params = useParams();
  const lang = (params?.lang as string) === 'ta' ? 'ta' : 'en';
  const [data, setData] = useState<SuccessData | null>(null);
  const [isSaving, setIsSaving] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => { setFadeIn(true); }, []);

  useEffect(() => {
    let cancelled = false;
    let parsed: SuccessData | null = null;
    try {
      const stored = sessionStorage.getItem('pch_success_data');
      if (stored) parsed = JSON.parse(stored) as SuccessData;
    } catch {}
    if (!cancelled) setData(parsed);

    if (!parsed?.entryId) {
      setIsSaving(false);
      return;
    }

    void (async () => {
      // Resolve on DB write completion OR max 1.5s timeout (no stuck UI)
      await withTimeout(ensureSaved(parsed as SuccessData), 1500, true);
      if (cancelled) return;
      try { sessionStorage.setItem('pch_success_data', JSON.stringify({ ...parsed, pending: false })); } catch {}
      setIsSaving(false);
      // background best-effort ensure (idempotent) if timeout won
      void ensureSaved(parsed as SuccessData);
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <div className={`py-10 md:py-16 relative transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Step 1/2: Dynamic top status */}
        <div className={`rounded-3xl border p-6 sm:p-8 text-center shadow-2xl transition-all duration-300 ${isSaving ? 'bg-[#13092d] border-teal-500/40' : 'bg-[#13092d] border-emerald-500/40'}`}>
          {isSaving ? (
            <>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-teal-500/15 border border-teal-400/40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-300 animate-spin" />
              </div>
              <p className="text-base sm:text-lg font-bold text-white">
                {lang === 'ta' ? 'பூச்சாண்டி லிஸ்ட்டில் பெயர் சேர்க்கப்படுகிறது...' : "Adding your child's name to Poochandi Name List..."}
              </p>
              <p className="text-xs text-slate-400 mt-2">{lang === 'ta' ? 'சிறிது நேரம் காத்திருக்கவும்' : 'Please wait a moment'}</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 mb-4 transition-all duration-300">
                <CheckCircle className="w-14 h-14 stroke-[2.5]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {lang === 'ta' ? 'வெற்றி! உங்கள் குழந்தையின் பெயர் வெற்றிகரமாக சேர்க்கப்பட்டது' : "Success! Your Child's Name Entry Was Successful"}
              </h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Thank you for supporting Poochandi Varaan! Your request has been added to the master list.
              </p>
              <p className="text-sm text-teal-200 mt-1.5 leading-relaxed">
                பூச்சாண்டி லிஸ்ட்டில் உங்கள் குழந்தையின் பெயர் வெற்றிகரமாக சேர்க்கப்பட்டது. மிக்க நன்றி!
              </p>
            </>
          )}
        </div>

        {/* Middle: AdSense clearly displayed */}
        <AdSenseSlot slotId="complaint-success-ad" className="!my-2" />

        {/* Details + bottom navigation */}
        <div className={`bg-[#13092d] border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 transition-opacity duration-300 ${isSaving ? 'opacity-80' : 'opacity-100'}`}>
          {data?.childName && (
            <div className="p-4 rounded-2xl bg-[#0c051f] border border-purple-900/50 space-y-2 text-left text-sm">
              {data.entryId && (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">{lang === 'ta' ? 'பதிவு எண்' : 'Entry Reference'}</span>
                  <span className="font-mono font-bold text-teal-400">{data.entryId}</span>
                </div>
              )}
              <div className={`flex justify-between items-center ${data.entryId ? 'pt-2 border-t border-purple-950' : ''}`}>
                <span className="text-slate-400">{lang === 'ta' ? 'குழந்தையின் பெயர்:' : "Child's Name:"}</span>
                <span className="font-bold text-white">{data.childName}</span>
              </div>
              {typeof data.childAge === 'number' && (
                <div className="pt-2 border-t border-purple-950 flex justify-between items-center">
                  <span className="text-slate-400">{lang === 'ta' ? 'வயது:' : 'Age:'}</span>
                  <span className="font-bold text-teal-300">{data.childAge} {lang === 'ta' ? 'வயது' : 'Years'}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!isSaving && (
              <Link href={`/${lang}/complaint-name-list`} className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition-transform duration-100">
                <Plus className="w-5 h-5" /><span>{lang === 'ta' ? 'மற்றொரு பெயரைச் சேர்க்க' : 'ADD ANOTHER ENTRY'}</span>
              </Link>
            )}
            <Link href={`/${lang}`} className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base shadow-lg shadow-orange-500/25 active:scale-95 transition-transform duration-100">
              <Home className="w-5 h-5 text-slate-950" />
              <span>{lang === 'ta' ? 'முகப்பு பக்கத்திற்குச் செல்ல' : 'Back to Home Page'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
