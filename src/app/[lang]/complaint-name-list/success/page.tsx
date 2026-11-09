'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, Home, Plus, ShieldCheck, Loader2 } from 'lucide-react';

type SuccessData = { entryId?: string; childName?: string; childAge?: number; pending?: boolean; saveError?: string };

async function ensureSaved(d: SuccessData) {
  if (!d?.entryId || !d?.childName || typeof d?.childAge !== 'number') return false;
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

export default function ComplaintNameSuccessPage() {
  const params = useParams();
  const lang = (params?.lang as string) === 'ta' ? 'ta' : 'en';

  const [data, setData] = useState<SuccessData | null>(null);
  const [syncState, setSyncState] = useState<'done' | 'saving' | 'error'>('done');

  useEffect(() => {
    let cancelled = false;
    try {
      const stored = sessionStorage.getItem('pch_success_data');
      if (stored) {
        const parsed = JSON.parse(stored) as SuccessData;
        if (!cancelled) setData(parsed);
        if (parsed?.pending) {
          if (!cancelled) setSyncState('saving');
          void (async () => {
            const ok = await ensureSaved(parsed);
            if (cancelled) return;
            const next = { ...parsed, pending: !ok, saveError: ok ? undefined : parsed.saveError };
            try { sessionStorage.setItem('pch_success_data', JSON.stringify(next)); } catch {}
            setData(next);
            setSyncState(ok ? 'done' : 'error');
          })();
        }
      }
    } catch {}
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="py-16 md:py-24 relative">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-[#13092d] border border-purple-800/60 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 animate-pulse">
            <CheckCircle className="w-14 h-14 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'ta'
                ? 'உங்கள் குழந்தையின் பெயர் பதிவு வெற்றிகரமாக முடிந்தது! 🎉'
                : "Your Child's Name Entry Was Successful! 🎉"}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {lang === 'ta'
                ? 'நன்றி! உங்கள் குழந்தையின் பெயர் பூச்சாண்டி பெயர் பட்டியலில் சேர்க்கப்பட்டது.'
                : "Thank you! Your child's name has been added to the Poochandi Name List."}
            </p>
          </div>

          {data && (
            <div className="p-5 rounded-2xl bg-[#0c051f] border border-purple-900/50 space-y-3 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">{lang === 'ta' ? 'பதிவு எண்' : 'Entry Reference'}</span>
                <span className="font-mono font-bold text-teal-400">{data.entryId}</span>
              </div>
              <div className="pt-2 border-t border-purple-950 flex justify-between items-center text-sm">
                <span className="text-slate-400">{lang === 'ta' ? 'குழந்தையின் பெயர்:' : "Child's Name:"}</span>
                <span className="font-bold text-white">{data.childName}</span>
              </div>
              <div className="pt-2 border-t border-purple-950 flex justify-between items-center text-sm">
                <span className="text-slate-400">{lang === 'ta' ? 'வயது:' : 'Age:'}</span>
                <span className="font-bold text-teal-300">{data.childAge} {lang === 'ta' ? 'வயது' : 'Years'}</span>
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col gap-3">
            <Link href={`/${lang}/complaint-name-list`} className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-base shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.01] active:scale-95 duration-100">
              <Plus className="w-5 h-5 text-slate-950" />
              <span>{lang === 'ta' ? 'மற்றொரு பெயரைச் சேர்க்க (ADD ANOTHER ENTRY)' : 'ADD ANOTHER ENTRY'}</span>
            </Link>
            <Link href={`/${lang}`} className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] active:scale-95 duration-100">
              <Home className="w-5 h-5 text-slate-950" />
              <span>{lang === 'ta' ? 'முகப்புக்குச் செல்ல (HOME)' : 'HOME'}</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-purple-950/80 flex items-center justify-center gap-2 text-xs text-emerald-400">
            {syncState === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>
              {syncState === 'saving'
                ? (lang === 'ta' ? 'பதிவு சேமிக்கப்படுகிறது...' : 'Saving your entry...')
                : syncState === 'error'
                  ? (lang === 'ta' ? 'நெட்வொர்க் சிக்கல் இருந்தால் மீண்டும் முயற்சிக்கவும்.' : 'If network was slow, please retry once to confirm.')
                  : (lang === 'ta' ? 'தனிப்பட்ட தரவுத்தளத்தில் பாதுகாப்பாக பதிவு செய்யப்பட்டது' : 'Securely recorded in private database')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
