import React from 'react';
import type { Metadata } from 'next';
import { Language, dictionaries } from '@/lib/i18n';
import { ShieldCheck, Lock } from 'lucide-react';

interface LegalPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  return {
    title: lang === 'ta' ? 'à®¤à®©à®¿à®¯à¯à®°à®¿à®®à¯ˆà®•à¯ à®•à¯Šà®³à¯à®•à¯ˆ' : 'Privacy Policy',
    description: 'Privacy Policy and Child Data Protection terms for Poochandi.in by Poochandi Varaan.',
  };
}

export default async function PrivacyPolicyPage({ params }: LegalPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const dict = dictionaries[lang];

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        <div className="border-b border-purple-900/40 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Child Privacy & Data Protection Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {dict.legal.privacyTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-2">{dict.legal.lastUpdated}</p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">1. Overview & Commitment</h2>
            <p>
              At <strong>Poochandi.in</strong> (operated by <strong>Poochandi Varaan</strong>), we prioritize the privacy and safety of our visitors, particularly children and their families. This Privacy Policy details our practices regarding the collection, storage, and handling of information when you use our website or submit child name requests.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">2. Information We Collect</h2>
            <p>
              When a parent or guardian voluntarily submits a request on our <em>Send Request</em> page, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Parent or legal guardian&apos;s full name.</li>
              <li>Child&apos;s first name or affectionate nickname.</li>
              <li>Child&apos;s approximate age range or grade.</li>
              <li>Selected behavior or habit to encourage (e.g., eating vegetables, bedtime).</li>
              <li>City / general location (optional).</li>
              <li>Parent&apos;s special instructions for Poochandi (optional).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">3. Verifiable Parental Consent & Child Protection</h2>
            <p>
              We require explicit affirmative consent from a parent or legal guardian before any child details can be submitted. We strictly uphold child data protection principles:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Submitted names and child details are <strong>never published publicly</strong> on our website.</li>
              <li>Child submission records are <strong>not indexed</strong> by Google or search engine crawlers.</li>
              <li>We never sell, rent, or trade children&apos;s data to third parties, data brokers, or advertisers.</li>
              <li>Child information is strictly used for the artistic creation of positive habit shoutouts in our video/audio reels.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">4. Data Retention, Security & Deletion Rights</h2>
            <p>
              All submissions are stored within a secure, authenticated database with restricted administrative access. Parents retain the permanent right to inspect, correct, or request the immediate deletion of their child&apos;s records at any time by contacting us at <a href="mailto:privacy@poochandi.in" className="text-teal-400 underline">privacy@poochandi.in</a> or through our Contact form.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">5. Google AdSense & Cookies</h2>
            <p>
              Our website may display non-intrusive advertisements served by Google AdSense to sustain free parenting content and creative animations. Google uses cookies to serve ads based on prior visits to this or other websites. You may opt out of personalized advertising by visiting Google Ads Settings. We enforce strict policies ensuring that advertisements are never placed in proximity to child request forms or confirmation screens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-teal-300">6. Contact for Privacy Inquiries</h2>
            <p>
              For any questions regarding this policy or data deletion requests, please contact Poochandi Varaan at <a href="mailto:privacy@poochandi.in" className="text-teal-400 underline">privacy@poochandi.in</a>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}

