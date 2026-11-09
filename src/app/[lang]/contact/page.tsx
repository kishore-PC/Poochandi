import React from 'react';
import type { Metadata } from 'next';
import { Language, dictionaries } from '@/lib/i18n';
import { initDb, queryAll } from '@/lib/db';
import ContactForm from '@/components/forms/ContactForm';
import { PhoneCall, Mail } from 'lucide-react';
import { InstagramIcon, YoutubeIcon } from '@/components/icons/SocialIcons';

interface ContactPageProps { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  return {
    title: lang === 'ta' ? 'à®¤à¯Šà®Ÿà®°à¯à®ªà¯à®•à¯à®•à¯ | à®ªà¯‚à®šà¯à®šà®¾à®£à¯à®Ÿà®¿' : 'Contact Us | Poochandi Official',
    description: lang === 'ta' ? 'à®ªà¯‚à®šà¯à®šà®¾à®£à¯à®Ÿà®¿ à®®à®±à¯à®±à¯à®®à¯ à®ªà®¸à¯ à®•à®¿à®°à®¿à®¯à¯‡à®·à®©à¯à®¸à¯ à®•à¯à®´à¯à®µà¯ˆà®¤à¯ à®¤à¯Šà®Ÿà®°à¯à®ªà¯ à®•à¯Šà®³à¯à®³à®µà¯à®®à¯.' : 'Get in touch with the Poochandi and Poochandi Varaan team for feedback, collaborations, or WhatsApp support.',
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const dict = dictionaries[lang];
  await initDb();
  const settingsRows = await queryAll<{ key: string; value: string }>('SELECT key, value FROM site_settings');
  const settings: Record<string, string> = {};
  for (const row of settingsRows) settings[row.key] = row.value;
  const whatsappNumber = settings.whatsapp_number || '+919876543210';
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-teal-300 text-xs font-bold"><Mail className="w-3.5 h-3.5" /><span>Connect with Poochandi Varaan</span></div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{dict.contact.title}</h1>
          <p className="text-base text-slate-300 max-w-xl mx-auto">{dict.contact.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/70 to-[#0e2a20] border border-emerald-600/40 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><PhoneCall className="w-6 h-6" /></div>
              <h3 className="text-lg font-bold text-white">{dict.contact.directChat}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{dict.contact.directChatDesc}</p>
              <a href={`https://wa.me/${cleanNumber}?text=Hello%20Poochandi%20Team!`} target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"><span>{dict.contact.chatNow}</span></a>
            </div>
            <div className="p-6 rounded-3xl bg-[#13082b] border border-purple-800/40 space-y-4">
              <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Official Email</span><a href={`mailto:${settings.contact_email || 'hello@poochandi.in'}`} className="text-sm font-semibold text-teal-400 hover:underline">{settings.contact_email || 'hello@poochandi.in'}</a></div>
              <div className="pt-3 border-t border-purple-900/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Social Channels</span>
                <div className="flex items-center gap-3">
                  <a href="https://www.instagram.com/poochandi.in/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-pink-600/20 text-pink-400 hover:bg-pink-600/40 transition-colors"><InstagramIcon className="w-4 h-4" /></a>
                  <a href="https://youtube.com/@poochandivaraan" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors"><YoutubeIcon className="w-4 h-4" /></a>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-7 bg-[#13092d] p-6 sm:p-10 rounded-3xl border border-purple-800/50 shadow-2xl"><ContactForm lang={lang} /></div>
        </div>
      </div>
    </div>
  );
}

