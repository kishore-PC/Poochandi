import React from 'react';
import type { Metadata } from 'next';
import { Language } from '@/lib/i18n';
import { initDb, queryAll } from '@/lib/db';
import AdSenseSlot from '@/components/ads/AdSenseSlot';
import ArticleCardGrid from '@/components/articles/ArticleCardGrid';
import { BookOpen } from 'lucide-react';

interface ParentingGuidesPageProps { params: Promise<{ lang: string }>; searchParams: Promise<{ category?: string; q?: string }> }

export async function generateMetadata({ params }: ParentingGuidesPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  return {
    title: 'Parenting Guides & Child Care Tips / பெற்றோர்களுக்கான வழிகாட்டி',
    description: lang === 'ta'
      ? 'குழந்தை வளர்ப்பு, திரை நேரக் கட்டுப்பாடு, தூக்க பழக்கம், உணவு, தன்னம்பிக்கை மற்றும் ஒழுக்கம் குறித்த இருமொழி பெற்றோர் வழிகாட்டிகள்.'
      : 'Bilingual parenting guides and child care tips for toddlers: screen time, sleep, food habits, tantrums, confidence, focus, and gentle discipline.',
    alternates: { canonical: `https://poochandi.in/${lang}/parenting-guides` },
  };
}

export default async function ParentingGuidesPage({ params, searchParams }: ParentingGuidesPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const { category, q } = await searchParams;
  await initDb();

  let query = 'SELECT id, slug, title_en, title_ta, excerpt_en, excerpt_ta, category, read_time, created_at FROM articles WHERE published = 1';
  const queryParams: any[] = [];
  if (category) { query += ' AND category = ?'; queryParams.push(category); }
  if (q) { query += ' AND (title_en LIKE ? OR title_ta LIKE ? OR excerpt_en LIKE ? OR excerpt_ta LIKE ? OR content_en LIKE ? OR content_ta LIKE ?)'; const s = `%${q}%`; queryParams.push(s, s, s, s, s, s); }
  query += ' ORDER BY created_at DESC';
  const articles = await queryAll<any>(query, queryParams);

  return (
    <div className="py-10 md:py-16 min-h-[60vh]" style={{ backgroundColor: '#0D0E12' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181A20] border border-[#1E293B] text-[#FACC15] text-xs font-bold" style={{ boxShadow: '0 1px 0 #000', textShadow: '0 1px 0 #000' }}>
            <BookOpen className="w-4 h-4" />
            <span>Poochandi Varaan • poochandi.in</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight" style={{ textShadow: '0 1px 0 #000' }}>
            Parenting Guides &amp; Child Care Tips / பெற்றோர்களுக்கான வழிகாட்டி
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl">
            {lang === 'ta'
              ? 'குழந்தை வளர்ப்பு மற்றும் குழந்தை பராமரிப்பு குறித்த SEO-சார்ந்த இருமொழி கட்டுரைகள். கீழே உள்ள EN | தமிழ் மாற்றி மூலம் மொழியைத் தேர்ந்தெடுக்கலாம்.'
              : 'SEO-focused bilingual parenting and child care articles. Use the EN | தமிழ் toggle to switch language on cards or read in your preferred language.'}
          </p>
        </header>

        {articles.length === 0 ? (
          <div className="rounded-2xl bg-[#181A20] border border-[#1E293B] p-10 text-center text-slate-400">No articles found.</div>
        ) : (
          <ArticleCardGrid articles={articles} defaultLang={lang} />
        )}

        <div className="mt-14">
          <AdSenseSlot slotId="parenting-guides-listing-bottom" />
        </div>
      </div>
    </div>
  );
}
