import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Language } from '@/lib/i18n';
import { initDb, queryOne } from '@/lib/db';
import { Clock, HeartHandshake } from 'lucide-react';

interface PausedPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PausedPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  return {
    title: lang === 'ta' ? 'பெயர் பதிவு தற்காலிகமாக நிறுத்தப்பட்டுள்ளது | பூச்சாண்டி' : 'Name Entry Paused | Poochandi',
    description: lang === 'ta' ? 'பெயர் பதிவு தற்போது தற்காலிகமாக நிறுத்தப்பட்டுள்ளது.' : 'Name entry is temporarily paused.',
    robots: { index: false, follow: true },
  };
}

export default async function NameEntryPausedPage({ params }: PausedPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  try {
    await initDb();
    const row = await queryOne<{ value: string }>('SELECT value FROM site_settings WHERE key = ?', ['name_entry_status']);
    if (row?.value !== 'stopped') {
      redirect(`/${lang}/complaint-name-list`);
    }
  } catch {
    // If status cannot be read, keep user on the safe paused message rather than exposing the form.
  }

  const isTa = lang === 'ta';

  return (
    <div className="py-12 md:py-20 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/15 blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 blur-[110px] rounded-full pointer-events-none" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-[#12082b]/90 border border-purple-800/50 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-300" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">Name List Limit Reached!</h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl mx-auto">
              Currently, we have received a large number of name entries. We have temporarily paused new entries to process the existing requests. We will reopen the name entry soon. Thank you for your patience and support!
            </p>
            {isTa && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
                தற்போது அதிக எண்ணிக்கையிலான பெயர் பதிவுகள் கிடைத்துள்ளதால், ஏற்கனவே வந்த விண்ணப்பங்களைச் செயல்படுத்த புதிய பெயர் பதிவுகளை தற்காலிகமாக நிறுத்தியுள்ளோம். விரைவில் பெயர் பதிவை மீண்டும் திறப்போம். உங்கள் பொறுமைக்கும் ஆதரவுக்கும் நன்றி!
              </p>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-200 text-sm font-semibold">
            <HeartHandshake className="w-4 h-4" />
            <span>{isTa ? 'தயவுசெய்து சிறிது நேரம் காத்திருந்து மீண்டும் முயற்சிக்கவும்.' : 'Please check back soon — we appreciate your patience!'}</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/${lang}`}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 border border-purple-700/50 text-purple-100 font-bold text-sm"
            >
              {isTa ? 'முகப்பு பக்கம்' : 'Back to Home'}
            </Link>
            <Link
              href={`/${lang}/parenting-guides`}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl bg-[#1d103f] hover:bg-[#271654] border border-purple-700/50 text-teal-200 font-bold text-sm"
            >
              {isTa ? 'பெற்றோர் வழிகாட்டிகள்' : 'Parenting Guides'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
