import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Language } from '@/lib/i18n';
import { initDb, queryAll } from '@/lib/db';
import AdSenseSlot from '@/components/ads/AdSenseSlot';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

interface ParentingGuidesPageProps { params: Promise<{ lang: string }>; searchParams: Promise<{ category?: string; q?: string }> }

export async function generateMetadata({ params }: ParentingGuidesPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  return {
    title: lang === 'ta' ? 'à®ªà¯†à®±à¯à®±à¯‹à®°à¯ à®µà®´à®¿à®•à®¾à®Ÿà¯à®Ÿà®¿à®•à®³à¯ & à®•à¯à®´à®¨à¯à®¤à¯ˆà®•à®³à¯ à®µà®³à®°à¯à®ªà¯à®ªà¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯' : 'Parenting Guides & Child Development Tips',
    description: lang === 'ta' ? 'à®¤à¯†à®©à¯à®©à®¿à®¨à¯à®¤à®¿à®¯ à®•à¯à®Ÿà¯à®®à¯à®ªà®™à¯à®•à®³à¯à®•à¯à®•à®¾à®© à®¨à®µà¯€à®© à®ªà¯†à®±à¯à®±à¯‹à®°à¯ à®µà®´à®¿à®•à®¾à®Ÿà¯à®Ÿà®¿à®•à®³à¯, à®‰à®£à®µà¯, à®¤à¯‚à®•à¯à®•à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®šà¯†à®²à¯à®ªà¯‹à®©à¯ à®ªà®´à®•à¯à®•à®µà®´à®•à¯à®• à®†à®²à¯‹à®šà®©à¯ˆà®•à®³à¯.' : 'Evidence-informed parenting guides, toddler sleep hacks, screen-time reduction tips, and South Indian family advice.',
  };
}

export default async function ParentingGuidesPage({ params, searchParams }: ParentingGuidesPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const { category, q } = await searchParams;
  await initDb();

  let query = 'SELECT * FROM articles WHERE published = 1';
  const queryParams: any[] = [];
  if (category) { query += ' AND category = ?'; queryParams.push(category); }
  if (q) { query += ' AND (title_en LIKE ? OR title_ta LIKE ? OR content_en LIKE ? OR content_ta LIKE ?)'; const s = `%${q}%`; queryParams.push(s, s, s, s); }
  query += ' ORDER BY created_at DESC';
  const articles = await queryAll<any>(query, queryParams);

  const categories = ['All', 'Positive Parenting', 'Screen Time', 'Food Habits', 'Bedtime Habits', 'Cultural Folklore'];
  return (
    <div className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/40 text-teal-300 text-xs font-bold"><BookOpen className="w-3.5 h-3.5" /><span>Poochandi Varaan Parenting Knowledge Hub</span></div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{lang === 'ta' ? 'à®¨à®µà¯€à®© à®ªà¯†à®±à¯à®±à¯‹à®°à¯ à®µà®´à®¿à®•à®¾à®Ÿà¯à®Ÿà®¿à®•à®³à¯' : 'Poochandi Parenting Guides'}</h1>
          <p className="text-slate-300 text-base leading-relaxed">{lang === 'ta' ? 'à®…à®©à¯à®ªà®¾à®© à®µà®´à®¿à®•à®¾à®Ÿà¯à®Ÿà®²à¯, à®¨à®Ÿà¯ˆà®®à¯à®±à¯ˆ à®…à®©à¯à®ªà®µà®™à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à®®à®¿à®´à¯ à®•à®²à®¾à®šà¯à®šà®¾à®° à®ªà®¿à®©à¯à®©à®£à®¿à®¯à®¿à®²à¯ à®‰à®°à¯à®µà®¾à®© à®ªà®¯à®©à¯à®³à¯à®³ à®•à¯à®´à®¨à¯à®¤à¯ˆ à®µà®³à®°à¯à®ªà¯à®ªà¯ à®†à®²à¯‹à®šà®©à¯ˆà®•à®³à¯.' : 'Practical, evidence-informed parenting wisdom designed for South Indian and modern global families.'}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-purple-900/40">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isSelected = (!category && cat === 'All') || category === cat;
              return <Link key={cat} href={cat === 'All' ? `/${lang}/parenting-guides` : `/${lang}/parenting-guides?category=${encodeURIComponent(cat)}`} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20' : 'bg-purple-950/60 text-slate-300 hover:bg-purple-900/60 hover:text-white border border-purple-800/40'}`}>{cat}</Link>;
            })}
          </div>
        </div>
        {articles.length === 0 ? <div className="text-center py-20 text-slate-400"><p>No articles found for this category.</p></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art: any) => {
              const title = lang === 'ta' ? art.title_ta : art.title_en;
              const excerpt = lang === 'ta' ? art.excerpt_ta : art.excerpt_en;
              return (
                <article key={art.id} className="rounded-3xl bg-[#140a2d] border border-purple-800/40 overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs"><span className="px-2.5 py-1 rounded-md bg-purple-950 text-teal-300 border border-purple-800/60 font-semibold">{art.category}</span><span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{art.read_time}</span></div>
                    <h2 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-2 leading-snug"><Link href={`/${lang}/parenting-guides/${art.slug}`}>{title}</Link></h2>
                    <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">{excerpt}</p>
                  </div>
                  <div className="px-6 py-4 border-t border-purple-900/40 bg-purple-950/20 flex items-center justify-between text-xs font-bold text-teal-400"><span>{lang === 'ta' ? 'à®®à¯à®´à¯ à®•à®Ÿà¯à®Ÿà¯à®°à¯ˆ' : 'Read Full Guide'}</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
                </article>
              );
            })}
          </div>
        )}
        <div className="mt-16"><AdSenseSlot slotId="parenting-guides-listing-bottom" /></div>
      </div>
    </div>
  );
}

