import React from 'react';
import type { Metadata } from 'next';
import { Language, dictionaries } from '@/lib/i18n';
import { AlertTriangle } from 'lucide-react';

interface LegalPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  return {
    title: lang === 'ta' ? 'à®ªà¯Šà®±à¯à®ªà¯à®ªà¯à®¤à¯ à®¤à¯à®±à®ªà¯à®ªà¯' : 'Disclaimer & Safe Use Notice',
    description: 'Disclaimer and guidance on the entertainment purpose of Poochandi.in.',
  };
}

export default async function DisclaimerPage({ params }: LegalPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const dict = dictionaries[lang];

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        <div className="border-b border-purple-900/40 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-700/50 text-amber-400 text-xs font-bold mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Important Advisory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {dict.legal.disclaimerTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-2">{dict.legal.lastUpdated}</p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">1. Entertainment & Habit Motivation Purpose</h2>
            <p>
              The <strong>Poochandi</strong> character, video reels, and interactive requests are developed solely for joyful family entertainment and positive behavioral encouragement through gentle storytelling and humor.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">2. Not Medical, Psychological, or Clinical Advice</h2>
            <p>
              Articles, parenting tips, and guides published on <strong>Poochandi.in</strong> represent general parenting perspectives and cultural observations. They do <strong>not</strong> constitute medical, pediatric, nutritional, clinical, or behavioral psychological therapy. Always consult a certified pediatrician or licensed child development professional regarding developmental delays, sensory challenges, or medical concerns.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">3. Parental Responsibility</h2>
            <p>
              Parents and guardians retain full responsibility for screen time monitoring, dietary choices, and the general welfare of their children. Poochandi Varaan assumes no liability for actions taken based on entertainment content or published parenting articles.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}

