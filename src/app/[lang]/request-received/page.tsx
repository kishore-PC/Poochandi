import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Language, dictionaries } from '@/lib/i18n';
import { CheckCircle2, Home, BookOpen, Heart, Sparkles, ShieldCheck } from 'lucide-react';

interface RequestReceivedProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ id?: string; child?: string; behavior?: string }>;
}

export async function generateMetadata({ params }: RequestReceivedProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  return {
    title: lang === 'ta' ? 'கோரிக்கை பெறப்பட்டது' : 'Request Received Successfully',
    robots: {
      index: false, // Prevent indexation of confirmation pages for privacy
      follow: false,
    },
  };
}

export default async function RequestReceivedPage({ params, searchParams }: RequestReceivedProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const { id: requestId, child: childName, behavior } = await searchParams;
  const dict = dictionaries[lang];

  return (
    <div className="py-16 md:py-24 relative">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        <div className="bg-[#13092d] border border-purple-800/60 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
          
          {/* Animated celebration icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {dict.requestSuccess.title}
            </h1>
            <p className="text-sm text-slate-300">
              {dict.requestSuccess.subtitle}
            </p>
          </div>

          {/* Details Card */}
          <div className="p-6 rounded-2xl bg-[#0c051f] border border-purple-900/50 space-y-4 text-left">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {dict.requestSuccess.requestIdLabel}
              </span>
              <span className="text-xl font-black text-teal-400 tracking-wider">
                {requestId || 'PCH-2026-CONFIRMED'}
              </span>
            </div>

            {childName && (
              <div className="pt-2 border-t border-purple-950">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {dict.requestSuccess.childLabel}
                </span>
                <span className="text-base font-bold text-white">
                  {decodeURIComponent(childName)}
                </span>
              </div>
            )}

            {behavior && (
              <div className="pt-2 border-t border-purple-950">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {dict.requestSuccess.behaviorLabel}
                </span>
                <span className="text-sm font-semibold text-purple-300">
                  {decodeURIComponent(behavior)}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
            {dict.requestSuccess.message}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${lang}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <Home className="w-4 h-4" />
              {dict.requestSuccess.homeBtn}
            </Link>
            <Link
              href={`/${lang}/parenting-guides`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-700/50 text-purple-200 font-bold text-sm flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              {dict.requestSuccess.guidesBtn}
            </Link>
          </div>

          <div className="pt-4 border-t border-purple-950 flex items-center justify-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted & Stored Safely in Buzz Creations Vault</span>
          </div>

        </div>

      </div>
    </div>
  );
}
