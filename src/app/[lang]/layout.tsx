import type { Metadata } from 'next';
import { Language } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { seedInitialData } from '@/lib/seed';
import { queryAll } from '@/lib/db';

// Database priming is handled per-request in server components/routes via initDb()/seedInitialData() where needed.

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  return {
    title: {
      template: '%s | Poochandi Official',
      default:
        lang === 'ta'
          ? 'பூச்சாண்டி | நவீன குழந்தை வளர்ப்பு & பிரத்யேக வாழ்த்துகள்'
          : 'Poochandi Official | Parenting Tips & Custom Child Requests',
    },
    description:
      lang === 'ta'
        ? 'பஸ் கிரியேஷன்ஸின் அதிகாரப்பூர்வ பூச்சாண்டி தளம். குழந்தையின் பெயர் கோரிக்கைகளை அனுப்பவும், பிரபலமான ரீல்ஸ்களைக் காணவும், நவீன பெற்றோர் வழிகாட்டிகளைப் படிக்கவும்.'
        : 'Official portal of Poochandi by Buzz Creations. Submit child name requests, watch trending reels, and read modern parenting tips.',
    metadataBase: new URL('https://poochandi.in'),
    alternates: {
      canonical: `https://poochandi.in/${lang}`,
      languages: {
        en: 'https://poochandi.in/en',
        ta: 'https://poochandi.in/ta',
      },
    },
    openGraph: {
      title: 'Poochandi Official — Modern Parenting Reimagined',
      description:
        'Encouraging positive habits in kids through playful South Indian storytelling, reels, and gentle guidance.',
      url: `https://poochandi.in/${lang}`,
      siteName: 'Poochandi.in',
      locale: lang === 'ta' ? 'ta_IN' : 'en_US',
      type: 'website',
      images: [
        {
          url: '/images/poochandi-hero.svg',
          width: 800,
          height: 800,
          alt: 'Poochandi Character by Buzz Creations',
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
    </div>
  );
}
