import React from 'react';
import type { Metadata } from 'next';
import { Language, dictionaries } from '@/lib/i18n';

interface LegalPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  return {
    title: lang === 'ta' ? 'à®šà¯‡à®µà¯ˆ à®µà®¿à®¤à®¿à®®à¯à®±à¯ˆà®•à®³à¯' : 'Terms of Service',
    description: 'Terms of service and website usage rules for Poochandi.in by Poochandi Varaan.',
  };
}

export default async function TermsOfServicePage({ params }: LegalPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const dict = dictionaries[lang];

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        <div className="border-b border-purple-900/40 pb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {dict.legal.termsTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-2">{dict.legal.lastUpdated}</p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">1. Acceptance of Terms</h2>
            <p>
              By accessing and browsing <strong>Poochandi.in</strong>, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, please do not use our website.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">2. Request Submissions & Content Usage</h2>
            <p>
              Submitting a child&apos;s name or details through the <em>Send Request</em> form does not guarantee an immediate or guaranteed video mention. All video shoutouts and reel inclusions are curated creatively by the Poochandi Varaan production team. Submissions containing offensive, harmful, or defamatory statements will be rejected immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">3. Intellectual Property Rights</h2>
            <p>
              All character designs, visual artwork, character animations, storylines, audio voiceovers, trademarks, and branding associated with <strong>Poochandi</strong> are the exclusive intellectual property of <strong>Poochandi Varaan</strong>. Reproduction, distribution, or commercial exploitation without prior written consent is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">4. Modifications to Service</h2>
            <p>
              Poochandi Varaan reserves the right to update, modify, or discontinue any aspect of the website or services at our discretion without prior notice.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}

