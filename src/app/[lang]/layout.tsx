import type { Metadata } from 'next';
import { Language } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieConsentBanner from '@/components/layout/CookieConsentBanner';
import { seedInitialData } from '@/lib/seed';
import { queryAll } from '@/lib/db';

// ISR-friendly: revalidate layout data (logo/settings seed) hourly. Avoid force-dynamic so public pages can use ISR.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  return {
    title: {
      template: '%s | POOCHANDI.IN',
      default:
        lang === 'ta'
          ? 'POOCHANDI.IN | நவீன குழந்தை வளர்ப்பு & பிரத்யேக வாழ்த்துகள்'
          : 'POOCHANDI.IN | Parenting Tips & Custom Child Requests',
    },
    description:
      lang === 'ta'
        ? 'POOCHANDI.IN — Poochandi Varaan வழங்கும் அதிகாரப்பூர்வ தளம். குழந்தையின் பெயர் பட்டியலில் பதிவு செய்யவும், பிரபலமான ரீல்ஸ்களைக் காணவும், பெற்றோர் வழிகாட்டிகளைப் படிக்கவும்.'
        : 'Official portal of POOCHANDI.IN and Poochandi Varaan. Submit child name requests, watch trending reels, and read modern parenting tips.',
    metadataBase: new URL('https://poochandi.in'),
    alternates: {
      canonical: `https://poochandi.in/${lang}`,
      languages: {
        en: 'https://poochandi.in/en',
        ta: 'https://poochandi.in/ta',
      },
    },
    openGraph: {
      title: 'POOCHANDI.IN — Modern Parenting Reimagined',
      description:
        'Encouraging positive habits in kids through playful South Indian storytelling, reels, and gentle guidance.',
      url: `https://poochandi.in/${lang}`,
      siteName: 'POOCHANDI.IN',
      locale: lang === 'ta' ? 'ta_IN' : 'en_US',
      type: 'website',
      images: [
        {
          url: '/images/poochandi-hero.svg',
          width: 800,
          height: 800,
          alt: 'Poochandi Character by Poochandi Varaan',
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  let logoUrl = '/images/poochandi-logo.svg';
  try {
    await seedInitialData();
    const rows = await queryAll<{ key: string; value: string }>("SELECT key, value FROM site_settings WHERE key = 'logo_url'");
    if (rows[0]?.value) logoUrl = rows[0].value;
  } catch (e) {
    console.error('Database init/seed error:', e);
  }
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  return (
    <div className="min-h-screen flex flex-col bg-[#0b051b] text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      <Header lang={lang} logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} logoUrl={logoUrl} />
      <CookieConsentBanner lang={lang} />
    </div>
  );
}
