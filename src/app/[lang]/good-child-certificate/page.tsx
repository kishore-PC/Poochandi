import React from 'react';
import type { Metadata } from 'next';
import { Language } from '@/lib/i18n';
import GoodChildCertificate from '@/components/certificate/GoodChildCertificate';
import AdSenseSlot from '@/components/ads/AdSenseSlot';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  return {
    title: lang === 'ta' ? 'நல்ல குழந்தை சான்றிதழ் | பூச்சாண்டி' : 'Good Child Certificate | Poochandi',
    description:
      lang === 'ta'
        ? 'உங்கள் குழந்தைக்கு அழகான நல்ல குழந்தை சான்றிதழை உருவாக்கி PDF ஆக பதிவிறக்குங்கள்.'
        : 'Create a beautiful Good Child Certificate for your child and download it as a PDF.',
  };
}

export default async function GoodChildCertificatePage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  return (
    <div className="py-10 md:py-16 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <GoodChildCertificate lang={lang} />
        {/* D. Bottom of the page: responsive advertisement before the footer */}
        <div className="mt-10" id="ad-certificate-bottom" data-ad-placement="before-footer" data-page="good-child-certificate">
          <AdSenseSlot slotId="certificate-page-bottom" format="auto" className="my-4" />
        </div>
      </div>
    </div>
  );
}
