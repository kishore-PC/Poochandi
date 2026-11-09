import React from 'react';
import type { Metadata } from 'next';
import { Language, dictionaries } from '@/lib/i18n';
import { initDb, queryAll } from '@/lib/db';
import { Sparkles, Heart, Shield, Award } from 'lucide-react';
import { InstagramIcon, YoutubeIcon } from '@/components/icons/SocialIcons';

interface AboutPageProps { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  return {
    title: lang === 'ta' ? 'à®ªà¯‚à®šà¯à®šà®¾à®£à¯à®Ÿà®¿ & à®ªà®¸à¯ à®•à®¿à®°à®¿à®¯à¯‡à®·à®©à¯à®¸à¯ à®ªà®±à¯à®±à®¿' : 'About Poochandi & Poochandi Varaan',
    description: lang === 'ta' ? 'à®¤à¯†à®©à¯à®©à®¿à®¨à¯à®¤à®¿à®¯ à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯ à®•à®¤à¯ˆà®¯à®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯ à®‰à®°à¯à®µà®¾à®© à®¨à®µà¯€à®© à®…à®©à¯à®ªà®¾à®© à®Ÿà®¿à®œà®¿à®Ÿà¯à®Ÿà®²à¯ à®¤à¯‹à®´à®©à¯ à®ªà¯‚à®šà¯à®šà®¾à®£à¯à®Ÿà®¿à®¯à®¿à®©à¯ à®•à®¤à¯ˆ.' : 'The vision, story, and mission behind Poochandi by Poochandi Varaan â€” transforming folklore into gentle parenting encouragement.',
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const dict = dictionaries[lang];
  await initDb();
  const settingsRows = await queryAll<{ key: string; value: string }>('SELECT key, value FROM site_settings');
  const settings: Record<string, string> = {};
  for (const row of settingsRows) settings[row.key] = row.value;

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-teal-300 text-xs font-bold"><Sparkles className="w-4 h-4" /><span>{dict.about.badge}</span></div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{dict.about.title}</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">{dict.about.lead}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center mb-16 bg-[#13092d] p-8 sm:p-12 rounded-3xl border border-purple-800/40">
          <div className="md:col-span-5 flex justify-center"><div className="relative w-64 h-64 rounded-2xl bg-gradient-to-tr from-purple-900 to-teal-800/30 p-4 border border-purple-700/50 flex items-center justify-center"><img src={settings.character_hero_url || '/images/poochandi-hero.svg'} alt="Poochandi Mascot" className="w-full h-full object-contain filter drop-shadow-xl" /></div></div>
          <div className="md:col-span-7 space-y-4">
            <h2 className="text-2xl font-black text-white text-gradient-magic">{dict.about.storyTitle}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{dict.about.storyP1}</p>
            <p className="text-slate-300 text-sm leading-relaxed">{dict.about.storyP2}</p>
            <p className="text-slate-300 text-sm leading-relaxed">{dict.about.storyP3}</p>
          </div>
        </div>
        <div className="mb-16 space-y-8">
          <h3 className="text-2xl font-black text-white text-center">{dict.about.missionTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#140b2e] border border-purple-800/40 space-y-3"><div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center"><Heart className="w-5 h-5" /></div><h4 className="font-bold text-white text-base">{dict.about.mission1Title}</h4><p className="text-xs text-slate-300 leading-relaxed">{dict.about.mission1Desc}</p></div>
            <div className="p-6 rounded-2xl bg-[#140b2e] border border-purple-800/40 space-y-3"><div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center"><Award className="w-5 h-5" /></div><h4 className="font-bold text-white text-base">{dict.about.mission2Title}</h4><p className="text-xs text-slate-300 leading-relaxed">{dict.about.mission2Desc}</p></div>
            <div className="p-6 rounded-2xl bg-[#140b2e] border border-purple-800/40 space-y-3"><div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center"><Shield className="w-5 h-5" /></div><h4 className="font-bold text-white text-base">{dict.about.mission3Title}</h4><p className="text-xs text-slate-300 leading-relaxed">{dict.about.mission3Desc}</p></div>
          </div>
        </div>
        <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 to-[#1b0d3a] border border-purple-700/40 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center sm:text-left"><h3 className="text-xl font-bold text-white">{dict.about.buzzTitle}</h3><p className="text-sm text-slate-300 max-w-xl">{dict.about.buzzDesc}</p></div>
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/poochandi.in/" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-pink-600/80 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-2 transition-all"><InstagramIcon className="w-4 h-4" /><span>@poochandi.in</span></a>
            <a href="https://youtube.com/@poochandivaraan" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-2 transition-all"><YoutubeIcon className="w-4 h-4" /><span>YouTube</span></a>
          </div>
        </div>
      </div>
    </div>
  );
}

