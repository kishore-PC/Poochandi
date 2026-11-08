import React from 'react';
import type { Metadata } from 'next';
import { Language, dictionaries } from '@/lib/i18n';
import SendRequestForm from '@/components/forms/SendRequestForm';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface SendRequestPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: SendRequestPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  return {
    title: lang === 'ta' ? "குழந்தையின் பெயர் கோரிக்கை அனுப்ப" : "Send Your Child's Name Request",
    description: lang === 'ta'
      ? "எங்களின் அடுத்த வீடியோவில் உங்கள் குழந்தையின் பெயர் இடம்பெற கோரிக்கை அனுப்பவும். பஸ் கிரியேஷன்ஸ் வழங்கும் பூச்சாண்டி."
      : "Want Poochandi to mention your child in our upcoming video? Fill in the details to send your personalized name request.",
  };
}

export default async function SendRequestPage({ params }: SendRequestPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const dict = dictionaries[lang];

  return (
    <div className="py-12 md:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header with Character Icon */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-purple-800 to-teal-500 p-0.5 shadow-xl shadow-purple-900/50 mx-auto">
            <div className="w-full h-full bg-[#180e38] rounded-full flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {dict.sendRequest.title}
          </h1>
          <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            {dict.sendRequest.subtitle}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#12082b] border border-purple-800/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          <SendRequestForm lang={lang} />
        </div>

      </div>
    </div>
  );
}
