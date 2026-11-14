import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Language, dictionaries } from '@/lib/i18n';
import { initDb, queryAll } from '@/lib/db';
import AdSenseSlot from '@/components/ads/AdSenseSlot';
import InstagramDmButton from '@/components/home/InstagramDmButton';
import { Sparkles, Send, BookOpen, Heart, Star, ShieldCheck, Play } from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

interface HomePageProps { params: Promise<{ lang: string }> }

export default async function HomePage({ params }: HomePageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const dict = dictionaries[lang];
  let settings: Record<string, string> = {};
  let articles: any[] = [];
  try {
    await initDb();
    const settingsRows = await queryAll<{ key: string; value: string }>('SELECT key, value FROM site_settings');
    for (const row of settingsRows) settings[row.key] = row.value;
    articles = await queryAll<any>('SELECT id, slug, title_en, title_ta, excerpt_en, excerpt_ta, category, read_time FROM articles WHERE published = 1 ORDER BY created_at DESC LIMIT 4');
  } catch (e) {
    console.error('Home page data load error:', e);
  }

  const reels = [
    { title: settings.reel1_title || 'When Kids Refuse to Eat Veggies!', url: settings.reel1_url || 'https://instagram.com/poochandi_ig', thumb: settings.reel1_thumbnail || '/images/reel-thumb-1.svg', desc: settings.reel1_desc || 'Poochandi explains why greens give magical superhero energy.' },
    { title: settings.reel2_title || 'Say Goodbye to Bedtime Meltdowns', url: settings.reel2_url || 'https://instagram.com/poochandi_ig', thumb: settings.reel2_thumbnail || '/images/reel-thumb-2.svg', desc: settings.reel2_desc || 'A soothing story technique that puts toddlers to sleep peacefully.' },
    { title: settings.reel3_title || 'Smart Alternative to Phone Addiction', url: settings.reel3_url || 'https://instagram.com/poochandi_ig', thumb: settings.reel3_thumbnail || '/images/reel-thumb-3.svg', desc: settings.reel3_desc || '3 easy fun games that replace screen cravings naturally.' },
    { title: settings.reel4_title || 'Teaching Kids to Respect Elders with Love', url: settings.reel4_url || 'https://instagram.com/poochandi_ig', thumb: settings.reel4_thumbnail || '/images/reel-thumb-4.svg', desc: settings.reel4_desc || 'Why manners become lifelong habits when taught with humor.' },
  ];

  return (
    <div className="relative overflow-hidden">
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-teal-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-teal-300 text-xs sm:text-sm font-semibold shadow-inner">
                <Sparkles className="w-4 h-4 text-teal-400" /><span>{dict.hero.tag}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                <span className="text-white">Poochandi — </span>
                <span className="text-gradient-magic">{lang === 'ta' ? 'நவீன குழந்தை வளர்ப்பை எளிதாக்குகிறோம்!' : 'Making Modern Parenting Easier & Fun!'}</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">{dict.hero.subheadline}</p>
              <div className="pt-4 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href={`/${lang}/complaint-name-list`} className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-transform duration-150 flex items-center justify-center gap-2"><Send className="w-4 h-4 text-slate-950" /><span>{dict.hero.btn1}</span></Link>
                  <Link href={`/${lang}/parenting-guides`} className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#1d103f] hover:bg-[#271654] border border-purple-700/50 text-purple-200 font-bold text-sm hover:scale-[1.02] active:scale-95 transition-transform duration-150 flex items-center justify-center gap-2"><BookOpen className="w-4 h-4 text-teal-400" /><span>{dict.hero.btn2}</span></Link>
                </div>
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/95 via-[#24124a] to-pink-950/30 border border-pink-500/30 shadow-xl max-w-xl mx-auto lg:mx-0 space-y-4">
                  <div className="text-center lg:text-left space-y-1.5">
                    <p className="text-sm sm:text-base font-black tracking-wide text-white">EXCLUSIVE SPECIAL VIDEOS</p>
                    <p className="text-sm sm:text-[15px] font-semibold text-teal-200 leading-snug">For Your Children &mdash; With Picture &amp; Name</p>
                    <p className="inline-flex text-[11px] sm:text-xs font-bold tracking-widest text-amber-300 bg-amber-500/10 border border-amber-400/30 px-2.5 py-0.5 rounded-md">(PAID)</p>
                  </div>
                  <InstagramDmButton />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /><span>100% Gentle & Non-Scary</span></div>
                <div className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-pink-400" /><span>Trusted by 50,000+ Parents</span></div>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 sm:w-96 lg:w-[420px] aspect-square rounded-3xl p-4 bg-gradient-to-b from-purple-900/30 via-[#190d3d]/60 to-[#0b051b] border border-purple-700/40 shadow-2xl shadow-purple-950/80">
                <Image src={settings.character_hero_url || '/images/poochandi-hero.svg'} alt="Poochandi Official Character by Poochandi Varaan" width={420} height={420} sizes="(max-width: 640px) 288px, (max-width: 1024px) 384px, 420px" priority className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(168,85,247,0.4)] animate-bounce-slow" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#180e38] border border-purple-500/50 text-[11px] font-bold text-teal-300 shadow-lg flex items-center gap-1.5 whitespace-nowrap"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span>Official Poochandi Avatar</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0e0725]/80 border-y border-purple-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">{dict.moments.title}</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">{dict.moments.subtitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reels.map((reel, index) => (
              <div key={index} className="group relative rounded-2xl bg-[#170c36] border border-purple-800/40 overflow-hidden shadow-lg hover:border-purple-500/60 transition-all duration-300 flex flex-col">
                <div className="relative aspect-[4/5] bg-purple-950/50 overflow-hidden">
                  <Image src={reel.thumb} alt={reel.title} width={400} height={500} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0725] via-transparent to-transparent opacity-80" />
                  <a href={reel.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center" aria-label={`Play ${reel.title}`}><div className="w-14 h-14 rounded-full bg-orange-500 group-hover:bg-orange-400 flex items-center justify-center text-slate-950 shadow-xl shadow-orange-500/40 group-hover:scale-110 transition-transform"><Play className="w-6 h-6 fill-slate-950 translate-x-0.5" /></div></a>
                  <div className="absolute top-3 right-3 bg-pink-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow"><InstagramIcon className="w-3 h-3" />Reel</div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div><h3 className="font-bold text-white text-base group-hover:text-teal-300 transition-colors line-clamp-1">{reel.title}</h3><p className="text-xs text-slate-400 mt-1 line-clamp-2">{reel.desc}</p></div>
                  <div className="pt-3 border-t border-purple-900/40 mt-3"><a href={reel.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"><span>{dict.moments.watchOnInstagram}</span><span>→</span></a></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 max-w-xl mx-auto text-center p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 to-[#1e0f40] border border-purple-700/40 shadow-xl">
            <p className="text-sm font-medium text-slate-300 mb-4">{dict.moments.followCtaText}</p>
            <a href="https://www.instagram.com/poochandi.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-pink-600/20 hover:scale-[1.02] transition-all"><InstagramIcon className="w-4 h-4" /><span>{dict.moments.followButton}</span></a>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4"><AdSenseSlot slotId="homepage-middle-slot-1" /></div>

      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12"><h2 className="text-2xl sm:text-4xl font-black text-white">{dict.services.title}</h2><p className="text-sm sm:text-base text-slate-400 mt-2">{dict.services.subtitle}</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#140b30]/80 border border-purple-800/40 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1 shadow-xl"><div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-6"><Send className="w-7 h-7" /></div><h3 className="text-xl font-bold text-white mb-3">{dict.services.card1Title}</h3><p className="text-sm text-slate-300 leading-relaxed">{dict.services.card1Desc}</p></div>
            <div className="p-8 rounded-3xl bg-[#140b30]/80 border border-purple-800/40 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 shadow-xl"><div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-6"><Heart className="w-7 h-7" /></div><h3 className="text-xl font-bold text-white mb-3">{dict.services.card2Title}</h3><p className="text-sm text-slate-300 leading-relaxed">{dict.services.card2Desc}</p></div>
            <div className="p-8 rounded-3xl bg-[#140b30]/80 border border-purple-800/40 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 shadow-xl"><div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-6"><BookOpen className="w-7 h-7" /></div><h3 className="text-xl font-bold text-white mb-3">{dict.services.card3Title}</h3><p className="text-sm text-slate-300 leading-relaxed">{dict.services.card3Desc}</p></div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0a0418] border-t border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div><span className="text-xs font-bold uppercase tracking-widest text-teal-400">{dict.articlesSection.title}</span><h2 className="text-2xl sm:text-4xl font-black text-white mt-1">{dict.articlesSection.subtitle}</h2></div>
            <Link href={`/${lang}/parenting-guides`} className="text-sm font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors"><span>{dict.articlesSection.viewAll}</span></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article: any) => {
              const title = lang === 'ta' ? article.title_ta : article.title_en;
              const excerpt = lang === 'ta' ? article.excerpt_ta : article.excerpt_en;
              return (
                <div key={article.id} className="rounded-2xl bg-[#150a30] border border-purple-800/40 p-5 flex flex-col justify-between hover:border-purple-600/50 transition-all duration-300 group">
                  <div><span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-950 text-teal-400 mb-3 border border-purple-800/50">{article.category}</span><h3 className="font-bold text-white text-base group-hover:text-teal-300 transition-colors line-clamp-2 leading-snug">{title}</h3><p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{excerpt}</p></div>
                  <div className="pt-4 mt-4 border-t border-purple-900/40 flex items-center justify-between text-xs"><span className="text-slate-500">{article.read_time}</span><Link href={`/${lang}/parenting-guides/${article.slug}`} className="font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"><span>{dict.articlesSection.readMore}</span></Link></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4"><AdSenseSlot slotId="homepage-bottom-slot-2" /></div>
    </div>
  );
}
