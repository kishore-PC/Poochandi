'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

type Lang = 'en' | 'ta';
type Article = {
  id: string; slug: string; category: string; read_time?: string;
  title_en: string; title_ta: string; excerpt_en: string; excerpt_ta: string;
};

export default function ArticleCardGrid({ articles, defaultLang }: { articles: Article[]; defaultLang: Lang }) {
  const [lang, setLang] = useState<Lang>(defaultLang);
  const [cardLang, setCardLang] = useState<Record<string, Lang>>({});

  const getCardLang = (id: string) => cardLang[id] || lang;
  const setOne = (id: string, l: Lang) => setCardLang((p) => ({ ...p, [id]: l }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="inline-flex items-center rounded-xl border border-[#1E293B] bg-[#181A20] p-1 text-sm font-bold shadow-[0_1px_0_#000]">
          <button type="button" onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-lg transition-all ${lang === 'en' ? 'bg-[#FACC15] text-black' : 'text-slate-300 hover:text-white'}`}>EN</button>
          <button type="button" onClick={() => setLang('ta')} className={`px-3 py-1.5 rounded-lg transition-all ${lang === 'ta' ? 'bg-[#FACC15] text-black' : 'text-slate-300 hover:text-white'}`}>தமிழ்</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => {
          const l = getCardLang(art.id);
          const title = l === 'ta' ? art.title_ta : art.title_en;
          const excerpt = l === 'ta' ? art.excerpt_ta : art.excerpt_en;
          return (
            <article key={art.id} className="rounded-2xl bg-[#181A20] border border-[#1E293B] overflow-hidden shadow-lg flex flex-col justify-between group" style={{ boxShadow: '0 1px 0 #000' }}>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#0D0E12] text-[#FACC15] border border-black/60 text-[11px] font-bold" style={{ textShadow: '0 1px 0 #000' }}>{art.category}</span>
                  <div className="inline-flex rounded-lg border border-[#1E293B] bg-[#0D0E12] p-0.5 text-[11px] font-bold">
                    <button type="button" onClick={() => setOne(art.id, 'en')} className={`px-2 py-1 rounded ${l === 'en' ? 'bg-[#FACC15] text-black' : 'text-slate-400'}`}>EN</button>
                    <button type="button" onClick={() => setOne(art.id, 'ta')} className={`px-2 py-1 rounded ${l === 'ta' ? 'bg-[#FACC15] text-black' : 'text-slate-400'}`}>தமிழ்</button>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-white group-hover:text-[#FACC15] transition-colors leading-snug" style={{ textShadow: '0 1px 0 #000' }}>{title}</h2>
                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{excerpt}</p>
                {art.read_time && <p className="text-[11px] text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{art.read_time}</p>}
              </div>
              <div className="px-5 py-4 border-t border-[#1E293B] bg-[#0D0E12]/60">
                <Link href={`/${l}/parenting-guides/${art.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#FACC15] hover:brightness-110" style={{ textShadow: '0 1px 0 #000' }}>
                  <span>{l === 'ta' ? 'மேலும் படிக்க' : 'Read Full Article'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
