import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Language } from '@/lib/i18n';
import { initDb, queryOne } from '@/lib/db';
import AdSenseSlot from '@/components/ads/AdSenseSlot';
import ArticleContentView from '@/components/articles/ArticleContentView';

interface ArticlePageProps { params: Promise<{ lang: string; slug: string }> }

function trimDesc(text: string, max = 160) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

function articleUrls(slug: string, lang: Language) {
  const base = 'https://poochandi.in';
  return {
    canonical: `${base}/${lang}/parenting-guides/${slug}`,
    en: `${base}/en/parenting-guides/${slug}`,
    ta: `${base}/ta/parenting-guides/${slug}`,
    ogImage: `${base}/images/poochandi-logo.svg`,
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  await initDb();
  const article = await queryOne<any>('SELECT * FROM articles WHERE slug = ?', [slug]);
  if (!article) return { title: 'Article Not Found | Poochandi Varaan' };

  const urls = articleUrls(slug, lang);
  const pageTitle = `${article.title_en} | ${article.title_ta} - Poochandi Varaan`;
  const description = trimDesc(`${article.excerpt_en || ''} ${article.excerpt_ta || ''}`.trim() || article.excerpt_en || article.excerpt_ta || '', 160);
  const primaryTitle = lang === 'ta' ? article.title_ta : article.title_en;

  return {
    title: pageTitle,
    description,
    keywords: article.seo_keywords || undefined,
    alternates: {
      canonical: urls.canonical,
      languages: { en: urls.en, ta: urls.ta, 'x-default': urls.en },
    },
    openGraph: {
      siteName: 'Poochandi Varaan',
      title: primaryTitle,
      description,
      url: urls.canonical,
      type: 'article',
      locale: lang === 'ta' ? 'ta_IN' : 'en_IN',
      alternateLocale: lang === 'ta' ? ['en_IN'] : ['ta_IN'],
      images: [{ url: urls.ogImage, alt: 'Poochandi Varaan' }],
      publishedTime: article.created_at || undefined,
      modifiedTime: article.updated_at || article.created_at || undefined,
      authors: ['Poochandi Varaan'],
    },
    twitter: {
      card: 'summary_large_image',
      title: primaryTitle,
      description,
      images: [urls.ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { lang: rawLang, slug } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  await initDb();
  const article = await queryOne<any>('SELECT * FROM articles WHERE slug = ?', [slug]);
  if (!article) notFound();

  const urls = articleUrls(slug, lang);
  const description = trimDesc(`${article.excerpt_en || ''} ${article.excerpt_ta || ''}`.trim() || '', 160);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': urls.canonical },
    headline: `${article.title_en} | ${article.title_ta}`,
    description: `${article.excerpt_en || ''} - ${article.excerpt_ta || ''}`.trim(),
    image: urls.ogImage,
    datePublished: article.created_at || undefined,
    dateModified: article.updated_at || article.created_at || undefined,
    inLanguage: ['en', 'ta'],
    keywords: article.seo_keywords || undefined,
    author: {
      '@type': 'Organization',
      name: 'Poochandi Varaan',
      url: 'https://instagram.com/poochandi.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Poochandi Varaan',
      logo: { '@type': 'ImageObject', url: 'https://poochandi.in/images/poochandi-logo.svg' },
    },
  };

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
