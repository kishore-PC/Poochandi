import React from 'react';
import type { Metadata } from 'next';
import { Language } from '@/lib/i18n';
import ComplaintNameForm from '@/components/forms/ComplaintNameForm';
import AdSenseSlot from '@/components/ads/AdSenseSlot';
import { ArrowDown } from 'lucide-react';
import { queryAll } from '@/lib/db';

interface ComplaintNameListPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: ComplaintNameListPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  return {
    title: lang === 'ta' ? 'பூச்சாண்டி பெயர் பட்டியல் பதிவு' : 'Poochandi Complaint Name List',
    description: lang === 'ta'
      ? 'பூச்சாண்டி பெயர் பட்டியலில் உங்கள் குழந்தையின் பெயரை எளிதாகப் பதிவு செய்யுங்கள்.'
      : "Add your child's name to the official Poochandi Name List.",
  };
}

export default async function ComplaintNameListPage({ params }: ComplaintNameListPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  let logoUrl = '/images/poochandi-logo.svg';
  try {
    const rows = await queryAll<{ key: string; value: string }>(`SELECT key, value FROM site_settings WHERE key = 'logo_url'`);
    if (rows[0]?.value) logoUrl = rows[0].value;
  } catch {
    // keep fallback logo
  }

  return (
    <div className="py-12 md:py-20 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* TOP SECTION */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center gap-4 mx-auto">
            <img src={logoUrl} alt="Poochandi official logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
            <span className="text-2xl sm:text-3xl font-black tracking-wide text-gradient-magic">Poochandi Varaan</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            {lang === 'ta' ? 'அன்பான பெற்றோருக்கு வணக்கம்! ❤️' : 'Welcome, Parents! ❤️'}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            {lang === 'ta'
              ? 'பூச்சாண்டி பெயர் பட்டியலில் உங்கள் குழந்தையின் பெயரைச் சேர்க்க வேண்டுமா? நீங்கள் சரியான இடத்திற்கு வந்துள்ளீர்கள்!'
              : "Want to add your child's name to the Poochandi Name List? You're in the right place!"}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/80 border border-purple-700/50 text-teal-300 text-xs sm:text-sm font-semibold shadow-inner mt-2">
            <ArrowDown className="w-4 h-4 text-teal-400 animate-bounce" />
            <span>
              {lang === 'ta'
                ? 'உங்கள் குழந்தையின் பெயரை உள்ளிட கீழே செல்லவும்'
                : "Scroll down to enter your child's name."}
            </span>
          </div>
        </div>

        {/* DEDICATED RESPONSIVE GOOGLE ADSENSE SECTION (Between intro & form, sufficient spacing) */}
        <div className="my-10">
          <AdSenseSlot slotId="complaint-name-list-mid-ad" />
        </div>

        {/* NAME ENTRY SECTION (Clean 2-field form with CONFIRM button) */}
        <div className="bg-[#12082b] border border-purple-800/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          <ComplaintNameForm lang={lang} />
        </div>

      </div>
    </div>
  );
}
