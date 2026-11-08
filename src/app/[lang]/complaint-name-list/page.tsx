import React from 'react';
import type { Metadata } from 'next';
import { Language } from '@/lib/i18n';
import ComplaintNameForm from '@/components/forms/ComplaintNameForm';
import AdSenseSlot from '@/components/ads/AdSenseSlot';
import { Sparkles, ArrowDown } from 'lucide-react';

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

  return (
    <div className="py-12 md:py-20 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* TOP SECTION */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-purple-800 to-teal-500 p-0.5 shadow-xl shadow-purple-900/50 mx-auto">
            <div className="w-full h-full bg-[#180e38] rounded-full flex items-center justify-center">
              <span className="text-3xl">❤️</span>
            </div>
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
