'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';

type Lang = 'en' | 'ta';
type Article = {
  slug: string; category: string; read_time?: string; created_at?: string;
  title_en: string; title_ta: string; excerpt_en: string; excerpt_ta: string;
  content_en: string; content_ta: string; seo_keywords?: string;
};

export default function ArticleContentView({ article, initialLang }: { article: Article; initialLang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const title = lang === 'ta' ? article.title_ta : article.title_en;
  const excerpt = lang === 'ta' ? article.excerpt_ta : article.excerpt_en;
  const content = lang === 'ta' ? article.content_ta : article.content_en;
  const blocks = String(content || '').split(/\n\n+/).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <nav className="text-xs font-semibold text-slate-400 flex items-center gap-2">
          <Link href={`/${lang}`} className="hover:text-[#FACC15]">{lang === 'ta' ? 'முகப்பு' : 'Home'}</Link>
          <span>/</span>
          <Link href={`/${lang}/parenting-guides`} className="hover:text-[#FACC15]">{lang === 'ta' ? 'பெற்றோர் வழிகாட்டிகள்' : 'Parenting Guides'}</Link>
        </nav>
        <div className="inline-flex items-center rounded-xl border border-[#1E293B] bg-[#181A20] p-1 text-sm font-bold" style={{ boxShadow: '0 1px 0 #000' }}>
          <button type="button" onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-lg ${lang === 'en' ? 'bg-[#FACC15] text-black' : 'text-slate-300'}`}>EN</button>
          <button type="button" onClick={() => setLang('ta')} className={`px-3 py-1.5 rounded-lg ${lang === 'ta' ? 'bg-[#FACC15] text-black' : 'text-slate-300'}`}>தமிழ்</button>
        </div>
      </div>

      <header className="space-y-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#181A20] text-[#FACC15] border border-[#1E293B]" style={{ textShadow: '0 1px 0 #000' }}>{article.category}</span>
        <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight" style={{ textShadow: '0 1px 0 #000' }}>{title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-b border-[#1E293B] pb-5">
          {article.created_at && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#FACC15]" />{new Date(article.created_at).toLocaleDateString()}</span>}
          {article.read_time && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#FACC15]" />{article.read_time}</span>}
        </div>
      </header>

      <div className="p-5 rounded-2xl bg-[#181A20] border border-[#1E293B] border-l-4 border-l-[#FACC15] text-slate-200 leading-relaxed">{excerpt}</div>

      <div className="space-y-4 text-slate-200 leading-relaxed">
        {blocks.map((block, i) => {
          if (block.startsWith('## ')) return <h2 key={i} className="text-xl sm:text-2xl font-black text-white pt-4" style={{ textShadow: '0 1px 0 #000' }}>{block.replace(/^##\s*/, '')}</h2>;
          if (block.startsWith('### ')) return <h3 key={i} className="text-lg sm:text-xl font-bold text-[#FACC15] pt-2">{block.replace(/^###\s*/, '')}</h3>;
          const lines = block.split('\n').filter(Boolean);
          if (lines.length > 1) {
            return <ol key={i} className="space-y-2 list-decimal list-inside bg-[#181A20] border border-[#1E293B] rounded-2xl p-4 sm:p-5">{lines.map((ln, j) => <li key={j} className="text-slate-300">{ln.replace(/^\d+\.\s*/, '')}</li>)}</ol>;
          }
          return <p key={i} className="text-slate-300">{block}</p>;
        })}
      </div>

      <div className="pt-4 text-center">
        <Link href={`/${lang}/parenting-guides`} className="inline-flex items-center gap-2 text-sm font-bold text-[#FACC15] hover:brightness-110"><ArrowLeft className="w-4 h-4" /><span>{lang === 'ta' ? 'அனைத்து கட்டுரைகளுக்கும் திரும்ப' : 'Back to All Parenting Guides'}</span></Link>
      </div>
    </div>
  );
}
