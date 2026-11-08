import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Language } from '@/lib/i18n';
import db from '@/lib/db';
import AdSenseSlot from '@/components/ads/AdSenseSlot';
import { Clock, Calendar, ArrowLeft, Tag, Share2, Sparkles, BookOpen } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug) as any;
  if (!article) return { title: 'Article Not Found' };

  const title = lang === 'ta' ? article.title_ta : article.title_en;
  const excerpt = lang === 'ta' ? article.excerpt_ta : article.excerpt_en;

  return {
    title: `${title} | Poochandi Parenting Guides`,
    description: excerpt,
    alternates: {
      canonical: `https://poochandi.in/${lang}/parenting-guides/${slug}`,
      languages: {
        en: `https://poochandi.in/en/parenting-guides/${slug}`,
        ta: `https://poochandi.in/ta/parenting-guides/${slug}`,
      },
    },
    openGraph: {
      title,
      description: excerpt,
      type: 'article',
      url: `https://poochandi.in/${lang}/parenting-guides/${slug}`,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { lang: rawLang, slug } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';

  const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug) as any;
  if (!article) notFound();

  const title = lang === 'ta' ? article.title_ta : article.title_en;
  const content = lang === 'ta' ? article.content_ta : article.content_en;
  const excerpt = lang === 'ta' ? article.excerpt_ta : article.excerpt_en;

  // Schema.org Article JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    image: 'https://poochandi.in/images/poochandi-hero.svg',
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Organization',
      name: 'Buzz Creations',
      url: 'https://poochandi.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Poochandi.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://poochandi.in/images/poochandi-logo.svg',
      },
    },
  };

  // Convert markdown-style headers to HTML
  const paragraphs = content.split('\n\n');

  return (
    <article className="py-12 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href={`/${lang}`} className="hover:text-teal-300">
            {lang === 'ta' ? 'முகப்பு' : 'Home'}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/parenting-guides`} className="hover:text-teal-300">
            {lang === 'ta' ? 'வழிகாட்டிகள்' : 'Parenting Guides'}
          </Link>
          <span>/</span>
          <span className="text-teal-400 truncate max-w-xs">{article.category}</span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-950 text-teal-300 border border-purple-800/60">
            {article.category}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-b border-purple-900/40 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              Published by Buzz Creations Editorial Team
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              {article.read_time}
            </span>
          </div>
        </header>

        {/* Lead excerpt */}
        <div className="p-6 rounded-2xl bg-[#140a2c] border-l-4 border-teal-500 mb-8 text-base text-slate-200 leading-relaxed italic">
          {excerpt}
        </div>

        {/* In-Article AdSense Placement 1 */}
        <AdSenseSlot slotId="article-top-slot" />

        {/* Article Body Content */}
        <div className="space-y-6 text-slate-200 text-base sm:text-lg leading-relaxed">
          {paragraphs.map((p: string, idx: number) => {
            if (p.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-2xl sm:text-3xl font-black text-white pt-6 pb-2 text-gradient-magic">
                  {p.replace('## ', '')}
                </h2>
              );
            }
            if (p.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-xl sm:text-2xl font-bold text-teal-300 pt-4 pb-1">
                  {p.replace('### ', '')}
                </h3>
              );
            }
            return (
              <p key={idx} className="text-slate-300">
                {p}
              </p>
            );
          })}
        </div>

        {/* In-Article AdSense Placement 2 */}
        <AdSenseSlot slotId="article-bottom-slot" />

        {/* Author & Disclaimer Footer */}
        <div className="mt-12 p-6 rounded-2xl bg-[#110726] border border-purple-800/50 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>About Buzz Creations Parenting Guides</span>
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our parenting articles are curated to offer encouraging, culturally resonant perspectives. They are intended for healthy encouragement and positive reinforcement. They do not replace formal clinical psychological or pediatric advice.
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href={`/${lang}/parenting-guides`}
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-400 hover:text-teal-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'ta' ? 'அனைத்து கட்டுரைகளுக்கும் திரும்பச் செல்' : 'Back to All Parenting Guides'}</span>
          </Link>
        </div>

      </div>
    </article>
  );
}
