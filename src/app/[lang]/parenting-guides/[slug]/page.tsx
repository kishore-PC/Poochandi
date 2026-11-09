import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Language } from '@/lib/i18n';
import { initDb, queryOne } from '@/lib/db';
import AdSenseSlot from '@/components/ads/AdSenseSlot';
import ArticleContentView from '@/components/articles/ArticleContentView';

interface ArticlePageProps { params: Promise<{ lang: string; slug: string }> }

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  await initDb();
  const article = await queryOne<any>('SELECT * FROM articles WHERE slug = ?', [slug]);
  if (!article) return { title: 'Article Not Found' };
  const title = lang === 'ta' ? article.title_ta : article.title_en;
  const excerpt = lang === 'ta' ? article.excerpt_ta : article.excerpt_en;
  return {
    title: `${title} | Parenting Guides & Child Care Tips`,
    description: excerpt,
    keywords: article.seo_keywords || undefined,
    alternates: { canonical: `https://poochandi.in/${lang}/parenting-guides/${slug}`, languages: { en: `https://poochandi.in/en/parenting-guides/${slug}`, ta: `https://poochandi.in/ta/parenting-guides/${slug}` } },
    openGraph: { title, description: excerpt, type: 'article', url: `https://poochandi.in/${lang}/parenting-guides/${slug}` },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { lang: rawLang, slug } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  await initDb();
  const article = await queryOne<any>('SELECT * FROM articles WHERE slug = ?', [slug]);
  if (!article) notFound();

  const title = lang === 'ta' ? article.title_ta : article.title_en;
  const excerpt = lang === 'ta' ? article.excerpt_ta : article.excerpt_en;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: excerpt, datePublished: article.created_at, dateModified: article.updated_at, author: { '@type': 'Organization', name: 'Poochandi Varaan', url: 'https://poochandi.in' }, publisher: { '@type': 'Organization', name: 'POOCHANDI.IN', logo: { '@type': 'ImageObject', url: 'https://poochandi.in/images/poochandi-logo.svg' } }, keywords: article.seo_keywords || undefined };

  return (
    <div className="py-10 md:py-16 min-h-[60vh]" style={{ backgroundColor: '#0D0E12' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <AdSenseSlot slotId="article-top-slot" />
        <div className="mt-6">
          <ArticleContentView article={article} initialLang={lang} />
        </div>
        <div className="mt-10"><AdSenseSlot slotId="article-bottom-slot" /></div>
      </div>
    </div>
  );
}
